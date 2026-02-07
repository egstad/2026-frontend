<script setup lang="ts">
import type {Media} from '~/types/sanity'
import {sanityImageUrl} from '~/utils/sanityImage'

const props = defineProps<{
  media: Media
}>()

// Check if this is a video
const isVideo = computed(() => props.media.mediaType === 'video' && props.media.muxPlaybackId)

// Preload on hover for instant navigation
let preloaded = false
function onHover() {
  if (preloaded || isVideo.value) return
  preloaded = true

  // Preload larger image (pick ~1600w for detail view)
  if (props.media.imageUrl) {
    const img = new Image()
    img.src = sanityImageUrl(props.media.imageUrl, {width: 1600})
  }
}

// Pass the base Sanity URL — Pic detects Sanity CDN URLs and uses
// NuxtImg's Sanity provider for automatic srcset, format negotiation,
// and DPR-aware source selection.
const thumbnailSrc = computed(() => props.media.imageUrl || null)

// Dimensions from metadata
const width = computed(() => props.media.imageMeta?.dimensions?.width)
const height = computed(() => props.media.imageMeta?.dimensions?.height)

// Parse Mux aspect ratio string (e.g., "16:9") to number
function parseMuxAspectRatio(ratio?: string): number | null {
  if (!ratio) return null
  const parts = ratio.split(':')
  if (parts.length === 2 && parts[0] && parts[1]) {
    const w = parseFloat(parts[0])
    const h = parseFloat(parts[1])
    if (w && h) return w / h
  }
  return null
}

// Aspect ratio for variable width calculation
const aspectRatio = computed(() => {
  // For videos, use Mux aspect ratio
  if (isVideo.value) {
    const videoAspect = parseMuxAspectRatio(props.media.videoMeta?.aspectRatio)
    if (videoAspect) return videoAspect
  }
  // For images, use dimensions
  if (width.value && height.value) {
    return width.value / height.value
  }
  return 1 // fallback to square
})
</script>

<template>
  <NuxtLink
    :to="`/media/${media.slug.current}`"
    class="media-card"
    :style="{ '--aspect': aspectRatio }"
    @mouseenter="onHover"
  >
    <!-- Video: autoplay muted -->
    <Vid
      v-if="isVideo"
      :playbackId="media.muxPlaybackId"
      preset="ambient"
    />
    <!-- Image -->
    <Pic
      v-else-if="thumbnailSrc"
      :src="thumbnailSrc"
      :alt="media.alt || media.title"
      :width="width"
      :height="height"
      :external="true"
      loading="lazy"
    />
    <!-- Fallback -->
    <div v-else class="placeholder" />
  </NuxtLink>
</template>

<style lang="scss" scoped>
.media-card {
  display: block;
  overflow: hidden;
  height: var(--row-height, 220px);
  width: calc(var(--row-height, 220px) * var(--aspect, 1));
  max-width: 100vw;
  flex-shrink: 0;
  margin: 2px;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.8;
  }

  :deep(.pic),
  :deep(.vid) {
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

.placeholder {
  width: 100%;
  height: 100%;
  background-color: var(--background-secondary);
}
</style>
