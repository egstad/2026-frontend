<template>
  <article class="feed-card" :style="{ '--aspect': aspectRatio }">
    <!-- Media area: same Teleport pattern as MediaCard -->
    <div
      ref="mediaEl"
      class="feed-card__media"
      :class="{ 'feed-card__media--active': isActive }"
      role="button"
      tabindex="0"
      :aria-label="`View ${media.title}`"
      @mouseenter="onHover"
      @click="activate"
      @keydown.enter.prevent="activate"
      @keydown.space.prevent="activate"
    >
      <div
        v-show="teleportEnabled"
        class="feed-card__ghost"
        aria-hidden="true"
      />

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
            :srcset="imageSrcset"
            :sizes="picSizes"
            :placeholder="lqipUrl"
            :priority="priority"
            :loading="priority ? 'eager' : 'lazy'"
          />
          <div v-else class="feed-card__placeholder" />
        </div>
      </Teleport>
    </div>

    <footer class="feed-card__meta">
      <Text size="caption-2" is="h2" class="feed-card__title">
        {{ media.title }}
      </Text>
      <Text
        v-if="media.captionText"
        size="caption-2"
        color="dim"
        class="feed-card__caption"
      >
        {{ media.captionText }}
      </Text>
      <div v-if="media.categories?.length" class="feed-card__tags">
        <Text
          v-for="cat in media.categories"
          :key="cat._id"
          size="caption-2"
          color="dimmer"
          is="span"
          class="feed-card__tag"
          >{{ cat.name }}</Text
        >
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { Artifact } from "~/types/sanity";
import { lightboxImageUrl, sanityImageSrcset, sanityLqipUrl, SRCSET_WIDTHS } from "~/utils/sanityImage";

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

const mediaEl = ref<HTMLElement | null>(null);
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

function activate() {
  const el = flipRootEl.value;
  const root = mediaEl.value;
  if (!el || !root) return;
  open(props.media, {
    trigger: root,
    firstRect: el.getBoundingClientRect(),
  });
}

// ─── Media helpers ────────────────────────────────────────────────────────────

const isVideo = computed(
  () => props.media.mediaType === "video" && !!props.media.muxPlaybackId,
);
const width = computed(() => props.media.imageMeta?.dimensions?.width);
const height = computed(() => props.media.imageMeta?.dimensions?.height);

const highResSrc = ref<string | null>(null);
const effectiveSrc = computed(
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

// Srcset covering the full range of Sanity-servable widths.
// The browser picks the right entry for the rendered CSS width × devicePixelRatio
// without any framework involvement.
const imageSrcset = computed(() => {
  const url = props.media.imageUrl;
  return url && !isVideo.value ? sanityImageSrcset(url, SRCSET_WIDTHS) : undefined;
});

// Tiny placeholder URL — loaded immediately, gives the blur-up effect while
// the correctly-sized srcset entry loads.
const lqipUrl = computed(() => {
  const url = props.media.imageUrl;
  return url && !isVideo.value ? sanityLqipUrl(url) : undefined;
});

// Standard CSS sizes — matches the responsive widths in the .feed-card CSS.
const picSizes = "(min-width: 1280px) 40vw, (min-width: 1024px) 45vw, (min-width: 768px) 65vw, 100vw";
</script>

<style lang="scss" scoped>
.feed-card {
  width: 100%;
  margin-inline: auto;
  // padding: 0 var(--unit-tiny);
  width: min(100%, calc(var(--aspect, 1) * 90%));

  @include tablet {
    width: min(100%, calc(var(--aspect, 1) * 65%));
  }
  @include laptop {
    width: min(100%, calc(var(--aspect, 1) * 45%));
  }
  @include desktop {
    width: min(100%, calc(var(--aspect, 1) * 40%));
  }
}

.feed-card__media {
  display: block;
  position: relative;
  width: 100%;
  // Preserve the card's height when lb-flip-root is teleported to the lightbox.
  // Without this, the only remaining child is the absolutely-positioned ghost
  // (zero flow-height), so the card collapses and the layout jumps.
  aspect-ratio: var(--aspect, 1);
  overflow: hidden;
  border-radius: var(--radii-tiny);
  cursor: zoom-in;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.9;
  }
  &:focus-visible {
    outline: 2px solid var(--foreground-primary);
    outline-offset: 2px;
  }

  &--active {
    cursor: default;
    pointer-events: none;
  }

  :deep(.lb-flip-root) {
    display: block;
    width: 100%;
  }

  :deep(.pic),
  :deep(.vid-wrapper) {
    display: block;
    width: 100%;
  }

  :deep(img) {
    display: block;
    width: 100%;
    height: auto;
  }
}

.feed-card__ghost {
  position: absolute;
  inset: 0;
  background: var(--background-secondary);
}

.feed-card__placeholder {
  width: 100%;
  aspect-ratio: 1;
  background: var(--background-secondary);
}

.feed-card__meta {
  padding: var(--unit-tinier) 0 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feed-card__title {
  color: var(--foreground-primary);
  margin: 0;
}
.feed-card__caption {
  margin: 0;
}
.feed-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--unit-tinier);
}
.feed-card__tag::before {
  content: "#";
}
</style>
