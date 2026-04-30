<script setup lang="ts">
import { gsap } from "gsap";
import { useWorkCategories } from "~/composables/useWorkCategories";
import { useWorkFilters } from "~/composables/useWorkFilters";
import { categoryFromQuery } from "~/utils/workQuery";
import { useDeviceStore } from "~/stores/device";
import type { SortOption, ViewOption } from "~/utils/workQuery";
import type { Artifact } from "~/types/sanity";

const route = useRoute();
const device = useDeviceStore();
const { data: workCategories } = useWorkCategories();
const { activeSort, activeView, setSort, setView } = useWorkFilters();

// ─── Scroll visibility ────────────────────────────────────────────────────────

const scrollY = ref(0);
const hideThreshold = ref(0);
let peakScrollY = 0;

const baseVisible = computed(
  () => device.scrollAtTop === false && device.scrollNearTop === false,
);

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
    if (y > peakScrollY) peakScrollY = y;
  } else {
    if (peakScrollY - y >= 10) {
      hideThreshold.value = y;
      peakScrollY = y;
    }
  }
  scrollY.value = y;
  if (panelOpen.value) closePanel();
}

onMounted(() => {
  scrollY.value = window.scrollY;
  window.addEventListener("scroll", onScroll, { passive: true });
});
onUnmounted(() => window.removeEventListener("scroll", onScroll));

// ─── Panel ────────────────────────────────────────────────────────────────────

const panelOpen = ref(false);
const rootEl = ref<HTMLElement | null>(null);

const togglePanel = () => (panelOpen.value = !panelOpen.value);
const closePanel = () => (panelOpen.value = false);

watch(() => route.path, closePanel);

function onDocClick(e: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(e.target as Node)) closePanel();
}
onMounted(() => document.addEventListener("click", onDocClick));
onUnmounted(() => document.removeEventListener("click", onDocClick));

// ─── Route ────────────────────────────────────────────────────────────────────

const routeName = computed(() => route.name?.toString().split("___")[0] ?? "");
const isWorkRoute = computed(
  () => routeName.value === "work" || routeName.value === "work-index",
);

// ─── Work ─────────────────────────────────────────────────────────────────────

const { data: artifacts } = useNuxtData<Artifact[]>("artifact");

const artifactTotal = computed(() => artifacts.value?.length ?? 0);

const artifactCountByCategory = computed(() => {
  const counts: Record<string, number> = {};
  for (const item of artifacts.value ?? []) {
    for (const cat of item.categories ?? []) {
      const slug = cat.slug?.current;
      if (slug) counts[slug] = (counts[slug] ?? 0) + 1;
    }
  }
  return counts;
});

const activeCategory = computed(() => categoryFromQuery(route.query.c));
const workAllSelected = computed(() => activeCategory.value === undefined);

const workQueryBase = computed(() => {
  const q: Record<string, string> = {};
  if (route.query.s) q.s = route.query.s as string;
  if (route.query.v) q.v = route.query.v as string;
  return q;
});

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "random", label: "Random" },
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
];

const viewOptions: { value: ViewOption; label: string }[] = [
  { value: "inline", label: "Grid" },
  { value: "feed", label: "Feed" },
  { value: "text", label: "Text" },
];

// ─── About ────────────────────────────────────────────────────────────────────

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

let sectionObserver: IntersectionObserver | null = null;

