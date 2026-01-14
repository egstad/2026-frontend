<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>effects</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Effects System Overview -->
      <DemoPageBody class="mb-small">
        <Text>Effects System</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Visual effects that enhance interface components through consistent
          styling patterns. Includes border radius, shadows, and other visual
          treatments for creating hierarchy and visual interest.
        </Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Effects use the same systematic approach as other design tokens,
          ensuring consistency across all interface elements.
        </Text>
        <Code
          class="py-small"
          language="sass"
          theme="github-dark"
          code="// Using effect variables
border-radius: var(--radii-small);
box-shadow: var(--shadow-medium);

// Component styling
.card {
  border-radius: var(--radii);
  box-shadow: var(--shadow-subtle);
  transition: box-shadow var(--normal) var(--ease);

  &:hover {
    box-shadow: var(--shadow-prominent);
  }
}"
        />
      </DemoPageBody>

      <!-- Border Radius Scale -->

      <DemoPageBody class="mb-bigger">
        <Text>Border Radius Scale</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Six border radius values from sharp corners to fully rounded shapes.
          Uses the unit system for consistency with spacing and sizing.
        </Text>
      </DemoPageBody>
      <Column></Column>

      <Column
        v-for="radius in borderRadii"
        :key="radius.name"
        span="12"
        span-tablet="6"
        span-laptop="4"
        span-desktop="2"
      >
        <div class="radius-demo mb-tinier">
          <Text size="caption-2" color="dim" class="mb-smallest">
            <span class="mr-tiny">{{ radius.name }}</span>
            <code>{{ radius.variable }}</code>
          </Text>
          <div class="radius-examples">
            <!-- Square example -->
            <div
              class="radius-example radius-square"
              :style="{ borderRadius: `var(${radius.variable})` }"
            ></div>
          </div>
        </div>
      </Column>

      <!-- Effects Code Patterns -->
      <DemoPageBody class="mt-bigger">
        <Text>Code Patterns</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Common patterns for implementing effects with proper fallbacks and
          progressive enhancement. Combine with motion for rich interactions.
        </Text>
        <Code
          class="my-small"
          language="sass"
          theme="github-dark"
          :code="`// Component effects
.card {
  border-radius: var(--radii);
  background: var(--background-secondary);
  transition:
    transform var(--normal) var(--ease-spring),
    border-radius var(--normal) var(--ease);

  &:hover {
    transform: scale(1.02);
    border-radius: var(--radii-big);
  }
}

// Button variations
.btn-primary {
  border-radius: var(--radii-small);
  background: var(--interactive-primary);
  transition: all var(--fast) var(--ease);
}

.btn-pill {
  border-radius: var(--radii-pill);
  padding: var(--unit-smaller) var(--unit-big);
}

// Avatar patterns
.avatar {
  border-radius: var(--radii-round);
  width: var(--unit-huge);
  height: var(--unit-huge);
  overflow: hidden;
}

.avatar-square {
  border-radius: var(--radii-small);
}

// Input fields
.input {
  border-radius: var(--radii-tiny);
  border: 1px solid var(--border-secondary);
  transition: border-color var(--fast) var(--ease);

  &:focus {
    border-color: var(--interactive-primary);
    outline: 2px solid var(--interactive-primary);
    outline-offset: -1px;
  }
}`"
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
  seoMeta: { title: "Effects Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Border radius data
const borderRadii = [
  {
    name: "None",
    variable: "--radii-none",
    value: "0",
  },
  {
    name: "Tiny",
    variable: "--radii-tiny",
    value: "var(--unit-tiniest)",
  },
  {
    name: "Small",
    variable: "--radii-small",
    value: "var(--unit-small)",
  },
  {
    name: "Big",
    variable: "--radii-big",
    value: "var(--unit-big)",
  },
  {
    name: "Round",
    variable: "--radii-round",
    value: "50%",
  },
  {
    name: "Pill",
    variable: "--radii-pill",
    value: "100vw",
  },
];
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

.demo {
  margin-top: var(--unit-biggest);
  width: 100%;
}

// Border Radius Demos
.radius-demo {
  padding: var(--unit-smaller);
  background: var(--background-secondary);
  border-radius: var(--radii-tiny);
  aspect-ratio: 4/1;

  @include tablet {
    aspect-ratio: 3/1;
  }

  @include laptop {
    aspect-ratio: 2/1;
  }

  @include desktop {
    aspect-ratio: 1.5/1;
  }
}

.radius-examples {
  height: 100%;
}

.radius-example {
  background: var(--background-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
}

.radius-square {
  width: 100%;
  height: 100%;
}

.radius-rectangle {
  width: 80px;
  height: 40px;
}

.radius-button {
  padding: var(--unit-smaller) var(--unit-small);
  height: 36px;
}
</style>
