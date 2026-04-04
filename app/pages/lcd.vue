<script setup>
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

PageSetup({ seoMeta: { title: "LCD" } });
definePageMeta({ layout: false, ssr: false, pageTransition: pageTransitionDefault() });

const PIXEL_SIZE       = 9;
const SUBPIXEL         = 3;
const VARIATION_BASE   = 12;
const VARIATION_SCATTER= 110;
const FPS              = 10;

const canvasEl = ref(null);
let ctx, animFrame;
let pixels = [], cols = 0, rows = 0, totalPx = 0, lastDraw = 0;
let variation    = VARIATION_BASE;
let scatterTimer = null;
let currentChannel = 0;
let rainbowMode    = false;
let rainbowHue     = 0;

let c1 = { r: 0, g: 0, b: 0 };
let c2 = { r: 255, g: 255, b: 255 };

// ─── Colour helpers ───────────────────────────────────────────────────────────

function hexToRgb(hex) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r
    ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) }
    : { r: 0, g: 0, b: 0 };
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)))
      .toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1) + min); }
function randomHex()   { return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`; }
function clamp(v)      { return Math.min(255, Math.max(0, v)); }

function setColors(hex1, hex2) {
  c1 = hexToRgb(hex1);
  c2 = hexToRgb(hex2);
}

// ─── Canvas ───────────────────────────────────────────────────────────────────

function resize() {
  cols    = Math.ceil(window.innerWidth  / PIXEL_SIZE);
  rows    = Math.ceil(window.innerHeight / PIXEL_SIZE);
  totalPx = cols * rows;
  canvasEl.value.width  = cols * PIXEL_SIZE;
  canvasEl.value.height = rows * PIXEL_SIZE;
  pixels = [];
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++)
      pixels.push({ x: x * PIXEL_SIZE, y: y * PIXEL_SIZE, r: 0, g: 0, b: 0 });
}

function loop(ts) {
  animFrame = requestAnimationFrame(loop);
  if (ts - lastDraw < 1000 / FPS) return;
  lastDraw = ts;

  if (rainbowMode) {
    setColors(
      hslToHex(rainbowHue % 360,        100, 50),
      hslToHex((rainbowHue + 50) % 360, 100, 50),
    );
    rainbowHue = (rainbowHue + 3) % 360;
  }

  for (let i = 0; i < totalPx; i++) {
    const t = i / totalPx;
    const v = () => Math.round(Math.random() * variation * 2 - variation);
    pixels[i].r = clamp(Math.round(c1.r + (c2.r - c1.r) * t) + v());
    pixels[i].g = clamp(Math.round(c1.g + (c2.g - c1.g) * t) + v());
    pixels[i].b = clamp(Math.round(c1.b + (c2.b - c1.b) * t) + v());
  }

  for (let i = 0; i < pixels.length; i++) {
    const { x, y, r, g, b } = pixels[i];
    ctx.fillStyle = `rgb(${r},0,0)`;   ctx.fillRect(x,              y, SUBPIXEL, PIXEL_SIZE);
    ctx.fillStyle = `rgb(0,${g},0)`;   ctx.fillRect(x + SUBPIXEL,   y, SUBPIXEL, PIXEL_SIZE);
    ctx.fillStyle = `rgb(0,0,${b})`;   ctx.fillRect(x + SUBPIXEL*2, y, SUBPIXEL, PIXEL_SIZE);
  }

  ctx.beginPath();
  for (let i = 0; i < pixels.length; i++)
    ctx.rect(pixels[i].x, pixels[i].y, PIXEL_SIZE, PIXEL_SIZE);
  ctx.strokeStyle = "rgba(0,0,0,0.3)";
  ctx.lineWidth   = 1;
  ctx.stroke();
}

// ─── Channel cycling ─────────────────────────────────────────────────────────

function scatter(duration = 500) {
  variation = VARIATION_SCATTER;
  clearTimeout(scatterTimer);
  scatterTimer = setTimeout(() => { variation = VARIATION_BASE; }, duration);
}

function changeChannel() {
  scatter();
  rainbowMode    = false;
  currentChannel = (currentChannel + 1) % 6;

  const h = rnd(0, 359), s = rnd(85, 100), l = rnd(40, 60);

  if (currentChannel === 0) {        // complimentary
    setColors(hslToHex(h, s, l), hslToHex((h + 180) % 360, s, l));
  } else if (currentChannel === 1) { // triadic
    setColors(hslToHex(h, s, l), hslToHex((h + 120) % 360, s, l));
  } else if (currentChannel === 2) { // square
    setColors(hslToHex(h, s, l), hslToHex((h +  90) % 360, s, l));
  } else if (currentChannel === 3) { // rainbow
    rainbowMode = true;
  } else if (currentChannel === 4) { // random
    setColors(randomHex(), randomHex());
  } else {                           // random + static (high noise stays)
    setColors(randomHex(), randomHex());
    variation = VARIATION_SCATTER;
    clearTimeout(scatterTimer);
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────

onMounted(() => {
  ctx = canvasEl.value.getContext("2d");
  const h = rnd(0, 359), s = rnd(85, 100), l = rnd(40, 60);
  setColors(hslToHex(h, s, l), hslToHex((h + 180) % 360, s, l));
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(loop);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animFrame);
  clearTimeout(scatterTimer);
  window.removeEventListener("resize", resize);
});
</script>

<template>
  <div class="lcd" @click="changeChannel" @keydown.space.prevent="changeChannel" tabindex="0">
    <canvas ref="canvasEl" class="bg" />
  </div>
</template>

<style lang="scss" scoped>
.lcd {
  position: fixed;
  inset: 0;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

.bg {
  position: absolute;
  inset: 0;
  display: block;
}
</style>
