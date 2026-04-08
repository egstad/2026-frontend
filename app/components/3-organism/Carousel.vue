<script setup lang="ts">
import EmblaCarousel from "embla-carousel";
import Fade from "embla-carousel-fade";
import AutoHeight from "embla-carousel-auto-height";
import Autoplay from "embla-carousel-autoplay";
import type { EmblaCarouselType } from "embla-carousel";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";

const props = withDefaults(
  defineProps<{
    loop?: boolean;
    captions?: string[];
    autoplay?: boolean;
    autoplayDelay?: number;
  }>(),
  { loop: true, autoplay: false, autoplayDelay: 4000 },
);

const viewportEl = ref<HTMLElement | null>(null);
const captionEl = ref<HTMLElement | null>(null);
let embla: EmblaCarouselType | null = null;
let resizeObserver: ResizeObserver | null = null;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSTRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 150);
}

const selectedIndex = ref(0);
const slideCount = ref(0);
const visibleCaption = ref("");
const userInteracted = ref(false);
const ringFillEl = ref<SVGCircleElement | null>(null);

function restartRing() {
  const el = ringFillEl.value;
  if (!el) return;
  el.style.animation = "none";
  el.getBoundingClientRect(); // force reflow so the browser registers the reset
  el.style.animation = "";
}

// CSS animation duration driven by the autoplay delay prop
const ringDuration = computed(() => `${props.autoplayDelay}ms`);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function stopAutoplay() {
  embla?.plugins()?.autoplay?.stop();
}

function startAutoplay() {
  embla?.plugins()?.autoplay?.play();
}

// Called on any deliberate user navigation — kills autoplay permanently
function onUserInteract() {
  if (!props.autoplay || userInteracted.value) return;
  userInteracted.value = true;
  stopAutoplay();
}

function onStageEnter() {
  if (!props.autoplay || userInteracted.value) return;
  stopAutoplay();
}

function onStageLeave() {
  if (!props.autoplay || userInteracted.value) return;
  startAutoplay();
}

// Mutable object reused by the typewriter tween so we can kill it by reference
const typewriter = { count: 0 };

function prev() {
  onUserInteract();
  embla?.scrollPrev();
}

function next() {
  onUserInteract();
  embla?.scrollNext();
}

function typewriteCaption(text: string) {
  if (!text) {
    visibleCaption.value = "";
    return;
  }

  gsap.killTweensOf(typewriter);
  typewriter.count = 0;
  visibleCaption.value = "";

  const words = text.split(" ");

  gsap.to(typewriter, {
    count: words.length,
    duration: words.length * 0.1,
    ease: "none",
    roundProps: "count",
    onUpdate() {
      visibleCaption.value = words.slice(0, typewriter.count).join(" ");
    },
    onComplete() {
      visibleCaption.value = text;
    },
  });
}

function onSelect() {
  const idx = embla?.selectedScrollSnap() ?? 0;
  const newCaption = props.captions?.[idx] ?? "";
  selectedIndex.value = idx;
  restartRing();

  if (!captionEl.value || !visibleCaption.value) {
    typewriteCaption(newCaption);
    return;
  }

  gsap.killTweensOf(captionEl.value);
  gsap.killTweensOf(typewriter);

  gsap.to(captionEl.value, {
    opacity: 0,
    duration: 0.15,
    ease: "power1.in",
    onComplete: () => {
      gsap.set(captionEl.value, { opacity: 1 });
      typewriteCaption(newCaption);
    },
  });
}

onMounted(() => {
  if (!viewportEl.value) return;

  const plugins = [Fade(), AutoHeight()];
  if (props.autoplay) {
    plugins.push(
      Autoplay({
        delay: props.autoplayDelay,
        stopOnInteraction: true,
        stopOnMouseEnter: false,
      }),
    );
  }

  embla = EmblaCarousel(viewportEl.value, { loop: true }, plugins);

  slideCount.value = embla.slideNodes().length;
  visibleCaption.value = props.captions?.[0] ?? "";
  embla.on("select", onSelect);
  embla.on("pointerDown", onUserInteract);

  resizeObserver = new ResizeObserver(() => {
    embla?.reInit();
    scheduleSTRefresh();
  });
  embla.slideNodes().forEach((slide) => resizeObserver!.observe(slide));
});

function onCarouselEnter() {
  if (props.autoplay && !userInteracted.value) {
    restartRing();
    startAutoplay();
  }
}

function onCarouselLeave() {
  if (!props.autoplay) return;
  stopAutoplay();
  if (ringFillEl.value) ringFillEl.value.style.animationPlayState = "paused";
}

function onVisibilityChange() {
  if (!props.autoplay) return;
  if (document.hidden) {
    stopAutoplay();
  } else if (!userInteracted.value) {
    restartRing();
    startAutoplay();
  }
}

