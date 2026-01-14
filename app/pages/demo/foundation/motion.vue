<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>motion</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Motion System Overview -->
      <DemoPageBody class="mb-small">
        <Text>Motion System</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          A systematic approach to motion with consistent durations, easing
          functions, and transitions. Creates cohesive user experiences through
          purposeful animation.
        </Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Motion can be applied using CSS custom properties or predefined
          transition classes for common interactions.
        </Text>
        <Code
          class="py-small"
          language="sass"
          theme="github-dark"
          code="// Using motion variables
transition: transform var(--fast) var(--ease-bounce);
animation-duration: var(--normal);
animation-timing-function: var(--ease-spring);

// Using transition utilities
.element {
  transition: var(--transition);
  &:hover { transform: scale(1.05); }
}"
        />
      </DemoPageBody>

      <!-- Easing Functions -->
      <DemoPageBody class="mt-bigger">
        <Text>Easing Functions</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Different easing curves create distinct motion personalities. Each
          ball continuously demonstrates its unique easing characteristics.
        </Text>
      </DemoPageBody>
      <Column class="my-biggest">
        <Grid>
          <Column
            span="12"
            span-tablet="6"
            span-laptop="4"
            span-desktop="2"
            v-for="easing in easingFunctions"
            :key="easing.name"
          >
            <div class="easing-info">
              <Text size="caption-2" class="mb-tiniest">{{ easing.name }}</Text>
              <Text size="micro-2" color="dim" class="mb-smallest">
                <code>{{ easing.value }}</code>
              </Text>
            </div>
            <div class="easing-track mb-small">
              <div class="easing-ball" :class="`easing-${easing.name}`"></div>
            </div>
          </Column>
        </Grid>
      </Column>

      <!-- Duration Visualization -->
      <DemoPageBody>
        <Text>Duration Scale</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim" class="mb-small">
          Five timing durations from instant feedback to deliberate state
          changes. Each duration serves different interaction needs.
        </Text>
        <div v-for="duration in durations" :key="duration.name">
          <div class="duration-demo mb-smallest">
            <Text size="caption-2" color="dim" class="mb-smallest">
              <code>{{ duration.variable }}: {{ duration.value }}</code>
            </Text>
            <div class="duration-visualization">
              <div class="duration-bar" :class="`duration-${duration.name}`">
                <Text size="caption-2">{{ duration.name }}</Text>
              </div>
            </div>
          </div>
        </div>
      </DemoPageBody>

      <!-- Motion Patterns -->
      <DemoPageBody class="mt-bigger">
        <Text>Motion Patterns</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Common patterns for implementing motion in interface design. Combine
          durations and easing functions for purposeful animations.
        </Text>
        <Code
          class="my-small"
          language="sass"
          theme="github-dark"
          :code="`// Button interactions
.button {
  transition:
    transform var(--fast) var(--ease-out),
    background-color var(--fast) var(--ease);

  &:hover {
    transform: translateY(-2px);
    background-color: var(--interactive-secondary);
  }

  &:active {
    transform: translateY(0);
    transition-duration: var(--instant);
  }
}

// Card hover effects
.card {
  transition:
    transform var(--normal) var(--ease-spring),
    box-shadow var(--normal) var(--ease);

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
}

// Loading animations
.loading {
  animation: pulse var(--slower) var(--ease-in-out) infinite;
}

.spinner {
  animation: rotate var(--normal) linear infinite;
}

// State transitions
.modal-enter {
  animation: slideIn var(--slow) var(--ease-out);
}

.modal-exit {
  animation: slideOut var(--fast) var(--ease-in);
}

// Staggered animations
.list-item {
  animation: fadeInUp var(--normal) var(--ease-out);
  animation-delay: calc(var(--delay-short) * var(--index));
}

