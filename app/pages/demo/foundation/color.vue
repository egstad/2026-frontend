<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>color</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Color System Overview -->
      <DemoPageBody>
        <Text>Comprehensive Color System</Text>
        <Space size="tinier" />
        <Text color="dim">
          A complete color palette using CSS custom properties with semantic
          naming. Includes background hierarchy, foreground contrast levels,
          interactive states, and a full spectrum of color palettes for
          systematic design.
        </Text>
        <Code
          class="py-small"
          language="sass"
          theme="github-dark"
          code="// Use semantic colors for consistent theming
background-color: var(--background-primary);
color: var(--foreground-secondary);
border: 1px solid var(--border-primary);"
        />
      </DemoPageBody>

      <!-- Semantic Colors -->
      <DemoPageBody>
        <Text>Semantic Colors</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Core colors that define the visual hierarchy and interaction states.
          These provide consistent theming across all components.
        </Text>
        <Space size="bigger" />
      </DemoPageBody>

      <Column span="12">
        <div class="semantic-grid">
          <div class="semantic-section">
            <Grid class="semantic-swatches background">
              <Column
                v-for="color in backgroundColors"
                :key="color.name"
                class="semantic-swatch"
                span-laptop="4"
                :style="{ backgroundColor: color.value }"
              >
                <div
                  class="semantic-info"
                  style="color: var(--foreground-primary)"
                >
                  <Text size="micro-1">{{ color.variable }}</Text>
                </div>
              </Column>
            </Grid>
          </div>

          <div class="semantic-section">
            <Grid class="semantic-swatches">
              <Column
                v-for="color in foregroundColors"
                :key="color.name"
                class="semantic-swatch"
                span-laptop="4"
                :style="{ backgroundColor: color.value }"
              >
                <div
                  class="semantic-info"
                  style="color: var(--background-primary)"
                >
                  <Text size="micro-1">{{ color.variable }}</Text>
                </div>
              </Column>
            </Grid>
          </div>

          <div class="semantic-section">
            <Grid class="semantic-swatches">
              <Column
                v-for="color in interactiveColors"
                :key="color.name"
                class="semantic-swatch"
                span-laptop="4"
                :style="{ backgroundColor: color.value }"
              >
                <div
                  class="semantic-info"
                  style="color: var(--background-primary)"
                >
                  <Text size="micro-1">{{ color.variable }}</Text>
                </div>
              </Column>
            </Grid>
          </div>
        </div>
      </Column>

      <!-- Color Palettes -->
      <DemoPageBody class="mt-bigger">
        <Text>Full Spectrum Palettes</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Systematic color scales from light to dark with consistent weight
          naming. Each palette provides versatile options for UI components and
          illustrations.
        </Text>
        <Code
          class="my-small"
          language="sass"
          theme="github-dark"
          :code="`// Access any color from the spectrum
background: var(--red-500);    // main red
border: var(--blue-300);       // light blue
color: var(--gray-700);        // dark gray`"
        />
      </DemoPageBody>

      <Column span="12">
        <div class="palette-grid">
          <div v-for="palette in colorPalettes" :key="palette.name">
            <Text size="micro-1" class="mb-tiny">{{ palette.name }}</Text>
            <div class="palette-swatches mb-small">
              <div
                v-for="(color, index) in palette.colors"
                :key="color.weight"
                class="palette-swatch"
                :style="{ backgroundColor: color.value }"
                :title="`--${palette.name.toLowerCase()}-${color.weight}: ${
                  color.value
                }`"
              >
                <Text
                  size="micro-2"
                  class="swatch-weight"
                  :style="{
                    color:
                      index < 3
                        ? 'var(--background-primary)'
                        : 'var(--foreground-primary)',
                  }"
                  >{{ color.weight }}</Text
                >
              </div>
            </div>
          </div>
        </div>
      </Column>

      <!-- Usage Examples -->
      <DemoPageBody class="mt-bigger">
        <Text>Usage Patterns</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Common patterns for applying colors in your components and designs.
        </Text>
        <Code
          class="my-small"
          language="sass"
          theme="github-dark"
          :code="`// Component theming
.card {
  background: var(--background-secondary);
  border: 1px solid var(--gray-300);
  color: var(--foreground-primary);
}

.button--primary {
  background: var(--violet-500);
  color: var(--background-primary);
}

.button--primary:hover {
  background: var(--violet-700);
}

