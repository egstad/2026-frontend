<script setup lang="ts">
import {sanityClient} from '~/utils/sanity'
import {formatDate} from '~/utils/formatDate'
import type {Log} from '~/types/sanity'
import PageSetup from '~/composables/PageSetup'

const route = useRoute()

const {data: log} = await useAsyncData(`log-${route.params.slug}`, () =>
  sanityClient.fetch<Log>(
    `
    *[_type == "log" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      date,
      content[] {
        ...,
        _type == "reference" => @-> {
          _id,
          _type,
          title,
          mediaType,
          alt,
          autoplay,
          "imageUrl": image.asset->url,
          "imageMeta": {
            "dimensions": image.asset->metadata.dimensions
          },
          "muxPlaybackId": video.asset->playbackId
        }
      }
    }
  `,
    {slug: route.params.slug},
  ),
)

if (!log.value) {
  throw createError({statusCode: 404, message: 'Log not found'})
}

PageSetup({
  seoMeta: {title: log.value?.title || 'Log'},
})
</script>

<template>
  <article class="log-detail" v-if="log">
    <header class="log-header">
      <NuxtLink to="/logs" class="back">← Back to logs</NuxtLink>
      <time class="date">{{ formatDate(log.date, {long: true}) }}</time>
      <h1>{{ log.title }}</h1>
    </header>

    <div class="content" v-if="log.content">
      <template v-for="block in log.content" :key="block._key">
        <template v-if="block._type === 'block'">
          <p v-if="block.style === 'normal'">
            <PortableTextSpan v-for="child in block.children" :key="child._key" :span="child" />
          </p>
          <h2 v-else-if="block.style === 'h2'">
            <PortableTextSpan v-for="child in block.children" :key="child._key" :span="child" />
          </h2>
          <h3 v-else-if="block.style === 'h3'">
            <PortableTextSpan v-for="child in block.children" :key="child._key" :span="child" />
          </h3>
          <blockquote v-else-if="block.style === 'blockquote'">
            <PortableTextSpan v-for="child in block.children" :key="child._key" :span="child" />
          </blockquote>
        </template>

        <template v-else-if="block._type === 'media'">
          <figure class="media-figure">
            <MediaEmbed :media="block" />
          </figure>
        </template>
      </template>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/global' as *;

.log-detail {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--unit-base);
  min-height: 100vh;
}

.log-header {
  margin-bottom: var(--unit-big);
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

.date {
  display: block;
  color: var(--foreground-tertiary);
  font-size: var(--caption-1);
  font-variant-numeric: tabular-nums;
  margin-bottom: var(--unit-tiny);
}

h1 {
  font-size: var(--headline-1);
  font-weight: 400;
  line-height: 1.2;
}

.content {
  font-size: var(--body-1);
  line-height: 1.8;

  p {
    margin-bottom: var(--unit-small);
  }

  h2 {
    font-size: var(--headline-2);
    font-weight: 500;
    margin: var(--unit-big) 0 var(--unit-tiny);
  }

  h3 {
    font-size: var(--headline-3);
    font-weight: 500;
    margin: var(--unit-base) 0 var(--unit-tiny);
  }

  blockquote {
    border-left: 3px solid var(--border-primary);
    padding-left: var(--unit-small);
    margin: var(--unit-base) 0;
    color: var(--foreground-secondary);
    font-style: italic;
  }

  code {
    background: var(--background-secondary);
    padding: 0.1em 0.3em;
    border-radius: var(--radii-tiny);
    font-size: 0.9em;
  }
}

.media-figure {
  margin: var(--unit-big) 0;
}
</style>
