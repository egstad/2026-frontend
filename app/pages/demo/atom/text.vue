<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>text</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Text Component Props -->
      <DemoPageBody>
        <Text>Text Component</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          The Text component provides a consistent interface for all typography
          in the design system. It handles sizing, color variations, and
          semantic HTML elements automatically.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Available props -->
<Text
  size='body-2'        /* Type size */
  color='normal'       /* normal | dim | dimmer */
  is='p'               /* HTML element to render */
  indent='false'       /* text indentation */
>
  Your content here
</Text>`"
        />
      </DemoPageBody>

      <!-- Size Variations -->
      <DemoPageBody class="mt-big">
        <Text>Size Variations</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim" class="mb-small">
          The Text component supports all typography scales from the design
          system. Each size maintains consistent proportions and spacing.
        </Text>
      </DemoPageBody>
      <Column span="12">
        <BaseButton
          size="small"
          class="mb-smallest"
          variant="secondary"
          @click="updateSampleText"
          >Update Words</BaseButton
        >
        <div class="type-scale-grid">
          <div
            v-for="size in sizeVariations"
            :key="size.name"
            class="type-example mb-smallest"
          >
            <div class="type-meta">
              <Text is="span" size="caption-2" class="mb-tinier mr-tiny">{{
                size.name
              }}</Text>
              <Text is="span" size="caption-2" color="dim">
                <code>{{ size.code }}</code>
              </Text>
            </div>
            <div class="type-demo mt-smaller">
              <Text :size="size.value" class="type-sample">
                {{ currentSampleText }}
              </Text>
            </div>
          </div>
        </div>
      </Column>

      <!-- Color Variations -->
      <DemoPageBody>
        <Grid>
          <Column span="12">
            <Text class="mb-tiny">Color Variations</Text>
            <Text size="body-2" color="dim" class="mb-small">
              Text colors follow the foreground color hierarchy for different
              levels of emphasis and information hierarchy.
            </Text>
            <div class="type-scale-grid">
              <div
                v-for="color in colorVariations"
                :key="color.name"
                class="type-example mb-smallest"
              >
                <div class="type-meta">
                  <Text is="span" size="caption-2" class="mb-tinier mr-tiny">{{
                    color.name
                  }}</Text>
                  <Text is="span" size="caption-2" color="dim">
                    <code>{{ color.code }}</code>
                  </Text>
                </div>
                <div class="type-demo mt-smaller">
                  <Text size="body-1" :color="color.value" class="type-sample">
                    {{ currentSampleText }}
                  </Text>
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </DemoPageBody>

      <!-- Element Variations -->
      <DemoPageBody>
        <Grid>
          <Column span="12">
            <Text class="mb-tiny">Semantic Elements</Text>
            <Text size="body-2" color="dim" class="mb-small">
              The Text component can render as any HTML element while
              maintaining consistent typography styling. This ensures semantic
              correctness without compromising visual design.
            </Text>
            <div class="type-scale-grid">
              <div
                v-for="element in elementVariations"
                :key="element.name"
                class="type-example mb-smallest"
              >
                <div class="type-meta">
                  <Text is="span" size="caption-2" class="mb-tinier mr-tiny">{{
                    element.name
                  }}</Text>
                  <Text is="span" size="caption-2" color="dim">
                    <code>{{ element.code }}</code>
                  </Text>
                </div>
                <div class="type-demo mt-smaller">
                  <Text size="body-1" :is="element.value" class="type-sample">
                    {{ currentSampleText }}
                  </Text>
                </div>
              </div>
            </div>
          </Column>
        </Grid>
      </DemoPageBody>

      <!-- Usage Patterns -->
      <DemoPageBody class="mt-bigger">
        <Text>Usage Patterns</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Common patterns for creating effective typography hierarchies and
          layouts in your interface designs.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Typical content hierarchy -->
<Text size='headline-2' is='h2'>Section Title</Text>
<Text size='body-2' color='dim'>Introduction paragraph</Text>
<Text size='body-2'>Main content paragraph</Text>
<Text size='caption-1' color='dimmer'>Metadata or footnote</Text>

<!-- Card or component pattern -->
<Text size='headline-2' is='h3'>Card Title</Text>
<Text size='body-2'>Card description text</Text>
<Text size='micro-1' color='dim'>LABEL</Text>`"
        />
      </DemoPageBody>

      <!-- Interactive Examples -->
      <DemoPageBody class="my-bigger">
        <Text>Interactive Examples</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim" class="mb-small">
          Live examples showing how the Text component works with different
          combinations of props.
        </Text>

        <!-- Interactive Text Demo -->
        <div class="interactive-demo">
          <div class="demo-controls mb-small">
            <div class="control-group">
              <BaseSelect
                v-model="selectedSize"
                :options="sizeOptions"
                label="Size"
              />
            </div>
            <div class="control-group">
              <BaseSelect
                v-model="selectedColor"
                label="Color"
                :options="colorOptions"
              />
            </div>
            <div class="control-group">
              <BaseSelect
                label="Element"
                v-model="selectedElement"
                :options="elementOptions"
              />
            </div>
          </div>

          <div class="demo-result">
            <Text
              :size="selectedSize"
              :color="selectedColor"
              :is="selectedElement"
            >
              {{ demoText }}
            </Text>
          </div>

          <Code
            class="mt-small"
            language="vue"
            theme="github-dark"
            :code="`<Text
  size='${selectedSize}'
  color='${selectedColor}'
  is='${selectedElement}'
