<script setup lang="ts">
import { sanityClient, urlFor } from "~/utils/sanity";
import type { Log, LogAsset } from "~/types/sanity";
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

const route = useRoute();

const { data: log } = await useAsyncData(`log-${route.params.slug}`, () =>
  sanityClient.fetch<Log>(
    `
    *[_type == "log" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      date,
      "categories": categories[]->{ _id, name, slug },
      "tags": tags[]->{ _id, name, slug },
      asset {
        mediaType,
        youtubeUrl,
        autoplay,
        alt,
        "imageUrl": image.asset->url,
        "imageMeta": { "dimensions": image.asset->metadata.dimensions },
        "muxPlaybackId": video.asset->playbackId,
        image { crop, hotspot, asset }
      },
      body[] {
        ...,
        markDefs[] {
          ...,
          _type == "internalLink" => {
            ...,
            "reference": reference->{ _type, slug, title }
          }
        }
      },
      content[] {
        ...,
        _type == "artifactRef" => {
          _key,
          _type,
          size,
          "artifact": artifact-> {
            _id,
            _type,
            title,
            mediaType,
            alt,
            autoplay,
            "imageUrl": image.asset->url,
            "imageMeta": { "dimensions": image.asset->metadata.dimensions },
            "muxPlaybackId": video.asset->playbackId
          }
        },
        _type == "media" => {
          ...,
          image {
            crop,
            hotspot,
            asset
          },
          "imageUrl": image.asset->url,
          "imageMeta": { "dimensions": image.asset->metadata.dimensions },
          "muxPlaybackId": video.asset->playbackId,
          caption[] {
            ...,
            markDefs[] {
              ...,
              _type == "internalLink" => {
                ...,
                "reference": reference->{ _type, slug, title }
              }
            }
          }
        },
        _type == "gallery" => {
          _key,
          _type,
          size,
          items[] {
            ...,
            _type == "reference" => @-> {
              _id,
              _type,
              mediaType,
              alt,
              autoplay,
              "imageUrl": image.asset->url,
              "imageMeta": { "dimensions": image.asset->metadata.dimensions },
              "muxPlaybackId": video.asset->playbackId,
              caption[] {
                ...,
                markDefs[] {
                  ...,
                  _type == "internalLink" => {
                    ...,
                    "reference": reference->{ _type, slug, title }
                  }
                }
              }
            },
            _type == "galleryMedia" => {
              ...,
              "imageUrl": image.asset->url,
              "imageMeta": { "dimensions": image.asset->metadata.dimensions },
              "muxPlaybackId": video.asset->playbackId,
              caption[] {
                ...,
                markDefs[] {
                  ...,
                  _type == "internalLink" => {
                    ...,
                    "reference": reference->{ _type, slug, title }
                  }
                }
              }
            }
          }
        },
        _type == "youtube" => {
          ...,
          caption[] {
            ...,
            markDefs[] {
              ...,
              _type == "internalLink" => {
                ...,
                "reference": reference->{ _type, slug, title }
              }
            }
          }
        },
        markDefs[] {
          ...,
          _type == "internalLink" => {
            ...,
            "reference": reference->{ _type, slug, title }
          }
        }
      }
    }
  `,
    { slug: route.params.slug },
  ),
);

if (!log.value) {
  throw createError({ statusCode: 404, message: "Log not found" });
}

PageSetup({
  seoMeta: { title: log.value?.title || "Log" },
});

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

function resolvedAssetImageUrl(asset: LogAsset): string | undefined {
  return asset.image ? urlFor(asset.image).url() : asset.imageUrl
}
</script>

<template>
  <article v-if="log">
    <!-- Header -->
    <Grid class="log-header">
      <Column
        start-tablet="4"
        span-tablet="9"
        start-laptop="4"
        span-laptop="9"
        start-desktop="3"
        span-desktop="8"
      >
        <Text is="h1" class="my-big log-title" size="headline-1">{{
          log.title
        }}</Text>
        <div v-if="log.categories?.length || log.tags?.length" class="log-taxonomy">
          <NuxtLink
            v-for="cat in log.categories"
            :key="cat._id"
            :to="`/logs?c=${cat.slug.current}`"
            class="log-taxonomy__tag log-taxonomy__tag--category"
          ><Text size="caption-2">{{ cat.name }}</Text></NuxtLink>
          <NuxtLink
            v-for="tag in log.tags"
            :key="tag._id"
            :to="`/logs?t=${tag.slug.current}`"
            class="log-taxonomy__tag"
          ><Text size="caption-2" color="dimmer">{{ tag.name }}</Text></NuxtLink>
        </div>
      </Column>
    </Grid>

    <!-- Short-form: asset + body -->
    <template v-if="log.kind === 'short-form'">
      <!-- Asset -->
      <Grid v-if="log.asset" class="block block--media" :class="{ 'grid--full': false }">
        <Column start-tablet="4" span-tablet="9" start-laptop="4" span-laptop="9" start-desktop="3" span-desktop="8">
          <figure>
            <!-- Image -->
            <template v-if="log.asset.mediaType === 'image' || !log.asset.mediaType">
              <MediaEmbed :media="{ ...log.asset, imageUrl: resolvedAssetImageUrl(log.asset) }" />
            </template>
            <!-- Video -->
            <template v-else-if="log.asset.mediaType === 'video' && log.asset.muxPlaybackId">
              <MediaEmbed :media="log.asset" />
            </template>
            <!-- YouTube -->
            <template v-else-if="log.asset.mediaType === 'youtube' && log.asset.youtubeUrl && getYouTubeId(log.asset.youtubeUrl)">
              <div class="youtube-embed">
                <iframe
                  :src="`https://www.youtube.com/embed/${getYouTubeId(log.asset.youtubeUrl!)}`"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                />
              </div>
            </template>
          </figure>
        </Column>
      </Grid>
      <!-- Body (rich text only) -->
      <LogContent v-if="log.body?.length" :content="log.body as any" />
    </template>

    <!-- Long-form: full content -->
    <LogContent v-else-if="log.content" :content="log.content" />
  </article>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/global" as *;

.log-title {
  font-variation-settings: "wght" 450;
}

.youtube-embed {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--radii-tiny);
  overflow: hidden;

  iframe {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
}

.log-taxonomy {
  display: flex;
  flex-wrap: wrap;
  gap: var(--unit-tinier);
  margin-top: var(--unit-small);
}

.log-taxonomy__tag {
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--border-primary);
  padding: var(--unit-tiniest) var(--unit-tiny);
  border-radius: var(--radii-tiny);
  transition: border-color var(--transition-fast);

  &:hover { border-color: var(--foreground-secondary); }

  &--category {
    border-color: var(--foreground-quaternary);
  }
}

</style>
