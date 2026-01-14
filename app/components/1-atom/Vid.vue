<template>
  <Observer
    class="vid-wrapper"
    :onEnter="handleEnterViewport"
    :onLeave="handleLeaveViewport"
    :once="false"
    v-slot="{ isIntersecting }"
  >
    <video
      ref="videoRef"
      :src="shouldLoadVideo ? src : undefined"
      :width="computedWidth"
      :height="computedHeight"
      :loading="loading"
      :autoplay="shouldAutoplay"
      :loop="effectiveLoop"
      :muted="effectiveMuted"
      :controls="effectiveControls"
      :playsinline="playsinline"
      :poster="poster"
      @loadstart="handleLoadStart"
      @loadeddata="handleLoadedData"
      @loadedmetadata="handleLoadedMetadata"
      @error="handleError"
      @canplay="handleCanPlay"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @click="handleVideoClick"
      @keydown="handleVideoKeydown"
      class="vid"
      :style="`aspect-ratio: ${computedWidth}/${computedHeight}`"
      :class="{
        'vid--loading': isLoading,
        'vid--error': hasError,
        'vid--clickable': !effectiveControls,
      }"
      :tabindex="0"
      :role="!effectiveControls ? 'button' : null"
      :aria-label="
        !effectiveControls
          ? `${alt} - Click to ${isPlaying ? 'pause' : 'play'}`
          : alt
      "
    >
      <slot />
    </video>

    <!-- Loading state -->
    <div v-if="isLoading" class="vid-loading">
      <div class="vid-loading-spinner"></div>
    </div>

    <!-- Error state -->
    <div v-if="hasError" class="vid-error">
      <div class="vid-error-content">
        <Text size="caption-1" color="dim">Video failed to load</Text>
      </div>
    </div>
  </Observer>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  width: {
    type: [String, Number],
    default: "auto",
  },
  height: {
    type: [String, Number],
    default: "auto",
  },
  alt: {
    type: String,
    default: "",
  },
  loading: {
    type: String,
    default: "lazy",
    validator: (value) => ["lazy", "eager"].includes(value),
  },
  autoplay: {
    type: Boolean,
    default: null,
  },
  loop: {
    type: Boolean,
    default: null,
  },
  muted: {
    type: Boolean,
    default: null,
  },
  controls: {
    type: Boolean,
    default: null,
  },
  playsinline: {
    type: Boolean,
    default: true,
  },
  poster: {
    type: String,
    default: "",
  },
  preset: {
    type: String,
    default: "default",
    validator: (value) => ["default", "ambient"].includes(value),
  },
});

const videoRef = ref(null);
const isLoading = ref(false);
const hasError = ref(false);
const isLoaded = ref(false);
const naturalWidth = ref(null);
const naturalHeight = ref(null);
const isInViewport = ref(false);
const shouldLoadVideo = ref(false);
const wasPlayingBeforeLeave = ref(false);
const isPlaying = ref(false);

const handleLoadStart = () => {
  isLoading.value = true;
  hasError.value = false;
};

const handleLoadedData = () => {
  isLoading.value = false;
  isLoaded.value = true;
};

const handleError = () => {
  isLoading.value = false;
  hasError.value = true;
};

const handleLoadedMetadata = () => {
  // Set natural dimensions when metadata is loaded
  if (videoRef.value) {
    naturalWidth.value = videoRef.value.videoWidth;
    naturalHeight.value = videoRef.value.videoHeight;
  }
};

const handleCanPlay = () => {
  isLoading.value = false;
  isLoaded.value = true;
};

const handleVideoClick = () => {
  // Only handle clicks when controls are hidden
  if (!effectiveControls.value && videoRef.value) {
    togglePlayPause();
  }
};

const handleVideoKeydown = (event) => {
  // Only handle keyboard when controls are hidden
  if (!effectiveControls.value && videoRef.value) {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      togglePlayPause();
    }
  }
};

const togglePlayPause = () => {
  if (!videoRef.value) return;

  if (videoRef.value.paused) {
    videoRef.value.play().catch(() => {
      // Handle play promise rejection silently
    });
  } else {
    videoRef.value.pause();
  }
};

const handleEnterViewport = () => {
  isInViewport.value = true;

  // Load video when it enters viewport (lazy loading)
  if (props.loading === "lazy" && !shouldLoadVideo.value) {
    shouldLoadVideo.value = true;
  }

  // Resume video if it was playing before leaving viewport
  if (videoRef.value && wasPlayingBeforeLeave.value) {
    videoRef.value.play().catch(() => {
      // Handle play promise rejection silently
    });
    wasPlayingBeforeLeave.value = false;
  }
};

const handleLeaveViewport = () => {
  isInViewport.value = false;

  // Pause video if it's currently playing
  if (videoRef.value && !videoRef.value.paused) {
    wasPlayingBeforeLeave.value = true;
    videoRef.value.pause();
  }
};

// Preset configurations
const presetConfigs = {
  default: {
    autoplay: false,
    muted: false,
    controls: true,
    loop: false,
  },
  ambient: {
    autoplay: true,
    muted: true,
    controls: false,
    loop: true,
  },
};

// Computed properties for effective settings (preset + prop overrides)
const effectiveAutoplay = computed(() => {
  if (props.autoplay !== null) return props.autoplay;
  return presetConfigs[props.preset].autoplay;
});

const effectiveLoop = computed(() => {
  if (props.loop !== null) return props.loop;
  return presetConfigs[props.preset].loop;
});

const effectiveMuted = computed(() => {
  if (props.muted !== null) return props.muted;
  return presetConfigs[props.preset].muted;
});

const effectiveControls = computed(() => {
  if (props.controls !== null) return props.controls;
  return presetConfigs[props.preset].controls;
});

// Computed property for autoplay behavior
const shouldAutoplay = computed(() => {
  // Only autoplay if video is loaded and was supposed to autoplay
  return effectiveAutoplay.value && shouldLoadVideo.value;
});

// Computed properties for dimensions
const computedWidth = computed(() => {
  if (props.width === "auto" && naturalWidth.value) {
    return naturalWidth.value;
  }
  return props.width;
});

const computedHeight = computed(() => {
  if (props.height === "auto" && naturalHeight.value) {
    return naturalHeight.value;
  }
  return props.height;
});

onMounted(() => {
  // Load immediately for eager loading
  if (props.loading === "eager") {
    shouldLoadVideo.value = true;
    isLoading.value = true;
  }
});
</script>

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

.vid-loading {
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