>
  ${demoText}
</Text>`"
          />
        </div>
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
  seoMeta: { title: "Text Component Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Interactive demo state
const selectedSize = ref("body-2");
const selectedColor = ref("normal");
const selectedElement = ref("p");
const demoText = ref("The quick brown fox jumps over the lazy dog");

// Sample text cycling functionality
const currentSampleIndex = ref(0);
const sampleTexts = [
  "The quick brown fox jumps over the lazy dog",
  "Hambergefontsiv & Typography 123",
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789 !@#$%^&*()",
  "Pack my box with five dozen liquor jugs",
  "How vexingly quick daft zebras jump!",
  "Sphinx of black quartz, judge my vow",
  "Amazingly few discotheques provide jukeboxes",
  "Mix Zapf with Veljovic and get quirky Beziers",
  "Testing fonts: grumpy wizards make toxic brew",
];

const currentSampleText = computed(() => sampleTexts[currentSampleIndex.value]);

const updateSampleText = () => {
  currentSampleIndex.value =
    (currentSampleIndex.value + 1) % sampleTexts.length;
};

// BaseSelect options (transformed from data arrays)
const sizeOptions = computed(() =>
  sizeVariations.map((size) => ({
    label: size.name,
    value: size.value,
  }))
);

const colorOptions = computed(() =>
  colorVariations.map((color) => ({
    label: color.name,
    value: color.value,
  }))
);

const elementOptions = computed(() =>
  elementVariations.map((element) => ({
    label: element.name,
    value: element.value,
  }))
);

// Size variations
const sizeVariations = [
  {
    name: "Headline 1",
    value: "headline-1",
    code: "size='headline-1'",
  },
  {
    name: "Headline 2",
    value: "headline-2",
    code: "size='headline-2'",
  },
  {
    name: "Body 1",
    value: "body-1",
    code: "size='body-1'",
  },
  {
    name: "Body 2 (Default)",
    value: "body-2",
    code: "size='body-2'",
  },
  {
    name: "Caption 1",
    value: "caption-1",
    code: "size='caption-1'",
  },
  {
    name: "Caption 2",
    value: "caption-2",
    code: "size='caption-2'",
  },
  {
    name: "Micro 1",
    value: "micro-1",
    code: "size='micro-1'",
  },
  {
    name: "Micro 2",
    value: "micro-2",
    code: "size='micro-2'",
  },
];

// Color variations
const colorVariations = [
  {
    name: "Normal (Default)",
    value: "normal",
    code: "color='normal'",
  },
  {
    name: "Dim",
    value: "dim",
    code: "color='dim'",
  },
  {
    name: "Dimmer",
    value: "dimmer",
    code: "color='dimmer'",
  },
];

// Element variations
const elementVariations = [
  {
    name: "Paragraph",
    value: "p",
    code: "is='p'",
  },
  {
    name: "Span",
    value: "span",
    code: "is='span'",
  },
  {
    name: "Heading",
    value: "h2",
    code: "is='h2'",
  },
  {
    name: "Div",
    value: "div",
    code: "is='div'",
  },
];
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

.demo {
  margin-top: var(--unit-biggest);
  width: 100%;
}

// Type Scale Grid
.type-scale-grid {
  display: flex;
  flex-direction: column;
  margin-bottom: var(--unit-bigger);
}

.type-example {
  padding: var(--unit-smaller);
  border-radius: var(--radii-tiny);
  background: var(--background-secondary);
}

.type-sample {
  overflow: hidden;
}

// Interactive Demo
.interactive-demo {
  padding: var(--unit-small);
  background: var(--background-secondary);
  border-radius: var(--radii-small);
}

.demo-controls {
  display: grid;

  gap: var(--grid-gap);

  @include laptop {
    grid-template-columns: repeat(3, 1fr);
  }
}

.control-group {
  display: flex;
  flex-direction: column;
}

.demo-result {
  padding: var(--unit-small);
  background: var(--background-primary);
  border-radius: var(--radii-tiny);
  min-height: 80px;
  display: flex;
  align-items: center;
}
</style>
