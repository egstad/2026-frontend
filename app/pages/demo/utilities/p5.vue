<template>
  <Grid class="p5-demo">
    <!-- Example 1: Basic usage with object syntax -->
    <Column class="demo-section" span-tablet="6">
      <div class="p5-container">
        <P5 @setup="setup" @draw="draw" @mouse-pressed="mousePressed" />
      </div>
    </Column>

    <!-- Example 2: Using v-on object syntax -->
    <Column class="demo-section" span-tablet="6">
      <div class="p5-container">
        <P5 v-on="p5Events" />
      </div>
    </Column>

    <!-- Debug info -->
    <Column class="debug-info">
      <div ref="tweakpaneContainer" class="tweakpane-wrapper"></div>
    </Column>
  </Grid>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";
import { useTweakpane } from "~/composables/useTweakpane";

PageSetup({
  seoMeta: { title: "P5.js Demo" },
});

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Reactive state
const mouseX = ref(0);
const mouseY = ref(0);
const lastKey = ref("");
const canvasWidth = ref(400);
const canvasHeight = ref(300);

// Shared color state for both canvases (hex format for Tweakpane color picker)
const circleColor = ref("#ff6464");

// Helper function to convert hex to RGB for P5.js
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 100, b: 100 }; // fallback
};

// Tweakpane setup using composable
const tweakpaneContainer = ref(null);

// Create debug data object that Tweakpane will bind to
const debugData = reactive({
  circleColor: circleColor.value,
  mouseX: mouseX.value,
  mouseY: mouseY.value,
  lastKey: lastKey.value || "none",
  canvasWidth: canvasWidth.value,
  canvasHeight: canvasHeight.value,
});

// Use the composable with configuration
const { addBinding, isReady } = useTweakpane(debugData, {
  title: "P5.js Controls",
  container: tweakpaneContainer,
  bindings: [
    { key: "circleColor", label: "Circle Color" },
    { key: "mouseX", label: "Mouse X", readonly: true },
    { key: "mouseY", label: "Mouse Y", readonly: true },
    { key: "lastKey", label: "Last Key", readonly: true },
    { key: "canvasWidth", label: "Canvas Width", readonly: true },
    { key: "canvasHeight", label: "Canvas Height", readonly: true },
  ],
});

// Watch debugData changes back to refs (for two-way binding)
watch(
  () => debugData.circleColor,
  (val) => (circleColor.value = val)
);

// Example 1: Individual event handlers
const setup = (sk) => {
  // Don't call createCanvas - let the P5 component handle it
  sk.background(220);
  canvasWidth.value = sk.width;
  canvasHeight.value = sk.height;
};

const draw = (sk) => {
  // Don't clear background to create a trail effect
  const color = hexToRgb(circleColor.value);
  sk.fill(color.r, color.g, color.b, 100);
  sk.noStroke();
  sk.circle(sk.mouseX, sk.mouseY, 20);

  // Update reactive state
  mouseX.value = sk.mouseX;
  mouseY.value = sk.mouseY;
};

const mousePressed = (sk) => {
  // Clear canvas on click
  sk.background(220);
};

// Example 2: Object syntax with all events
const p5Events = {
  setup: (sk) => {
    // Don't call createCanvas - let the P5 component handle it
    sk.background(50);
    canvasWidth.value = sk.width;
    canvasHeight.value = sk.height;
  },

  draw: (sk) => {
    const color = hexToRgb(circleColor.value);
    sk.fill(color.r, color.g, color.b, 10);
    sk.noStroke();
    sk.circle(sk.mouseX, sk.mouseY, 20);

    // Update reactive state for both canvases
    mouseX.value = sk.mouseX;
    mouseY.value = sk.mouseY;
  },

  mousePressed: (sk) => {
    const color = hexToRgb(circleColor.value);
    sk.fill(color.r, color.g, color.b, 255); // Full opacity on click
    sk.circle(sk.mouseX, sk.mouseY, 20);
  },

  mouseDragged: (sk) => {
    sk.stroke(255);
    sk.strokeWeight(2);
    sk.line(sk.pmouseX, sk.pmouseY, sk.mouseX, sk.mouseY);
  },

  keyPressed: (sk) => {
    const key = String.fromCharCode(sk.keyCode) || sk.key;
    lastKey.value = key;

    // Clear canvas on spacebar
    if (sk.key === " ") {
      sk.background(50);
    }
  },

  windowResized: (sk) => {
    // Update debug info after auto-resize
    canvasWidth.value = sk.width;
    canvasHeight.value = sk.height;
  },
};
</script>

<style lang="scss" scoped>
.p5-container {
  overflow: hidden;
  width: 100%;
  height: 100%;
  aspect-ratio: 1/1;

  @include tablet {
    aspect-ratio: 1.5/1;
  }
}

.debug-info {
  font-family: monospace;
  margin-top: var(--unit-small);
}

tr {
  border-top: 1px solid var(--border-primary);
}

table {
  width: 100%;
  margin-top: var(--unit-smallest);
}

td {
  width: 50%;
  padding-top: var(--unit-tiniest);
  padding-bottom: var(--unit-tiny);
}
</style>
