<script setup>
import gsap from "gsap";
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

PageSetup({ seoMeta: { title: "SS" } });
definePageMeta({
  layout: false,
  ssr: false,
  pageTransition: pageTransitionDefault(),
});

// ─── Egg ─────────────────────────────────────────────────────────────────────

const CRACK =
  "M670 254C658 239.333 630.6 207.4 617 197L525 289L406 385L369 654L507 730L702 509L670 254Z";

const EGG_PATHS = [
  // 1 — whole
  "M511.964 130C663.177 130 785.928 362.889 785.928 565.775C785.928 768.662 663.177 864.61 511.964 864.61C360.75 864.61 238 768.662 238 565.775C238 362.889 360.75 130 511.964 130Z",
  // 2 — first crack
  "M511.964 130C555.055 130 595.834 148.913 632.12 180.653L642.976 256.243L636.812 305L654.116 256.243L648.255 195.9C730.5 279.561 785.928 429.442 785.928 565.775C785.928 768.662 663.177 864.61 511.964 864.61C360.75 864.61 238 768.662 238 565.775C238 362.889 360.75 130 511.964 130Z",
  // 3 — crack grows
  "M511.964 130C557.023 130 599.555 150.681 637.064 185.084L606.123 312.496L649.743 367.455L524 443L676 379.014L631.267 308.739L663.108 212.059C737.103 297.934 785.928 437.821 785.928 565.775C785.928 768.662 663.177 864.61 511.964 864.61C360.75 864.61 238 768.662 238 565.775C238 362.889 360.75 130 511.964 130Z",
  // 4 — crack larger
  "M511.964 130C552.938 130 591.822 147.101 626.74 176.07L570.83 319.486L640.852 374.441L439 449.982L469.937 586.271L458 646L491.511 586.271L472.361 461.541L683 386L611.191 315.729L664.899 214.152C737.89 300.196 785.928 438.856 785.928 565.775C785.928 768.662 663.177 864.61 511.964 864.61C360.75 864.61 238 768.662 238 565.775C238 362.889 360.75 130 511.964 130Z",
  // 5 — broken, bottom shell only
  "M744.813 352.879C770.871 419.997 785.928 494.726 785.928 565.775C785.928 768.662 663.177 864.61 511.964 864.61C360.75 864.61 238 768.662 238 565.775C238 534.97 240.829 503.473 246.159 472.204L331.5 414L358 434L419 414L477 508.5L458 646L524 508.5L555.5 396.5L596 393L606 374L636 359L686.5 374L744.813 352.879Z",
];

// ─── Gradient background ──────────────────────────────────────────────────────

const colorStops = ref([]);
const bgString = ref("");
let gradientAngle = 0;

function brightParts() {
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
    { ...brightParts(), pos: Math.round(Math.random() * 20) },
    { h: 0, s: 0, l: 100, pos: Math.round(80 + Math.random() * 20) },
  ];
  buildGradient();
}

function addStop() {
  colorStops.value = [
    ...colorStops.value,
    { ...brightParts(), pos: Math.round(Math.random() * 100) },
  ].sort((a, b) => a.pos - b.pos);
  buildGradient();
}

// Initialise synchronously — gradient ready before first render (ssr: false)
initGradient();

const bgStyle = computed(() => ({ backgroundImage: bgString.value || "none" }));

// ─── Interaction ──────────────────────────────────────────────────────────────

const stage       = ref(0);
const eggEl       = ref(null);
const eggWrapEl   = ref(null);
let isAnimating   = false;

function jolt(sign) {
  return sign * gsap.utils.random(0.8, 2);
}

function shiver() {
  gsap.killTweensOf(eggEl.value);
  gsap
    .timeline({ defaults: { ease: "power2.out" } })
    .set(eggEl.value, { x: 0, rotation: 0 })
    .to(eggEl.value, { duration: 0.06, x: jolt(-1), rotation: gsap.utils.random(-0.2, -0.1) })
    .to(eggEl.value, { duration: 0.07, x: jolt( 1), rotation: gsap.utils.random( 0.1,  0.2) })
    .to(eggEl.value, { duration: 0.06, x: jolt(-1), rotation: gsap.utils.random(-0.15,-0.05) })
    .to(eggEl.value, { duration: 0.07, x: jolt( 1), rotation: gsap.utils.random( 0.05, 0.15) })
    .to(eggEl.value, { duration: 0.12, x: 0, rotation: 0, ease: "power3.out" });
}