/* Status indicators */
.status--success { color: var(--green-500); }
.status--warning { color: var(--orange-500); }
.status--error { color: var(--red-500); }`"
        />
      </DemoPageBody>
    </Grid>

    <DemoSectionNav />
  </section>
</template>

<script setup>
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";
import DemoPageHeader from "~/components/demo/PageHeader.vue";
import DemoPageBody from "~/components/demo/PageBody.vue";
import DemoSectionNav from "~/components/demo/SectionNav.vue";

// Run common mount/unmount scripts. Setup SEO, etc.
PageSetup({
  seoMeta: { title: "Color System Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Function to get CSS custom property value
const getCSSVariable = (variable) => {
  if (process.client) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(variable)
      .trim();
  }
  return "";
};

// Semantic colors - these will automatically reflect the actual CSS values
const backgroundColors = ref([
  { name: "Primary", variable: "--background-primary", value: "" },
  { name: "Secondary", variable: "--background-secondary", value: "" },
  { name: "Tertiary", variable: "--background-tertiary", value: "" },
]);

const foregroundColors = ref([
  { name: "Primary", variable: "--foreground-primary", value: "" },
  { name: "Secondary", variable: "--foreground-secondary", value: "" },
  { name: "Tertiary", variable: "--foreground-tertiary", value: "" },
]);

const interactiveColors = ref([
  { name: "Primary", variable: "--interactive-primary", value: "" },
  { name: "Secondary", variable: "--interactive-secondary", value: "" },
  { name: "Tertiary", variable: "--interactive-tertiary", value: "" },
]);

// Update color values on mount
onMounted(() => {
  // Update background colors
  backgroundColors.value.forEach((color) => {
    color.value = getCSSVariable(color.variable);
  });

  // Update foreground colors
  foregroundColors.value.forEach((color) => {
    color.value = getCSSVariable(color.variable);
  });

  // Update interactive colors
  interactiveColors.value.forEach((color) => {
    color.value = getCSSVariable(color.variable);
  });

  // Update palette colors
  colorPalettes.value.forEach((palette) => {
    palette.colors.forEach((color) => {
      const variable = `--${palette.name.toLowerCase()}-${color.weight}`;
      color.value = getCSSVariable(variable);
    });
  });
});

// Full spectrum color palettes - values will be populated from CSS
const colorPalettes = ref([
  {
    name: "Red",
    colors: [
      { weight: "50", value: "" },
      { weight: "150", value: "" },
      { weight: "300", value: "" },
      { weight: "500", value: "" },
      { weight: "700", value: "" },
      { weight: "900", value: "" },
      { weight: "950", value: "" },
    ],
  },
  {
    name: "Orange",
    colors: [
      { weight: "50", value: "" },
      { weight: "150", value: "" },
      { weight: "300", value: "" },
      { weight: "500", value: "" },
      { weight: "700", value: "" },
      { weight: "900", value: "" },
      { weight: "950", value: "" },
    ],
  },
  {
    name: "Yellow",
    colors: [
      { weight: "50", value: "" },
      { weight: "150", value: "" },
      { weight: "300", value: "" },
      { weight: "500", value: "" },
      { weight: "700", value: "" },
      { weight: "900", value: "" },
      { weight: "950", value: "" },
    ],
  },
  {
    name: "Green",
    colors: [
      { weight: "50", value: "" },
      { weight: "150", value: "" },
      { weight: "300", value: "" },
      { weight: "500", value: "" },
      { weight: "700", value: "" },
      { weight: "900", value: "" },
      { weight: "950", value: "" },
    ],
  },
  {
    name: "Blue",
    colors: [
      { weight: "50", value: "" },
      { weight: "150", value: "" },
      { weight: "300", value: "" },
      { weight: "500", value: "" },
      { weight: "700", value: "" },
      { weight: "900", value: "" },
      { weight: "950", value: "" },
    ],
  },
  {
    name: "Indigo",
    colors: [
      { weight: "50", value: "" },
      { weight: "150", value: "" },
      { weight: "300", value: "" },
      { weight: "500", value: "" },
      { weight: "700", value: "" },
      { weight: "900", value: "" },
      { weight: "950", value: "" },
    ],
  },
  {
    name: "Violet",
    colors: [
      { weight: "50", value: "" },
      { weight: "150", value: "" },
      { weight: "300", value: "" },
      { weight: "500", value: "" },
      { weight: "700", value: "" },
      { weight: "900", value: "" },
      { weight: "950", value: "" },
    ],
  },
  {
    name: "Gray",
    colors: [
      { weight: "50", value: "" },
      { weight: "150", value: "" },
      { weight: "300", value: "" },
      { weight: "500", value: "" },
      { weight: "700", value: "" },
      { weight: "900", value: "" },
      { weight: "950", value: "" },
    ],
  },
]);
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

.demo {
  margin-top: var(--unit-biggest);
  width: 100%;
}

.semantic-grid {
  display: flex;
  flex-direction: column;
  gap: var(--unit-big);
}

.semantic-section {
  display: flex;
  flex-direction: column;
  gap: var(--unit-smaller);
}

.semantic-title {
  font-weight: 500;
  color: var(--foreground-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.semantic-swatches.background {
  .column:first-child {
    border: 1px solid var(--border-primary);
  }
}

.semantic-swatch {
  flex: 1;
  height: var(--unit-huge);
  display: flex;
  align-items: end;
  padding: var(--unit-smaller);
  transition: transform 0.2s ease;
  position: relative;
  border-radius: var(--radii-tiny);
}

.palette-grid {
  grid-template-columns: 1fr;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(4, 1fr);
  }
}

.palette-section {
  display: flex;
  flex-direction: column;
  gap: var(--unit-smaller);
}

.palette-swatches {
  display: flex;
  border-radius: var(--radii-tiny);
  overflow: hidden;
}

.palette-swatch {
  flex: 1;
  height: var(--unit-bigger);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
