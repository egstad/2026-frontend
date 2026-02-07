<script setup lang="ts">
import Hls from "hls.js";

interface Props {
  playbackId?: string; // Mux playback ID (preferred for production)
  src?: string; // Direct video URL fallback (local .mp4)
  poster?: string; // Custom poster image URL
  alt?: string; // Accessibility description
  width?: number | string;
  height?: number | string;
  preset?: "default" | "ambient";
  autoplay?: boolean | null;
  loop?: boolean | null;
  muted?: boolean | null;
  controls?: boolean | null;
  playsinline?: boolean;
  loading?: "lazy" | "eager";
  defaultSubtitleLang?: string; // e.g. "en" — subtitles off by default
}

const props = withDefaults(defineProps<Props>(), {
  preset: "default",
  autoplay: null,
  loop: null,
  muted: null,
  controls: null,
  playsinline: true,
  loading: "lazy",
});

const emit = defineEmits<{
  play: [];
  pause: [];
  error: [];
  loaded: [];
}>();

// -------------------------
// Refs
// -------------------------
const wrapperRef = ref<HTMLElement | null>(null);
const videoRef = ref<HTMLVideoElement | null>(null);
const hlsInstance = ref<Hls | null>(null);
const observer = ref<IntersectionObserver | null>(null);

// -------------------------
// State
// -------------------------
const isLoading = ref(false);
const hasError = ref(false);
const isPlaying = ref(false);
const shouldLoad = ref(false);
const wasPlayingBeforeLeave = ref(false);
const naturalWidth = ref<number | null>(null);
const naturalHeight = ref<number | null>(null);

// Captions
const hasCaptions = ref(false);
const captionsEnabled = ref(false);

// Audio
const hasAudio = ref(false);
const isMuted = ref(true);

// Controls hover visibility (cursor devices only)
const controlsVisible = ref(false);
let hideTimeout: ReturnType<typeof setTimeout> | null = null;
const HIDE_DELAY = 500;

// -------------------------
// Preset system
// -------------------------
const presetConfigs = {
  default: { autoplay: false, muted: false, controls: true, loop: false },
  ambient: { autoplay: true, muted: true, controls: false, loop: true },
};

const effectiveAutoplay = computed(
  () => props.autoplay ?? presetConfigs[props.preset].autoplay
);
const effectiveLoop = computed(
  () => props.loop ?? presetConfigs[props.preset].loop
);
const effectiveMuted = computed(
  () => props.muted ?? presetConfigs[props.preset].muted
);
const effectiveControls = computed(
  () => props.controls ?? presetConfigs[props.preset].controls
);

// -------------------------
// Stream URL & poster
// -------------------------
const streamUrl = computed(() => {
  if (props.playbackId) {
    const base = `https://stream.mux.com/${props.playbackId}.m3u8`;
    return props.defaultSubtitleLang
      ? `${base}?default_subtitles_lang=${props.defaultSubtitleLang}`
      : base;
  }
  return props.src || "";
});

const posterUrl = computed(() => {
  if (props.poster) return props.poster;
  if (props.playbackId) {
    return `https://image.mux.com/${props.playbackId}/thumbnail.jpg?width=1280&fit_mode=preserve`;
  }
  return undefined;
});

// -------------------------
// Dimensions
// -------------------------
const computedWidth = computed(() => {
  if (props.width && props.width !== "auto") return props.width;
  return naturalWidth.value || undefined;
});

const computedHeight = computed(() => {
  if (props.height && props.height !== "auto") return props.height;
  return naturalHeight.value || undefined;
});

// -------------------------
// Computed classes
// -------------------------
const vidClasses = computed(() => ({
  "vid--loading": isLoading.value,
  "vid--error": hasError.value,
  "vid--clickable": !effectiveControls.value,
}));

// -------------------------
// Video events
// -------------------------
const handleLoadStart = () => {
  isLoading.value = true;
  hasError.value = false;
};

const handleLoadedMetadata = () => {
  if (videoRef.value) {
    naturalWidth.value = videoRef.value.videoWidth;
    naturalHeight.value = videoRef.value.videoHeight;
  }
};

const handleCanPlay = () => {
  isLoading.value = false;
  if (videoRef.value) isMuted.value = videoRef.value.muted;
  emit("loaded");
};

const handleError = () => {
  isLoading.value = false;
  hasError.value = true;
  emit("error");
};

const handlePlay = () => {
  isPlaying.value = true;
  emit("play");
};

const handlePause = () => {
  isPlaying.value = false;
  emit("pause");
};

