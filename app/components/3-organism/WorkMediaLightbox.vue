<script setup lang="ts">
/**
 * WorkMediaLightbox
 *
 * Animation sequence — open:
 *   1. showModal (scrim + chrome at opacity 0)
 *   2. wait for Vue to render stage div + Teleport to activate
 *   3. GSAP FLIP: media flies from card bounds → stage center
 *      simultaneously: scrim fades in
 *   4. media settled → details + toolbar fade in
 *
 * Animation sequence — close:
 *   1. details + toolbar fade out
 *   2. GSAP FLIP: media flies from stage → card bounds
 *      simultaneously: scrim fades out
 *   3. lb._closeState() → Teleport disabled → element returns to card
 *   4. dialog.close()
 */
import gsap from "gsap";
import { sanityImageSrcset, SRCSET_WIDTHS } from "~/utils/sanityImage";
import type { Artifact } from "~/types/sanity";

// ─── Imperative src upgrade ───────────────────────────────────────────────────
// Changing the NuxtImg `sizes` prop reactively causes NuxtImg to reset the
// <img> src back to its tiny placeholder URL (e.g. ?w=2&h=4) before loading
// the larger image — producing the "unintelligible gradient" flash.
//
// Fix: keep Vue props constant and imperatively patch the DOM after FLIP so
// NuxtImg never sees a sizes change and never resets its placeholder state.
//
// Strategy: remove srcset entirely and point src at a single fixed high-res URL.
// With no srcset the browser cannot re-evaluate which candidate to use on resize,
// so the image stays sharp regardless of how the container dimensions change.

let _upgradedImg: HTMLImageElement | null = null;
let _originalSrcset = "";
let _originalSizes = "";
let _originalSrc = "";

/** Compute the high-res src that upgradeImgSrcset will set on the <img>.
 *  Reads --lb-flip-w from the stage (set by applyCurrentFlipDimensions) so the
 *  URL is identical to what the browser will eventually load — guaranteeing an
 *  HTTP cache hit when the same URL is pre-warmed during the FLIP animation. */
function computeLightboxImgSrc(artifact: Artifact | null): string | null {
  if (!import.meta.client) return null;
  if (!artifact?.imageUrl || artifact.mediaType === "video") return null;

  const cssW =
    parseFloat(
      localStageEl.value?.style.getPropertyValue("--lb-flip-w") || "0",
    ) || window.innerWidth;
  // physicalW already accounts for DPR, so do NOT pass dpr to sanityImageUrl —
  // Sanity's dpr param multiplies w server-side, which would double-scale the
  // image (cssW × dpr²) and produce a file up to 4× larger than needed.
  const dpr = Math.min(Math.ceil(window.devicePixelRatio || 1), 3);
  const physicalW = Math.round(cssW * dpr);
  const targetW =
    SRCSET_WIDTHS.find((w) => w >= physicalW) ??
    SRCSET_WIDTHS.at(-1) ??
    4000;

  return sanityImageUrl(artifact.imageUrl, { width: targetW });
}

function upgradeImgSrcset() {
  if (!import.meta.client) return;
  const artifact = activeArtifact.value;
  if (!artifact?.imageUrl || artifact.mediaType === "video") return;

  const imgEl =
    sharedStageEl.value?.querySelector<HTMLImageElement>("img") ?? null;
  if (!imgEl) return;

  _upgradedImg = imgEl;
  _originalSrcset = imgEl.getAttribute("srcset") ?? "";
  _originalSizes = imgEl.getAttribute("sizes") ?? "";
  _originalSrc = imgEl.getAttribute("src") ?? "";

  const src = computeLightboxImgSrc(artifact);
  if (!src) return;

  // Remove srcset/sizes so the browser has no adaptive candidates to
  // re-evaluate. A plain src is a hard lock on a single URL.
  imgEl.removeAttribute("srcset");
  imgEl.removeAttribute("sizes");
  imgEl.src = src;
  console.log("[lb] img src swapped (cached =", imgEl.complete, ")→", src);
}

