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

const thumb = computed(() => {
  for (const p of props.log.previews ?? []) {
    if (p.imageUrl) return { type: 'image', url: p.imageUrl }
    if (p.youtubeUrl) {
      const t = getYouTubeThumb(p.youtubeUrl)
      if (t) return { type: 'image', url: t }
    }
  }
  return null
})
</script>

<template>
  <NuxtLink :to="`/logs/${log.slug.current}`" class="log-card">
    <!-- Visual -->
    <img v-if="thumb" :src="thumb.url" :alt="log.title" loading="lazy" class="log-card__image" />

    <!-- Text fallback -->
    <div v-else class="log-card__text">
      <Text size="caption-1" color="dimmer" is="time" :datetime="log.date">{{ formatDate(log.date) }}</Text>
      <Text size="body-2" class="log-card__title">{{ log.title }}</Text>
      <Text v-if="log.excerpt" size="caption-1" color="dim" class="log-card__excerpt">{{ log.excerpt }}</Text>
    </div>

    <!-- Title overlay on visual cards -->
    <div v-if="thumb" class="log-card__overlay">
      <Text size="caption-1" class="log-card__overlay-title">{{ log.title }}</Text>
    </div>
  </NuxtLink>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/global' as *;

.log-card {
  position: relative;
  aspect-ratio: 1;
  display: block;
  border: 1px solid var(--border-primary);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  transition: border-color var(--transition-fast);

  &:hover {
    border-color: var(--foreground-secondary);

    .log-card__overlay {
      opacity: 1;
    }
  }
}

.log-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.log-card__text {
  width: 100%;
  height: 100%;
  padding: var(--unit-tiny);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: var(--unit-tinier);
}

.log-card__title {
  line-height: 1.2;
}

.log-card__excerpt {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.log-card__overlay {
  position: absolute;
  inset: 0;
  padding: var(--unit-tiny);
  display: flex;
  align-items: flex-end;
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%);
  opacity: 0;
  transition: opacity var(--transition-fast);

  :deep([class^="t-"]) {
    color: white;
  }
}
</style>
