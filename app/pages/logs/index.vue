<script setup lang="ts">
import { sanityClient } from "~/utils/sanity";
import { formatDate } from "~/utils/formatDate";
import type { Log } from "~/types/sanity";
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

PageSetup({ seoMeta: { title: "Logs" } });
definePageMeta({ pageTransition: pageTransitionDefault() });

const { data: logs } = await useAsyncData("logs", () =>
  sanityClient.fetch<Log[]>(`
    *[_type == "log"] | order(date desc) {
      _id,
      kind,
      title,
      slug,
      date,
      "excerpt": array::join(content[_type == "block" && style == "normal"][0].children[].text, ""),
      "categories": categories[]->{ _id, name, slug },
      "tags": tags[]->{ _id, name, slug },
      "previews": select(
        kind == "short-form" => [{
          "_type": "asset",
          "imageUrl": asset.image.asset->url,
          "dimensions": asset.image.asset->metadata.dimensions,
          "youtubeUrl": asset.youtubeUrl
        }],
        content[_type in ["media", "artifactRef", "youtube"]][0..0] {
          _type,
          "imageUrl": select(
            _type == "media" => image.asset->url,
            _type == "artifactRef" => artifact->image.asset->url,
            null
          ),
          "dimensions": select(
            _type == "media" => image.asset->metadata.dimensions,
            _type == "artifactRef" => artifact->image.asset->metadata.dimensions,
            null
          ),
          "youtubeUrl": select(_type == "youtube" => url, null)
        }
      )
    }
  `),
);

function getYouTubeThumb(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  const id = match?.[1];
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

function getAsset(log: Log & { previews?: any[] }) {
  const p = log.previews?.[0];
  if (!p) return null;
  const url =
    p.imageUrl ?? (p.youtubeUrl ? getYouTubeThumb(p.youtubeUrl) : null);
  if (!url) return null;
  const aspect = p.dimensions?.aspectRatio ?? (p.youtubeUrl ? 16 / 9 : 1);
  return { url, aspect };
}
</script>

<template>
  <div class="logs-feed">
    <template v-if="logs?.length">
      <Grid v-for="log in logs" :key="log._id" class="feed-entry">
        <!-- Left: date -->
        <Column span-tablet="3" span-desktop="2">
          <Text
            is="time"
            size="caption-1"
            color="dimmer"
            :datetime="log.date"
            class="date"
            >{{ formatDate(log.date) }}</Text
          >
        </Column>

        <!-- Right: content -->
        <Column
          span-tablet="9"
          span-laptop="6"
          start-desktop="3"
          span-desktop="5"
          class="feed-entry__body"
        >
          <Text is="h2" size="headline-2">
            <NuxtLink
              v-if="log.kind !== 'short-form'"
              :to="`/logs/${log.slug.current}`"
              class="feed-entry__link"
              >{{ log.title }}</NuxtLink
            >
            <template v-else>{{ log.title }}</template>
          </Text>

          <Text v-if="log.excerpt" color="dim" size="body-2" class="mt-tinier">
            {{ log.excerpt
            }}<NuxtLink
              v-if="log.kind !== 'short-form'"
              :to="`/logs/${log.slug.current}`"
              class="feed-entry__read-more"
            >
              Read more...</NuxtLink
            >
          </Text>

          <div v-if="getAsset(log)" class="feed-entry__asset mt-small">
            <img :src="getAsset(log)!.url" :alt="log.title" loading="lazy" />
          </div>

          <div
            v-if="log.categories?.length || log.tags?.length"
            class="feed-entry__tags"
          >
            <Text size="caption-2" color="dimmer">Filed as </Text>
            <Text
              v-for="cat in log.categories"
              :key="cat._id"
              size="caption-2"
              color="dimmer"
              >#{{ cat.name }}</Text
            >
            <Text
              v-for="tag in log.tags"
              :key="tag._id"
              size="caption-2"
              color="dimmer"
              >#{{ tag.name }}</Text
            >
          </div>
        </Column>
      </Grid>
    </template>

    <Text v-else color="dimmer">No logs yet.</Text>
  </div>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/global" as *;

.logs-feed {
  padding-bottom: var(--unit-biggest);
}

.feed-entry {
  padding-block: var(--unit-big);

  align-items: first baseline;
}

.feed-entry__body {
  display: flex;
  flex-direction: column;
}

.date {
  display: block;
  margin-bottom: var(--unit-tiny);
}

.feed-entry__excerpt {
  // inherits t-body-2 from Text component
}

.feed-entry__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  margin-top: var(--unit-tinier);
  gap: var(--unit-tiniest);
}

.feed-entry__link {
  text-decoration: none;
  color: inherit;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.6;
  }
}

.feed-entry__read-more {
  white-space: nowrap;
}

.feed-entry__asset {
  :deep(img) {
    display: block;
    width: 100%;
    height: auto;
    border-radius: var(--radii-tiny);
    border: 1px solid var(--border-opaque);
  }
}
</style>
