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

/** True when the open was triggered from a card that teleports media into the stage.
 *  False for text-row opens — the lightbox renders media directly in the stage. */
export const hasTeleport = ref(false);

/** The card root element — receives focus when the lightbox closes. */
const triggerEl = ref<HTMLElement | null>(null);

/** Element whose bounds the close FLIP animates toward.
 *  Defaults to triggerEl when not explicitly provided. */
const closeFocusEl = ref<HTMLElement | null>(null);

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
      /** Receives focus when the lightbox closes. */
      trigger: HTMLElement;
      /** Bounds of the media element before opening (FLIP First rect).
       *  Omit for opens without a visible media source. */
      firstRect?: DOMRect;
      /** Element whose bounds the close FLIP flies back to.
       *  Defaults to `trigger` when omitted. Use this when the focus target
       *  (e.g. a full-width row) differs from the media thumbnail. */
      closeTarget?: HTMLElement;
    },
  ) {
    triggerEl.value = options.trigger;
    closeFocusEl.value = options.closeTarget ?? options.trigger;
    pendingFirstRect.value = options.firstRect ?? null;
    hasTeleport.value = !!options.firstRect;
    activeArtifact.value = item;
  }

  // ── Close (called by lightbox AFTER animations complete) ──────────────────
  function _closeState() {
    activeArtifact.value = null;
    pendingFirstRect.value = null;
    activeFlipRootEl.value = null;
    hasTeleport.value = false;
    const t = triggerEl.value;
    triggerEl.value = null;
    closeFocusEl.value = null;
    nextTick(() => t?.focus());
  }

  // ── Helpers exposed to the lightbox for animations ────────────────────────
  function consumeFirstRect(): DOMRect | null {
    const r = pendingFirstRect.value;
    pendingFirstRect.value = null;
    return r;
  }

  function getTriggerEl(): HTMLElement | null {
    return closeFocusEl.value ?? triggerEl.value;
  }

  return {
    // State
    activeArtifact,
    // DOM refs
    sharedStageEl,
    activeFlipRootEl,
    hasTeleport,
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
