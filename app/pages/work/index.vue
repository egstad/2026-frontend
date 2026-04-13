<script setup lang="ts">
import { sanityClient } from "~/utils/sanity";
import type { Artifact } from "~/types/sanity";
import { useArtifactStore } from "~/stores/artifact";
import { useDeviceStore } from "~/stores/device";
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

PageSetup({
  seoMeta: { title: "Artifact" },
});

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

const nuxtApp = useNuxtApp();
const route = useRoute();
const router = useRouter();
const artifactStore = useArtifactStore();
const device = useDeviceStore();

// ─── Data ─────────────────────────────────────────────────────────────────────

const { data: media } = await useAsyncData(
  "artifact",
  () =>
    sanityClient.fetch<Artifact[]>(`
    *[_type == "artifact"] | order(dateTaken desc, _createdAt desc) {
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
      "categories": categories[]->{ _id, name, slug }
    }
  `),
  {
    getCachedData: (key) =>
      nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  },
);

// ─── Category filter (URL query param) ────────────────────────────────────────

const activeCategory = computed(
  () => route.query.category as string | undefined,
);

function setCategory(slug: string | null) {
  router.push({ query: slug ? { category: slug } : {} });
}

// ─── Sort ─────────────────────────────────────────────────────────────────────

type SortOption = "random" | "newest" | "oldest";
const activeSort = ref<SortOption>("random");

function setSort(option: SortOption) {
  if (option === "random" && activeSort.value === "random") {
    artifactStore.reshuffle();
  }
  activeSort.value = option;
}

// ─── View ─────────────────────────────────────────────────────────────────────

type ViewOption = "inline" | "inline-small" | "feed";
const activeView = ref<ViewOption>("inline");

const rowHeight = computed(() => {
  if (activeView.value === "inline-small") return 100;
  return 330;
});

// ─── Shuffle ──────────────────────────────────────────────────────────────────

function seededRandom(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

const shuffledMedia = computed(() => {
  if (!media.value?.length) return [];
  return seededShuffle(media.value, artifactStore.randomSeed);
});

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

  return shuffledMedia.value;
});

// ─── Display (filtered + category) ───────────────────────────────────────────

const displayMedia = computed(() => {
  const cat = activeCategory.value;
  const items = sortedMedia.value;
  if (!cat) return items;
  return items.filter((item) =>
    item.categories?.some((c) => c.slug?.current === cat),
  );
});

// ─── Batch rendering ──────────────────────────────────────────────────────────

const PAGE_SIZE = 50;
const visibleCount = ref(PAGE_SIZE);
const sentinelEl = ref<HTMLElement | null>(null);
let sentinelObserver: IntersectionObserver | null = null;

const visibleMedia = computed(() =>
  displayMedia.value.slice(0, visibleCount.value),
);

// Reset to first page when filter or sort changes
watch([activeCategory, activeSort], () => {
  visibleCount.value = PAGE_SIZE;
});

onMounted(() => {
  sentinelObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) {
        visibleCount.value = Math.min(
          visibleCount.value + PAGE_SIZE,
          displayMedia.value.length,
        );
      }
    },
    { rootMargin: "400px" },
  );
  if (sentinelEl.value) sentinelObserver.observe(sentinelEl.value);
});

onUnmounted(() => {
  sentinelObserver?.disconnect();
});

// ─── Masonry ──────────────────────────────────────────────────────────────────

// Number of masonry columns at the current viewport width.
// 0 = use the standard inline flex layout (laptop+).
const masonryColumns = computed(() => {
  const w = device.winWidth;
  if (!w || w >= 1024) return 0;
  if (w >= 768) return 3;
  return 2;
});

function getAspectRatio(item: Artifact): number {
  if (item.mediaType === "video" && item.videoMeta?.aspectRatio) {
    const [wStr, hStr] = item.videoMeta.aspectRatio.split(":");
    const w = parseFloat(wStr ?? "1");
    const h = parseFloat(hStr ?? "1");
    if (w && h) return w / h;
  }
  const w = item.imageMeta?.dimensions?.width;
  const h = item.imageMeta?.dimensions?.height;
  if (w && h) return w / h;
  return 1;
}

const masonryItems = computed(() =>
  visibleMedia.value.map((item) => ({
    ...item,
    aspectRatio: getAspectRatio(item),
  })),
);
</script>

<template>
  <Grid class="media-page mt-big">
    <Column>
      <header class="media-header" v-if="media?.length">
        <div class="filters">
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
        </div>

        <span class="count">{{ displayMedia.length }}/{{ media.length }}</span>
      </header>

      <ClientOnly v-if="displayMedia.length">
        <!-- Mobile/tablet: masonry grid (row-first ordering) -->
        <MasonryGrid
          v-if="masonryColumns > 0"
          :items="masonryItems"
          :columns="masonryColumns"
        >
          <template #default="{ item, index }">
            <MediaCard :media="item" :priority="index < 6" />
          </template>
        </MasonryGrid>

        <!-- Laptop+: original inline flex layout -->
        <div
          v-else
          class="media-grid"
          :class="{ 'feed-view': activeView === 'feed' }"
          :style="{ '--row-height': `${rowHeight}px` }"
        >
          <MediaCard
            v-for="(item, index) in visibleMedia"
            :key="item._id"
            :media="item"
            :row-height="rowHeight"
            :priority="index < 3"
          />
        </div>

        <!-- SSR fallback: inline grid while client boots -->
        <template #fallback>
          <div
            class="media-grid"
            :style="{ '--row-height': `${rowHeight}px` }"
          >
            <MediaCard
              v-for="(item, index) in visibleMedia"
              :key="item._id"
              :media="item"
              :row-height="rowHeight"
              :priority="index < 3"
            />
          </div>
        </template>
      </ClientOnly>

      <!-- Sentinel: triggers next batch when scrolled into view -->
      <div ref="sentinelEl" class="sentinel" aria-hidden="true" />

      <p v-if="!displayMedia.length && activeCategory" class="empty">
        No matches.
      </p>
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

.sentinel {
  height: 1px;
  pointer-events: none;
}

.empty {
  color: var(--foreground-tertiary);
  padding: var(--unit-huge);
}
</style>