function restoreImgSrcset() {
  if (!_upgradedImg) return;
  if (_originalSrcset) _upgradedImg.setAttribute("srcset", _originalSrcset);
  if (_originalSizes) _upgradedImg.setAttribute("sizes", _originalSizes);
  if (_originalSrc) _upgradedImg.src = _originalSrc;
  _upgradedImg = null;
  _originalSrc = "";
}

// ─── Squish-free FLIP: explicit pixel dimensions ─────────────────────────────
// FLIP applies scaleX and scaleY independently. When the stage's aspect ratio
// differs from the card's, scaleX ≠ scaleY → content visibly squishes.
//
// Fix: before measuring `lastRect`, compute the pixel dimensions the media
// SHOULD occupy in the stage (same math as object-fit:contain) and write them
// directly onto flipRootEl. Explicit pixels give `height: 100%` on children a
// definite reference (unlike CSS `aspect-ratio` on a flex item), so vid-wrapper
// and pic render correctly.
function mediaAspectRatio(artifact: Artifact | null): number {
  if (!artifact) return 16 / 9;
  if (artifact.mediaType === "video") {
    const ratio = artifact.videoMeta?.aspectRatio; // "16:9"
    if (ratio) {
      const [w, h] = ratio.split(":").map(Number);
      if (w && h) return w / h;
    }
    return 16 / 9;
  }
  const d = artifact.imageMeta?.dimensions;
  return d?.width && d?.height ? d.width / d.height : 16 / 9;
}

// ─── Flip dimensions via CSS custom properties ───────────────────────────────
// We set --lb-flip-w / --lb-flip-h on the STAGE element (owned by this
// component) rather than as inline styles on lb-flip-root (owned by
// MediaCard/FeedCard). Vue's vdom patch can silently clear inline styles on
// teleported elements during re-renders; CSS custom properties on an ancestor
// element are immune to that.
// The :deep(.lb-flip-root) rule reads the vars so lb-flip-root always has a
// definite size, giving vid-wrapper/pic a concrete 100%-height to resolve.

/** Compute and apply contain-fit dimensions for the media, optionally capped
 *  at the asset's natural size so images are never upscaled past their source
 *  resolution.  Pass `stageW` from a ResizeObserver entry to avoid a forced
 *  reflow. */
