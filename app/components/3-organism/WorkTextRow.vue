<script setup lang="ts">
import type { Artifact } from "~/types/sanity";
import { lightboxImageUrl, muxThumbnailUrl } from "~/utils/sanityImage";

const props = defineProps<{
  media: Artifact;
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

const rowEl = ref<HTMLElement | null>(null);
const thumbEl = ref<HTMLElement | null>(null);
const flipRootEl = ref<HTMLElement | null>(null);

const isActive = computed(() => activeArtifact.value?._id === props.media._id);
const teleportEnabled = computed(
  () => isActive.value && sharedStageEl.value != null,
);
const teleportTo = computed(() =>
  sharedStageEl.value ? sharedStageEl.value : "body",
);

watchEffect((onCleanup) => {
  const el = flipRootEl.value;
  if (!el || !isActive.value) return;
  registerFlipRoot(el);
  onCleanup(() => unregisterFlipRootIf(el));
});

function activate() {
  const el = flipRootEl.value;
  const row = rowEl.value;
  const thumb = thumbEl.value;
  if (!el || !row) return;
  open(props.media, {
    trigger: row,
    firstRect: el.getBoundingClientRect(),
    closeTarget: thumb ?? undefined,
  });
}

// ─── Media helpers ────────────────────────────────────────────────────────────

const isVideo = computed(
  () => props.media.mediaType === "video" && !!props.media.muxPlaybackId,
);

const aspectRatio = computed(() => {
  if (isVideo.value && props.media.videoMeta?.aspectRatio) {
    const [w, h] = props.media.videoMeta.aspectRatio.split(":").map(Number);
    if (w && h) return w / h;
  }
  const w = props.media.imageMeta?.dimensions?.width;
  const h = props.media.imageMeta?.dimensions?.height;
  return w && h ? w / h : 1;
});

// ─── Hover preload (images only) ──────────────────────────────────────────────

let preloaded = false;
function onHover() {
  if (preloaded || isVideo.value) return;
  preloaded = true;
  const url = lightboxImageUrl(props.media.imageUrl ?? "", aspectRatio.value, {
    maxNaturalW: props.media.imageMeta?.dimensions?.width,
    maxNaturalH: props.media.imageMeta?.dimensions?.height,
  });
  if (!url) return;
  const img = new Image();
  img.src = url;
}

// ─── Keep high-res after close ────────────────────────────────────────────────

const highResSrc = ref<string | null>(null);
const imageSrc = computed(
  () => highResSrc.value || props.media.imageUrl || null,
);

watch(isActive, (isNowActive, wasActive) => {
  if (!isNowActive && wasActive && !isVideo.value && props.media.imageUrl) {
    highResSrc.value = lightboxImageUrl(
      props.media.imageUrl,
      aspectRatio.value,
      {
        maxNaturalW: props.media.imageMeta?.dimensions?.width,
        maxNaturalH: props.media.imageMeta?.dimensions?.height,
      },
    );
  }
});

// ─── Video thumbnail src ──────────────────────────────────────────────────────

const videoThumbSrc = computed(() =>
  props.media.muxPlaybackId
    ? muxThumbnailUrl(props.media.muxPlaybackId, { width: 80, height: 80 })
    : null,
);
</script>

<template>
  <div
    ref="rowEl"
    class="work-text__row"
    :class="{ 'work-text__row--active': isActive }"
    role="button"
    tabindex="0"
    :aria-label="`View ${media.title}`"
    @mouseenter="onHover"
    @click="activate"
    @keydown.enter.prevent="activate"
    @keydown.space.prevent="activate"
  >
    <!-- Thumbnail -->
    <div ref="thumbEl" class="work-text__thumb">
      <div
        v-show="teleportEnabled"
        class="work-text__ghost"
        aria-hidden="true"
      />
      <Teleport :disabled="!teleportEnabled" :to="teleportTo">
        <div ref="flipRootEl" class="lb-flip-root work-text__flip-root">
          <Pic
            v-if="isVideo && videoThumbSrc"
            :src="videoThumbSrc"
            :alt="media.alt || media.title"
            :width="80"
            :height="80"
            external
            sizes="80px"
            :placeholder="false"
          />
          <Pic
            v-else-if="imageSrc"
            :src="imageSrc"
            :alt="media.alt || media.title"
            :width="media.imageMeta?.dimensions?.width"
            :height="media.imageMeta?.dimensions?.height"
            sizes="80px"
            :placeholder="false"
          />
          <div v-else class="work-text__no-thumb" />
        </div>
      </Teleport>
    </div>

    <Text size="caption-1" class="work-text__content">
      <span class="work-text__title">{{ media.title }}</span>
      <div class="work-text__meta">
        <span v-if="media.dateTaken" class="work-text__date">{{
          media.dateTaken.slice(0, 4)
        }}</span>
        <span v-if="media.categories?.length" class="work-text__cats">
          {{ media.categories.map((c) => c.name).join(", ") }}
        </span>
      </div>
    </Text>
  </div>
</template>

<style lang="scss" scoped>
.work-text__row {
  --thumbnail-size: var(--unit-big);

  @include tablet {
    --thumbnail-size: var(--unit-bigger);
  }

  display: grid;
  grid-template-columns: var(--thumbnail-size) 1fr;
  gap: 0 var(--unit-tiny);
  align-items: center;
  padding: var(--unit-tiny) 0;
  border-top: 1px solid var(--border-primary);
  cursor: zoom-in;
  transition: opacity var(--transition-fast);

  &:focus {
    outline: 0;
  }
  &:focus-visible {
    // outline: 2px solid var(--foreground-primary);
    // outline-offset: 2px;
    outline: 0;
  }
  &--active {
    cursor: default;
    pointer-events: none;
  }
}

// ── Thumbnail ─────────────────────────────────────────────────────────────────

.work-text__thumb {
  position: relative;
  width: var(--thumbnail-size);
  height: var(--thumbnail-size);
  overflow: hidden;
  border-radius: var(--radii-tiny);
  flex-shrink: 0;

  @include desktop {
    width: var(--thumbnail-size);
    height: var(--thumbnail-size);
  }
}

.work-text__ghost {
  position: absolute;
  inset: 0;
  background: var(--background-secondary);
}

.work-text__flip-root {
  width: 100%;
  height: 100%;
}

:deep(.pic),
:deep(.pic__image),
:deep(img) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.work-text__no-thumb {
  width: 100%;
  height: 100%;
  background: var(--background-secondary);
}

// ── Text content ──────────────────────────────────────────────────────────────

.work-text__content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.work-text__title {
  color: var(--foreground-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.work-text__meta {
  display: flex;
  gap: var(--unit-tinier);
  align-items: baseline;
}

.work-text__date {
  color: var(--foreground-tertiary);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;

  & + .work-text__cats::before {
    content: "·";
    margin-right: var(--unit-tinier);
    color: var(--foreground-tertiary);
  }
}

.work-text__cats {
  color: var(--foreground-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
