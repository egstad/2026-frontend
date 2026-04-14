<template>
  <MasonryWall
    class="masonry-root"
    :items="items"
    :min-columns="columns"
    :max-columns="columns"
    :column-width="1"
    :gap="MASONRY_GAP_PX"
    :ssr-columns="columns"
    :key-mapper="itemKey"
  >
    <template #default="{ item, index }">
      <div
        class="masonry__card"
        :style="{ aspectRatio: String(item.aspectRatio || 1) }"
      >
        <slot :item="item" :index="index" />
      </div>
    </template>
  </MasonryWall>
</template>

<script setup lang="ts">
// @yeger/vue-masonry-wall: Vue 3 / SSR port of fuxingloh/vue-masonry-wall (pure Vue,
// no Metafizzy DOM). See https://github.com/DerYeger/yeger/tree/main/packages/vue-masonry-wall

import type { KeyMapper } from "@yeger/vue-masonry-wall";
import { MasonryWall } from "@yeger/vue-masonry-wall";

import type { Artifact } from "~/types/sanity";

export type MasonryItem = Artifact & { aspectRatio: number };

/** Matches previous grid gutter (px). */
const MASONRY_GAP_PX = 8;

const props = defineProps<{
  items: MasonryItem[];
  columns: number;
}>();

const itemKey: KeyMapper<MasonryItem> = (item) => item._id;
</script>

<style lang="scss" scoped>
.masonry-root {
  width: 100%;
}

.masonry-root :deep(.masonry-item) {
  min-width: 0;
}

.masonry__card {
  width: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--background-secondary);
}

.masonry__card :deep(.media-card) {
  display: block;
  width: 100%;
  height: 100%;
  aspect-ratio: unset;
  margin: 0;
  max-width: unset;
}

.masonry__card :deep(img),
.masonry__card :deep(video) {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}
</style>
