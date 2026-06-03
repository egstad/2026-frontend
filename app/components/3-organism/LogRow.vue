<script setup lang="ts">
import { formatDate } from '~/utils/formatDate'
import type { Log } from '~/types/sanity'

interface LogPreview {
  _type: string
  imageUrl?: string | null
  youtubeUrl?: string | null
}

interface LogWithPreviews extends Log {
  previews?: LogPreview[]
}

const props = defineProps<{ log: LogWithPreviews }>()

function getYouTubeThumb(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  const id = match?.[1]
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
}

const previews = computed(() => (props.log.previews ?? []).slice(0, 4))
</script>

<template>
  <NuxtLink :to="`/logs/${log.slug.current}`" class="log-row">

    <!-- Info cell -->
    <div class="log-row__info item">
      <Text size="caption-2" color="dimmer" is="time" :datetime="log.date">{{ formatDate(log.date) }}</Text>
      <Text size="body-1" class="log-row__title">{{ log.title }}</Text>
      <Text v-if="log.excerpt" size="caption-1" color="dim" class="log-row__excerpt">{{ log.excerpt }}</Text>
    </div>

    <!-- Preview thumbnails -->
    <div
      v-for="(preview, i) in previews"
      :key="i"
      class="log-row__thumb item"
      :data-index="i"
    >
      <img
        v-if="preview.imageUrl"
        :src="preview.imageUrl"
        alt=""
        loading="lazy"
      />
      <img
        v-else-if="preview.youtubeUrl && getYouTubeThumb(preview.youtubeUrl)"
        :src="getYouTubeThumb(preview.youtubeUrl)!"
        alt=""
        loading="lazy"
      />
      <div v-else class="log-row__placeholder" />
    </div>

  </NuxtLink>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/global' as *;

.log-row {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: var(--unit-tiny);
  padding: var(--unit-tiny);
  border: 1px solid var(--border-primary);
  text-decoration: none;
  color: inherit;
  transition: border-color var(--transition-fast);

  &:hover {
    border-color: var(--foreground-secondary);
  }
}

.item {
  aspect-ratio: 1;
  overflow: hidden;
}

.log-row__info {
  padding: var(--unit-tiny);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--unit-tinier);
}

.log-row__title {
  line-height: 1.2;
}

.log-row__excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.log-row__thumb {
  display: none;
  background: var(--background-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.log-row__placeholder {
  width: 100%;
  height: 100%;
  background: var(--background-secondary);
}

@include phablet {
  .log-row__thumb[data-index='0'] { display: block; }
}

@include tablet {
  .log-row__thumb[data-index='1'] { display: block; }
}

@include laptop {
  .log-row__thumb[data-index='2'] { display: block; }
}

@include desktop {
  .log-row__thumb[data-index='3'] { display: block; }
}
</style>