function applyFlipDimensions(
  stageEl: HTMLElement,
  ar: number,
  stageW?: number,
  maxNaturalW?: number,
  maxNaturalH?: number,
) {
  if (!import.meta.client || !ar) return;
  const sw = stageW ?? (stageEl.getBoundingClientRect().width || window.innerWidth);
  const vh = window.innerHeight;
  if (!sw) return;

  // Width-constrained when natural height fits the viewport;
  // height-constrained (100dvh) otherwise (portrait / square).
  const naturalH = sw / ar;
  let w = naturalH <= vh ? sw : vh * ar;
  let h = naturalH <= vh ? naturalH : vh;

  // Cap at original asset dimensions so images are never upscaled past their
  // source resolution (no cap for video — HLS ABR handles quality).
  if (maxNaturalW !== undefined || maxNaturalH !== undefined) {
    const scaleByW = maxNaturalW !== undefined && w > maxNaturalW ? maxNaturalW / w : 1;
    const scaleByH = maxNaturalH !== undefined && h > maxNaturalH ? maxNaturalH / h : 1;
    const scale = Math.min(scaleByW, scaleByH);
    if (scale < 1) {
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
  }

  stageEl.style.setProperty("--lb-flip-w", `${w}px`);
  stageEl.style.setProperty("--lb-flip-h", `${h}px`);
}

/** Remove the dimension vars so the stage returns to a neutral state. */
function clearFlipDimensions(stageEl: HTMLElement | null) {
  if (!stageEl) return;
  stageEl.style.removeProperty("--lb-flip-w");
  stageEl.style.removeProperty("--lb-flip-h");
}

/** Original pixel dimensions of an image asset for the natural-size cap.
 *  Returns undefined for video — HLS ABR selects the right quality level. */
function mediaNaturalDimensions(artifact: Artifact | null): { w?: number; h?: number } {
  if (!artifact || artifact.mediaType === "video") return {};
  const d = artifact.imageMeta?.dimensions;
  return { w: d?.width, h: d?.height };
}

/** Apply dimensions for the currently-active artifact.
 *  Optionally pass `stageW` (from ResizeObserver contentRect) to skip the
 *  getBoundingClientRect() reflow. */
function applyCurrentFlipDimensions(stageW?: number) {
  if (!localStageEl.value) return;
  const ar = mediaAspectRatio(activeArtifact.value);
  const { w: maxW, h: maxH } = mediaNaturalDimensions(activeArtifact.value);
  applyFlipDimensions(localStageEl.value, ar, stageW, maxW, maxH);
}

// A ResizeObserver on the stage keeps --lb-flip-w / --lb-flip-h live while the
// lightbox is open so media always fills the viewport correctly.  Started after
// the opening FLIP, stopped before the closing FLIP to avoid interfering with
// the animations.
let resizeRO: ResizeObserver | null = null;

const lb = useWorkLightbox();
const {
  activeArtifact,
  activeFlipRootEl,
  sharedStageEl,
  _closeState,
  consumeFirstRect,
  getTriggerEl,
} = lb;

// Use a stable local ref instead of a function ref on the template.
// Function refs can be called after script-scope teardown (during out-in
// page transitions), causing "Cannot set properties of null" errors.
const localStageEl = ref<HTMLElement | null>(null);
watchEffect(() => {
  sharedStageEl.value = localStageEl.value;
});

// ─── Refs ────────────────────────────────────────────────────────────────────

const dialogRef = ref<HTMLDialogElement | null>(null);
const scrimRef = ref<HTMLElement | null>(null);
const toolbarRef = ref<HTMLElement | null>(null);
const detailsRef = ref<HTMLElement | null>(null);

let isAnimating = false;

// ─── Utilities ────────────────────────────────────────────────────────────────

function rAF(frames = 1): Promise<void> {
  return new Promise((resolve) => {
    let remaining = frames;
    const step = () =>
      --remaining <= 0 ? resolve() : requestAnimationFrame(step);
    requestAnimationFrame(step);
  });
}

function rm(): boolean {
  return (
    import.meta.client &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// ─── Open sequence ────────────────────────────────────────────────────────────

watch(activeArtifact, async (artifact) => {
  if (!import.meta.client) return;
  if (!artifact) return;
  await runOpenSequence();
});

async function runOpenSequence() {
  const dlg = dialogRef.value;
  if (!dlg) return;

  // Show dialog; stage/chrome still invisible
  if (!dlg.open) {
    dlg.showModal();
    document.documentElement.classList.add("lb-open");
  }

  // Hide scrim and stage immediately (toolbar/details aren't in DOM yet —
  // they're guarded by v-if="activeArtifact" which Vue renders on next tick).
  gsap.set([scrimRef.value, localStageEl.value], { opacity: 0 });

  // ① Wait for Vue to render v-if content (toolbar, details) and bind sharedStageEl,
  //   then for the Teleport in MediaCard/FeedCard to activate.
  await nextTick(); // toolbar + details are now in the DOM

  // Hide chrome now that it has mounted (gsap ignores null targets above).
  gsap.set([toolbarRef.value, detailsRef.value], { opacity: 0 });

  await nextTick();
  await rAF(2);

  const flipEl = activeFlipRootEl.value;
  const firstRect = consumeFirstRect();

  const ar = mediaAspectRatio(activeArtifact.value);

  if (localStageEl.value) {
    // --lb-media-ar is the fallback aspect-ratio used before dimensions are set.
    localStageEl.value.style.setProperty("--lb-media-ar", String(ar));
  }

  if (!flipEl || rm()) {
    // Reduced motion / no flip data — apply dims and show everything
    applyCurrentFlipDimensions();
    gsap.set(
      [scrimRef.value, toolbarRef.value, detailsRef.value, localStageEl.value],
      { opacity: 1 },
    );
    if (localStageEl.value) resizeRO?.observe(localStageEl.value);
    return;
  }

  // Restore stage opacity synchronously — no paint has happened yet, so
  // the first painted frame shows flipEl already at the card position via FLIP.
  gsap.set(localStageEl.value, { clearProps: "opacity" });

  // Set --lb-flip-w / --lb-flip-h on the stage so lb-flip-root gets correct
  // contain-fit dimensions before we measure lastRect for the FLIP.
  applyCurrentFlipDimensions();

  // Pre-warm the HTTP cache with the exact URL upgradeImgSrcset will use.
  // The FLIP + details fade (~0.95 s) runs concurrently, giving the browser
  // a head-start on fetching the high-res image before it's needed.
  const _imgPreload = computeLightboxImgSrc(activeArtifact.value);
  if (_imgPreload) {
    const _preloader = new Image();
    const _t0 = Date.now();
    console.log("[lb] prefetch start →", _imgPreload);
    _preloader.onload = () => console.log(`[lb] prefetch done in ${Date.now() - _t0}ms`);
    _preloader.onerror = () => console.warn("[lb] prefetch failed");
    _preloader.src = _imgPreload;
  }

  // ② FLIP: measure last position, invert and play forward
  const last = flipEl.getBoundingClientRect();

  if (!firstRect || last.width === 0 || last.height === 0) {
    if (localStageEl.value) resizeRO?.observe(localStageEl.value);
    gsap.to(
      [scrimRef.value, toolbarRef.value, detailsRef.value, localStageEl.value],
      { opacity: 1, duration: 0.4 },
    );
    return;
  }

  const dx = firstRect.left - last.left;
  const dy = firstRect.top - last.top;
  const sx = firstRect.width / Math.max(last.width, 1);
  const sy = firstRect.height / Math.max(last.height, 1);

  // ③ FLIP media + fade scrim simultaneously
  await Promise.all([
    gsap
      .fromTo(
        flipEl,
        { x: dx, y: dy, scaleX: sx, scaleY: sy, transformOrigin: "0 0" },
        { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.6, ease: "expo.out" },
      )
      .then(() => {
        gsap.set(flipEl, { clearProps: "transform,transformOrigin" });
      }),
    gsap.to(scrimRef.value, { opacity: 1, duration: 0.45, ease: "power2.out" }),
  ]);

  // Upgrade the <img> srcset/sizes imperatively so the browser fetches a
  // high-res version without going through NuxtImg's reactive system
  // (which would reset the src to the placeholder URL).
  upgradeImgSrcset();

  // Ensure video keeps playing after DOM move
  const video = sharedStageEl.value?.querySelector<HTMLVideoElement>("video");
  if (video?.paused) video.play().catch(() => {});

  // ④ Fade in toolbar + details
  await gsap.to([toolbarRef.value, detailsRef.value], {
    opacity: 1,
    y: 0,
    duration: 0.35,
    ease: "power2.out",
    stagger: 0.06,
  });

  // ⑤ Start live-resize: keep media fitted to the viewport while open
  if (localStageEl.value) resizeRO?.observe(localStageEl.value);
}

// ─── Close sequence ───────────────────────────────────────────────────────────

async function handleClose() {
  if (isAnimating || !activeArtifact.value) return;
  isAnimating = true;
  // Stop live-resize before the close FLIP so dimension changes don't
  // invalidate the animation's fromRect measurement.
  resizeRO?.disconnect();

  try {
    const dlg = dialogRef.value;
    const flipEl = activeFlipRootEl.value;
    const home = getTriggerEl();

    // Reduced motion / missing refs: instant close
    if (!flipEl || !home || rm()) {
      restoreImgSrcset();
      clearFlipDimensions(localStageEl.value);
      if (flipEl) gsap.set(flipEl, { clearProps: "transform,transformOrigin" });
      finishClose();
      return;
    }

    // ① Fade out details + toolbar
    await gsap.to([toolbarRef.value, detailsRef.value], {
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
    });

    // Restore the original srcset/sizes before the FLIP plays back so the
    // browser reverts to the cached thumbnail (no gradient flash during close).
    restoreImgSrcset();

    // ② FLIP media back to card + fade scrim simultaneously
    // Re-apply dims from the *current* viewport (may have changed since open)
    // so the close FLIP measures a correctly-sized fromRect.
    applyCurrentFlipDimensions();
    const fromRect = flipEl.getBoundingClientRect();
    const toRect = home.getBoundingClientRect();
    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;
    const sx = toRect.width / Math.max(fromRect.width, 1);
    const sy = toRect.height / Math.max(fromRect.height, 1);

    await Promise.all([
      gsap
        .fromTo(
          flipEl,
          { x: 0, y: 0, scaleX: 1, scaleY: 1, transformOrigin: "0 0" },
          {
            x: dx,
            y: dy,
            scaleX: sx,
            scaleY: sy,
            duration: 0.5,
            ease: "expo.inOut",
          },
        )
        .then(() => {
          gsap.set(flipEl, { clearProps: "transform,transformOrigin" });
          clearFlipDimensions(localStageEl.value);
        }),
      gsap.to(scrimRef.value, { opacity: 0, duration: 0.4, ease: "power2.in" }),
    ]);

    finishClose();
  } finally {
    isAnimating = false;
  }
}

function finishClose() {
  resizeRO?.disconnect(); // safety net for instant-close / native-close paths
  _closeState();
  const dlg = dialogRef.value;
  if (dlg?.open) dlg.close();
  document.documentElement.classList.remove("lb-open");
}

// ─── Native dialog events ─────────────────────────────────────────────────────

function onDialogClose() {
  // Fired when dialog.close() or Escape closes it natively.
  // _closeState is safe to call even if already cleared.
  if (activeArtifact.value) _closeState();
}

function onCancel(ev: Event) {
  ev.preventDefault(); // suppress native Escape close so we can animate
  handleClose();
}

onMounted(() => {
  if (import.meta.client && "ResizeObserver" in window) {
    resizeRO = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !activeArtifact.value || !localStageEl.value) return;
      // Use contentRect.width to avoid a forced reflow; still uses
      // window.innerHeight for the vertical constraint (close enough to 100dvh).
      applyCurrentFlipDimensions(entry.contentRect.width);
    });
  }
});