// -------------------------
// Play/pause controls
// -------------------------
const togglePlayPause = () => {
  if (!videoRef.value) return;
  if (videoRef.value.paused) {
    videoRef.value.play().catch(() => {});
  } else {
    videoRef.value.pause();
  }
};

const handleVideoClick = () => {
  if (!effectiveControls.value) togglePlayPause();
};

const handleVideoKeydown = (event: KeyboardEvent) => {
  if (
    !effectiveControls.value &&
    (event.key === " " || event.key === "Enter")
  ) {
    event.preventDefault();
    togglePlayPause();
  }
};

// -------------------------
// Captions toggle
// -------------------------
const toggleCaptions = () => {
  captionsEnabled.value = !captionsEnabled.value;

  if (hlsInstance.value) {
    hlsInstance.value.subtitleTrack = captionsEnabled.value ? 0 : -1;
  } else if (videoRef.value?.textTracks) {
    const tracks = videoRef.value!.textTracks;
    for (let i = 0; i < tracks.length; i++) {
      tracks[i]!.mode = captionsEnabled.value ? "showing" : "hidden";
    }
  }
};

// -------------------------
// Audio toggle
// -------------------------
const toggleMute = () => {
  if (!videoRef.value) return;
  videoRef.value.muted = !videoRef.value.muted;
  isMuted.value = videoRef.value.muted;
};

// -------------------------
// Controls hover visibility
// -------------------------
const showControls = () => {
  if (hideTimeout) clearTimeout(hideTimeout);
  controlsVisible.value = true;
};

const scheduleHideControls = () => {
  if (hideTimeout) clearTimeout(hideTimeout);
  hideTimeout = setTimeout(() => {
    controlsVisible.value = false;
  }, HIDE_DELAY);
};

// -------------------------
// HLS / video initialisation
// -------------------------
const initVideo = () => {
  if (!videoRef.value || !streamUrl.value) return;

  if (props.playbackId) {
    // Mux HLS stream
    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl.value);
      hls.attachMedia(videoRef.value);

      // Detect audio via codec info in the HLS manifest.
      // Each level's audioCodec is set (e.g. "mp4a.40.2") when audio
      // is present — even when muxed into the video track — and null
      // when the stream is silent.
      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        hasAudio.value = data.levels.some(
          (level: { audioCodec?: string | null }) => !!level.audioCodec
        );
      });

      // Detect available subtitle tracks — off by default
      hls.on(Hls.Events.SUBTITLE_TRACKS_UPDATED, () => {
        hasCaptions.value = hls.subtitleTracks.length > 0;
        hls.subtitleTrack = -1;
      });

      hlsInstance.value = hls;
    } else if (
      videoRef.value.canPlayType("application/vnd.apple.mpegurl")
    ) {
      // Safari native HLS support
      videoRef.value.src = streamUrl.value;

      videoRef.value.addEventListener("loadedmetadata", () => {
        // Safari exposes audioTracks on the video element
        const audioTracks = (videoRef.value as any)?.audioTracks;
        hasAudio.value = audioTracks ? audioTracks.length > 0 : false;

        // Detect text tracks
        const textTracks = videoRef.value?.textTracks;
        if (textTracks && textTracks.length > 0) {
          hasCaptions.value = true;
          for (let i = 0; i < textTracks.length; i++) {
            textTracks[i]!.mode = "hidden";
          }
        }
      });
    }
  } else {
    // Direct src (local .mp4, etc.)
    // Audio detection skipped — MP4 containers often embed silent
    // audio tracks, causing false positives. Mux strips these during
    // ingest so HLS detection above is reliable.
    videoRef.value.src = streamUrl.value;
  }
};

// -------------------------
// Intersection observer
// -------------------------
const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      // Lazy-load: start loading on first viewport entry
      if (!shouldLoad.value) {
        shouldLoad.value = true;
        initVideo();
      }

      // Resume playback
      if (
        videoRef.value &&
        (wasPlayingBeforeLeave.value || effectiveAutoplay.value)
      ) {
        videoRef.value.play().catch(() => {});
      }
      wasPlayingBeforeLeave.value = false;
    } else {
      // Pause when leaving viewport
      if (videoRef.value && !videoRef.value.paused) {
        wasPlayingBeforeLeave.value = true;
        videoRef.value.pause();
      }
    }
  }
};

// -------------------------
// Lifecycle
// -------------------------
onMounted(() => {
  const target = wrapperRef.value;
  if (!target) return;

  if (props.loading === "eager") {
    shouldLoad.value = true;
    isLoading.value = true;
    initVideo();
  }

  observer.value = new IntersectionObserver(handleIntersection, {
    threshold: 0.25,
  });
  observer.value.observe(target);
});

