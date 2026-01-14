<template>
  <section class="demo">
    <DemoPageHeader>
      <template #title>space</template>
    </DemoPageHeader>

    <Grid>
      <!-- Component Overview -->
      <GridSliceCenter>
        <Text class="mb-tinier">Component Overview</Text>
        <Text size="body-2" color="dim">
          The Space component provides consistent vertical spacing using
          margin-top and the design system's spacing scale. It's responsive and
          supports different sizes across breakpoints.
        </Text>

        <Text size="micro-1" class="mt-big">Basic Usage</Text>
        <Text color="dim" class="mt-tinier mb-smallest">
          Create vertical spacing between elements using semantic size names.
        </Text>
        <Code
          language="vue"
          theme="github-dark"
          :code="`<Space size='small' \/>`"
        />
      </GridSliceCenter>

      <!-- Size Demonstrations -->
      <GridSliceCenter class="mt-bigger">
        <Text class="mb-tinier">Size Scale Demonstration</Text>
        <Text size="body-2" color="dim" class="mb-small">
          Visual comparison of all available spacing sizes. Each space component
          creates different amounts of vertical spacing between the below
          blocks.
        </Text>
        <Code
          language="vue"
          theme="github-dark"
          :code="`<Space size='tiniest' \/>
<Space size='tinier' \/>
<Space size='tiny' \/>
<Space size='smallest' \/>
<Space size='smaller' \/>
<Space size='small' \/>
<Space size='big' \/>
<Space size='bigger' \/>
<Space size='biggest' \/>
<Space size='huge' \/>
<Space size='huger' \/>
<Space size='hugest' \/>`"
        />

        <div class="my-bigger">
          <Grid class="space-list">
            <Column
              v-for="size in Object.keys(sizeValues)"
              :key="size"
              class="space-item"
            >
              <div class="mb-tinier">
                <Text size="micro-1" class="space-name">{{ size }}</Text>
              </div>
              <div
                class="space-example"
                :style="{ height: `var(--unit-${size})` }"
              ></div>
            </Column>
          </Grid>
        </div>
      </GridSliceCenter>

      <!-- Responsive Breakpoints -->
      <GridSliceCenter>
        <Text class="mb-tinier">Responsive Breakpoints</Text>
        <Text size="body-2" color="dim">
          The Space component supports different sizes across breakpoints with
          cascading behavior. Resize your browser to see the spacing change.
        </Text>
        <Text size="body-2" color="dim" class="mt-smallest">
          Available sizes: tiniest, tinier, tiny, smallest, smaller, small, big,
          bigger, biggest, huge, huger, hugest
        </Text>

        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<Space
  size='small'                  \/\* Default size (all breakpoints) \*\/
  size-mobile='small'           \/\* Mobile breakpoint \*\/
  size-phablet='small'          \/\* Phablet breakpoint \*\/
  size-tablet='big'             \/\* Tablet breakpoint \*\/
  size-laptop='big'             \/\* Laptop breakpoint \*\/
  size-desktop='bigger'         \/\* Desktop breakpoint \*\/
  size-ultrawide='biggest'      \/\* Ultrawide breakpoint \*\/
\/\>`"
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
  seoMeta: { title: "Space Component Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Interactive demo data
const selectedSize = ref("small");

const sizeOptions = [
  { label: "Tiniest", value: "tiniest" },
  { label: "Tinier", value: "tinier" },
  { label: "Tiny", value: "tiny" },
  { label: "Smallest", value: "smallest" },
  { label: "Smaller", value: "smaller" },
  { label: "Small", value: "small" },
  { label: "Big", value: "big" },
  { label: "Bigger", value: "bigger" },
  { label: "Biggest", value: "biggest" },
  { label: "Huge", value: "huge" },
  { label: "Huger", value: "huger" },
  { label: "Hugest", value: "hugest" },
];

const sizeValues = {
  tiniest: "4px",
  tinier: "8px",
  tiny: "12px",
  smallest: "16px",
  smaller: "24px",
  small: "32px",
  big: "48px",
  bigger: "64px",
  biggest: "96px",
  huge: "128px",
  huger: "192px",
  hugest: "256px",
};

const getSizeValue = (size) => {
  return sizeValues[size] || "Unknown";
};
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

// Demo blocks for visual examples
.demo-block {
  background: var(--background-secondary);
  padding: var(--unit-small);
  border-radius: var(--radii-small);
  text-align: center;

  &:nth-child(even) {
    background: var(--background-tertiary);
  }
}

.demo-label {
  font-size: var(--font-size-caption-2);
  color: var(--foreground-secondary);
  text-align: center;
  padding: var(--unit-smallest) var(--unit-small);
  background: var(--background-tertiary);
  border-radius: var(--radii-tiny);
}

// Space demo containers
.space-demo,
.responsive-demo,
.cascading-demo,
.interactive-demo {
  background: var(--background-secondary);
  padding: var(--unit-small);
  border-radius: var(--radii-small);
  margin: var(--unit-small) 0;
}

.space-list {
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

.space-example {
  background: var(--background-tertiary);
  border-radius: var(--radii-tiny);
  width: 100%;
  min-height: var(--unit-tiniest);
}

// Responsive indicators
@include tablet {
  .responsive-demo::before {
    content: "Tablet breakpoint active";
    display: block;
    font-size: var(--font-size-caption-2);
    color: var(--foreground-secondary);
    margin-bottom: var(--unit-small);
    text-align: center;
  }
}

@include desktop {
  .responsive-demo::before {
    content: "Desktop breakpoint active";
  }
}

@include ultrawide {
  .responsive-demo::before {
    content: "Ultrawide breakpoint active";
  }
}
</style>
