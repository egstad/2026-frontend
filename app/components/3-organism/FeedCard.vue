<template>
  <article class="feed-card" :style="{ '--aspect': aspectRatio }">
    <NuxtLink :to="`/work/${media.slug.current}`" class="feed-card__media">
      <Vid v-if="isVideo" :playbackId="media.muxPlaybackId" preset="ambient" />
      <Pic
        v-else-if="media.imageUrl"
        :src="media.imageUrl"
        :alt="media.alt || media.title"
        :width="width"
        :height="height"
        :external="true"
        :priority="priority"
        :loading="priority ? 'eager' : 'lazy'"
      />
      <div v-else class="feed-card__placeholder" />
    </NuxtLink>

    <footer class="feed-card__meta">
      <Text size="caption-2" is="h2" class="feed-card__title">
        {{ media.title }}
      </Text>
      <Text
        v-if="media.captionText"
        size="caption-2"
        color="dim"
        class="feed-card__caption"
      >
        {{ media.captionText }}
      </Text>
      <div v-if="media.categories?.length" class="feed-card__tags">
        <Text
          v-for="cat in media.categories"
          :key="cat._id"
          size="caption-2"
          color="dimmer"
          is="span"
          class="feed-card__tag"
        >
          {{ cat.name }}
        </Text>
      </div>
    </footer>
  </article>
</template>

<script setup lang="ts">
import type { Artifact } from "~/types/sanity";

const props = defineProps<{
  media: Artifact;
  priority?: boolean;
}>();

const isVideo = computed(
  () => props.media.mediaType === "video" && props.media.muxPlaybackId,
);

const width = computed(() => props.media.imageMeta?.dimensions?.width);
const height = computed(() => props.media.imageMeta?.dimensions?.height);

const aspectRatio = computed(() => {
  if (isVideo.value && props.media.videoMeta?.aspectRatio) {
    const [wStr, hStr] = props.media.videoMeta.aspectRatio.split(":");
    const w = parseFloat(wStr ?? "1");
    const h = parseFloat(hStr ?? "1");
    if (w && h) return w / h;
  }
  if (width.value && height.value) return width.value / height.value;
  return 1;
});
</script>

<style lang="scss" scoped>
// Width scales with aspect ratio relative to the container — purely %-based so
// it stays proportional at any viewport size, from mobile to cinema display.
// Base multiplier: 50% means a 1:1 square = half the container width,
// 16:9 landscape ≈ 89%, 9:16 portrait ≈ 28%.
$feed-base: 60%;

.feed-card {
  width: 100%;
  margin-inline: auto;

  @include mobile {
    width: min(100%, calc(var(--aspect, 1) * 80%));
  }

  @include phablet {
    width: min(100%, calc(var(--aspect, 1) * 75%));
  }

  @include tablet {
    width: min(100%, calc(var(--aspect, 1) * 55%));
  }

  @include laptop {
    width: min(100%, calc(var(--aspect, 1) * 35%));
  }
}

.feed-card__media {
  display: block;
  width: 100%;
  overflow: hidden;
  transition: opacity var(--transition-fast);

  &:hover {
    opacity: 0.9;
  }

  :deep(.pic),
  :deep(.vid) {
    display: block;
    width: 100%;
  }

  :deep(img),
  :deep(video) {
    display: block;
    width: 100%;
    height: auto;
  }
}

.feed-card__placeholder {
  width: 100%;
  aspect-ratio: 1;
  background: var(--background-secondary);
}

.feed-card__meta {
  padding: var(--unit-tinier) 0 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.feed-card__title {
  color: var(--foreground-primary);
  margin: 0;
}

.feed-card__caption {
  margin: 0;
}

.feed-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0 var(--unit-tinier);
}

.feed-card__tag {
  &::before {
    content: "#";
  }
}
</style>
