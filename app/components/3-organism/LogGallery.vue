<script setup lang="ts">
import type { LogGallery, LogGalleryItem } from '~/types/sanity'

const props = defineProps<{ gallery: LogGallery }>()

const items = computed(() => props.gallery.items ?? [])
const count = computed(() => items.value.length)

// [tablet, laptop, desktop] columns per item count.
// Mobile is always 1 (hardcoded in CSS).
const COLS: Record<number, [number, number, number]> = {
  2:  [2, 2,  2 ],
  3:  [3, 3,  3 ],
  4:  [2, 4,  4 ],
  5:  [2, 5,  5 ],
  6:  [2, 3,  6 ],
  7:  [2, 4,  7 ],
  8:  [2, 4,  8 ],
  9:  [2, 3,  9 ],
  10: [2, 5,  10],
  11: [2, 4,  11],
  12: [2, 3,  6 ],
}

const gridStyle = computed(() => {
  const [tablet, laptop, desktop] = COLS[count.value] ?? [2, 3, 4]
  return {
    '--cols-tablet':  tablet,
    '--cols-laptop':  laptop,
    '--cols-desktop': desktop,
  }
})

function isVideo(item: LogGalleryItem) {
  return item.mediaType === 'video'
}
</script>

<template>
  <div class="log-gallery" :style="gridStyle">
    <figure v-for="(item, i) in items" :key="item._key ?? i" class="log-gallery__item">
      <div class="log-gallery__media-wrap">
        <Vid
          v-if="isVideo(item) && item.muxPlaybackId"
          :playbackId="item.muxPlaybackId"
          :preset="item.autoplay ? 'ambient' : 'default'"
        />
        <Pic
          v-else-if="item.imageUrl"
          :src="item.imageUrl"
          :alt="item.alt ?? ''"
          :width="item.imageMeta?.dimensions?.width"
          :height="item.imageMeta?.dimensions?.height"
          external
        />
      </div>
      <Text
        v-if="item.caption?.length"
        is="figcaption"
        size="caption-2"
        color="dim"
        class="log-gallery__caption"
      >
        <template v-for="block in item.caption" :key="block._key">
          <PortableTextSpan
            v-for="child in block.children"
            :key="child._key"
            :span="child"
            :markDefs="block.markDefs"
            size="caption-2"
          />
        </template>
      </Text>
    </figure>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/global' as *;

.log-gallery {
  display: grid;
  gap: var(--grid-gap);
  grid-template-columns: 1fr;

  @include tablet {
    grid-template-columns: repeat(var(--cols-tablet), 1fr);
  }

  @include laptop {
    grid-template-columns: repeat(var(--cols-laptop), 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(var(--cols-desktop), 1fr);
  }
}

.log-gallery__item {
  display: flex;
  flex-direction: column;
  gap: var(--unit-tinier);
}

.log-gallery__media-wrap {
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: var(--radii-tiny);

  :deep(.pic),
  :deep(.vid-wrapper) {
    width: 100%;
    height: 100%;
  }

  :deep(img),
  :deep(video) {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.log-gallery__caption {
  // inherits t-caption-2 from Text component
}
</style>
