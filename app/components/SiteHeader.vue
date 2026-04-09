<template>
  <Grid is="header" ref="headerEl" class="header">
    <Column span-tablet="6" span-laptop="3" span-desktop="2" class="mobile-row">
      <!-- Wordmark -->
      <NuxtLink to="/">
        <span class="sr-only">Egstad</span>
        <svg
          viewBox="0 0 115 22"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          class="logo"
        >
          <path
            d="M0.000906292 21.4888V19.6038H2.75591V2.20377H0.000906292V0.318769H15.0809V6.98877H13.0509V2.20377H4.93091V9.45377H8.70091V6.69877H10.5859V14.0938H8.70091V11.3388H4.93091V19.6038H13.6309V14.0938H15.6609V21.4888H0.000906292ZM29.0487 21.8078C23.0747 21.8078 18.6957 17.2548 18.6957 10.9038C18.6957 4.58177 23.0747 -0.0002321 29.0487 -0.0002321C32.1227 -0.0002321 34.6167 1.15977 36.2117 3.36377V0.318769H38.0967V8.03277H36.3567C35.4867 4.46577 32.7317 2.02977 29.0487 2.02977C24.3217 2.02977 20.8707 5.74177 20.8707 10.9038C20.8707 16.0948 24.3217 19.7778 29.0487 19.7778C33.1087 19.7778 35.8057 17.0228 35.9217 13.0788V12.7888H30.2667V10.9038H39.9817V12.7888H37.9517V21.4888H35.9217V18.5308C34.4427 20.5608 32.0937 21.8078 29.0487 21.8078ZM50.2581 21.8078C47.8221 21.8078 45.9081 20.6478 44.7481 19.0238V21.4888H42.8631V14.2388H44.6031C45.0091 17.5158 47.6481 19.7778 50.2581 19.7778C52.6651 19.7778 54.1731 18.3278 54.1731 16.4428C54.1731 13.9778 51.7951 13.1368 49.3301 12.0638L48.4021 11.6578C45.7631 10.4978 42.9211 9.13477 42.9211 5.48077C42.9211 2.00077 45.5021 -0.0002321 48.5471 -0.0002321C50.4031 -0.0002321 52.0851 0.869769 53.0711 2.46477V0.318769H54.9561V6.98877H53.2161C52.7811 3.74077 50.7511 2.02977 48.5471 2.02977C46.6041 2.02977 45.0961 3.27677 45.0961 5.33577C45.0961 7.88777 47.2131 8.64177 49.5041 9.65677L50.4321 10.0628C52.5781 10.9908 56.3481 12.2378 56.3481 16.2978C56.3481 19.6038 53.9411 21.8078 50.2581 21.8078ZM61.4342 21.4888V19.6038H65.3492V2.20377H60.9992V9.59877H58.9692V0.318769H73.9042V9.59877H71.8742V2.20377H67.5242V19.6038H71.4392V21.4888H61.4342ZM73.9194 21.4888V19.6038H76.2104L83.3734 0.173769H84.6784L91.7834 19.6038H94.0744V21.4888H87.5494V19.6038H89.6374L87.8394 14.5288H80.1544L78.3564 19.6038H80.4444V21.4888H73.9194ZM80.8214 12.6438H87.1724L84.0114 3.68277L80.8214 12.6438ZM95.3527 21.4888V19.6038H98.3977V2.20377H95.3527V0.318769H104.604C110.955 0.318769 114.783 5.04577 114.783 10.9038C114.783 16.7618 110.955 21.4888 104.604 21.4888H95.3527ZM100.573 19.6038H104.459C109.418 19.6038 112.608 15.7468 112.608 10.9038C112.608 6.08977 109.418 2.20377 104.459 2.20377H100.573V19.6038Z"
          />
        </svg>
      </NuxtLink>
    </Column>

    <!-- Primary nav: pages -->
    <Column span-tablet="3" span-laptop="3">
      <nav aria-label="Primary" class="primary mobile-row">
        <NuxtLink v-for="page in pages" :key="page.to" :to="page.to">
          <Text size="caption-1">{{ page.label }}</Text>
        </NuxtLink>
      </nav>
    </Column>

    <!-- Secondary nav: in-page sections -->
    <Column span-tablet="3" span-laptop="6">
      <nav
        v-if="currentSections.length"
        aria-label="Page sections"
        class="secondary mobile-row"
      >
        <a
          v-for="section in currentSections"
          :key="section.id"
          :href="`#${section.id}`"
          :class="{ 'is-active': activeSection === section.id }"
          @click.prevent="scrollTo(section.id)"
        >
          <Text size="caption-1">{{ section.label }}</Text>
        </a>
      </nav>
    </Column>
  </Grid>
</template>

<script setup lang="ts">
interface Section {
  label: string;
  id: string;
}

interface Page {
  label: string;
  to: string;
}

const route = useRoute();
const activeSection = ref("");

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

const currentSections = computed<Section[]>(() => {
  const name = route.name?.toString().split("___")[0] ?? "";
  return sectionsByRoute[name] ?? [];
});

// ─── Smooth scroll ────────────────────────────────────────────────────────────

function scrollTo(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ─── Active section via IntersectionObserver ──────────────────────────────────

let observer: IntersectionObserver | null = null;

function setInitialActiveSection() {
  // Find the last section whose top edge is at or above the middle of the viewport
  const mid = window.innerHeight / 2;
  let active = "";
  for (const { id } of currentSections.value) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (el.getBoundingClientRect().top <= mid) active = id;
  }
  if (active) activeSection.value = active;
  else if (currentSections.value[0])
    activeSection.value = currentSections.value[0].id;
}

function setupObserver() {
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

  setInitialActiveSection();
}

watch(
  () => route.path,
  () => nextTick(setupObserver),
);

onMounted(setupObserver);
onUnmounted(() => observer?.disconnect());
</script>

<style lang="scss">
.sr-only {
  @include sr-only();
}

.header {
  @media screen and (max-width: $desktop) {
    padding: 0 !important;
  }
}

.primary,
.secondary {
  display: flex;
  border-top: 0.1px solid var(--foreground-quaternary);
  padding-inline: var(--grid-margin);

  // tablet–laptop: links stack vertically within their column
  @include tablet {
    flex-direction: column;
    padding-inline: 0;
    border: 0;
    padding-top: var(--unit-smallest);
  }

  // laptop+: links back to a horizontal row
  @include laptop {
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    padding-top: var(--unit-smaller);
    gap: var(--unit-tiny);
  }

  a {
    min-height: 26px;
    min-width: 26px;
    display: inline-flex;
    align-items: center;
    padding: var(--unit-smallest) var(--unit-smallest) var(--unit-smallest) 0;
    color: var(--foreground-tertiary);
    height: 100%;

    @include tablet {
      padding: 0;
    }

    &.router-link-active {
      color: var(--foreground-foreground);
    }
  }
}

.secondary {
  // mobile only: horizontal scroll
  @media screen and (max-width: $tablet) {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }

    a {
      white-space: nowrap;
      flex-shrink: 0;
    }
  }

  a {
    &.is-active {
      color: var(--foreground-primary);
    }
  }
}

.mobile-row {
  @media screen and (max-width: $laptop) {
    height: 44px;
    display: flex;
    align-items: center;
  }

  @include tablet {
    align-items: start;
    height: auto;
  }
}

.logo {
  display: block;
  min-width: 80px;
  // width: 100%;
  color: var(--foreground-primary);
  max-width: var(--unit-huge);
  padding: var(--grid-margin) 0;
  margin: 0 var(--grid-margin);

  @include desktop {
    margin-left: 0;
  }
}
</style>
