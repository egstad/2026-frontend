<script setup lang="ts">
import type {Artifact} from '~/types/sanity'

const props = defineProps<{
  media: Artifact
  size?: 'normal' | 'large'
}>()

// Image props - width/height for layout shift prevention
const imageProps = computed(() => {
  if (!props.media.imageUrl) return null

  const dims = props.media.imageMeta?.dimensions
  return {
    src: props.media.imageUrl,
    alt: props.media.alt || props.media.title,
    width: dims?.width,
    height: dims?.height,
    external: true,
  }
})

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

// Video props
const videoProps = computed(() => {
  if (!props.media.muxPlaybackId) return null

  const aspectRatio = parseMuxAspectRatio(props.media.videoMeta?.aspectRatio)
  const preset = props.media.autoplay ? 'ambient' : 'default'
  return {
    playbackId: props.media.muxPlaybackId,
    preset: preset as 'ambient' | 'default',
    ...(aspectRatio ? { aspectRatio } : {}),
  }
})

</script>

<template>
  <div
    class="media-embed"
    :class="size"
    
  >
    <!-- Image -->
    <Pic v-if="media.mediaType === 'image' && imageProps" v-bind="imageProps" />

    <!-- Video -->
    <Vid v-else-if="media.mediaType === 'video' && videoProps" v-bind="videoProps" />

    <!-- Fallback -->
    <div v-else class="fallback">
      <Text size="caption-1">Media unavailable</Text>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* Large: max 80vh, centered */
.media-embed.large {
  text-align: center;
}

/* Images: fill width, height constrained, use object-fit */
.media-embed.large :deep(.pic) {
  width: 100%;
}

.media-embed.large :deep(img) {
  display: block;
  width: 100%;
  height: auto;
  max-height: 80vh;
  object-fit: contain;
  object-position: center;
}

/* Videos: letterbox inside reserved aspect box */
.media-embed.large :deep(.vid-wrapper) {
  max-height: 80vh;
  height: auto;
  width: 100%;
  margin-inline: auto;
}

.media-embed.large :deep(.vid) {
  object-fit: contain;
}

.fallback {
  background: var(--background-secondary);
  padding: var(--unit-big);
  text-align: center;
  color: var(--foreground-tertiary);
}
</style>
