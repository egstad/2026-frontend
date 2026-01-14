<template>
  <Grid class="tweakpane-example">
    <Column>
      <header class="section">
        <Text is="h1" size="headline-2">tweakpane examples</Text>
        <br />
        <Text is="h1" color="dim"
          >Lorem ipsum dolor sit amet, consectetur adipisicing elit. Earum ipsa
          molestias aut beatae libero a. Praesentium possimus sed blanditiis
          nobis ex itaque ipsum eligendi alias, autem, nihil beatae inventore
          officia!</Text
        >
      </header>

      <section class="section">
        <header>
          <Text is="h2">essential binding types</Text>
          <Text is="p" size="caption-1" color="dim"
            >Full list of bindinds
            <a
              href="https://tweakpane.github.io/docs/input-bindings/"
              target="_blank"
              >here</a
            >.</Text
          >
        </header>

        <Grid>
          <Column span="12" span-laptop="6" class="box preview">
            <div
              class="animated-box"
              :style="{
                width: `${composableData.size}px`,
                height: `${composableData.size}px`,
                backgroundColor: composableData.color,
                transform: `translate(${composableData.position.x}px, ${composableData.position.y}px)`,
              }"
            ></div>
          </Column>
          <Column span="12" span-laptop="6" class="box">
            <div class="controls-container" ref="composableContainer"></div>
          </Column>
          <Column>
            <Code
              language="javascript"
              theme="github-dark"
              :code="codeExample"
            />
          </Column>
        </Grid>
      </section>

      <!-- Tips Section -->
      <section class="section">
        <header>
          <Text is="h2">tips &amp; considerations</Text>
        </header>
        <ul class="tips-list">
          <li>
            <Text size="caption-1">reactive data</Text>
            <Text size="caption-1" color="dim"
              >Use <code>reactive()</code> or <code>ref()</code> for data that
              needs to update the UI in real-time</Text
            >
          </li>
          <li>
            <Text size="caption-1">type safety</Text>
            <Text size="caption-1" color="dim"
              >The composable includes TypeScript interfaces for better
              development experience</Text
            >
          </li>
          <li>
            <Text size="caption-1">container targeting</Text>
            <Text size="caption-1" color="dim"
              >You can specify a custom container using the
              <code>container</code> option</Text
            >
          </li>
          <li>
            <Text size="caption-1">folders</Text>
            <Text size="caption-1" color="dim"
              >Use folders to organize many controls and improve UX - they can
              be expanded/collapsed</Text
            >
          </li>
          <li>
            <Text size="caption-1">cleanup</Text>
            <Text size="caption-1" color="dim"
              >The composable automatically handles cleanup on component
              unmount</Text
            >
          </li>
        </ul>
      </section>
    </Column>
  </Grid>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, watch } from "vue";
import { useTweakpane } from "~/composables/useTweakpane";
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

PageSetup({
  seoMeta: { title: "Tweakpane Examples" },
});

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Code example for the CodeBlock component
const codeExample = `import { useTweakpane } from '~/composables/useTweakpane'

const data = reactive({
  size: 100,
  range: 100,
  message: "Hello Tweakpane",
  isAnimating: false,
  color: "#ff6b6b",
  position: { x: 0, y: 0 }
})

const { pane, isReady } = useTweakpane(data, {
  title: 'Essential Binding Types',
  container: containerRef,
  folders: [
    {
      title: 'Binding Types',
      expanded: true,
      bindings: [
        { key: 'size', label: 'Number', min: 10, max: 200, step: 1 },
        { key: 'message', label: 'String' },
        { key: 'isAnimating', label: 'Boolean' },
        { key: 'color', label: 'Color' },
        {
          key: 'position',
          label: 'Point 2D',
          options: { x: { min: -100, max: 100 }, y: { min: -100, max: 100 } }
        }
      ]
    }
  ]
})`;

// Method 1: Composable data - one example of each binding type
const composableContainer = ref<HTMLElement | null>(null);
const composableData = reactive({
  size: 100,
  message: "Hello Tweakpane",
  isAnimating: false,
  color: "#ff6b6b",
  position: { x: 0, y: 0 },
});

// Initialize tweakpane with essential binding examples
const { pane: composablePaneInstance, isReady } = useTweakpane(composableData, {
  title: "Essential Binding Types",
  container: composableContainer,
  folders: [
    {
      title: "Binding Types",
      expanded: true,
      bindings: [
        { key: "message", label: "String" },
        { key: "size", label: "Range" },
        { key: "size", label: "Number", min: 10, max: 200, step: 1 },
        { key: "isAnimating", label: "Boolean" },
        { key: "color", label: "Color" },
        {
          key: "position",
          label: "Point 2D",
          options: { x: { min: -100, max: 100 }, y: { min: -100, max: 100 } },
        },
      ],
    },
  ],
});

// Auto animation for first example
let animationFrame: number;
const autoAnimate = () => {
  if (composableData.isAnimating) {
    composableData.position.x = Math.sin(Date.now() * 0.002) * 30;
    composableData.position.y = Math.cos(Date.now() * 0.003) * 20;
  }
  animationFrame = requestAnimationFrame(autoAnimate);
};

onMounted(() => {
  autoAnimate();
});

onUnmounted(() => {
  if (animationFrame) cancelAnimationFrame(animationFrame);
});
</script>

<style lang="scss" scoped>
.section {
  margin-bottom: 4rem;

  code {
    font-family: "Monaco", "Consolas", monospace;
  }
}

header {
  margin-bottom: var(--unit-smaller);
}

.box {
  aspect-ratio: 1/1;
  margin-top: var(--grid-gap);
  overflow: hidden;

  @include tablet {
    aspect-ratio: 1.5/1;
  }

  @include laptop {
    aspect-ratio: 1/1;
  }

  @include desktop {
    aspect-ratio: 1.5/1;
  }

  @include ultrawide {
    aspect-ratio: 1.75/1;
  }
}

.controls-container {
  background: var(--background-secondary);
  padding: var(--unit-big);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  > * {
    max-width: 300px;
  }
}

.preview {
  padding: 2rem;
  background: var(--background-secondary);
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.animated-box {
  background: #ccc;
  transition: all 0.1s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.tips-list {
  list-style: none;
  padding: 0;

  li {
    // background: var(--border-primary);
    margin-top: var(--unit-tinier);
    padding-bottom: var(--unit-small);
    padding-left: var(--unit-tiny);
    border-left: 1px solid var(--background-secondary);
  }
}
</style>