onUnmounted(() => {
  resizeRO?.disconnect();
  resizeRO = null;
  document.documentElement.classList.remove("lb-open");
});

// ─── Share ────────────────────────────────────────────────────────────────────

const copied = ref(false);

async function copyLink() {
  const slug = activeArtifact.value?.slug?.current;
  if (!slug || !import.meta.client) return;
  try {
    await navigator.clipboard.writeText(
      `${window.location.origin}/work/${slug}`,
    );
    copied.value = true;
    setTimeout(() => (copied.value = false), 2000);
  } catch {
    /* ignore */
  }
}

</script>

<template>
  <!-- dialog is always in the DOM; open/close is toggled via showModal()/close() -->
  <dialog
    ref="dialogRef"
    class="lb"
    aria-label="Media viewer"
    @close="onDialogClose"
    @cancel.prevent="onCancel"
  >
    <!-- ① Scrim — animatable backdrop -->
    <div ref="scrimRef" class="lb__scrim" @click="handleClose" />

    <!-- ② Scrollable content: stage + details stacked vertically -->
    <div class="lb__scroll">
      <!-- Stage — Teleport destination, always rendered so sharedStageEl is set -->
      <div ref="localStageEl" class="lb__stage" />

      <template v-if="activeArtifact">
        <div ref="detailsRef" class="lb__details">
          <ArtifactMetaPanel :media="activeArtifact" />
          <button class="lb__copy-link" type="button" @click="copyLink">
            {{ copied ? "Copied!" : "copy link" }}
          </button>
        </div>
      </template>
    </div>

    <!-- ③ Close button — fixed overlay, fades in after FLIP -->
    <template v-if="activeArtifact">
      <div ref="toolbarRef" class="lb__toolbar">
        <BaseButton
          type="button"
          size="small"
          variant="ghost"
          @click="handleClose"
        >
          Close
        </BaseButton>
      </div>
    </template>
  </dialog>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/global" as *;

