<template>
  <nav ref="navEl" class="nav" :class="{ 'is-open': isOpen }">
    <!-- Bar -->
    <Grid class="nav__bar">
      <Column span-laptop="2">
        <NuxtLink class="nav__wordmark" to="/" @click="close">
          <h1 class="sr-only">Egstad</h1>
          <svg
            class="logo"
            viewBox="0 0 115 22"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.000906292 21.4888V19.6038H2.75591V2.20377H0.000906292V0.318769H15.0809V6.98877H13.0509V2.20377H4.93091V9.45377H8.70091V6.69877H10.5859V14.0938H8.70091V11.3388H4.93091V19.6038H13.6309V14.0938H15.6609V21.4888H0.000906292ZM29.0487 21.8078C23.0747 21.8078 18.6957 17.2548 18.6957 10.9038C18.6957 4.58177 23.0747 -0.0002321 29.0487 -0.0002321C32.1227 -0.0002321 34.6167 1.15977 36.2117 3.36377V0.318769H38.0967V8.03277H36.3567C35.4867 4.46577 32.7317 2.02977 29.0487 2.02977C24.3217 2.02977 20.8707 5.74177 20.8707 10.9038C20.8707 16.0948 24.3217 19.7778 29.0487 19.7778C33.1087 19.7778 35.8057 17.0228 35.9217 13.0788V12.7888H30.2667V10.9038H39.9817V12.7888H37.9517V21.4888H35.9217V18.5308C34.4427 20.5608 32.0937 21.8078 29.0487 21.8078ZM50.2581 21.8078C47.8221 21.8078 45.9081 20.6478 44.7481 19.0238V21.4888H42.8631V14.2388H44.6031C45.0091 17.5158 47.6481 19.7778 50.2581 19.7778C52.6651 19.7778 54.1731 18.3278 54.1731 16.4428C54.1731 13.9778 51.7951 13.1368 49.3301 12.0638L48.4021 11.6578C45.7631 10.4978 42.9211 9.13477 42.9211 5.48077C42.9211 2.00077 45.5021 -0.0002321 48.5471 -0.0002321C50.4031 -0.0002321 52.0851 0.869769 53.0711 2.46477V0.318769H54.9561V6.98877H53.2161C52.7811 3.74077 50.7511 2.02977 48.5471 2.02977C46.6041 2.02977 45.0961 3.27677 45.0961 5.33577C45.0961 7.88777 47.2131 8.64177 49.5041 9.65677L50.4321 10.0628C52.5781 10.9908 56.3481 12.2378 56.3481 16.2978C56.3481 19.6038 53.9411 21.8078 50.2581 21.8078ZM61.4342 21.4888V19.6038H65.3492V2.20377H60.9992V9.59877H58.9692V0.318769H73.9042V9.59877H71.8742V2.20377H67.5242V19.6038H71.4392V21.4888H61.4342ZM73.9194 21.4888V19.6038H76.2104L83.3734 0.173769H84.6784L91.7834 19.6038H94.0744V21.4888H87.5494V19.6038H89.6374L87.8394 14.5288H80.1544L78.3564 19.6038H80.4444V21.4888H73.9194ZM80.8214 12.6438H87.1724L84.0114 3.68277L80.8214 12.6438ZM95.3527 21.4888V19.6038H98.3977V2.20377H95.3527V0.318769H104.604C110.955 0.318769 114.783 5.04577 114.783 10.9038C114.783 16.7618 110.955 21.4888 104.604 21.4888H95.3527ZM100.573 19.6038H104.459C109.418 19.6038 112.608 15.7468 112.608 10.9038C112.608 6.08977 109.418 2.20377 104.459 2.20377H100.573V19.6038Z"
            />
          </svg>
        </NuxtLink>
      </Column>
      <!-- Desktop: always-visible inline links -->
      <Column span-tablet="9" class="nav__inline">
        <div class="nav__links">
          <NuxtLink
            v-for="page in pages"
            :key="page.to"
            :to="page.to"
            class="nav__link"
            >{{ page.label }}</NuxtLink
          >
        </div>
        <div
          v-if="currentSections.length"
          class="nav__links nav__links--sections"
        >
          <a
            v-for="section in currentSections"
            :key="section.id"
            :href="`#${section.id}`"
            class="nav__link"
            :class="{ 'is-active': activeSection === section.id }"
            >{{ section.label }}</a
          >
        </div>
      </Column>

      <button
        class="nav__toggle"
        @click="toggle"
        :aria-expanded="isOpen"
        :aria-label="isOpen ? 'Close navigation' : 'Open navigation'"
      >
        <span class="nav__dots">
          <span v-for="i in 9" :key="i" class="nav__dot" />
        </span>
      </button>
    </Grid>

    <!-- Mobile menu -->
    <Transition name="menu">
      <div v-if="isOpen" class="nav__menu">
        <!-- Page row -->
        <div class="nav__row">
          <span class="nav__row-label">Page:</span>
          <div class="nav__links">
            <NuxtLink
              v-for="page in pages"
              :key="page.to"
              :to="page.to"
              class="nav__link"
              @click="close"
              >{{ page.label }}</NuxtLink
            >
          </div>
        </div>

        <!-- Section row (page-specific) -->
        <div v-if="currentSections.length" class="nav__row">
          <span class="nav__row-label">Section:</span>
          <div class="nav__links">
            <a
              v-for="section in currentSections"
              :key="section.id"
              :href="`#${section.id}`"
              class="nav__link"
              :class="{ 'is-active': activeSection === section.id }"
              @click="close"
              >{{ section.label }}</a
            >
          </div>
        </div>

        <!-- Sort row (work only) -->
        <div v-if="isWorkRoute" class="nav__row">
          <span class="nav__row-label">Sort:</span>
          <div class="nav__links">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              class="nav__link"
              :class="{ 'is-active': activeSort === opt.value }"
              @click="setSort(opt.value as SortOption); close()"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>

        <!-- View row (work only) -->
        <div v-if="isWorkRoute" class="nav__row">
          <span class="nav__row-label">View:</span>
          <div class="nav__links">
            <button
              v-for="opt in viewOptions"
              :key="opt.value"
              class="nav__link"
              :class="{ 'is-active': activeView === opt.value }"
              @click="setView(opt.value as ViewOption); close()"
            >
              {{ opt.label }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { useWorkFilters } from "~/composables/useWorkFilters";
import type { SortOption, ViewOption } from "~/utils/workQuery";

interface Section {
  label: string;
  id: string;
}

interface Page {
  label: string;
  to: string;
}

const isOpen = ref(false);
const navEl = ref<HTMLElement | null>(null);
const route = useRoute();
const activeSection = ref("");
const { activeSort, activeView, setSort, setView } = useWorkFilters();

const pages: Page[] = [
  { label: "Work", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const sectionsByRoute: Record<string, Section[]> = {
  about: [
    { label: "Intro", id: "intro" },
    { label: "Details", id: "details" },
    { label: "Clients", id: "clients" },
    { label: "Work", id: "work" },
    { label: "Press", id: "press" },
    { label: "History", id: "history" },
    { label: "Footprint", id: "footprint" },
    { label: "Colophon", id: "colophon" },
  ],
};

const routeName = computed(() => route.name?.toString().split("___")[0] ?? "");

const currentSections = computed<Section[]>(() => {
  return sectionsByRoute[routeName.value] ?? [];
});

const isWorkRoute = computed(
  () => routeName.value === "work" || routeName.value === "work-index"
);

const sortOptions = [
  { label: "Random", value: "random" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

const viewOptions = [
  { label: "Grid", value: "inline" },
  { label: "Feed", value: "feed" },
  { label: "Text", value: "text" },
];

const toggle = () => {
  isOpen.value = !isOpen.value;
};
const close = () => {
  isOpen.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  if (navEl.value && !navEl.value.contains(e.target as Node)) close();
};
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") close();
};

watch(() => route.path, close);

// ─── Section observer ─────────────────────────────────────────────────────────

let observer: IntersectionObserver | null = null;

const setupObserver = () => {
  observer?.disconnect();
  if (!currentSections.value.length) return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) activeSection.value = entry.target.id;
      });
    },
    { rootMargin: "-10% 0px -75% 0px", threshold: 0 },
  );

  currentSections.value.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) observer!.observe(el);
  });
};

