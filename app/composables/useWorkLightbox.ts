/**
 * useWorkLightbox
 *
 * All module-level refs are singletons so every component that calls
 * useWorkLightbox() shares the same state.  Only plain/shallow refs are used
 * for serialisable state so SSR does not complain; HTMLElement refs are kept
 * outside useState (non-serialisable, client-only).
 */
import type { Artifact } from "~/types/sanity";

// ─── Client-only DOM refs ─────────────────────────────────────────────────────

/** The <div> inside WorkMediaLightbox that the Teleport renders into. */
export const sharedStageEl = ref<HTMLElement | null>(null);

/** The .lb-flip-root wrapper on the active card (registered by MediaCard/FeedCard). */
export const activeFlipRootEl = ref<HTMLElement | null>(null);

/** The card root element to return focus / compute close-rect from. */
const triggerEl = ref<HTMLElement | null>(null);

/** Bounds of the media at the moment open() was called (First rect for FLIP). */
const pendingFirstRect = shallowRef<DOMRect | null>(null);

// ─── Composable ───────────────────────────────────────────────────────────────

export function useWorkLightbox() {
  const activeArtifact = useState<Artifact | null>(
    "work-lb-artifact",
    () => null,
  );
  // ── Registration (called by the active card) ───────────────────────────────
  function registerFlipRoot(el: HTMLElement) {
    activeFlipRootEl.value = el;
  }
  function unregisterFlipRootIf(el: HTMLElement) {
    if (activeFlipRootEl.value === el) activeFlipRootEl.value = null;
  }

  // ── Open ──────────────────────────────────────────────────────────────────
  function open(
    item: Artifact,
    options: {
      /** The card root — restored focus + close FLIP target. */
      trigger: HTMLElement;
      /** Bounds of the media element before opening (FLIP First rect). */
      firstRect: DOMRect;
    },
  ) {
    triggerEl.value = options.trigger;
    pendingFirstRect.value = options.firstRect;
    activeArtifact.value = item;
  }

  // ── Close (called by lightbox AFTER animations complete) ──────────────────
  function _closeState() {
    activeArtifact.value = null;
    pendingFirstRect.value = null;
    activeFlipRootEl.value = null;
    const t = triggerEl.value;
    triggerEl.value = null;
    nextTick(() => t?.focus());
  }

  // ── Helpers exposed to the lightbox for animations ────────────────────────
  function consumeFirstRect(): DOMRect | null {
    const r = pendingFirstRect.value;
    pendingFirstRect.value = null;
    return r;
  }

  function getTriggerEl(): HTMLElement | null {
    return triggerEl.value;
  }

  return {
    // State
    activeArtifact,
    // DOM refs
    sharedStageEl,
    activeFlipRootEl,
    // Actions
    open,
    _closeState,
    // Helpers
    registerFlipRoot,
    unregisterFlipRootIf,
    consumeFirstRect,
    getTriggerEl,
  };
}