onUnmounted(() => {
  hlsInstance.value?.destroy();
  hlsInstance.value = null;
  observer.value?.disconnect();
  observer.value = null;
  if (hideTimeout) clearTimeout(hideTimeout);
});
</script>

<template>
  <div
    ref="wrapperRef"
    class="vid-wrapper"
    @mouseenter="showControls"
    @mouseleave="scheduleHideControls"
  >
    <video
      ref="videoRef"
      :width="computedWidth"
      :height="computedHeight"
      :autoplay="effectiveAutoplay && shouldLoad"
      :loop="effectiveLoop"
      :muted="effectiveMuted || effectiveAutoplay"
      :controls="effectiveControls"
      :playsinline="playsinline"
      :poster="posterUrl"
      class="vid"
      :class="vidClasses"
      :tabindex="!effectiveControls ? 0 : undefined"
      :role="!effectiveControls ? 'button' : undefined"
      :aria-label="
        !effectiveControls
          ? `${alt || 'Video'} – Click to ${isPlaying ? 'pause' : 'play'}`
          : alt || undefined
      "
      @loadstart="handleLoadStart"
      @loadedmetadata="handleLoadedMetadata"
      @error="handleError"
      @canplay="handleCanPlay"
      @play="handlePlay"
      @pause="handlePause"
      @click="handleVideoClick"
      @keydown="handleVideoKeydown"
    />

    <!-- Video overlay controls -->
    <div
      v-if="hasAudio || hasCaptions"
      class="vid-controls"
      :class="{ 'vid-controls--visible': controlsVisible }"
    >
      <!-- Audio toggle -->
      <button
        v-if="hasAudio"
        class="vid-btn"
        :class="{ 'vid-btn--active': !isMuted }"
        :aria-label="isMuted ? 'Unmute' : 'Mute'"
        :aria-pressed="!isMuted"
        @click.stop.prevent="toggleMute"
      >
        <svg
          v-if="isMuted"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 5 6 9H2v6h4l5 4zM22 9l-6 6M16 9l6 6" />
        </svg>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M11 5 6 9H2v6h4l5 4z" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      </button>

      <!-- Captions toggle -->
      <button
        v-if="hasCaptions"
        class="vid-btn"
        :class="{ 'vid-btn--active': captionsEnabled }"
        :aria-label="captionsEnabled ? 'Disable captions' : 'Enable captions'"
        :aria-pressed="captionsEnabled"
        @click.stop.prevent="toggleCaptions"
      >
        CC
      </button>
    </div>

    <!-- Loading overlay -->
    <div v-if="isLoading" class="vid-loading">
      <div class="vid-loading-spinner" />
    </div>

    <!-- Error overlay -->
    <div v-if="hasError" class="vid-error">
      <div class="vid-error-content t-micro-1">Video failed to load</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.vid-wrapper {
  position: relative;
  display: block;
  width: 100%;
  height: auto;
  overflow: hidden;
  border-radius: var(--radii-tiny);
  background: var(--background-secondary);
}

.vid {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
  transition: opacity var(--transition);

  &--loading {
    opacity: 0.5;
  }

  &--error {
    opacity: 0.3;
  }

  &--clickable {
    cursor: pointer;
  }
}

.vid-controls {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  display: flex;
  gap: 4px;
  transition: opacity 0.2s ease;

  // Touch devices: always visible
  opacity: 1;

  // Cursor devices: JS-driven show/hide
  @media (hover: hover) and (pointer: fine) {
    opacity: 0;

    &--visible {
      opacity: 1;
    }
  }
}

.vid-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 6px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.5);
  color: rgba(255, 255, 255, 0.7);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s ease;
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    border-color: rgba(255, 255, 255, 0.6);
  }

  &--active {
    background: rgba(255, 255, 255, 0.9);
    color: #000;
    border-color: transparent;

    &:hover {
      background: #fff;
      color: #000;
      border-color: transparent;
    }
  }
}

/* Caption styling */
.vid::cue {
  font-family: inherit;
  font-size: clamp(1rem, 2vw, 2em);
  line-height: 1.4;
}

.vid-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  &-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--foreground-tertiary);
    border-top: 2px solid var(--foreground-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

.vid-error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-secondary);
  z-index: 1;

  &-content {
    text-align: center;
    padding: var(--unit-small);
    color: var(--foreground-secondary);
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
