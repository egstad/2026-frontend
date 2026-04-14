<script setup lang="ts">
import { sanityClient } from "~/utils/sanity";
import type { Artifact } from "~/types/sanity";
import { useArtifactStore } from "~/stores/artifact";
import { useDeviceStore } from "~/stores/device";
import { gsap } from "gsap";

import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";
import { workCategoryFromQuery } from "~/utils/workCategoryQuery";

PageSetup({
  seoMeta: { title: "Artifact" },
});

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

const route = useRoute();
const router = useRouter();
const artifactStore = useArtifactStore();
const device = useDeviceStore();

// ─── Data ─────────────────────────────────────────────────────────────────────

// No top-level await: `<script setup>` + await makes this an async component; Vue
// can defer inner hydration (`__asyncHydrate`) so the first client pass still has
// `media === null` while the DOM from SSR already has the grid → mismatches.
const { data: media } = useAsyncData(
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
      "captionText": pt::text(caption),
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
  { lazy: false },
);

// ─── Category filter (URL query param) ────────────────────────────────────────

const activeCategory = computed(() =>
  workCategoryFromQuery(route.query.category),
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

/** Drives `<Transition>` so old results leave before new ones mount (`out-in`). */
const resultsAnimKey = computed(
  () =>
    `${activeView.value}|${activeSort.value}|${activeCategory.value ?? ""}|${artifactStore.randomSeed}`,
);

const RESULT_CARD_SELECTOR =
  ".masonry__card, .media-grid > .media-card, .feed .feed-card";

function elementsInViewport(elements: HTMLElement[]): HTMLElement[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return elements.filter((el) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
  });
}

function collectResultCards(root: Element): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(RESULT_CARD_SELECTOR)];
}

function splitInOffViewport(cards: HTMLElement[]) {
  const inView = elementsInViewport(cards);
  const inSet = new Set(inView);
  const offView = cards.filter((c) => !inSet.has(c));
  return { inView, offView };
}

function killResultTweens(root: Element) {
  const cards = collectResultCards(root);
  gsap.killTweensOf([root, ...cards]);
}

function resultsBeforeEnter(el: Element) {
  killResultTweens(el);
  const cards = collectResultCards(el);
  if (cards.length) gsap.set(cards, { opacity: 0 });
  else gsap.set(el, { opacity: 0 });
}

/** Initial load: fade in without heavy stepping. */
function resultsAppear(el: Element, done: () => void) {
  if (!import.meta.client) {
    done();
    return;
  }
  killResultTweens(el);
  requestAnimationFrame(() => {
    const cards = collectResultCards(el);
    if (!cards.length) {
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          ease: "power2.out",
          onComplete: done,
        },
      );
      return;
    }
    const { inView, offView } = splitInOffViewport(cards);
    if (offView.length) gsap.set(offView, { opacity: 1 });
    const targets = inView.length ? inView : cards;
    gsap.to(targets, {
      opacity: 1,
      duration: 0.48,
      stagger: { each: 0.02, from: "start" },
      ease: "power2.out",
      onComplete: () => {
        gsap.set(cards, { clearProps: "opacity" });
        done();
      },
    });
  });
}

/** After filter / sort / view / shuffle: stagger in from 0. */
function resultsEnter(el: Element, done: () => void) {
  if (!import.meta.client) {
    done();
    return;
  }
  killResultTweens(el);
  requestAnimationFrame(() => {
    const cards = collectResultCards(el);
    if (!cards.length) {
      gsap.fromTo(
        el,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.32,
          ease: "power2.out",
          onComplete: done,
        },
      );
      return;
    }
    const { inView, offView } = splitInOffViewport(cards);
    if (offView.length) gsap.set(offView, { opacity: 1 });
    const targets = inView.length ? inView : cards;
    gsap.to(targets, {
      opacity: 1,
      duration: 0.34,
      stagger: { each: 0.03, from: "start" },
      ease: "power2.out",
      onComplete: () => {
        gsap.set(cards, { clearProps: "opacity" });
        done();
      },
    });
  });
}

/** Stagger opacity out; `out-in` defers new mount until this finishes. */
function resultsLeave(el: Element, done: () => void) {
  if (!import.meta.client) {
    done();
    return;
  }
  killResultTweens(el);
  const cards = collectResultCards(el);
  if (!cards.length) {
    gsap.to(el, {
      opacity: 0,
      duration: 0.22,
      ease: "power2.in",
      onComplete: done,
    });
    return;
  }
  const { inView, offView } = splitInOffViewport(cards);
  if (offView.length) gsap.set(offView, { opacity: 0 });
  if (!inView.length) {
    done();
    return;
  }
  gsap.to(inView, {
    opacity: 0,
    duration: 0.2,
    stagger: { each: 0.03, from: "start" },
    ease: "power2.out",
    onComplete: done,
  });
}

// Reset to first page when filter or sort changes
watch([activeCategory, activeSort, () => artifactStore.randomSeed], () => {
  visibleCount.value = PAGE_SIZE;
});

// Masonry must not switch on until after mount: the dimensions plugin sets
// winWidth before hydration, so the client would otherwise pick MasonryGrid
// while SSR always had winWidth 0 → flex grid (hydration mismatch).
const masonryLayoutReady = ref(false);

onMounted(() => {
  masonryLayoutReady.value = true;

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
  if (!masonryLayoutReady.value) return 0;
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

      <Transition
        appear
        mode="out-in"
        :css="false"
        @before-appear="resultsBeforeEnter"
        @appear="resultsAppear"
        @before-enter="resultsBeforeEnter"
        @enter="resultsEnter"
        @leave="resultsLeave"
      >
        <div :key="resultsAnimKey" class="work-results-stage">
          <!-- Feed view: always one item wide with caption -->
          <div v-if="activeView === 'feed' && displayMedia.length" class="feed">
            <FeedCard
              v-for="(item, index) in visibleMedia"
              :key="item._id"
              :media="item"
              :priority="index < 3"
            />
          </div>

          <div v-else-if="displayMedia.length" class="media-results">
            <MasonryGrid
              v-if="masonryColumns > 0"
              :items="masonryItems"
              :columns="masonryColumns"
            >
              <template #default="{ item, index }">
                <MediaCard :media="item" :priority="index < 6" />
              </template>
            </MasonryGrid>

            <div
              v-else
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
          </div>

          <template v-else>
            <p v-if="!displayMedia.length && activeCategory" class="empty">
              No matches.
            </p>
            <p v-else-if="!media?.length" class="empty">No media yet.</p>
          </template>
        </div>
      </Transition>

      <!-- Sentinel: triggers next batch when scrolled into view -->
      <div ref="sentinelEl" class="sentinel" aria-hidden="true" />
    </Column>
  </Grid>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/global" as *;

.media-page {
  min-height: 100vh;
  padding-left: var(--unit-tinier);
  padding-right: var(--unit-tinier);
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

.media-results {
  min-height: 1px;
}

.media-grid {
  display: flex;
  flex-wrap: wrap;
}

.feed {
  display: flex;
  flex-direction: column;
  padding-block: var(--unit-small);
  gap: var(--unit-big);

  @include tablet {
    gap: var(--unit-biggest);
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
