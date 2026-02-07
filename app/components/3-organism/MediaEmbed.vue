<script setup lang="ts">
import type {Media} from '~/types/sanity'

const props = defineProps<{
  media: Media
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

// Video props
const videoProps = computed(() => {
  if (!props.media.muxPlaybackId) return null

  return {
    playbackId: props.media.muxPlaybackId,
    preset: props.media.autoplay ? 'ambient' : 'default',
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

/* Videos: size naturally to avoid controls extending */
.media-embed.large :deep(video) {
  display: inline-block;
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 80vh;
}

.fallback {
  background: var(--background-secondary);
  padding: var(--unit-big);
  text-align: center;
  color: var(--foreground-tertiary);
}
</style>