function setupSectionObserver() {
  sectionObserver?.disconnect();
  if (routeName.value !== "about") return;
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

// ─── Nav data ─────────────────────────────────────────────────────────────────

const pages = [
  { label: "Work", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const contactLinks = [
  { label: "Email", href: "mailto:hello@egstad.com" },
  { label: "Instagram", href: "https://instagram.com/egstad" },
  { label: "GitHub", href: "https://github.com/egstad" },
  { label: "Are.na", href: "https://are.na/jordan-egstad" },
  { label: "LinkedIn", href: "https://linkedin.com/in/egstad" },
];

const logsFilters = ["All", "Design", "Code", "Writing"];

// ─── Breadcrumb ───────────────────────────────────────────────────────────────

const activeCategoryName = computed(
  () =>
    workCategories.value?.find((c) => c.slug?.current === activeCategory.value)
      ?.name ?? null,
);

const subCount = computed(() => {
  if (!isWorkRoute.value) return null;
  if (workAllSelected.value) return artifactTotal.value || null;
  const cat = activeCategory.value;
  return cat ? (artifactCountByCategory.value[cat] ?? null) : null;
});

const activeSectionLabel = computed(
  () => aboutSections.find((s) => s.id === activeSection.value)?.label ?? "",
);

const parentPage = computed(
  () =>
    pages.find((p) => routeName.value.startsWith(p.label.toLowerCase())) ??
    null,
);
const parentLabel = computed(() => parentPage.value?.label ?? "");
const parentTo = computed(() => parentPage.value?.to ?? "/");

const subLabel = computed(() => {
  if (isWorkRoute.value) return activeCategoryName.value ?? "All";
  if (routeName.value === "about") return activeSectionLabel.value;
  return null;
});

// ─── Panel animations ─────────────────────────────────────────────────────────

function onPanelEnter(el: Element, done: () => void) {
  gsap.fromTo(
    el,
    { height: 0, opacity: 0, overflow: "hidden" },
    {
      height: "auto",
      opacity: 1,
      duration: 0.35,
      ease: "power2.out",
      clearProps: "height,overflow",
      onComplete: done,
    },
  );
}

function onPanelLeave(el: Element, done: () => void) {
  gsap.to(el, {
    height: 0,
    opacity: 0,
    overflow: "hidden",
    duration: 0.25,
    ease: "power2.in",
    onComplete: done,
  });
}
</script>

<template>
  <div
    ref="rootEl"
    class="sticky-header"
    :class="{ 'is-visible': isVisible, 'is-open': panelOpen }"
  >
    <!-- ─── Bar ──────────────────────────────────────────────────────────── -->
    <div class="sticky-header__bar">
      <div class="sticky-header__crumb-wrap">
        <nav
          class="sticky-header__breadcrumb"
          :class="{ 'is-hidden': panelOpen }"
          aria-label="Current location"
        >
          <NuxtLink :to="parentTo" class="sticky-header__crumb">
            <Text size="caption-1">{{ parentLabel }}</Text>
          </NuxtLink>
          <span v-if="subLabel" class="sticky-header__sep" aria-hidden="true">/</span>
          <span class="sticky-header__sub">
            <Text size="caption-1">{{ subLabel }}</Text>
            <Text v-if="subCount" size="caption-1" color="dimmer">{{ subCount }}</Text>
          </span>
        </nav>
        <span
          class="sticky-header__menu-label"
          :class="{ 'is-hidden': !panelOpen }"
        >
          <Text size="caption-1" color="dimmer">Menu</Text>
        </span>
      </div>

      <div class="sticky-header__bar-right">
        <div
          v-if="isWorkRoute"
          class="sticky-header__bar-filters"
        >
          <BaseSelect
            variant="text"
            dropdown-align="left"
            label="Sort"
            :model-value="activeSort"
            :options="sortOptions"
            style="--select-value-min-width: 4.5em"
            @update:model-value="(v) => setSort(v as SortOption)"
          />
          <BaseSelect
            variant="text"
            dropdown-align="right"
            label="View"
            :model-value="activeView"
            :options="viewOptions"
            style="--select-value-min-width: 2.5em"
            @update:model-value="(v) => setView(v as ViewOption)"
          />
        </div>

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
    </div>

    <!-- ─── Panel ────────────────────────────────────────────────────────── -->
    <Transition :css="false" @enter="onPanelEnter" @leave="onPanelLeave">
      <div v-if="panelOpen" class="sticky-header__panel">
        <Grid class="sticky-header__grid">
          <!-- Col 1: primary pages -->
          <Column
            span-mobile="6"
            span-tablet="3"
            span-laptop="3"
            span-desktop="2"
          >
            <ul class="sticky-header__col">
              <li v-for="page in pages" :key="page.to">
                <NuxtLink
                  :to="page.to"
                  class="sticky-header__link"
                  @click="closePanel"
                >
                  <Text>{{ page.label }}</Text>
                </NuxtLink>
              </li>
            </ul>
          </Column>

          <!-- Col 2: context subnav -->
          <Column
            span-mobile="6"
            span-tablet="3"
            span-laptop="3"
            span-desktop="2"
          >
            <!-- About: scroll-to sections -->
            <ul v-if="routeName === 'about'" class="sticky-header__col">
              <li v-for="section in aboutSections" :key="section.id">
                <a
                  :href="`#${section.id}`"
                  class="sticky-header__link"
                  :class="{ 'is-active': activeSection === section.id }"
                  @click="closePanel"
                >
                  <Text>{{ section.label }}</Text>
                </a>
              </li>
            </ul>

            <!-- Work: categories -->
            <ul v-else-if="isWorkRoute" class="sticky-header__col">
              <li>
                <NuxtLink
                  :to="{ path: '/work', query: workQueryBase }"
                  custom
                  v-slot="{ href, navigate }"
                >
                  <a
                    :href="href"
                    class="sticky-header__link"
                    :class="{
                      'is-active': workAllSelected,
                      'is-inactive': !workAllSelected,
                    }"
                    @click="
                      navigate();
                      closePanel();
                    "
                  >
                    <Text>All</Text>
                    <span v-if="artifactTotal" class="sticky-header__count">
                      <Text color="dimmer">{{ artifactTotal }}</Text>
                    </span>
                  </a>
                </NuxtLink>
              </li>
              <li v-for="cat in workCategories" :key="cat._id">
                <NuxtLink
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
                    <Text>{{ cat.name }}</Text>
                    <span v-if="artifactCountByCategory[cat.slug.current]" class="sticky-header__count">
                      <Text color="dimmer">{{ artifactCountByCategory[cat.slug.current] }}</Text>
                    </span>
                  </a>
                </NuxtLink>
              </li>
            </ul>

            <!-- Logs: filters -->
            <ul
              v-else-if="routeName === 'logs' || routeName === 'logs-index'"
              class="sticky-header__col"
            >
              <li v-for="filter in logsFilters" :key="filter">
                <button class="sticky-header__link" disabled>
                  <Text size="caption-1">{{ filter }}</Text>
                </button>
              </li>
            </ul>

            <!-- Contact: external links -->
            <ul v-else-if="routeName === 'contact'" class="sticky-header__col">
              <li v-for="link in contactLinks" :key="link.label">
                <a
                  :href="link.href"
                  class="sticky-header__link"
                  target="_blank"
                  rel="noopener"
                  @click="closePanel"
                >
                  <Text size="caption-1">{{ link.label }}</Text>
                </a>
              </li>
            </ul>
          </Column>

          <!-- Col 3: work sort + view (mobile only — tablet+ uses bar inline filters) -->
          <Column
            v-if="isWorkRoute"
            span-mobile="12"
            span-tablet="6"
            span-laptop="6"
            span-desktop="8"
            class="work-filters-col work-filters-col--panel"
          >
            <div class="work-filters">
              <BaseSelect
                variant="text"
                dropdown-align="left"
                label="Sort"
                :model-value="activeSort"
                :options="sortOptions"
                style="--select-value-min-width: 4.5em"
                @update:model-value="(v) => setSort(v as SortOption)"
              />
              <BaseSelect
                variant="text"
                dropdown-align="right"
                label="View"
                :model-value="activeView"
                :options="viewOptions"
                style="--select-value-min-width: 2.5em"
                @update:model-value="(v) => setView(v as ViewOption)"
              />
            </div>
          </Column>
        </Grid>
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
  background: var(--background-primary);
  border-bottom: 1px solid var(--border-primary);

  .is-open & {
    border-bottom-color: transparent;
  }
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────

.sticky-header__crumb-wrap {
  position: relative;
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.sticky-header__breadcrumb,
.sticky-header__menu-label {
  display: flex;
  align-items: baseline;
  transition: opacity var(--transition);

  &.is-hidden {
    opacity: 0;
    pointer-events: none;
  }
}

.sticky-header__breadcrumb {
  gap: var(--unit-tinier);
}

.sticky-header__menu-label {
  position: absolute;
  top: 0;
  left: 0;
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

// ── Bar right ─────────────────────────────────────────────────────────────────

.sticky-header__bar-right {
  display: flex;
  align-items: center;
  gap: var(--unit-small);
  flex-shrink: 0;
}

.sticky-header__bar-filters {
  display: none;
  gap: var(--unit-small);

  @include tablet {
    display: flex;
  }
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
}

.sticky-header__grid {
  padding-top: var(--unit-tiny);
  padding-bottom: var(--unit-small);
}

.sticky-header__col {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.sticky-header__link {
  font-size: var(--t-caption-1-size);
  line-height: var(--t-caption-1-leading);
  color: var(--foreground-quaternary);
  text-decoration: none;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  appearance: none;
  transition: color var(--transition-fast);
  display: flex;
  align-items: baseline;
  gap: 0.4em;

  &:hover {
    color: var(--foreground-primary);
  }

  &.is-active,
  &.router-link-active {
    color: var(--foreground-primary);

    :deep([class^="t-"]) {
      color: inherit;
    }
  }

  &.is-inactive {
    color: var(--foreground-quaternary);

    :deep([class^="t-"]) {
      color: inherit;
    }
  }

  &:disabled {
    cursor: default;
  }
}

// ── Work filters ──────────────────────────────────────────────────────────────

.work-filters-col {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.work-filters-col--panel {
  @include tablet {
    display: none;
  }
}

.work-filters {
  margin-top: var(--unit-small);
  display: grid;
  gap: var(--grid-gap);
  width: 100%;
  grid-template-columns: 1fr 1fr;

  @include tablet {
    width: auto;
    margin-left: auto;
    margin-top: 0;
  }
}

// ── Count ─────────────────────────────────────────────────────────────────────

.sticky-header__count {
  opacity: 0;
  transition: opacity var(--transition-fast);
  display: contents;

  .sticky-header__link.is-active &,
  .sticky-header__link:hover & {
    opacity: 1;
  }
}

// ── Transitions ───────────────────────────────────────────────────────────────

</style>
