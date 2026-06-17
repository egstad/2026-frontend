<script setup lang="ts">
import type { DiscogsRelease } from "~/composables/useDiscogs";

const props = defineProps<{
  release: DiscogsRelease;
}>();

const info = computed(() => props.release.basic_information);

const artistNames = computed(() =>
  info.value.artists.map((a) => a.name).join(", "),
);

function getReleaseUrl() {
  return `https://www.discogs.com/release/${props.release.id}`;
}
</script>

<template>
  <a
    :href="getReleaseUrl()"
    target="_blank"
    rel="noopener"
    class="record-card mb-small"
  >
    <div class="record-cover">
      <Pic
        v-if="info.cover_image"
        :src="info.cover_image"
        :alt="info.title"
        external
        loading="lazy"
      />
    </div>

    <div class="record-info">
      <Text is="h2" size="caption-2">{{ info.title }}</Text>
      <Text is="p" size="caption-2" color="dimmer">{{ artistNames }}</Text>
    </div>
  </a>
</template>

<style lang="scss" scoped>
.record-card {
  display: flex;
  flex-direction: column;
  gap: var(--unit-tiny);
  text-decoration: none;
  color: inherit;

  &:hover .t-dimmer {
    color: var(--foreground-primary);
  }
}

.record-cover {
  width: 100%;
  overflow: hidden;

  :deep(.pic) {
    aspect-ratio: 1;
  }

  :deep(.pic__image) {
    object-fit: cover;
  }
}

.record-info {
  text-wrap: balance;
  padding-right: var(--unit-tiny);
}
</style>