// ── Dialog shell ──────────────────────────────────────────────────────────────
.lb {
  position: fixed;
  inset: 0;
  width: 100vw;
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--foreground-primary);
  overflow: hidden;

  &::backdrop {
    display: none;
  }
}

// ── Scrim — full-screen animatable backdrop ───────────────────────────────────
.lb__scrim {
  position: absolute;
  inset: 0;
  background: var(--background-primary);
  z-index: 0;
  cursor: zoom-out;
}

// ── Scroll container — the full-height scrollable region ─────────────────────
.lb__scroll {
  position: relative;
  z-index: 1;
  height: 100dvh;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  // Reserve scrollbar gutter so the stage width never jumps when content
  // overflows (i.e. when the details panel makes the scroll area taller).
  scrollbar-gutter: stable;
}

// ── Stage — fixed viewport height; media is contained within ─────────────────
// Using a fixed height here is the key to preventing layout shifts: when the
// details panel is injected below the stage, the stage never reflows.
.lb__stage {
  position: relative;
  width: 100%;
  height: 100dvh;  // fixed — never changes regardless of content below
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;

  // Dimensions are driven by --lb-flip-w / --lb-flip-h, CSS custom properties
  // set on .lb__stage by applyFlipDimensions(). Using vars on the stage (a
  // component-owned element) rather than inline styles on lb-flip-root (a
  // teleported element from MediaCard/FeedCard) means Vue's vdom patch cannot
  // accidentally clear them during card re-renders.
  // --lb-media-ar provides a fallback aspect-ratio for the invisible
  // settle period before the first applyFlipDimensions call.
  :deep(.lb-flip-root) {
    width: var(--lb-flip-w, auto);
    height: var(--lb-flip-h, auto);
    aspect-ratio: var(--lb-media-ar, 1);
  }

  :deep(.pic) {
    display: block;
    width: 100%;
    height: 100%;
    margin: 0;
  }

  :deep(.pic__image) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
    object-position: center;
  }

  :deep(.vid-wrapper) {
    width: 100%;
    height: 100%;
  }

  :deep(.vid) {
    object-fit: contain;
  }
}

// ── Close button — sits above the scroll container ───────────────────────────
.lb__toolbar {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 2;
  padding: var(--unit-tiny);
  pointer-events: all;
}

// ── Details — below the stage, scrolls with content ─────────────────────────
.lb__details {
  position: relative;
  z-index: 1;
  padding: var(--unit-tinier) var(--unit-small);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: all;
}

// ── Copy link — inline text link ─────────────────────────────────────────────
.lb__copy-link {
  appearance: none;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  font-size: var(--caption-2);
  color: var(--foreground-tertiary);
  text-decoration: underline;
  text-underline-offset: 2px;
  margin-top: var(--unit-tinier);
  display: inline-block;
}
</style>

<style lang="scss">
html.lb-open {
  overflow: hidden;
}
</style>
