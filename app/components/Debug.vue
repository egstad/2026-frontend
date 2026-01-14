<template>
  <client-only>
    <div ref="tweakpaneContainer" class="debug-panel"></div>
  </client-only>
</template>

<script setup>
import { computed, ref, reactive, watch, nextTick } from "vue";
import { useDeviceStore } from "~/stores/device";
import { useTweakpane } from "~/composables/useTweakpane";

const debugActive = ref(false);
const deviceStore = useDeviceStore();
const tweakpaneContainer = ref(null);

// Create a reactive object for Tweakpane to bind to
const deviceData = reactive({});

// Function to sync Pinia store with our reactive object
const syncDeviceData = () => {
  const state = deviceStore.$state || deviceStore;
  const filtered = Object.entries(state).filter(([key, value]) => {
    // Filter out properties we don't want to include
    if (["unwantedProperty1", "unwantedProperty2"].includes(key)) {
      return false;
    }

    // Filter out null/undefined values
    if (value === null || value === undefined) {
      return false;
    }

    // Convert objects to strings for display, or filter them out if they can't be stringified
    if (typeof value === "object" && value !== null) {
      try {
        // Test if we can stringify it
        JSON.stringify(value);
        return true;
      } catch (e) {
        console.warn(`Filtering out ${key}: cannot stringify object`);
        return false;
      }
    }

    return true;
  });

  // Clear existing data and add new data
  Object.keys(deviceData).forEach((key) => delete deviceData[key]);
  filtered.forEach(([key, value]) => {
    // Convert objects to JSON strings for display
    if (typeof value === "object" && value !== null) {
      deviceData[key] = JSON.stringify(value);
    } else {
      deviceData[key] = value;
    }
  });
};

// Initial sync
syncDeviceData();

// Generate bindings dynamically from device properties
const generateBindings = () => {
  return Object.keys(deviceData).map((key) => ({
    key,
    label:
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
    readonly: true,
  }));
};

// Use Tweakpane composable
const { pane, isReady, dispose, init } = useTweakpane(deviceData, {
  title: "Debug",
  container: tweakpaneContainer,
  bindings: generateBindings(),
  expanded: false,
});

// Watch the Pinia store for changes and sync to our reactive object
watch(
  () => deviceStore.$state,
  () => {
    syncDeviceData();
  },
  { deep: true }
);
</script>

<style scoped>
.debug-panel {
  position: fixed;
  z-index: 999;
  top: var(--unit-smallest);
  right: var(--grid-margin);
  max-width: 300px;
}
</style>