watch(
  () => route.path,
  () => nextTick(setupObserver),
);

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
  setupObserver();
});

onUnmounted(() => {
  observer?.disconnect();
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style lang="scss" scoped>
.nav {
  background: var(--background-primary);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

// ─── Bar ──────────────────────────────────────────────────────────────────────

.nav__bar {
}

.nav__wordmark {
  display: flex;
  align-items: center;
}

.logo {
  height: calc(var(--unit-smaller) * 0.8);
  width: auto;
  color: var(--foreground-primary);
  padding-left: var(--grid-margin);
}

h1 {
  @include sr-only;
}

.nav__toggle {
  background: none;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: opacity var(--transition-fast);
}

.nav__dots {
  display: grid;
  grid-template-columns: repeat(3, 4px);
  grid-template-rows: repeat(3, 4px);
  gap: 4px;
  width: 18px;
  height: 18px;
  transition: transform var(--fast) var(--ease-in-out);

  .is-open & {
    transform: rotate(90deg);
  }
}

.nav__dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: var(--foreground-tertiary);
  transition:
    opacity var(--transition),
    transform var(--transition);

  .is-open & {
    &:nth-child(2),
    &:nth-child(4),
    &:nth-child(6),
    &:nth-child(8) {
      opacity: 0;
    }
  }
}

// ─── Desktop inline ───────────────────────────────────────────────────────────

.nav__inline {
  display: none;
  align-items: baseline;
  flex: 1;

  @include laptop {
    display: flex;
  }
}

.nav__links--sections {
  margin-left: auto;
  padding-right: var(--unit-small);
}

// ─── Mobile menu ──────────────────────────────────────────────────────────────

.nav__menu {
  border-top: 1px solid rgba(255, 255, 255, 0.07);

  @include laptop {
    display: none;
  }
}

.nav__row {
  display: flex;
  align-items: baseline;
  gap: var(--unit-small);
  padding: var(--unit-tinier) var(--grid-margin);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);

  &:last-child {
    border-bottom: none;
  }
}

.nav__row-label {
  font-size: var(--t-caption-1-size);
  line-height: var(--t-caption-1-leading);
  color: var(--foreground-quaternary);
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 4.5em;
}

.nav__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--unit-tinier) var(--unit-small);
}

.nav__link {
  font-size: var(--t-caption-1-size);
  line-height: var(--t-caption-1-leading);
  color: var(--foreground-tertiary);
  text-decoration: none;
  transition: color var(--transition-fast);

  &:hover {
    color: var(--foreground-secondary);
  }

  &.router-link-active,
  &.is-active {
    color: var(--foreground-primary);
  }
}

.nav__toggle {
  @include laptop {
    display: none;
  }
}

// ─── Transition ───────────────────────────────────────────────────────────────

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity var(--transition),
    transform var(--transition);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
