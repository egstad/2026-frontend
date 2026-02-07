<script setup lang="ts">
import {sanityClient} from '~/utils/sanity'
import {formatDate} from '~/utils/formatDate'
import type {Media} from '~/types/sanity'
import PageSetup from '~/composables/PageSetup'

const route = useRoute()
const nuxtApp = useNuxtApp()

const {data: media} = await useAsyncData(
  `media-${route.params.slug}`,
  () =>
    sanityClient.fetch<Media>(
      `
    *[_type == "media" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      mediaType,
      image,
      alt,
      caption,
      autoplay,
      dateTaken,
      locationName,
      camera,
      lens,
      focalLength,
      aperture,
      shutterSpeed,
      iso,
      "imageUrl": image.asset->url,
      "imageMeta": {
        "dimensions": image.asset->metadata.dimensions
      },
      "muxPlaybackId": video.asset->playbackId,
      "videoMeta": {
        "aspectRatio": video.asset->data.aspect_ratio
      },
      "categories": categories[]->{ _id, name, slug },
      "tags": tags[]->{ _id, name, slug }
    }
  `,
      {slug: route.params.slug},
    ),
  {
    getCachedData: (key) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  },
)

if (!media.value) {
  throw createError({statusCode: 404, message: 'Media not found'})
}

PageSetup({
  seoMeta: {title: media.value?.title || 'Media'},
})

definePageMeta({
  pageTransition: false,
})
</script>

<template>
  <div class="media-detail" v-if="media">
    <NuxtLink to="/media" class="back">← Back to media</NuxtLink>

    <div class="media-container">
      <MediaEmbed :media="media" size="large" />
    </div>

    <div class="media-info">
      <h1>{{ media.title }}</h1>

      <div class="meta">
        <div class="meta-item" v-if="media.dateTaken">
          <span class="meta-label">Date</span>
          <span>{{ formatDate(media.dateTaken, {long: true}) }}</span>
        </div>
        <div class="meta-item" v-if="media.locationName">
          <span class="meta-label">Location</span>
          <span>{{ media.locationName }}</span>
        </div>
        <div class="meta-item" v-if="media.camera">
          <span class="meta-label">Camera</span>
          <span>{{ media.camera }}</span>
        </div>
        <div class="meta-item" v-if="media.lens">
          <span class="meta-label">Lens</span>
          <span>{{ media.lens }}</span>
        </div>
        <div class="meta-item" v-if="media.focalLength || media.aperture || media.shutterSpeed || media.iso">
          <span class="meta-label">Settings</span>
          <span>
            {{
              [media.focalLength, media.aperture, media.shutterSpeed, media.iso ? `ISO ${media.iso}` : '']
                .filter(Boolean)
                .join(' · ')
            }}
          </span>
        </div>
      </div>

      <div class="tags" v-if="media.categories?.length || media.tags?.length">
        <span v-for="cat in media.categories" :key="cat._id" class="tag category">{{ cat.name }}</span>
        <span v-for="tag in media.tags" :key="tag._id" class="tag">{{ tag.name }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/global' as *;

.media-detail {
  padding: var(--unit-base);
  min-height: 100vh;
}

.back {
  color: var(--foreground-tertiary);
  font-size: var(--caption-1);
  display: inline-block;
  margin-bottom: var(--unit-big);
  text-decoration: none;

  &:hover {
    color: var(--foreground-primary);
  }
}

.media-container {
  margin-bottom: var(--unit-big);
}

.media-info {
  h1 {
    font-size: var(--headline-2);
    font-weight: 500;
    margin-bottom: var(--unit-small);
  }
}

.meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--unit-tiny);
  margin-bottom: var(--unit-small);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--unit-tiniest);
}

.meta-label {
  font-size: var(--caption-2);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--foreground-tertiary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--unit-tiny);
}

.tag {
  background: var(--background-secondary);
  padding: var(--unit-tiniest) var(--unit-tiny);
  font-size: var(--caption-1);
  border-radius: var(--radii-tiny);

  &.category {
    background: var(--foreground-primary);
    color: var(--background-primary);
  }
}
</style>
