<template>
  <ClientOnly>
    <div ref="p5Container"></div>
    <template #fallback>
      <div class="loading">Loading p5.js sketch...</div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const p5Container = ref(null);
let p5Instance = null;

// Props for controlling canvas sizing
const props = defineProps({
  // If true, canvas will auto-resize to fit container (default: true)
  autoResize: {
    type: Boolean,
    default: true,
  },
  // Default canvas size if container has no dimensions
  defaultWidth: {
    type: Number,
    default: 400,
  },
  defaultHeight: {
    type: Number,
    default: 300,
  },
});

// Define all p5.js events as emits
const emit = defineEmits([
  // Core events
  "setup",
  "draw",
  "preload",

  // Mouse events
  "mousePressed",
  "mouseReleased",
  "mouseMoved",
  "mouseDragged",
  "mouseWheel",
  "mouseClicked",
  "doubleClicked",

  // Keyboard events
  "keyPressed",
  "keyReleased",
  "keyTyped",

  // Touch events
  "touchStarted",
  "touchMoved",
  "touchEnded",

  // Device events
  "deviceMoved",
  "deviceTurned",
  "deviceShaken",

  // Window events
  "windowResized",
]);

onMounted(async () => {
  // Only import p5 on the client side to avoid SSR issues
  if (process.client) {
    const p5 = (await import("p5")).default;

    const sketch = (sk) => {
      // Core events - always define these as p5.js expects them
      sk.setup = () => {
        // Auto-resize canvas to fit container if enabled
        if (props.autoResize) {
          const container = p5Container.value;
          if (container) {
            // Use getComputedStyle to get the actual rendered dimensions
            const computedStyle = window.getComputedStyle(container);
            const width =
              parseInt(computedStyle.width) ||
              container.clientWidth ||
              props.defaultWidth;
            const height =
              parseInt(computedStyle.height) ||
              container.clientHeight ||
              props.defaultHeight;
            sk.createCanvas(width, height);
          }
        }
        emit("setup", sk);
      };

      sk.draw = () => {
        emit("draw", sk);
      };

      // Only define preload if we have a listener for it
      // (preload is optional and can cause issues if defined but empty)

      // Mouse events
      sk.mousePressed = (event) => {
        emit("mousePressed", sk, event);
      };

      sk.mouseReleased = (event) => {
        emit("mouseReleased", sk, event);
      };

      sk.mouseMoved = (event) => {
        emit("mouseMoved", sk, event);
      };

      sk.mouseDragged = (event) => {
        emit("mouseDragged", sk, event);
      };

      sk.mouseWheel = (event) => {
        emit("mouseWheel", sk, event);
      };

      sk.mouseClicked = (event) => {
        emit("mouseClicked", sk, event);
      };

      sk.doubleClicked = (event) => {
        emit("doubleClicked", sk, event);
      };

      // Keyboard events
      sk.keyPressed = (event) => {
        emit("keyPressed", sk, event);
      };

      sk.keyReleased = (event) => {
        emit("keyReleased", sk, event);
      };

      sk.keyTyped = (event) => {
        emit("keyTyped", sk, event);
      };

      // Touch events
      sk.touchStarted = (event) => {
        emit("touchStarted", sk, event);
      };

      sk.touchMoved = (event) => {
        emit("touchMoved", sk, event);
      };

      sk.touchEnded = (event) => {
        emit("touchEnded", sk, event);
      };

      // Device events
      sk.deviceMoved = (event) => {
        emit("deviceMoved", sk, event);
      };

      sk.deviceTurned = (event) => {
        emit("deviceTurned", sk, event);
      };

      sk.deviceShaken = (event) => {
        emit("deviceShaken", sk, event);
      };

      // Window events
      sk.windowResized = (event) => {
        // Auto-resize canvas to match container if enabled
        if (props.autoResize) {
          const container = p5Container.value;
          if (container) {
            // Use getComputedStyle to get the actual rendered dimensions
            const computedStyle = window.getComputedStyle(container);
            const width =
              parseInt(computedStyle.width) ||
              container.clientWidth ||
              sk.width;
            const height =
              parseInt(computedStyle.height) ||
              container.clientHeight ||
              sk.height;

            // Only resize if dimensions actually changed
            if (width !== sk.width || height !== sk.height) {
              sk.resizeCanvas(width, height);
              // Re-emit setup to restore background and initial state
              emit("setup", sk);
            }
          }
        }
        emit("windowResized", sk, event);
      };
    };

    // Create p5 instance with error handling
    try {
      p5Instance = new p5(sketch, p5Container.value);
    } catch (error) {
      console.error("Error creating p5 instance:", error);
    }
  }
});

onUnmounted(() => {
  if (p5Instance) {
    p5Instance.remove();
    p5Instance = null;
  }
});

// Expose the p5 instance for direct access if needed
defineExpose({
  p5Instance: () => p5Instance,
});
</script>

<style scoped>
/* Allow the container to be flexible */
div {
  width: 100%;
  height: 100%;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-style: italic;
  min-height: 200px; /* Ensure there's some height for the loading state */
}
</style>
