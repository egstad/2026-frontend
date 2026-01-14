<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>unit</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Unit System Overview -->
      <GridSliceCenter>
        <Text class="mb-tinier">Spacing & Sizing Scale</Text>
        <Text color="dim">
          Defines a comprehensive spacing and sizing scale using CSS custom
          properties. These units serve as the foundation for consistent spacing
          (padding/margin) and element dimensions throughout the design system.
        </Text>
        <Code
          class="py-small"
          language="sass"
          theme="github-dark"
          code="// Use units for consistent spacing
padding: var(--unit-small);
margin-bottom: var(--unit-big);
width: var(--unit-huge);"
        />
      </GridSliceCenter>

      <!-- Unit Scale Visualization -->
      <GridSliceCenter>
        <Text size="body-2" color="dim" class="mb-tinier">
          The scale uses intuitive naming conventions from `tiniest` to `hugest`
          and includes responsive scaling for desktop viewports.
        </Text>
      </GridSliceCenter>

      <GridSliceCenter class="my-biggest">
        <Grid class="unit-list">
          <Column v-for="size in sizes" :key="size" class="unit-item">
            <div class="mb-tinier">
              <Text size="micro-1" class="unit-name"> --unit-{{ size }}</Text>
            </div>
            <div
              class="unit-example"
              :style="{ height: `var(--unit-${size})` }"
            ></div>
          </Column>
        </Grid>
      </GridSliceCenter>

      <!-- Utility Classes -->
      <GridSliceCenter>
        <Text class="mb-tinier">Utility Classes</Text>
        <Text size="body-2" color="dim">
          Use CSS utility classes for quick padding and margin adjustments.
          These classes use the same unit system for consistency.
        </Text>
        <Code
          class="my-small"
          language="html"
          theme="github-dark"
          :code="`<!-- Padding utilities -->
<div class='p-small'>All sides padding</div>
<div class='pt-tiny pb-big'>Top/bottom padding</div>
<div class='px-huge'>Horizontal padding</div>

<!-- Margin utilities -->
<div class='m-big'>All sides margin</div>
<div class='mt-small mb-bigger'>Top/bottom margin</div>
<div class='mx-auto'>Centered with auto margins</div>`"
        />
      </GridSliceCenter>

      <!-- Usage Examples -->
      <GridSliceCenter>
        <Text size="body-2" color="dim">
          Common patterns for using the unit system in your components and
          layouts.
        </Text>
        <Code
          class="my-small"
          language="css"
          theme="github-dark"
          :code="`// In CSS/SCSS
.card {
  padding: var(--unit-small);
  margin-bottom: var(--unit-big);
  border-radius: var(--unit-tinier);
}

// Responsive spacing
.hero {
  padding: var(--unit-big);

  @include desktop {
    padding: var(--unit-huge);
  }
}`"
        />
      </GridSliceCenter>
    </Grid>

    <DemoSectionNav />
  </section>
</template>

<script setup>
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";
import DemoPageHeader from "~/components/demo/PageHeader.vue";
import GridSliceCenter from "~/components/demo/PageBody.vue";
import DemoSectionNav from "~/components/demo/SectionNav.vue";

// Run common mount/unmount scripts. Setup SEO, etc.
PageSetup({
  seoMeta: { title: "Unit System Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

const sizes = [
  "tiniest",
  "tinier",
  "tiny",
  "smallest",
  "smaller",
  "small",
  "big",
  "bigger",
  "biggest",
  "huge",
  "huger",
  "hugest",
];
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

.demo {
  margin-top: var(--unit-biggest);
  width: 100%;
}

.unit-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--unit-smaller);
  width: 100%;

  @include tablet {
    grid-template-columns: repeat(2, 1fr);
  }

  @include laptop {
    grid-template-columns: repeat(3, 1fr);
  }

  @include desktop {
    grid-template-columns: repeat(4, 1fr);
  }
}

.unit-example {
  background: var(--background-tertiary);
  border-radius: var(--radii-tiny);
  width: 100%;
  min-height: var(--unit-tiniest);
}
</style>
