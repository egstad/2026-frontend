<template>
  <Teleport to="body">
    <div v-if="isActive" ref="overlayEl" class="site-intro" aria-hidden="true">
      <div
        ref="bgEl"
        class="site-intro__bg"
        :style="{ backgroundImage: bgString }"
      />
      <div class="site-intro__wordmark">
        <svg
          ref="svgEl"
          viewBox="0 0 115 22"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          class="wordmark-svg"
        >
          <g class="letter">
            <path
              d="M0.000906292 21.4888V19.6038H2.75591V2.20377H0.000906292V0.318769H15.0809V6.98877H13.0509V2.20377H4.93091V9.45377H8.70091V6.69877H10.5859V14.0938H8.70091V11.3388H4.93091V19.6038H13.6309V14.0938H15.6609V21.4888H0.000906292Z"
            />
          </g>
          <g class="letter">
            <path
              d="M29.0487 21.8078C23.0747 21.8078 18.6957 17.2548 18.6957 10.9038C18.6957 4.58177 23.0747 -0.0002321 29.0487 -0.0002321C32.1227 -0.0002321 34.6167 1.15977 36.2117 3.36377V0.318769H38.0967V8.03277H36.3567C35.4867 4.46577 32.7317 2.02977 29.0487 2.02977C24.3217 2.02977 20.8707 5.74177 20.8707 10.9038C20.8707 16.0948 24.3217 19.7778 29.0487 19.7778C33.1087 19.7778 35.8057 17.0228 35.9217 13.0788V12.7888H30.2667V10.9038H39.9817V12.7888H37.9517V21.4888H35.9217V18.5308C34.4427 20.5608 32.0937 21.8078 29.0487 21.8078Z"
            />
          </g>
          <g class="letter">
            <path
              d="M50.2581 21.8078C47.8221 21.8078 45.9081 20.6478 44.7481 19.0238V21.4888H42.8631V14.2388H44.6031C45.0091 17.5158 47.6481 19.7778 50.2581 19.7778C52.6651 19.7778 54.1731 18.3278 54.1731 16.4428C54.1731 13.9778 51.7951 13.1368 49.3301 12.0638L48.4021 11.6578C45.7631 10.4978 42.9211 9.13477 42.9211 5.48077C42.9211 2.00077 45.5021 -0.0002321 48.5471 -0.0002321C50.4031 -0.0002321 52.0851 0.869769 53.0711 2.46477V0.318769H54.9561V6.98877H53.2161C52.7811 3.74077 50.7511 2.02977 48.5471 2.02977C46.6041 2.02977 45.0961 3.27677 45.0961 5.33577C45.0961 7.88777 47.2131 8.64177 49.5041 9.65677L50.4321 10.0628C52.5781 10.9908 56.3481 12.2378 56.3481 16.2978C56.3481 19.6038 53.9411 21.8078 50.2581 21.8078Z"
            />
          </g>
          <g class="letter">
            <path
              d="M61.4342 21.4888V19.6038H65.3492V2.20377H60.9992V9.59877H58.9692V0.318769H73.9042V9.59877H71.8742V2.20377H67.5242V19.6038H71.4392V21.4888H61.4342Z"
            />
          </g>
          <g class="letter">
            <path
              d="M73.9194 21.4888V19.6038H76.2104L83.3734 0.173769H84.6784L91.7834 19.6038H94.0744V21.4888H87.5494V19.6038H89.6374L87.8394 14.5288H80.1544L78.3564 19.6038H80.4444V21.4888H73.9194ZM80.8214 12.6438H87.1724L84.0114 3.68277L80.8214 12.6438Z"
            />
          </g>
          <g class="letter">
            <path
              d="M95.3527 21.4888V19.6038H98.3977V2.20377H95.3527V0.318769H104.604C110.955 0.318769 114.783 5.04577 114.783 10.9038C114.783 16.7618 110.955 21.4888 104.604 21.4888H95.3527ZM100.573 19.6038H104.459C109.418 19.6038 112.608 15.7468 112.608 10.9038C112.608 6.08977 109.418 2.20377 104.459 2.20377H100.573V19.6038Z"
            />
          </g>
        </svg>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { gsap } from "gsap";

