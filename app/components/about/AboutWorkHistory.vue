<script setup lang="ts">
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { WorkHistory } from "~/types/sanity";

const props = defineProps<{ items: WorkHistory[] }>();

const listEl = ref<HTMLElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const scrollActiveId = ref<string | null>(null);
const hoveredId = ref<string | null>(null);
const isHovering = ref(false);
const isMouseOverList = ref(false);
const mousePos = { x: 0, y: 0 };
const expandedId = ref<string | null>(null);
const triggers: ScrollTrigger[] = [];

// Hover takes priority over scroll; scrolling cancels hover
const activeId = computed(() =>
  isHovering.value ? hoveredId.value : scrollActiveId.value,
);

const LAPTOP_MQ = "(min-width: 900px)";

function toggleExpand(id: string) {
  if (window.matchMedia(LAPTOP_MQ).matches) return;

  const prev = expandedId.value;

  if (prev && prev !== id) {
    const prevEl = listEl.value?.querySelector<HTMLElement>(
      `[data-id="${prev}"] .work-image-mobile`,
    );
    if (prevEl)
      gsap.to(prevEl, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
  }

  if (prev === id) {
    expandedId.value = null;
    const el = listEl.value?.querySelector<HTMLElement>(
      `[data-id="${id}"] .work-image-mobile`,
    );
    if (el)
      gsap.to(el, {
        height: 0,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out",
      });
    return;
  }

  expandedId.value = id;
  const el = listEl.value?.querySelector<HTMLElement>(
    `[data-id="${id}"] .work-image-mobile`,
  );
  if (el)
    gsap.to(el, {
      height: "auto",
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    });
}

function onItemMouseenter(id: string) {
  if (!window.matchMedia(LAPTOP_MQ).matches) return;
  isMouseOverList.value = true;
  isHovering.value = true;
  hoveredId.value = id;
}

function onListMousemove(e: MouseEvent) {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
}

function onListMouseleave() {
  isMouseOverList.value = false;
  // isHovering intentionally left — hover persists after mouse exits
}

function onWindowScroll() {
  if (!isMouseOverList.value) {
    // Mouse is away from the list — scroll takes over
    isHovering.value = false;
    return;
  }

  // Mouse is over the list while scrolling — find whichever item
  // is now under the cursor and activate it
  const el = document.elementFromPoint(mousePos.x, mousePos.y);
  const entry = el?.closest<HTMLElement>("[data-id]");
  if (entry?.dataset.id) {
    isHovering.value = true;
    hoveredId.value = entry.dataset.id;
  }
}

watch(activeId, (newId, oldId) => {
  if (!panelEl.value) return;

  // Pause the previously active panel video
  if (oldId) {
    panelEl.value
      .querySelector<HTMLVideoElement>(`[data-id="${oldId}"] video`)
      ?.pause();
  }

  // Play the newly active panel video
  if (newId) {
    panelEl.value
      .querySelector<HTMLVideoElement>(`[data-id="${newId}"] video`)
      ?.play()
      .catch(() => {});
  }
});

onMounted(() => {
  const mobileImages =
    listEl.value?.querySelectorAll<HTMLElement>(".work-image-mobile");
  if (mobileImages?.length)
    gsap.set(mobileImages, { height: 0, opacity: 0, overflow: "hidden" });

  if (!window.matchMedia(LAPTOP_MQ).matches) return;

  window.addEventListener("scroll", onWindowScroll, { passive: true });

  // Container trigger: clears selection when the whole list leaves view.
  // Per-item triggers only ever SET the active id so there is no gap
  // between adjacent items where nothing is selected.
  const containerTrigger = ScrollTrigger.create({
    trigger: listEl.value,
    start: "top bottom",
    end: "bottom top",
    onLeave: () => {
      scrollActiveId.value = null;
    },
    onLeaveBack: () => {
      scrollActiveId.value = null;
    },
  });
  triggers.push(containerTrigger);

  const entries = listEl.value?.querySelectorAll<HTMLElement>(".work-entry");
  entries?.forEach((entry) => {
    const id = entry.dataset.id!;

    const trigger = ScrollTrigger.create({
      trigger: entry,
      start: "top 50%",
      end: "bottom 50%",
      onEnter: () => {
        scrollActiveId.value = id;
      },
      onEnterBack: () => {
        scrollActiveId.value = id;
      },
    });

    triggers.push(trigger);
  });
});

onUnmounted(() => {
  triggers.forEach((t) => t.kill());
  window.removeEventListener("scroll", onWindowScroll);
});
</script>

<template>
  <div class="work-history-wrap">
    <ul
      ref="listEl"
      class="work-history"
      :class="{ 'has-active': !!activeId }"
      @mousemove="onListMousemove"
      @mouseleave="onListMouseleave"
    >
      <li
        v-for="job in items"
        :key="job._id"
        :data-id="job._id"
        class="work-entry"
        :class="{ 'is-active': activeId === job._id }"
        @mouseenter="onItemMouseenter(job._id)"
      >
        <div class="work-card">
          <button
            class="work-row"
            :aria-expanded="expandedId === job._id"
            @click="toggleExpand(job._id)"
          >
            <div class="work-left">
              <span class="employer">
                <Text size="caption-2">
                  {{ job.employer }}
                </Text></span
              >
              <ul v-if="job.roles?.length" class="roles">
                <li v-for="(role, i) in job.roles" :key="i">
                  <Text size="caption-2">{{ role }}</Text>
                </li>
              </ul>
            </div>

            <span v-if="job.dateRange" class="date-range">
              <Text size="caption-2">
                {{ job.dateRange }}
              </Text></span
            >
          </button>

          <!-- Mobile: expandable media -->
          <div class="work-image-mobile">
            <template v-if="job.mediaType === 'image' && job.imageUrl">
              <Pic :src="job.imageUrl" :alt="job.employer" />
            </template>
            <template
              v-else-if="job.mediaType === 'video' && job.muxPlaybackId"
            >
              <Vid
                :playbackId="job.muxPlaybackId"
                preset="ambient"
                loading="eager"
              />
            </template>
            <div v-else class="work-placeholder" />
          </div>
        </div>
      </li>
    </ul>

    <!-- Laptop+: sticky media panel beside the list -->
    <div ref="panelEl" class="work-image-panel" aria-hidden="true">
      <div
        v-for="job in items"
        :key="job._id"
        :data-id="job._id"
        class="work-image-panel-item"
        :class="{ 'is-visible': activeId === job._id }"
      >
        <template v-if="job.mediaType === 'image' && job.imageUrl">
          <Pic :src="job.imageUrl" :alt="job.employer" />
        </template>
        <template v-else-if="job.mediaType === 'video' && job.muxPlaybackId">
          <Vid
            :playbackId="job.muxPlaybackId"
            preset="ambient"
            loading="eager"
          />
        </template>
        <div v-else class="work-placeholder" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.work-history {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;

  @include desktop {
    max-width: calc(var(--unit-hugest) * 2);
  }
}

.work-entry {
  padding: calc(var(--unit-tiniest) / 2) 0;

  &:first-child {
    padding-top: 0;
  }
  &:last-child {
    padding-bottom: 0;
  }
  transition: color var(--transition);

  .employer {
    color: var(--foreground-primary);
  }

  // Mobile: always appear active
  color: var(--foreground-tertiary);

  @include laptop {
    cursor: crosshair;
    // Dim all items by default; active item brightens
    color: var(--foreground-quaternary);

    .employer {
      color: var(--foreground-tertiary);
    }

    .has-active &:not(.is-active) {
      color: var(--foreground-quaternary);
    }

    &.is-active {
      color: var(--foreground-secondary);

      .employer {
        color: var(--foreground-primary);
      }
    }
  }
}

.work-card {
  transition: background-color var(--transition);
  background: var(--background-secondary);
  border-radius: var(--unit-tinier);
  // border-radius: var(--radii-tiny);
  overflow: hidden;

  @include laptop {
    .work-entry.is-active & {
      background: var(--background-tertiary);
    }
  }
}

.work-row {
  display: flex;
  align-items: flex-start;
  width: 100%;
  padding: var(--unit-tiny) var(--unit-smallest);
  background: none;
  border: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;

  @include laptop {
    cursor: default;
    pointer-events: none; // click disabled; hover is on the parent li
  }
}

.work-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.employer {
  color: inherit;
  transition: color var(--transition);
}

.roles {
  list-style: none;
  padding: 0;
  margin: 0;
  color: inherit;
}

.date-range {
  flex-shrink: 0;
  text-align: right;
  color: inherit;
  font-variant-numeric: tabular-nums;
}

// Mobile expandable image — full bleed inside card
.work-image-mobile {
  @include laptop {
    display: none;
  }

  :deep(.pic),
  :deep(.vid-wrapper) {
    display: block;
    width: 100%;
    height: auto;
  }

  :deep(img),
  :deep(video) {
    display: block;
    width: 100%;
    height: auto;
  }
}

.work-placeholder {
  aspect-ratio: 3 / 2;
  background: var(--background-tertiary);
  width: 100%;
}

// Laptop+: sticky image panel beside the list
.work-history-wrap {
  @include laptop {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--grid-gap);
    align-items: start;
  }
}

.work-image-panel {
  display: none;

  @include laptop {
    // Grid stacking: all items share one cell, each sizes to its own
    // natural dimensions. Row height = tallest item.
    display: grid;
    grid-template: auto / 1fr;
    position: sticky;
    top: var(--unit-small);
    pointer-events: none;
    // border-radius: var(--unit-tinier);
    border-radius: var(--radii-tiny);
    overflow: hidden;
  }
}

.work-image-panel-item {
  // All items share the same grid cell
  grid-row: 1;
  grid-column: 1;
  // Inactive: out of flow → doesn't contribute to grid row height
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 400ms ease;
  overflow: hidden;

  // Active: back in flow → its natural height drives the grid row
  &.is-visible {
    position: relative;
    inset: unset;
    opacity: 1;
  }

  :deep(.pic),
  :deep(.vid-wrapper) {
    display: block;
    width: 100%;
  }

  :deep(img),
  :deep(video) {
    display: block;
    width: 100%;
    height: auto;
  }
}
</style>
