<template>
  <Grid is="nav" aria-label="Site navigation" class="site-header">
    <!-- Col 1: primary pages -->
    <Column span-mobile="6" span-tablet="3" span-laptop="3" span-desktop="2">
      <ul class="nav-col">
        <li v-for="page in pages" :key="page.to">
          <NuxtLink :to="page.to" class="nav-link">
            <Text>{{ page.label }}</Text>
          </NuxtLink>
        </li>
        <li>
          <button
            class="nav-link egg-btn"
            :class="{ 'is-active': eggActive }"
            @click="toggleEgg"
            aria-label="Toggle easter egg mode"
          >
            <Text>{{ eggActive ? "🍳" : "🥚" }}</Text>
          </button>
        </li>
      </ul>
    </Column>

    <!-- Col 2: context-sensitive subnav -->
    <Column span-mobile="6" span-tablet="3" span-laptop="3" span-desktop="2">
      <div ref="subnavEl">
        <!-- About: scroll-to sections -->
        <ul v-if="visibleRoute === 'about'" class="nav-col">
          <li v-for="section in aboutSections" :key="section.id">
            <a
              :href="`#${section.id}`"
              class="nav-link"
              :class="{ 'is-active': activeSection === section.id }"
              @click.prevent="scrollTo(section.id)"
            >
              <Text>{{ section.label }}</Text>
            </a>
          </li>
        </ul>

        <!-- Work: filters (FPO) -->
        <ul
          v-else-if="visibleRoute === 'work' || visibleRoute === 'work-index'"
          class="nav-col"
        >
          <li v-for="filter in workFilters" :key="filter">
            <button class="nav-link" disabled>
              <Text>{{ filter }}</Text>
            </button>
          </li>
        </ul>

        <!-- Logs: filters (FPO) -->
        <ul
          v-else-if="visibleRoute === 'logs' || visibleRoute === 'logs-index'"
          class="nav-col"
        >
          <li v-for="filter in logsFilters" :key="filter">
            <button class="nav-link" disabled>
              <Text size="caption-1">{{ filter }}</Text>
            </button>
          </li>
        </ul>

        <!-- Contact: external links -->
        <ul v-else-if="visibleRoute === 'contact'" class="nav-col">
          <li v-for="link in contactLinks" :key="link.label">
            <a
              :href="link.href"
              class="nav-link"
              target="_blank"
              rel="noopener"
            >
              <Text size="caption-1">{{ link.label }}</Text>
            </a>
          </li>
        </ul>
      </div>
    </Column>
  </Grid>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { useEggMode } from "~/composables/useEggMode";

interface Section {
  label: string;
  id: string;
}

const route = useRoute();
const { isActive: eggActive, toggle: toggleEgg } = useEggMode();
const activeSection = ref("");
const subnavEl = ref<HTMLElement | null>(null);

const routeName = computed(() => route.name?.toString().split("___")[0] ?? "");

// Lags behind routeName — controls what's rendered while animations play
const visibleRoute = ref(routeName.value);

// ─── Primary nav ──────────────────────────────────────────────────────────────

const pages = [
  { label: "Work", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Logs", to: "/logs" },
  { label: "Contact", to: "/contact" },
];

// ─── Subnav data ──────────────────────────────────────────────────────────────

const aboutSections: Section[] = [
  { label: "Intro", id: "intro" },
  { label: "Details", id: "details" },
  { label: "Clients", id: "clients" },
  { label: "Work", id: "work" },
  { label: "Press", id: "press" },
  { label: "History", id: "history" },
  { label: "Footprint", id: "footprint" },
  { label: "Colophon", id: "colophon" },
];

const workFilters = ["All", "Branding", "Web", "Type", "Print"];

const logsFilters = ["All", "Design", "Code", "Writing"];

const contactLinks = [
  { label: "Email", href: "mailto:hello@egstad.com" },
  { label: "Instagram", href: "https://instagram.com/egstad" },
  { label: "GitHub", href: "https://github.com/egstad" },
  { label: "Are.na", href: "https://are.na/jordan-egstad" },
  { label: "LinkedIn", href: "https://linkedin.com/in/egstad" },
];

// ─── Smooth scroll (about sections) ──────────────────────────────────────────

function scrollTo(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Active section observer ──────────────────────────────────────────────────

let observer: IntersectionObserver | null = null;

function setInitialActiveSection() {
  const mid = window.innerHeight / 2;
  let active = "";
  for (const { id } of aboutSections) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= mid) active = id;
  }
  activeSection.value = active || (aboutSections[0]?.id ?? "");
}

function setupObserver() {
  observer?.disconnect();
  if (routeName.value !== "about") return;

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) activeSection.value = e.target.id;
      });
    },
    { rootMargin: "-10% 0px -75% 0px", threshold: 0 },
  );

  aboutSections.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (el) observer!.observe(el);
  });

  setInitialActiveSection();
}

// ─── Subnav stagger animations ────────────────────────────────────────────────

function getItems() {
  return subnavEl.value?.querySelectorAll<HTMLElement>("li") ?? [];
}

function animateIn() {
  const items = getItems();
  if (!items.length) return;
  gsap.fromTo(
    items,
    { opacity: 0, y: 5 },
    {
      opacity: 1,
      y: 0,
      duration: 0.2,
      stagger: 0.06,
      ease: "power2.out",
      clearProps: "transform",
    },
  );
}

watch(routeName, async (newRoute) => {
  const fromHeight = subnavEl.value?.offsetHeight ?? 0;

  // Fade out subnav items while the page leave transition runs
  await new Promise<void>((resolve) => {
    gsap.to(getItems(), {
      opacity: 0,
      duration: 0.1,
      stagger: 0.025,
      ease: "power2.in",
      onComplete: resolve,
    });
  });

  visibleRoute.value = newRoute;

  nextTick(() => {
    gsap.set(getItems(), { opacity: 0, y: 0 });

    // Lock height at current value until page:leave-complete fires
    if (subnavEl.value) {
      gsap.set(subnavEl.value, { height: fromHeight, overflow: "hidden" });
    }
  });
});

// Animate height + items in once the outgoing page is fully hidden
function onLeaveComplete() {
  if (!subnavEl.value) return;

  const toHeight = subnavEl.value.scrollHeight;

  gsap.to(subnavEl.value, {
    height: toHeight,
    duration: 0,
    ease: "power2.inOut",
    clearProps: "height,overflow",
  });

  gsap.delayedCall(0.15, () => {
    animateIn();
    setupObserver();
  });
}

onMounted(() => {
  setupObserver();
  window.addEventListener("page:leave-complete", onLeaveComplete);
});

onUnmounted(() => {
  observer?.disconnect();
  window.removeEventListener("page:leave-complete", onLeaveComplete);
});
</script>

<style lang="scss" scoped>
.site-header {
  padding-top: var(--unit-smallest);
}

.nav-col {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.nav-link {
  color: var(--foreground-quaternary);
  // color: inherit;
  display: block;
  // text-decoration: none;
  // background: none;
  border: none;
  padding: 0;
  background: 0;
  cursor: pointer;
  appearance: none;
  // transition: color var(--transition-fast);

  &:hover {
    color: var(--foreground-primary);
  }

  &.router-link-active,
  &.is-active {
    color: var(--foreground-primary);
  }

  // &:disabled {
  //   cursor: default;
  //   opacity: 0.4;
  // }
}

.egg-btn {
  opacity: 0.35;
  transition: opacity 0.15s ease;

  &:hover,
  &.is-active {
    opacity: 1;
    color: var(--foreground-quaternary);
  }
}
</style>
