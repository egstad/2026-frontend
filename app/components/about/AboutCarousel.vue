<script setup lang="ts">
import EmblaCarousel from "embla-carousel";
import AutoScroll from "embla-carousel-auto-scroll";
import type { EmblaCarouselType } from "embla-carousel";
import type { Great } from "~/types/sanity";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const props = defineProps<{
  items?: Great[];
  speed?: number;
}>();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

const shuffledItems = computed(() => (props.items ? shuffle(props.items) : []));

const viewportEl = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const isPaused = ref(false);
let embla: EmblaCarouselType | null = null;
let observer: IntersectionObserver | null = null;
let parallaxTriggers: ScrollTrigger[] = [];

function pause() {
  embla?.plugins()?.autoScroll?.stop();
}

function play() {
  if (!isPaused.value) embla?.plugins()?.autoScroll?.play();
}

function togglePause() {
  isPaused.value = !isPaused.value;
  isPaused.value ? pause() : play();
}

onMounted(() => {
  if (!viewportEl.value) return;

  embla = EmblaCarousel(
    viewportEl.value,
    { loop: true, dragFree: true, align: "start" },
    [
      AutoScroll({
        speed: props.speed ?? 0.4,
        startDelay: 0,
        stopOnInteraction: false,
      }),
    ],
  );

  // Once Embla has measured slides and images have settled, re-measure all
  // ScrollTrigger positions — components below the carousel would otherwise
  // be offset by the carousel's unresolved height at the time of their mount.
  embla.on("init", () => ScrollTrigger.refresh());

  // Pause autoscroll when out of view, resume when back in view
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) play();
      else pause();
    },
    { threshold: 0.1 },
  );
  observer.observe(viewportEl.value);

  // Parallax: each image travels within its clipped container on scroll
  const slides =
    viewportEl.value.querySelectorAll<HTMLElement>(".carousel__slide");
  slides.forEach((slide) => {
    const img = slide.querySelector<HTMLElement>("img");
    if (!img) return;

    const tween = gsap.fromTo(
      img,
      { yPercent: -10, scale: 1.2 },
      {
        yPercent: 10,
        scale: 1.2,
        ease: "ease-out",
        scrollTrigger: {
          trigger: slide,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    );
    if (tween.scrollTrigger) parallaxTriggers.push(tween.scrollTrigger);
  });
});

onUnmounted(() => {
  embla?.destroy();
  observer?.disconnect();
  parallaxTriggers.forEach((t) => t.kill());
  parallaxTriggers = [];
});
</script>

<template>
  <div class="carousel">
    <BaseButton
      variant="ghost"
      size="small"
      :icon="isPaused ? 'play' : 'pause'"
      icon-position="leading"
      class="carousel__toggle"
      :aria-label="isPaused ? 'Play carousel' : 'Pause carousel'"
      :aria-pressed="isPaused"
      @click="togglePause"
    >
      <span class="sr-only">{{ isPaused ? "Play" : "Pause" }}</span>
    </BaseButton>

    <div
      ref="viewportEl"
      class="carousel__viewport"
      :class="{ 'is-dragging': isDragging }"
      @mousedown="isDragging = true"
      @mouseup="isDragging = false"
      @mouseleave="isDragging = false"
    >
      <div class="carousel__container">
        <template v-if="shuffledItems.length">
          <figure
            v-for="item in shuffledItems"
            :key="item._id"
            class="carousel__slide"
          >
            <Pic v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" />
            <figcaption class="carousel__caption">
              <Text size="micro-2">{{ item.name }}</Text>
            </figcaption>
          </figure>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.carousel {
  overflow: hidden;
  user-select: none;
  position: relative;
}

.carousel__toggle {
  position: relative;
  left: var(--unit-tiny);
  margin-bottom: var(--unit-tiny);
  z-index: 1;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.carousel__viewport {
  overflow: hidden;
  cursor: grab;

  &.is-dragging {
    cursor: grabbing;
  }
}

.carousel__container {
  --carousel-height: clamp(240px, 50vmin, 640px);
  max-height: 720px;
  display: flex;
  align-items: flex-start;
  touch-action: pan-y;
}

.carousel__slide {
  flex: 0 0 auto;
  width: auto;
  margin-right: var(--unit-tiny);

  :deep(.pic) {
    height: var(--carousel-height);
    width: auto;
    min-height: unset;
    overflow: hidden;
  }

  :deep(img) {
    height: 100%; // extra height gives parallax room to move
    width: auto;
    display: block;
    pointer-events: none;
    will-change: transform;
    transform-origin: center center;
  }
}

.carousel__caption {
  color: var(--foreground-tertiary);
  padding-top: var(--unit-tinier);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition);

  .carousel__slide:hover & {
    color: var(--foreground-primary);
  }
}
</style>
