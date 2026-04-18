<script setup lang="ts">
import { useDeviceStore } from "~/stores/device";
import { useArtifactStore } from "~/stores/artifact";
import { useWorkCategories } from "~/composables/useWorkCategories";
import {
  categoryFromQuery,
  sortFromQuery,
  viewFromQuery,
} from "~/utils/workQuery";
import type { SortOption, ViewOption } from "~/utils/workQuery";

const route = useRoute();
const router = useRouter();
const device = useDeviceStore();
const artifactStore = useArtifactStore();
const { data: workCategories } = useWorkCategories();

// ─── Bar visibility ───────────────────────────────────────────────────────────
// Show once the user has scrolled past the "near top" zone.
// Hide again after scrolling down 20px from wherever the bar last appeared.

const scrollY = ref(0);
const hideThreshold = ref(0);
let peakScrollY = 0; // highest Y reached during the current downward run

// Eligible to show: device has scrolled past the near-top zone.
const baseVisible = computed(
  () => device.scrollAtTop === false && device.scrollNearTop === false,
);

// When eligibility is first met, anchor the threshold to the current position.
watch(baseVisible, (val) => {
  if (val) {
    hideThreshold.value = scrollY.value;
    peakScrollY = scrollY.value;
  }
});

const isVisible = computed(
  () => baseVisible.value && scrollY.value <= hideThreshold.value + 20,
);

function onScroll() {
  const y = window.scrollY;
  const prev = scrollY.value;

  if (y >= prev) {
    // Scrolling down — track the peak of this downward run.
    if (y > peakScrollY) peakScrollY = y;
  } else {
    // Scrolling up — only reveal after 20px of upward travel from the peak.
    if (peakScrollY - y >= 10) {
      hideThreshold.value = y;
      peakScrollY = y; // reset so the next downward run starts fresh
    }
  }

  scrollY.value = y;
}

onMounted(() => {
  scrollY.value = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll);
});

// ─── Panel ────────────────────────────────────────────────────────────────────

const panelOpen = ref(false);
const rootEl = ref<HTMLElement | null>(null);

const togglePanel = () => (panelOpen.value = !panelOpen.value);
const closePanel = () => (panelOpen.value = false);

// Close on route change
watch(() => route.path, closePanel);

// Close on outside click
function onDocClick(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) closePanel();
}

onMounted(() => document.addEventListener("click", onDocClick));
onUnmounted(() => document.removeEventListener("click", onDocClick));

// ─── Route helpers ────────────────────────────────────────────────────────────

const routeName = computed(() => route.name?.toString().split("___")[0] ?? "");
const isWorkRoute = computed(
  () => routeName.value === "work" || routeName.value === "work-index",
);
const isAboutRoute = computed(() => routeName.value === "about");

const pages = [
  { label: "Work", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Logs", to: "/logs" },
  { label: "Contact", to: "/contact" },
];

const parentPage = computed(
  () =>
    pages.find((p) => routeName.value.startsWith(p.label.toLowerCase())) ??
    null,
);
const parentLabel = computed(() => parentPage.value?.label ?? "");
const parentTo = computed(() => parentPage.value?.to ?? "/");

// ─── Work filters ─────────────────────────────────────────────────────────────

const activeCategory = computed(() => categoryFromQuery(route.query.c));
const activeSort = computed(() => sortFromQuery(route.query.s));
const activeView = computed(() => viewFromQuery(route.query.v));

const activeCategoryName = computed(
  () =>
    workCategories.value?.find((c) => c.slug?.current === activeCategory.value)
      ?.name ?? null,
);

const workQueryBase = computed(() => {
  const q: Record<string, string> = {};
  if (route.query.s) q.s = route.query.s as string;
  if (route.query.v) q.v = route.query.v as string;
  return q;
});

function buildWorkQuery(patch: Record<string, string | undefined>) {
  const q: Record<string, string> = {};
  for (const key of ["c", "s", "v"] as const) {
    const val = Object.hasOwn(patch, key)
      ? patch[key]
      : (route.query[key] as string | undefined);
    if (val) q[key] = val;
  }
  return q;
}

function setSort(opt: SortOption) {
  if (opt === "random" && activeSort.value === "random")
    artifactStore.reshuffle();
  router.push({
    query: buildWorkQuery({ s: opt === "random" ? undefined : opt }),
  });
  closePanel();
}

function setView(opt: ViewOption) {
  router.push({
    query: buildWorkQuery({ v: opt === "inline" ? undefined : opt }),
  });
  closePanel();
}

// ─── About: active section ────────────────────────────────────────────────────

const aboutSections = [
  { label: "Intro", id: "intro" },
  { label: "Details", id: "details" },
  { label: "Clients", id: "clients" },
  { label: "Work", id: "work" },
  { label: "Press", id: "press" },
  { label: "History", id: "history" },
  { label: "Footprint", id: "footprint" },
  { label: "Colophon", id: "colophon" },
];
const activeSection = ref("");
const activeSectionLabel = computed(
  () => aboutSections.find((s) => s.id === activeSection.value)?.label ?? "",
);

let sectionObserver: IntersectionObserver | null = null;

function setupSectionObserver() {
  sectionObserver?.disconnect();
  if (!isAboutRoute.value) return;
  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) activeSection.value = e.target.id;
      });
    },
    { rootMargin: "-10% 0px -75% 0px", threshold: 0 },
  );
  aboutSections.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) sectionObserver!.observe(el);
  });
}

