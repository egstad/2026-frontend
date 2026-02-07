<script setup lang="ts">
import { sanityClient } from "~/utils/sanity";
import type { Media, Category, Tag, Client } from "~/types/sanity";
import { useMediaStore } from "~/stores/media";
import PageSetup from "~/composables/PageSetup";

PageSetup({
  seoMeta: { title: "Media" },
});

definePageMeta({
  pageTransition: false,
});

const nuxtApp = useNuxtApp();
const mediaStore = useMediaStore();

// Fetch all media with their relationships
const { data: media } = await useAsyncData(
  "media",
  () =>
    sanityClient.fetch<Media[]>(`
    *[_type == "media"] | order(dateTaken desc, _createdAt desc) {
      _id,
      title,
      slug,
      mediaType,
      alt,
      dateTaken,
      _createdAt,
      "imageUrl": image.asset->url,
      "imageMeta": {
        "dimensions": image.asset->metadata.dimensions
      },
      "muxPlaybackId": video.asset->playbackId,
      "videoMeta": {
        "aspectRatio": video.asset->data.aspect_ratio
      },
      "categories": categories[]->{ _id, name, slug },
      "tags": tags[]->{ _id, name, slug },
      "clients": clients[]->{ _id, name, slug }
    }
  `),
  {
    getCachedData: (key) =>
      nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  },
);

// Fetch filter options
const { data: filterOptions } = await useAsyncData(
  "media-filters",
  () =>
    sanityClient.fetch<{
      categories: Category[];
      tags: Tag[];
      clients: Client[];
    }>(`{
      "categories": *[_type == "category"] | order(name asc) { _id, name, slug },
      "tags": *[_type == "tag"] | order(name asc) { _id, name, slug },
      "clients": *[_type == "client"] | order(name asc) { _id, name, slug }
    }`),
  {
    getCachedData: (key) =>
      nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  },
);

// Filter state
const activeFilters = reactive({
  mediaType: null as "image" | "video" | null,
  categories: [] as string[],
  tags: [] as string[],
  clients: [] as string[],
});

// Sort state
type SortOption = "random" | "newest" | "oldest";
const activeSort = ref<SortOption>("random");

// View state
type ViewOption = "inline" | "inline-small" | "feed";
const activeView = ref<ViewOption>("inline");

const rowHeight = computed(() => {
  if (activeView.value === "inline-small") return 100;
  return 330;
});

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return (
    activeFilters.mediaType !== null ||
    activeFilters.categories.length > 0 ||
    activeFilters.tags.length > 0 ||
    activeFilters.clients.length > 0
  );
});

// Clear all filters
function clearFilters() {
  activeFilters.mediaType = null;
  activeFilters.categories = [];
  activeFilters.tags = [];
  activeFilters.clients = [];
}

// Toggle a filter value
function toggleFilter(type: "categories" | "tags" | "clients", id: string) {
  const index = activeFilters[type].indexOf(id);
  if (index === -1) {
    activeFilters[type].push(id);
  } else {
    activeFilters[type].splice(index, 1);
  }
}

// Toggle media type filter
function toggleMediaType(type: "image" | "video") {
  activeFilters.mediaType = activeFilters.mediaType === type ? null : type;
}

// Set sort option (reshuffle if clicking random again)
function setSort(option: SortOption) {
  if (option === "random" && activeSort.value === "random") {
    // Already on random, reshuffle
    mediaStore.reshuffle();
  }
  activeSort.value = option;
}

// Seeded random number generator (mulberry32)
function seededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Seeded Fisher-Yates shuffle
function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  const random = seededRandom(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const temp = result[i]!;
    result[i] = result[j]!;
    result[j] = temp;
  }
  return result;
}

// Shuffled media based on stored seed (recomputes when seed changes)
const shuffledMedia = computed(() => {
  if (!media.value?.length) return [];
  return seededShuffle(media.value, mediaStore.randomSeed);
});

// Get sorted media based on active sort
const sortedMedia = computed(() => {
  const items = media.value;
  const sort = activeSort.value;

  if (!items?.length) return [];

  if (sort === "newest") {
    return [...items].sort((a, b) => {
      const dateA = a.dateTaken || a._createdAt || "";
      const dateB = b.dateTaken || b._createdAt || "";
      return dateB.localeCompare(dateA);
    });
  }

  if (sort === "oldest") {
    return [...items].sort((a, b) => {
      const dateA = a.dateTaken || a._createdAt || "";
      const dateB = b.dateTaken || b._createdAt || "";
      return dateA.localeCompare(dateB);
    });
  }

  // Default to random/shuffled (seeded for persistence)
  return shuffledMedia.value;
});

// Filtered media based on active filters
const displayMedia = computed(() => {
  if (!sortedMedia.value.length) return [];

  return sortedMedia.value.filter((item) => {
    // Media type filter
    if (activeFilters.mediaType && item.mediaType !== activeFilters.mediaType) {
      return false;
    }

    // Category filter (match any selected)
    if (activeFilters.categories.length > 0) {
      const itemCategoryIds = item.categories?.map((c) => c._id) || [];
      if (
        !activeFilters.categories.some((id) => itemCategoryIds.includes(id))
      ) {
        return false;
      }
    }

    // Tag filter (match any selected)
    if (activeFilters.tags.length > 0) {
      const itemTagIds = item.tags?.map((t) => t._id) || [];
      if (!activeFilters.tags.some((id) => itemTagIds.includes(id))) {
        return false;
      }
    }

    // Client filter (match any selected)
    if (activeFilters.clients.length > 0) {
      const itemClientIds = item.clients?.map((c) => c._id) || [];
      if (!activeFilters.clients.some((id) => itemClientIds.includes(id))) {
        return false;
      }
    }

    return true;
  });
});
</script>