// Progressive enhancement
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
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
  seoMeta: { title: "Motion Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Duration data
const durations = [
  {
    name: "instant",
    variable: "--instant",
    value: "0ms",
  },
  {
    name: "fast",
    variable: "--fast",
    value: "150ms",
  },
  {
    name: "normal",
    variable: "--normal",
    value: "250ms",
  },
  {
    name: "slow",
    variable: "--slow",
    value: "350ms",
  },
  {
    name: "slower",
    variable: "--slower",
    value: "500ms",
  },
];

// Easing function data
const easingFunctions = [
  {
    name: "ease-in",
    variable: "--ease-in",
    value: "cubic-bezier(0.4, 0, 1, 1)",
  },
  {
    name: "ease-out",
    variable: "--ease-out",
    value: "cubic-bezier(0, 0, 0.2, 1)",
  },
  {
    name: "ease-in-out",
    variable: "--ease-in-out",
    value: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  {
    name: "ease-sharp",
    variable: "--ease-sharp",
    value: "cubic-bezier(0.4, 0, 0.6, 1)",
  },
  {
    name: "ease-bounce",
    variable: "--ease-bounce",
    value: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  },
  {
    name: "ease-spring",
    variable: "--ease-spring",
    value: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  },
];

// Interactive functions
const triggerDuration = (durationName) => {
  const element = document.querySelector(`.duration-${durationName}`);
  if (element) {
    element.style.animation = "none";
    element.offsetHeight; // Trigger reflow
    element.style.animation = `durationPulse var(--${durationName}) var(--ease-out)`;
  }
};
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

.demo {
  margin-top: var(--unit-biggest);
  width: 100%;
}

// Duration Demos
.duration-demo {
  padding: var(--unit-smaller);
  background: var(--background-secondary);
  border-radius: var(--radii-tiny);
}

.duration-visualization {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
}

.duration-bar {
  width: 100%;
  text-align: center;
  border-radius: var(--unit-tiniest);
  border: 1px solid transparent;
  transition: color var(--transition-fast),
    background-color var(--transition-fast), border-color var(--transition-fast);
  outline: 0;
  cursor: pointer;
  background-color: var(--background-tertiary);
  padding: var(--unit-tinier) var(--unit-tiny);

  &:hover {
    transform: scale(1.025);
  }
}

// Duration-specific transitions
.duration-instant {
  transition: transform var(--instant) ease;
}

.duration-fast {
  transition: transform var(--fast) ease;
}

.duration-normal {
  transition: transform var(--normal) ease;
}

.duration-slow {
  transition: transform var(--slow) ease;
}

.duration-slower {
  transition: transform var(--slower) ease;
}

// Easing Demos
.easing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--unit-smaller);
}

.easing-demo {
  padding: var(--unit-smaller);
  background: var(--background-secondary);
  border-radius: var(--radii-tiny);
  transition: transform var(--fast) var(--ease-out);

  &:hover {
    transform: translateY(-2px);
  }
}

.easing-track {
  width: 100%;
  height: 20px;
  background: var(--background-tertiary);
  border-radius: var(--radii-pill);
  position: relative;
  overflow: hidden;
}

.easing-ball {
  width: 20px;
  height: 20px;
  background: var(--interactive-primary);
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

// Easing-specific animations
.easing-ease-in {
  animation: easingMove 2s var(--ease-in) infinite alternate;
}

.easing-ease-out {
  animation: easingMove 2s var(--ease-out) infinite alternate;
}

.easing-ease-in-out {
  animation: easingMove 2s var(--ease-in-out) infinite alternate;
}

.easing-ease-sharp {
  animation: easingMove 2s var(--ease-sharp) infinite alternate;
}

.easing-ease-bounce {
  animation: easingMove 2s var(--ease-bounce) infinite alternate;
}

.easing-ease-spring {
  animation: easingMove 2s var(--ease-spring) infinite alternate;
}

// Animations
@keyframes durationPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes easingMove {
  0% {
    left: 0;
  }
  100% {
    left: calc(100% - 20px);
  }
}
</style>