watch(
  () => route.path,
  () => nextTick(setupSectionObserver),
);
onMounted(setupSectionObserver);
onUnmounted(() => sectionObserver?.disconnect());

// ─── Breadcrumb sub-label ─────────────────────────────────────────────────────

const subLabel = computed(() => {
  if (isWorkRoute.value) return activeCategoryName.value ?? "All";
  if (isAboutRoute.value) return activeSectionLabel.value;
  return null;
});

// ─── Sort/view label helpers ──────────────────────────────────────────────────

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "random", label: "Random" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

const viewOptions: { value: ViewOption; label: string }[] = [
  { value: "inline", label: "Inline" },
  { value: "feed", label: "Feed" },
  { value: "text", label: "Text" },
];
</script>

<template>
  <div
    ref="rootEl"
    class="sticky-header"
    :class="{ 'is-visible': isVisible, 'is-open': panelOpen }"
  >
    <!-- Thin bar -->
    <div class="sticky-header__bar">
      <!-- Breadcrumb -->
      <nav class="sticky-header__breadcrumb" aria-label="Current location">
        <NuxtLink :to="parentTo" class="sticky-header__crumb">
          <Text size="caption-1">{{ parentLabel }}</Text>
        </NuxtLink>
        <span v-if="subLabel" class="sticky-header__sep" aria-hidden="true">/</span>
        <Transition name="sub" mode="out-in">
          <span :key="subLabel ?? ''" class="sticky-header__sub">
            <Text size="caption-1">{{ subLabel }}</Text>
          </span>
        </Transition>
      </nav>

      <!-- Nav toggle -->
      <button
        class="sticky-header__toggle"
        :aria-expanded="panelOpen"
        aria-label="Toggle navigation"
        @click.stop="togglePanel"
      >
        <span class="sticky-header__dots" aria-hidden="true">
          <span v-for="i in 9" :key="i" class="sticky-header__dot" />
        </span>
      </button>
    </div>

    <!-- Expanded panel -->
    <Transition name="panel">
      <div v-if="panelOpen" class="sticky-header__panel">
        <!-- Pages -->
        <div class="sticky-header__row">
          <span class="sticky-header__row-label">Page</span>
          <div class="sticky-header__links">
            <NuxtLink
              v-for="page in pages"
              :key="page.to"
              :to="page.to"
              class="sticky-header__link"
              @click="closePanel"
            >
              <Text size="caption-1">{{ page.label }}</Text>
            </NuxtLink>
          </div>
        </div>

        <!-- Work: categories + sort + view -->
        <template v-if="isWorkRoute">
          <div class="sticky-header__row">
            <span class="sticky-header__row-label">Category</span>
            <div class="sticky-header__links">
              <NuxtLink
                :to="{ path: '/work', query: workQueryBase }"
                custom
                v-slot="{ href, navigate }"
              >
                <a
                  :href="href"
                  class="sticky-header__link"
                  :class="{
                    'is-active': !activeCategory,
                    'is-inactive': !!activeCategory,
                  }"
                  @click="
                    navigate();
                    closePanel();
                  "
                >
                  <Text size="caption-1">All</Text>
                </a>
              </NuxtLink>
              <NuxtLink
                v-for="cat in workCategories"
                :key="cat._id"
                :to="{
                  path: '/work',
                  query: { ...workQueryBase, c: cat.slug.current },
                }"
                custom
                v-slot="{ href, navigate }"
              >
                <a
                  :href="href"
                  class="sticky-header__link"
                  :class="{
                    'is-active': activeCategory === cat.slug.current,
                    'is-inactive':
                      !!activeCategory && activeCategory !== cat.slug.current,
                  }"
                  @click="
                    navigate();
                    closePanel();
                  "
                >
                  <Text size="caption-1">{{ cat.name }}</Text>
                </a>
              </NuxtLink>
            </div>
          </div>

          <div class="sticky-header__row">
            <span class="sticky-header__row-label">Sort</span>
            <div class="sticky-header__links">
              <button
                v-for="opt in sortOptions"
                :key="opt.value"
                class="sticky-header__link"
                :class="{ 'is-active': activeSort === opt.value }"
                @click="setSort(opt.value)"
              >
                <Text size="caption-1">{{ opt.label }}</Text>
              </button>
            </div>
          </div>

          <div class="sticky-header__row">
            <span class="sticky-header__row-label">View</span>
            <div class="sticky-header__links">
              <button
                v-for="opt in viewOptions"
                :key="opt.value"
                class="sticky-header__link"
                :class="{ 'is-active': activeView === opt.value }"
                @click="setView(opt.value)"
              >
                <Text size="caption-1">{{ opt.label }}</Text>
              </button>
            </div>
          </div>
        </template>

        <!-- About: sections -->
        <div v-else-if="isAboutRoute" class="sticky-header__row">
          <span class="sticky-header__row-label">Section</span>
          <div class="sticky-header__links">
            <a
              v-for="section in aboutSections"
              :key="section.id"
              :href="`#${section.id}`"
              class="sticky-header__link"
              :class="{ 'is-active': activeSection === section.id }"
              @click="closePanel"
            >
              <Text size="caption-1">{{ section.label }}</Text>
            </a>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