onMounted(() => {
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", onVisibilityChange);
  if (refreshTimer) clearTimeout(refreshTimer);
  gsap.killTweensOf(typewriter);
  embla?.destroy();
  resizeObserver?.disconnect();
});
</script>

<template>
  <Observer :on-enter="onCarouselEnter" :on-leave="onCarouselLeave">
    <div
      class="carousel"
      tabindex="0"
      @keydown.left.prevent="prev"
      @keydown.right.prevent="next"
    >
      <div
        class="carousel__stage"
        @mouseenter="onStageEnter"
        @mouseleave="onStageLeave"
      >
        <div ref="viewportEl" class="carousel__viewport">
          <div class="carousel__container">
            <slot />
          </div>
        </div>

        <div v-if="slideCount > 1" class="carousel__arrows" @click="next">
          <button
            class="carousel__btn"
            aria-label="Previous slide"
            @click.stop="prev"
          >
            <ChevronLeftIcon class="carousel__btn-icon" aria-hidden="true" />
          </button>
          <button
            class="carousel__btn"
            aria-label="Next slide"
            @click.stop="next"
          >
            <ChevronRightIcon class="carousel__btn-icon" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div class="carousel__footer">
        <p ref="captionEl" class="carousel__caption">
          <Text size="caption-2" color="dim">{{
            visibleCaption || "\u00a0"
          }}</Text>
        </p>

        <div
          v-if="slideCount > 1"
          class="carousel__counter"
          :class="{ 'carousel__counter--playing': autoplay && !userInteracted }"
          aria-hidden="true"
        >
          <Transition name="ring-fade">
            <svg
              v-if="autoplay && !userInteracted"
              class="carousel__ring"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
            >
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="var(--background-quaternary)"
                stroke-width="1"
              />
              <circle
                ref="ringFillEl"
                class="carousel__ring-fill"
                cx="7"
                cy="7"
                r="5"
                stroke="var(--foreground-secondary)"
                stroke-width="1"
                stroke-linecap="round"
                stroke-dasharray="31.416"
                stroke-dashoffset="31.416"
                transform="rotate(-90 7 7)"
              />
            </svg>
          </Transition>
          <Text is="span" size="micro-1" color="dimmer" class="carousel__count">
            {{ pad(selectedIndex + 1) }}&nbsp;/&nbsp;{{ pad(slideCount) }}
          </Text>
        </div>
      </div>
    </div>
  </Observer>
</template>

<style lang="scss" scoped>
.carousel {
  user-select: none;
  outline: none;

  &:focus-visible {
    outline: 2px solid var(--interactive-primary);
    outline-offset: 4px;
    border-radius: 2px;
  }
}

.carousel__stage {
  position: relative;
}

.carousel__viewport {
  overflow: hidden;
}

.carousel__container {
  display: flex;
  align-items: flex-start;
  touch-action: pan-y;
  transition: height var(--transition);
}

:slotted(.carousel__slide) {
  flex: 0 0 100%;
  min-width: 0;
  position: relative;
}

.carousel__arrows {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--unit-tinier);
  cursor: pointer;

  @media (hover: hover) {
    opacity: 0;
    transition: opacity var(--transition);
  }
}

@media (hover: hover) {
  .carousel__stage:hover .carousel__arrows {
    opacity: 1;
  }
}

.carousel__btn {
  width: 24px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--background-primary) 70%, transparent);
  backdrop-filter: blur(4px);
  color: var(--foreground-secondary);
  border: none;
  border-radius: var(--unit-tiniest);
  flex-shrink: 0;
  cursor: pointer;
  transition:
    color var(--transition-fast),
    background var(--transition-fast);

  &:hover {
    background: color-mix(in srgb, var(--background-primary) 90%, transparent);
    color: var(--foreground-primary);
  }
}

.carousel__btn-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.carousel__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--unit-tinier);
  padding-top: var(--unit-tinier);
}

.carousel__caption {
  color: var(--foreground-tertiary);
  font-variant-numeric: tabular-nums;
}

.carousel__counter {
  display: flex;
  align-items: center;
  gap: var(--unit-tinier);
  flex-shrink: 0;
  color: var(--foreground-quaternary);
  transition: opacity var(--transition);

  @media (hover: hover) {
    &:not(.carousel__counter--playing) {
      opacity: 0;
    }
  }
}

@media (hover: hover) {
  .carousel:has(.carousel__stage:hover) .carousel__counter {
    opacity: 1;
  }
}

.carousel__ring {
  display: block;
  flex-shrink: 0;
  margin-top: 0.1em;
}

.ring-fade-leave-active {
  transition: opacity var(--transition);
}

.ring-fade-leave-to {
  opacity: 0;
}

@keyframes ring-fill {
  from {
    stroke-dashoffset: 31.416;
  }
  to {
    stroke-dashoffset: 0;
  }
}

.carousel__ring-fill {
  animation: ring-fill v-bind(ringDuration) linear forwards;
}

.carousel__count {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
