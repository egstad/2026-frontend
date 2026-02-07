<template>
  <figure class="pic" :class="picClasses">
    <!-- Sanity CDN images: NuxtImg with built-in Sanity provider.
         Handles srcset generation, auto=format (avif/webp), quality,
         and DPR selection natively via the sizes/srcset mechanism. -->
    <NuxtImg
      v-if="sanityAssetPath"
      ref="imageRef"
      provider="sanity"
      :src="sanityAssetPath"
      :alt="alt"
      :width="width"
      :height="height"
      :sizes="computedSizes"
      :placeholder="placeholder"
      :loading="loading"
      :quality="quality"
      :densities="densities"
      :preload="preload"
      @load="onLoad"
      @error="onError"
      class="pic__image"
    />

    <!-- Other external images (non-Sanity) -->
    <img
      v-else-if="external"
      ref="imageRef"
      :src="src"
      :srcset="srcset || undefined"
      :sizes="srcset ? computedSizes || undefined : undefined"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      @load="onLoad"
      @error="onError"
      class="pic__image"
    />

    <!-- Local images: NuxtImg default provider -->
    <NuxtImg
      v-else
      ref="imageRef"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :sizes="computedSizes"
      :placeholder="placeholder"
      :loading="loading"
      :quality="computedQuality"
      :format="format"
      :densities="densities"
      :preload="preload"
      @load="onLoad"
      @error="onError"
      class="pic__image"
    />

    <!-- Error state overlay -->
    <div v-if="showError && hasError" class="pic__error">
      <slot name="error">
        <div class="pic__error-message t-micro-1">Failed to load image</div>
      </slot>
    </div>
  </figure>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    required: true,
  },
  external: {
    type: Boolean,
    default: false,
  },
  width: {
    type: [Number, String],
    default: undefined,
  },
  height: {
    type: [Number, String],
    default: undefined,
  },
  srcset: {
    type: String,
    default: undefined,
  },
  sizes: {
    type: String,
    default: undefined,
  },
  placeholder: {
    type: [String, Boolean],
    default: true,
  },
  loading: {
    type: String,
    default: "lazy",
  },
  quality: {
    type: Number,
    default: undefined,
  },
  format: {
    type: String,
    default: "webp",
  },
  densities: {
    type: String,
    default: "1x 2x",
  },
  preload: {
    type: Boolean,
    default: false,
  },
  showError: {
    type: Boolean,
    default: true,
  },
  blockLoading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["load", "error"]);

// -------------------------
// State
// -------------------------
const isLoading = ref(true);
const hasError = ref(false);
const isMounted = ref(false);
const imageRef = ref(null);
const naturalWidth = ref(null);
const naturalHeight = ref(null);

// -------------------------
// Sanity CDN detection
// -------------------------

/**
 * Extract a Sanity asset reference ID from a full CDN URL.
 * The NuxtImg Sanity provider uses @sanity/image-url internally,
 * which expects the asset reference format:
 *
 *   URL filename: "abc123-800x600.jpg"
 *   Asset ref ID: "image-abc123-800x600-jpg"
 */
const sanityAssetPath = computed(() => {
  if (!props.src?.includes("cdn.sanity.io")) return null;
  const pathWithoutParams = props.src.split("?")[0];
  const segments = pathWithoutParams.split("/");
  const filename = segments[segments.length - 1];
  if (!filename) return null;

  // Convert "hash-WxH.ext" → "image-hash-WxH-ext"
  const lastDot = filename.lastIndexOf(".");
  if (lastDot === -1) return null;
  const name = filename.substring(0, lastDot);
  const ext = filename.substring(lastDot + 1);
  return `image-${name}-${ext}`;
});

// -------------------------
// Responsive sizing
// -------------------------

/**
 * NuxtImg needs its own breakpoint-based `sizes` format to generate
 * proper srcset widths. Plain CSS "100vw" can't be resolved to pixels
 * at build time, so NuxtImg falls back to 1px base width.
 *
 * NuxtImg format: "sm:100vw md:50vw lg:400px"
 * → computes image width at each screen breakpoint
 * → generates srcset entries at those widths
 *
 * Default: full viewport width at every breakpoint.
 */
const DEFAULT_SIZES = "sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw";
const computedSizes = computed(() => props.sizes || DEFAULT_SIZES);

/** Quality for the local NuxtImg path. Explicit prop or 80 default. */
const computedQuality = computed(() => props.quality ?? 80);

// -------------------------
// Event handlers
// -------------------------
const onLoad = (event) => {
  if (props.blockLoading) return;

  const imgEl = event.target;
  if (imgEl) {
    naturalWidth.value = imgEl.naturalWidth;
    naturalHeight.value = imgEl.naturalHeight;

    // Set intrinsic dimensions if none provided (prevents layout shift)
    if (!props.width && !props.height) {
      imgEl.setAttribute("width", naturalWidth.value);
      imgEl.setAttribute("height", naturalHeight.value);
    }
  }

  isLoading.value = false;
  hasError.value = false;
  emit("load", event);
};

const onError = (event) => {
  if (props.blockLoading) return;
  isLoading.value = false;
  hasError.value = true;
  emit("error", event);
};

// -------------------------
// Lifecycle
// -------------------------
onMounted(() => {
  isMounted.value = true;

  if (props.blockLoading) {
    isLoading.value = true;
    hasError.value = false;
    return;
  }

  // Check if external image already loaded (SSR hydration case where
  // the load event fires before Vue attaches listeners).
  if (props.external && !sanityAssetPath.value && imageRef.value) {
    const imgEl = imageRef.value;
    if (imgEl.complete) {
      if (imgEl.naturalWidth > 0) {
        naturalWidth.value = imgEl.naturalWidth;
        naturalHeight.value = imgEl.naturalHeight;
        if (!props.width && !props.height) {
          imgEl.setAttribute("width", naturalWidth.value);
          imgEl.setAttribute("height", naturalHeight.value);
        }
        isLoading.value = false;
        hasError.value = false;
      } else {
        isLoading.value = false;
        hasError.value = true;
      }
    }
    // If not complete, @load/@error events will fire naturally
  }
});

// Computed classes
const picClasses = computed(() => {
  const classes = [];
  if (isLoading.value) classes.push("pic--loading");
  if (hasError.value) classes.push("pic--error");
  return classes;
});
</script>

<style lang="scss" scoped>
.pic {
  position: relative;
  overflow: hidden;
  min-height: 24px;
  border-radius: var(--radii-tiny);
}

.pic__image {
  width: 100%;
  height: 100%;
  display: flex;
  transition: opacity var(--transition);

  .pic--error & {
    opacity: 0.3;
  }
}

.pic__error {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--background-tertiary);
}

.pic__error-message {
  color: var(--foreground-secondary);
  text-align: center;
}
</style>