const SESSION_KEY = "site-intro-played";

const isActive = ref(false);
const overlayEl = ref<HTMLElement | null>(null);
const bgEl = ref<HTMLElement | null>(null);
const svgEl = ref<SVGSVGElement | null>(null);
const bgString = ref("");

// ─── Gradient (mirrors ss.vue logic) ─────────────────────────────────────────

interface ColorStop {
  h: number;
  s: number;
  l: number;
  pos: number;
}

const colorStops = ref<ColorStop[]>([]);
let gradientAngle = 0;

function brightParts(): Omit<ColorStop, "pos"> {
  return {
    h: Math.round(Math.random() * 360),
    s: Math.round(88 + Math.random() * 12),
    l: Math.round(48 + Math.random() * 14),
  };
}

function buildGradient() {
  const stops = colorStops.value
    .map((s) => `hsl(${s.h} ${s.s}% ${s.l}%) ${s.pos}%`)
    .join(", ");
  bgString.value = `linear-gradient(${gradientAngle}deg, ${stops})`;
}

function initGradient() {
  gradientAngle = Math.round(Math.random() * 360);
  colorStops.value = [
    { ...brightParts(), pos: Math.round(Math.random() * 15) },
    { ...brightParts(), pos: Math.round(20 + Math.random() * 20) },
    { ...brightParts(), pos: Math.round(45 + Math.random() * 20) },
    { ...brightParts(), pos: Math.round(68 + Math.random() * 15) },
    { h: 0, s: 0, l: 100, pos: Math.round(85 + Math.random() * 15) },
  ].sort((a, b) => a.pos - b.pos);
  buildGradient();
}

// ─── Animation sequence ───────────────────────────────────────────────────────

function play() {
  const siteContent = document.querySelector<HTMLElement>(".site-content");
  const bg = bgEl.value;
  const svg = svgEl.value;
  if (!bg || !svg) return;

  // Compute how far each letter must travel (in SVG user-units) to fall below
  // the viewport. The SVG fills the container width, so: 1 SVG unit = rect.width / 115 px.
  const rect = svg.getBoundingClientRect();
  const pxPerUnit = rect.width / 115;
  const pxToFall = window.innerHeight - rect.top + 100;
  const svgUnitsToFall = pxToFall / pxPerUnit;

  const letters = Array.from(svg.querySelectorAll<SVGGElement>(".letter"));

  if (siteContent) gsap.set(siteContent, { opacity: 0 });

  gsap
    .timeline({
      onComplete() {
        sessionStorage.setItem(SESSION_KEY, "1");
        document.documentElement.classList.remove("intro-pending");
        isActive.value = false;
        if (siteContent) gsap.set(siteContent, { clearProps: "opacity" });
      },
    })
    // 1. Letters fall, staggered left to right
    .to(
      letters,
      { y: svgUnitsToFall, duration: 0.45, ease: "power3.in", stagger: 0.07 },
      1.3,
    )
    // 3. Background drops out, content fades in simultaneously
    .to(bg, { y: window.innerHeight, duration: 0.55, ease: "power2.in" }, 1.55)
    .to(
      siteContent ?? [],
      { opacity: 1, duration: 0.5, ease: "power2.out" },
      1.55,
    );
}

onMounted(() => {
  if (sessionStorage.getItem(SESSION_KEY)) return;
  initGradient();
  isActive.value = true;
  nextTick(play);
});
</script>

<style lang="scss" scoped>
@use "~/assets/styles/global" as *;

.site-intro {
  position: fixed;
  inset: 0;
  z-index: 9000;
  pointer-events: none;
}

.site-intro__bg {
  position: absolute;
  inset: 0;
  will-change: transform;
}

.site-intro__wordmark {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  padding: 0 var(--grid-margin);
  overflow: visible;
}

.wordmark-svg {
  width: 100%;
  height: auto;
  display: block;
  color: white;
  overflow: visible;
}
</style>
