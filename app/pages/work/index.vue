<script setup lang="ts">
import { sanityClient } from "~/utils/sanity";
import type { Artifact } from "~/types/sanity";
import { useArtifactStore } from "~/stores/artifact";
import { useDeviceStore } from "~/stores/device";
import { gsap } from "gsap";

import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";
import {
  sortFromQuery,
  viewFromQuery,
  categoryFromQuery,
} from "~/utils/workQuery";
import type { SortOption, ViewOption } from "~/utils/workQuery";

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
      autoplay,
      dateTaken,
      locationName,
      camera,
      lens,
      focalLength,
      aperture,
      shutterSpeed,
      iso,
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
      "categories": categories[]->{ _id, name, slug },
      "tags": tags[]->{ _id, name, slug }
    }
  `),
  { lazy: false },
);

// ─── URL-driven filter state (?c= category, ?s= sort, ?v= view) ──────────────

const activeCategory = computed(() => categoryFromQuery(route.query.c));
const activeSort = computed(() => sortFromQuery(route.query.s));
const activeView = computed(() => viewFromQuery(route.query.v));

function buildQuery(patch: Record<string, string | undefined>) {
  const q: Record<string, string> = {};
  for (const key of ["c", "s", "v"] as const) {
    // Use patch value if the key was explicitly provided, otherwise keep current
    const val = Object.hasOwn(patch, key)
      ? patch[key]
      : (route.query[key] as string | undefined);
    if (val) q[key] = val;
  }
  return q;
}

function setCategory(slug: string | null) {
  router.push({ query: buildQuery({ c: slug || undefined }) });
}

function setSort(option: SortOption) {
  if (option === "random" && activeSort.value === "random") {
    artifactStore.reshuffle();
  }
  router.push({
    query: buildQuery({ s: option === "random" ? undefined : option }),
  });
}

function setView(option: ViewOption) {
  router.push({
    query: buildQuery({ v: option === "inline" ? undefined : option }),
  });
}

// ─── View ─────────────────────────────────────────────────────────────────────

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

const TEXT_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;
const PAGE_SIZE = computed(() =>
  activeView.value === "text" ? TEXT_PAGE_SIZE : DEFAULT_PAGE_SIZE,
);
const visibleCount = ref(PAGE_SIZE.value);
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
  ".masonry__card, .media-grid > .media-card, .feed .feed-card, .work-text .work-text__row";

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
    // @before-appear may have hidden the CONTAINER (when cards weren't in the DOM
    // yet because async data resolved after the hook fired). Cards may also have
    // arrived after that hook, so their opacity could be either 0 (set by the hook)
    // or natural (1, if they mounted after). Normalise both cases here: restore the
    // container and ensure every card starts at 0 so the stagger plays correctly.
    gsap.set(el, { clearProps: "opacity" });
    gsap.set(cards, { opacity: 0 });
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
    // Mirror the same container-restore + card-normalise pattern from resultsAppear
    // to guard against the same async-data timing race.
    gsap.set(el, { clearProps: "opacity" });
    gsap.set(cards, { opacity: 0 });
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

// Reset to first page when filter, sort, or view changes
watch(
  [activeCategory, activeSort, activeView, () => artifactStore.randomSeed],
  () => {
    visibleCount.value = PAGE_SIZE.value;
  },
);

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
          visibleCount.value + PAGE_SIZE.value,
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

// ─── Lightbox ─────────────────────────────────────────────────────────────────
// Freeze the column layout while the lightbox is open.
// masonryColumns depends on device.winWidth, so resizing across the 1024px
// breakpoint toggles the v-if between MasonryGrid and the flex grid, destroying
// every MediaCard — including the active one. That remounts Vid.vue, which
// reinitialises HLS.js and restarts the video from the beginning.
// Solution: snapshot the column count when the lightbox opens and hold it there
// until the lightbox closes, then let the grid update to the current viewport.

const { activeArtifact: lbActiveArtifact } = useWorkLightbox();
const frozenMasonryColumns = ref<number | null>(null);

watch(
  () => !!lbActiveArtifact.value,
  (isOpen) => {
    frozenMasonryColumns.value = isOpen ? masonryColumns.value : null;
  },
);

const effectiveMasonryColumns = computed(() =>
  frozenMasonryColumns.value !== null
    ? frozenMasonryColumns.value
    : masonryColumns.value,
);

// Provide the current filtered list to MediaCard / FeedCard so every card
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
              @click="setView('inline')"
            >
              inline
            </BaseButton>
            <BaseButton
              size="small"
              :variant="activeView === 'feed' ? 'primary' : 'ghost'"
              @click="setView('feed')"
            >
              feed
            </BaseButton>
            <BaseButton
              size="small"
              :variant="activeView === 'text' ? 'primary' : 'ghost'"
              @click="setView('text')"
            >
              text
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

          <!-- Text view: table of contents -->
          <div
            v-else-if="activeView === 'text' && displayMedia.length"
            class="work-text"
          >
            <WorkTextRow
              v-for="item in visibleMedia"
              :key="item._id"
              :media="item"
            />
          </div>

          <div v-else-if="displayMedia.length" class="media-results">
            <MasonryGrid
              v-if="effectiveMasonryColumns > 0"
              :items="masonryItems"
              :columns="effectiveMasonryColumns"
            >
              <template #default="{ item, index }">
                <MediaCard
                  :key="item._id"
                  :media="item"
                  :priority="index < 6"
                />
              </template>
            </MasonryGrid>

            <div v-else class="media-grid">
              <MediaCard
                v-for="(item, index) in visibleMedia"
                :key="item._id"
                :media="item"
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

      <!-- Lightbox: dialog uses the top-layer so DOM position doesn't matter -->
      <WorkMediaLightbox />
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

.work-text {
  display: grid;
  grid-template-columns: 1fr;
  // border-top: 1px solid var(--border-primary);

  @include laptop {
    grid-template-columns: repeat(2, 1fr);
    column-gap: var(--grid-gap);
  }
  @include desktop {
    grid-template-columns: repeat(3, 1fr);
  }
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