// ── Shell ─────────────────────────────────────────────────────────────────────

.sticky-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  transform: translateY(-100%);
  transition: transform var(--transition);
  pointer-events: none;

  &.is-visible {
    transform: translateY(0);
    pointer-events: all;
  }
}

// ── Bar ───────────────────────────────────────────────────────────────────────

.sticky-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--unit-tiny) var(--grid-margin);
  // height: var(--unit-small);
  background: var(--background-primary);
  border-bottom: 1px solid var(--border-primary);

  .is-open & {
    border-bottom-color: transparent;
  }
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

.sticky-header__breadcrumb {
  display: flex;
  align-items: baseline;
  gap: var(--unit-tinier);
  min-width: 0;
  overflow: hidden;
}

.sticky-header__crumb {
  color: var(--foreground-primary);
  text-decoration: none;
  white-space: nowrap;
  flex-shrink: 0;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--foreground-secondary);
  }
}

.sticky-header__sub {
  display: flex;
  align-items: baseline;
  gap: var(--unit-tinier);
  min-width: 0;
  overflow: hidden;

  :deep([class^="t-"]) {
    color: var(--foreground-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.sticky-header__sep {
  color: var(--foreground-quaternary);
  flex-shrink: 0;
  font-size: var(--t-caption-1-size);
}

// ── Toggle ────────────────────────────────────────────────────────────────────

.sticky-header__toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.sticky-header__dots {
  display: grid;
  grid-template-columns: repeat(3, 3px);
  grid-template-rows: repeat(3, 3px);
  gap: 3px;
  transition: transform var(--transition);

  .is-open & {
    transform: rotate(45deg);
  }
}

.sticky-header__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--foreground-tertiary);
  transition: opacity var(--transition);

  .is-open & {
    &:nth-child(2),
    &:nth-child(4),
    &:nth-child(6),
    &:nth-child(8) {
      opacity: 0;
    }
  }
}

// ── Panel ─────────────────────────────────────────────────────────────────────

.sticky-header__panel {
  background: var(--background-primary);
  border-bottom: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
}

.sticky-header__row {
  display: flex;
  align-items: baseline;
  gap: var(--unit-small);
  padding: var(--unit-tiny) var(--grid-margin);
  border-top: 1px solid var(--border-primary);
}

.sticky-header__row-label {
  font-size: var(--t-caption-1-size);
  line-height: var(--t-caption-1-leading);
  color: var(--foreground-quaternary);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 4.5em;
}

.sticky-header__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--unit-tinier) var(--unit-small);
}

.sticky-header__link {
  font-size: var(--t-caption-1-size);
  line-height: var(--t-caption-1-leading);
  color: var(--foreground-tertiary);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  appearance: none;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--foreground-secondary);
  }

  &.is-active,
  &.router-link-active {
    color: var(--foreground-primary);
  }

  &.is-inactive {
    color: var(--foreground-quaternary);
  }
}

// ── Transitions ───────────────────────────────────────────────────────────────

.panel-enter-active,
.panel-leave-active {
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.panel-enter-from,
.panel-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.sub-enter-active,
.sub-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}

.sub-enter-from,
.sub-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