<template>
  <Grid class="media-page mt-big">
    <Column>
      <header class="media-header" v-if="media?.length">
        <div class="filters">
          <!-- Media Type -->
          <div class="filter-group">
            <BaseButton
              size="small"
              :variant="
                activeFilters.mediaType === 'image' ? 'primary' : 'ghost'
              "
              @click="toggleMediaType('image')"
            >
              image
            </BaseButton>
            <BaseButton
              size="small"
              :variant="
                activeFilters.mediaType === 'video' ? 'primary' : 'ghost'
              "
              @click="toggleMediaType('video')"
            >
              video
            </BaseButton>
          </div>

          <!-- Categories -->
          <div class="filter-group" v-if="filterOptions?.categories?.length">
            <BaseButton
              v-for="cat in filterOptions.categories"
              :key="cat._id"
              size="small"
              :variant="
                activeFilters.categories.includes(cat._id) ? 'primary' : 'ghost'
              "
              @click="toggleFilter('categories', cat._id)"
            >
              {{ cat.name }}
            </BaseButton>
          </div>

          <!-- Tags -->
          <div class="filter-group" v-if="filterOptions?.tags?.length">
            <BaseButton
              v-for="tag in filterOptions.tags"
              :key="tag._id"
              size="small"
              :variant="
                activeFilters.tags.includes(tag._id) ? 'primary' : 'ghost'
              "
              @click="toggleFilter('tags', tag._id)"
            >
              {{ tag.name }}
            </BaseButton>
          </div>

          <!-- Clients -->
          <div class="filter-group" v-if="filterOptions?.clients?.length">
            <BaseButton
              v-for="client in filterOptions.clients"
              :key="client._id"
              size="small"
              :variant="
                activeFilters.clients.includes(client._id) ? 'primary' : 'ghost'
              "
              @click="toggleFilter('clients', client._id)"
            >
              {{ client.name }}
            </BaseButton>
          </div>

          <!-- Sort -->
          <div class="filter-group">
            <BaseButton
              size="small"
              :variant="activeSort === 'random' ? 'primary' : 'ghost'"
              @click="setSort('random')"
            >
              random
            </BaseButton>
            <BaseButton
              size="small"
              :variant="activeSort === 'newest' ? 'primary' : 'ghost'"
              @click="setSort('newest')"
            >
              newest
            </BaseButton>
            <BaseButton
              size="small"
              :variant="activeSort === 'oldest' ? 'primary' : 'ghost'"
              @click="setSort('oldest')"
            >
              oldest
            </BaseButton>
          </div>

          <!-- View -->
          <div class="filter-group">
            <BaseButton
              size="small"
              :variant="activeView === 'inline' ? 'primary' : 'ghost'"
              @click="activeView = 'inline'"
            >
              inline
            </BaseButton>
            <BaseButton
              size="small"
              :variant="activeView === 'inline-small' ? 'primary' : 'ghost'"
              @click="activeView = 'inline-small'"
            >
              inline small
            </BaseButton>
            <BaseButton
              size="small"
              :variant="activeView === 'feed' ? 'primary' : 'ghost'"
              @click="activeView = 'feed'"
            >
              feed
            </BaseButton>
          </div>

          <!-- Clear filters -->
          <BaseButton
            v-if="hasActiveFilters"
            size="small"
            variant="secondary"
            @click="clearFilters"
          >
            clear
          </BaseButton>
        </div>

        <span class="count">{{ displayMedia.length }}/{{ media.length }}</span>
      </header>

      <div
        class="media-grid"
        :class="{ 'feed-view': activeView === 'feed' }"
        :style="{ '--row-height': `${rowHeight}px` }"
        v-if="displayMedia.length"
      >
        <MediaCard v-for="item in displayMedia" :key="item._id" :media="item" />
      </div>

      <p v-else-if="hasActiveFilters" class="empty">No matches.</p>
      <p v-else-if="!media?.length" class="empty">No media yet.</p>
    </Column>
  </Grid>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/global" as *;

.media-page {
  min-height: 100vh;
}

.media-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--unit-tiny);
  flex-wrap: wrap;
}

.filters {
  display: flex;
  align-items: flex-start;
  gap: var(--unit-small);
}

.filter-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  max-height: 200px;
  overflow-y: auto;
}

.count {
  font-size: var(--caption-2);
  line-height: 1;
  color: var(--foreground-tertiary);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.media-grid {
  display: flex;
  flex-wrap: wrap;

  &.feed-view {
    flex-direction: column;
    align-items: center;
    gap: var(--unit-small);
    padding: var(--unit-small);

    :deep(.media-card) {
      width: auto;
      height: auto;
      max-width: 100vw;
      max-height: 80vh;
      margin: 0;
    }

    :deep(.media-card img),
    :deep(.media-card video) {
      width: auto;
      height: auto;
      max-width: 100vw;
      max-height: 80vh;
      object-fit: contain;
    }
  }
}

.empty {
  color: var(--foreground-tertiary);
  padding: var(--unit-huge);
}
</style>
