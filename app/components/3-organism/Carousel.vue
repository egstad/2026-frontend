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

// Mutable object reused by the typewriter tween so we can kill it by reference
const typewriter = { count: 0 };

function prev() {
  embla?.scrollPrev();
}

function next() {
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
        stopOnMouseEnter: true,
      }),
    );
  }

  embla = EmblaCarousel(viewportEl.value, { loop: true }, plugins);

  slideCount.value = embla.slideNodes().length;
  visibleCaption.value = props.captions?.[0] ?? "";
  embla.on("select", onSelect);

  resizeObserver = new ResizeObserver(() => {
    embla?.reInit();
    scheduleSTRefresh();
  });
  embla.slideNodes().forEach((slide) => resizeObserver!.observe(slide));
});

function onCarouselEnter() {
  if (props.autoplay) embla?.plugins()?.autoplay?.play();
}

function onCarouselLeave() {
  if (props.autoplay) embla?.plugins()?.autoplay?.stop();
}

onUnmounted(() => {
  if (refreshTimer) clearTimeout(refreshTimer);
  gsap.killTweensOf(typewriter);
  embla?.destroy();
  resizeObserver?.disconnect();
});
</script>

<template>
  <Observer :on-enter="onCarouselEnter" :on-leave="onCarouselLeave">
    <div class="carousel">
      <div class="carousel__stage">
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

      <p ref="captionEl" class="carousel__caption">
        <Text size="caption-2" color="dimmer">{{
          visibleCaption || "\u00a0"
        }}</Text>
      </p>
    </div>
  </Observer>
</template>

<style lang="scss" scoped>
.carousel {
  user-select: none;
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
  .carousel__stage:hover .carousel__arrows,
  .carousel__stage:focus-within .carousel__arrows {
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

.carousel__caption {
  padding-top: var(--unit-tinier);
  color: var(--foreground-tertiary);
}
</style>
