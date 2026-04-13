<template>
  <span
    ref="triggerEl"
    class="tooltip-trigger"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click.stop="onTriggerClick"
  >
    <slot />

    <Teleport to="body">
      <Transition :css="false" @enter="onEnter" @leave="onLeave">
        <div
          v-if="isMounted && isOpen"
          ref="tooltipEl"
          class="tooltip"
          :style="tooltipStyle"
          role="tooltip"
          @mouseenter="cancelClose"
          @mouseleave="scheduleClose"
          @click.stop
        >
          <figure v-if="image" class="tooltip__image">
            <img :src="image" :alt="imageAlt || ''" loading="lazy" />
          </figure>

          <Text size="caption-2" class="tooltip__body">
            <!-- HTML string -->
            <p v-if="html" class="tooltip__text" v-html="html" />
            <!-- Portable text / custom slot -->
            <slot v-else name="content" />
          </Text>

          <BaseButton
            class="tooltip__close ml-tiny mb-tiny"
            size="small"
            variant="ghost"
            icon="close"
            aria-label="Close"
            @click.stop="close"
            >Close</BaseButton
          >
        </div>
      </Transition>
    </Teleport>
  </span>
</template>

<script setup lang="ts">
import { gsap } from "gsap";

interface Props {
  html?: string;
  image?: string;
  imageAlt?: string;
}

defineProps<Props>();

const triggerEl = ref<HTMLElement | null>(null);
const tooltipEl = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const isMounted = ref(false);
const isTouch = ref(false);
const tooltipStyle = ref<Record<string, string>>({});
let closeTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Positioning ──────────────────────────────────────────────────────────────

async function updatePosition() {
  await nextTick();
  if (!triggerEl.value || !tooltipEl.value) return;

  const trigger = triggerEl.value.getBoundingClientRect();
  const tooltip = tooltipEl.value.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const GAP = 10;
  const EDGE = 12;

  // Default: below trigger, centered over it
  let top = trigger.bottom + GAP;
  let left = trigger.left + trigger.width / 2 - tooltip.width / 2;

  // Flip above if clipped by bottom of viewport
  if (top + tooltip.height + EDGE > vh) {
    top = trigger.top - tooltip.height - GAP;
  }

  // Clamp to horizontal viewport edges
  left = Math.max(EDGE, Math.min(left, vw - tooltip.width - EDGE));

  tooltipStyle.value = {
    position: "fixed",
    top: `${Math.round(top)}px`,
    left: `${Math.round(left)}px`,
  };
}

// ─── Open / close ─────────────────────────────────────────────────────────────

async function open() {
  if (closeTimer) clearTimeout(closeTimer);
  isOpen.value = true;
  await updatePosition();
}

function close() {
  if (closeTimer) clearTimeout(closeTimer);
  isOpen.value = false;
}

function scheduleClose() {
  closeTimer = setTimeout(close, 150);
}

function cancelClose() {
  if (closeTimer) clearTimeout(closeTimer);
}

// ─── Hover (pointer devices) ──────────────────────────────────────────────────

function onMouseEnter() {
  if (isTouch.value) return;
  open();
}

function onMouseLeave() {
  if (isTouch.value) return;
  scheduleClose();
}

// ─── Tap (touch devices) ──────────────────────────────────────────────────────

function onTriggerClick(e: MouseEvent) {
  if (!isTouch.value) return;
  e.preventDefault();
  isOpen.value ? close() : open();
}

function onOutsideClick() {
  if (isOpen.value) close();
}

function onScroll() {
  if (isOpen.value) close();
}

// ─── GSAP transitions ─────────────────────────────────────────────────────────

function onEnter(el: Element, done: () => void) {
  gsap.fromTo(
    el,
    { opacity: 0, y: 6 },
    { opacity: 1, y: 0, duration: 0.2, ease: "power2.out", onComplete: done },
  );
}

function onLeave(el: Element, done: () => void) {
  gsap.to(el, {
    opacity: 0,
    y: 4,
    duration: 0.15,
    ease: "power2.in",
    onComplete: done,
  });
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  isMounted.value = true;
  isTouch.value = window.matchMedia(
    "(hover: none) and (pointer: coarse)",
  ).matches;
  document.addEventListener("click", onOutsideClick);
  window.addEventListener("scroll", onScroll, { passive: true });
});

onUnmounted(() => {
  document.removeEventListener("click", onOutsideClick);
  window.removeEventListener("scroll", onScroll);
  if (closeTimer) clearTimeout(closeTimer);
});
</script>

<style lang="scss" scoped>
@use "~/assets/styles/global" as *;

// ─── Trigger ──────────────────────────────────────────────────────────────────

.tooltip-trigger {
  display: inline;
  cursor: help;

  // Styled like a link but doesn't navigate — tooltip opens instead
  :deep(a),
  :deep(.t-link),
  :deep([data-tooltip-trigger]) {
    color: var(--interactive-primary);
    text-decoration: underline;
    text-underline-offset: 0.175em;
    text-decoration-thickness: 0.06em;
    text-decoration-color: transparent;
    text-decoration-skip-ink: all;
    cursor: help;
    transition:
      text-decoration-color var(--transition-fast),
      color var(--transition-fast);

    &:hover {
      text-decoration-color: var(--interactive-primary);
      color: var(--foreground-primary);
    }
  }
}

// ─── Popup ────────────────────────────────────────────────────────────────────

.tooltip {
  z-index: 9000;
  // width: min(280px, calc(100vw - 24px))
  max-width: calc(var(--unit-huge) * 2);
  width: 60%;
  min-width: 200px;
  background: var(--background-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 4px;
  overflow: hidden;
  // box-shadow:
  //   0 4px 16px rgba(0, 0, 0, 0.4),
  //   0 1px 3px rgba(0, 0, 0, 0.3);
}

// ─── Image ────────────────────────────────────────────────────────────────────

.tooltip__image {
  margin: 0;
  line-height: 0;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-bottom: 1px solid var(--border-primary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

// ─── Body ─────────────────────────────────────────────────────────────────────

.tooltip__body {
  padding: var(--unit-tinier) var(--unit-tiny);
}

// ─── Close button ─────────────────────────────────────────────────────────────

.tooltip__close {
  @media (hover: hover) and (pointer: fine) {
    display: none;
  }
}

.tooltip__text {
  color: var(--foreground-secondary);
  margin: 0;
  line-height: 1.5;

  :deep(a) {
    color: var(--link-color);
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: var(--link-color-hover);
    }
  }
}
</style>