function fallAndReset() {
  isAnimating = true;
  const tiltDir = Math.random() < 0.5 ? 1 : -1;

  // Kill any in-progress tweens on both elements
  gsap.killTweensOf(eggEl.value);
  gsap.killTweensOf(eggWrapEl.value);
  // Clear any shiver residue on the SVG
  gsap.set(eggEl.value, { x: 0, rotation: 0 });

  gsap.timeline()
    // Wrapper rotates around its CSS center — no drift
    .to(eggWrapEl.value, {
      duration: gsap.utils.random(0.5, 0.75),
      y: "135vh",
      rotation: tiltDir * gsap.utils.random(15, 70),
      ease: "power3.in",
    })
    // Swap to fresh whole egg while offscreen
    .call(() => {
      stage.value = 0;
      initGradient();
    })
    .set(eggWrapEl.value, { y: "-120vh", rotation: tiltDir * -4 })
    // Brief pause before the new egg appears
    .to(eggWrapEl.value, {
      duration: 1.0,
      y: 0,
      rotation: 0,
      ease: "power3.out",
      delay: 0.6,
    })
    .call(() => {
      isAnimating = false;
    });
}

function advance() {
  if (isAnimating) return;

  const next = (stage.value + 1) % EGG_PATHS.length;

  if (next === 0) {
    fallAndReset();
    return;
  }

  stage.value = next;
  addStop();
  shiver();
}

// ─── Clock ────────────────────────────────────────────────────────────────────

const localTime = ref("");
let clockTimer  = null;
let lastMinute  = -1;

function updateTime() {
  const now = new Date();
  localTime.value = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const minute = now.getMinutes();
  if (lastMinute !== -1 && minute !== lastMinute) advance();
  lastMinute = minute;
}

onMounted(() => {
  gsap.set(eggEl.value, { svgOrigin: "512 864" });
  updateTime();
  clockTimer = setInterval(updateTime, 1000);
});

onBeforeUnmount(() => {
  clearInterval(clockTimer);
});
</script>

<template>
  <div class="ss" :style="bgStyle" @click="advance">
    <Text is="time" class="clock" aria-live="polite">{{ localTime }}</Text>
    <div ref="eggWrapEl" class="egg-wrap">
    <svg
      ref="eggEl"
      class="egg"
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <filter
          id="crack-shadow"
          x="367.375"
          y="195.011"
          width="336.199"
          height="540.883"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.616079 0 0 0 0 0.5998 0 0 0 0 0.5998 0 0 0 1 0"
          />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
        </filter>

        <linearGradient
          id="crack-fill"
          x1="652"
          y1="233"
          x2="387.924"
          y2="496.528"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#C5B4AB" />
          <stop offset="0.0446391" stop-color="#CCC7C7" />
          <stop offset="0.129733" stop-color="#C5B4AB" />
          <stop offset="0.395" stop-color="#5B6567" />
          <stop offset="0.87419" stop-color="#4D423E" />
        </linearGradient>

        <linearGradient
          id="crack-stroke"
          x1="643.5"
          y1="206"
          x2="698"
          y2="456.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stop-color="#CEC8BB" />
          <stop offset="0.638534" stop-color="#858482" />
        </linearGradient>

        <radialGradient
          id="egg-fill"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(536 326) rotate(92.4302) scale(566.009 422.172)"
        >
          <stop offset="0.175" stop-color="#F2EEE1" />
          <stop offset="0.63" stop-color="#D6C9BE" />
          <stop offset="0.795" stop-color="#C9B0A5" />
          <stop offset="0.925" stop-color="#95979B" />
          <stop offset="1" stop-color="#CCCFD4" />
        </radialGradient>
      </defs>

      <g filter="url(#crack-shadow)">
        <path :d="CRACK" fill="#D9D9D9" />
        <path :d="CRACK" fill="url(#crack-fill)" />
      </g>
      <path :d="CRACK" stroke="url(#crack-stroke)" stroke-width="3" />
      <path :d="EGG_PATHS[stage]" fill="url(#egg-fill)" class="egg-body" />
    </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.ss {
  position: fixed;
  inset: 0;
  background-color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.egg-wrap {
  display: flex;
}

.egg-body {
  cursor: pointer;
}

.egg {
  width: min(110vw, 110vh);
  height: auto;
  display: block;
}

.clock {
  position: fixed;
  bottom: var(--unit-small, 1.5rem);
  left: var(--unit-small, 1.5rem);
  line-height: 1;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-variant-numeric: tabular-nums;
  color: white;
  mix-blend-mode: exclusion;
  pointer-events: none;
  user-select: none;
}
</style>
