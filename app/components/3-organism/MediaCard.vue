<script setup lang="ts">
import type { Artifact } from "~/types/sanity";
import { lightboxImageUrl } from "~/utils/sanityImage";

const props = defineProps<{
  media: Artifact;
  priority?: boolean;
}>();

// ─── Lightbox ─────────────────────────────────────────────────────────────────

const lb = useWorkLightbox();
const {
  activeArtifact,
  sharedStageEl,
  registerFlipRoot,
  unregisterFlipRootIf,
  open,
} = lb;

const cardEl = ref<HTMLElement | null>(null);
const flipRootEl = ref<HTMLElement | null>(null);

const isActive = computed(
  () => activeArtifact.value?._id === props.media._id,
);

// Teleport is enabled when this card is active AND the stage exists.
const teleportEnabled = computed(
  () => isActive.value && sharedStageEl.value != null,
);

// Safe target for Teleport :to (always a valid selector when disabled)
const teleportTo = computed(() =>
  sharedStageEl.value ? sharedStageEl.value : "body",
);

// Register/unregister this card's flip root with the composable so the
// lightbox knows which element to FLIP.
watchEffect((onCleanup) => {
  const el = flipRootEl.value;
  if (!el || !isActive.value) return;
  registerFlipRoot(el);
  onCleanup(() => unregisterFlipRootIf(el));
});

function activate() {
  const el = flipRootEl.value;
  const card = cardEl.value;
  if (!el || !card) return;
  open(props.media, {
    trigger: card,
    firstRect: el.getBoundingClientRect(),
  });
}

// ─── Media helpers ────────────────────────────────────────────────────────────

const isVideo = computed(
  () => props.media.mediaType === "video" && !!props.media.muxPlaybackId,
);

let preloaded = false;
function onHover() {
  if (preloaded || isVideo.value) return;
  preloaded = true;
  const url = lightboxImageUrl(
    props.media.imageUrl ?? "",
    aspectRatio.value,
    {
      maxNaturalW: props.media.imageMeta?.dimensions?.width,
      maxNaturalH: props.media.imageMeta?.dimensions?.height,
    },
  );
  if (!url) return;
  const img = new Image();
  img.src = url;
}

const thumbnailSrc = computed(() => props.media.imageUrl || null);
const highResSrc = ref<string | null>(null);
const effectiveSrc = computed(() => highResSrc.value || thumbnailSrc.value);
const width = computed(() => props.media.imageMeta?.dimensions?.width);

watch(isActive, (isNowActive, wasActive) => {
  if (!isNowActive && wasActive && !isVideo.value && props.media.imageUrl) {
    highResSrc.value = lightboxImageUrl(props.media.imageUrl, aspectRatio.value, {
      maxNaturalW: props.media.imageMeta?.dimensions?.width,
      maxNaturalH: props.media.imageMeta?.dimensions?.height,
    });
  }
});
const height = computed(() => props.media.imageMeta?.dimensions?.height);

function parseMuxAspect(ratio?: string): number | null {
  if (!ratio) return null;
  const [w, h] = ratio.split(":").map(Number);
  return w && h ? w / h : null;
}

const aspectRatio = computed(() => {
  if (isVideo.value) {
    const a = parseMuxAspect(props.media.videoMeta?.aspectRatio);
    if (a) return a;
  }
  if (width.value && height.value) return width.value / height.value;
  return 1;
});

const vidAspect = computed(
  () => parseMuxAspect(props.media.videoMeta?.aspectRatio) ?? undefined,
);

const sizesHint = computed(() => `${Math.round(330 * aspectRatio.value)}px`);

// Keep sizes constant — the lightbox upgrades srcset/sizes imperatively
// after the FLIP animation to avoid triggering NuxtImg's placeholder reset.
const picSizes = computed(() => sizesHint.value);
</script>

<template>
  <div
    ref="cardEl"
    class="media-card"
    :class="{ 'media-card--active': isActive }"
    :style="{ '--aspect': aspectRatio }"
    role="button"
    tabindex="0"
    :aria-label="`View ${media.title}`"
    @mouseenter="onHover"
    @click="activate"
    @keydown.enter.prevent="activate"
    @keydown.space.prevent="activate"
  >
    <!-- Ghost: holds the grid slot while media is teleported to the lightbox -->
    <div v-show="teleportEnabled" class="media-card__ghost" aria-hidden="true" />

    <!-- Media: teleported into the lightbox stage when active -->
    <Teleport :disabled="!teleportEnabled" :to="teleportTo">
      <div ref="flipRootEl" class="lb-flip-root">
        <Vid
          v-if="isVideo"
          :playbackId="media.muxPlaybackId"
          preset="ambient"
          :aspect-ratio="vidAspect"
          :lock-play="isActive"
        />
        <Pic
          v-else-if="effectiveSrc"
          :src="effectiveSrc"
          :alt="media.alt || media.title"
          :width="width"
          :height="height"
          external
          :sizes="picSizes"
          :priority="priority"
          :loading="priority ? 'eager' : 'lazy'"
          :placeholder="true"
        />
        <div v-else class="media-card__placeholder" />
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.media-card {
  display: block;
  position: relative;
  overflow: hidden;
  height: var(--row-height, 220px);
  width: calc(var(--row-height, 220px) * var(--aspect, 1));
  max-width: 100vw;
  flex-shrink: 0;
  margin-right: var(--unit-tinier);
  margin-bottom: var(--unit-tinier);
  border-radius: var(--radii-tiny);
  cursor: zoom-in;
  transition: opacity var(--transition-fast);

  &:hover { opacity: 0.8; }
  &:focus-visible {
    outline: 2px solid var(--foreground-primary);
    outline-offset: 2px;
  }

  // ── Styles applied when media lives in this card (not teleported) ─────────
  :deep(.lb-flip-root) {
    display: block;
    width: 100%;
    height: 100%;
  }

  :deep(.pic),
  :deep(.vid-wrapper) {
    display: block;
    width: 100%;
    height: 100%;
  }

  :deep(img),
  :deep(video) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// Ghost keeps the card slot visible while media is in the lightbox
.media-card__ghost {
  position: absolute;
  inset: 0;
  background: var(--background-secondary);
  border-radius: inherit;
}

.media-card--active {
  cursor: default;
  pointer-events: none;
}

.media-card__placeholder {
  width: 100%;
  height: 100%;
  background: var(--background-secondary);
}
</style>
