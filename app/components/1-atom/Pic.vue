<template>
  <figure class="pic" :class="picClasses">
    <!-- Use regular img for external/unoptimized images -->
    <img
      v-if="external"
      ref="imageRef"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      @load="onLoad"
      @error="onError"
      class="pic__image"
    />

    <!-- Use NuxtImg for local images that should be optimized -->
    <NuxtImg
      v-else
      ref="imageRef"
      :src="src"
      :alt="alt"
      :width="width"
      :height="height"
      :sizes="sizes"
      :placeholder="placeholder"
      :loading="loading"
      :quality="quality"
      :format="format"
      :densities="densities"
      :preload="preload"
      @load="onLoad"
      @error="onError"
      class="pic__image"
    />

    <!-- Loading state overlay -->
    <div v-if="showLoading && isLoading" class="pic__loading">
      <slot name="loading">
        <div class="pic__spinner"></div>
      </slot>
    </div>

    <!-- Error state overlay -->
    <div v-if="showError && hasError" class="pic__error">
      <slot name="error">
        <div class="pic__error-message t-micro-1">Failed to load image</div>
      </slot>
    </div>
  </figure>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";

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
    default: 80,
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
  showLoading: {
    type: Boolean,
    default: true,
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

// State management
const isLoading = ref(true);
const hasError = ref(false);
const isMounted = ref(false);
const imageRef = ref(null);
const naturalWidth = ref(null);
const naturalHeight = ref(null);

// Event handlers
const onLoad = (event) => {
  if (props.blockLoading) return;

  // Set natural dimensions when image loads
  if (imageRef.value) {
    naturalWidth.value = imageRef.value.naturalWidth;
    naturalHeight.value = imageRef.value.naturalHeight;

    // If no width/height props provided, use natural dimensions
    if (!props.width && !props.height && imageRef.value) {
      imageRef.value.setAttribute("width", naturalWidth.value);
      imageRef.value.setAttribute("height", naturalHeight.value);
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

// Handle client-side mounting
onMounted(() => {
  isMounted.value = true;

  // If blockLoading is true, keep in loading state
  if (props.blockLoading) {
    isLoading.value = true;
    hasError.value = false;
    return;
  }

  // For external images, check if they're already loaded
  if (props.external) {
    const img = new Image();
    img.onload = () => {
      if (isMounted.value) {
        // Set natural dimensions for external images too
        naturalWidth.value = img.naturalWidth;
        naturalHeight.value = img.naturalHeight;

        // If no width/height props provided, use natural dimensions
        if (!props.width && !props.height && imageRef.value) {
          imageRef.value.setAttribute("width", naturalWidth.value);
          imageRef.value.setAttribute("height", naturalHeight.value);
        }

        isLoading.value = false;
        hasError.value = false;
      }
    };
    img.onerror = () => {
      if (isMounted.value) {
        isLoading.value = false;
        hasError.value = true;
      }
    };
    img.src = props.src;
  }
});

onUnmounted(() => {
  isMounted.value = false;
});

// Computed classes
const picClasses = computed(() => {
  const classes = [];

  if (isLoading.value) {
    classes.push("pic--loading");
  }

  if (hasError.value) {
    classes.push("pic--error");
  }

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

  .pic--loading & {
    opacity: 0;
  }

  .pic--error & {
    opacity: 0.3;
  }
}

.pic__loading,
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

.pic__spinner {
  width: 16px;
  height: 16px;
  border: 1px solid var(--foreground-secondary);
  border-top: 2px solid var(--foreground-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.pic__error-message {
  color: var(--foreground-secondary);
  text-align: center;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
