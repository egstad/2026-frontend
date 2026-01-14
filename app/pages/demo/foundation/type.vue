<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>type</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Typography System Overview -->
      <DemoPageBody class="mb-small">
        <Text>Type System</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          A systematic approach to typography with 8 distinct sizes, each with
          carefully crafted proportions for optimal readability and hierarchy.
          Built with fluid scaling for responsive design.
        </Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Typography can be applied using CSS classes or directly or the
          <nuxt-link to="/demo/atom/text">Text component</nuxt-link>. The Text
          component provides additional features like color variations and
          semantic HTML elements.
        </Text>
        <Code
          class="py-small"
          language="vue"
          theme="github-dark"
          code="<!-- Using CSS classes directly -->
<h1 class='t-headline-1'>Large Display Text</h1>
<p class='t-body-2'>Default paragraph text</p>
<span class='t-caption-1 t-dim'>Supporting information</span>

<!-- Using Text component  -->
<Text size='headline-1'>Large Display Text</Text>
<Text size='body-2'>Default paragraph text</Text>
<Text size='caption-1' color='dim'>Supporting information</Text>"
        />
      </DemoPageBody>

      <!-- Type Scale Visualization -->
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
            v-for="typeStyle in typeStyles"
            :key="typeStyle.name"
            class="type-example mb-smallest"
          >
            <div class="type-meta">
              <Text is="span" size="caption-2" class="mb-tinier mr-tiny">{{
                typeStyle.name
              }}</Text>
              <Text is="span" size="caption-2" color="dim">
                <code>.t-{{ typeStyle.size }} </code>
              </Text>
            </div>
            <div class="type-demo mt-smaller">
              <Text :size="typeStyle.size" class="type-sample">
                {{ currentSampleText }}
              </Text>
            </div>
          </div>
        </div>
      </Column>

      <!-- CSS Typography Classes -->
      <DemoPageBody class="mt-bigger">
        <Text>CSS Typography Classes</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Typography styles can also be applied directly using CSS classes. This
          is useful when you need to apply typography styling to existing HTML
          elements without using the Text component.
        </Text>
        <Code
          class="my-small"
          language="scss"
          theme="github-dark"
          :code="`/* Typography classes follow the .t-{size} pattern */
.t-headline-1 { /* Large display text */ }
.t-headline-2 { /* Section headers */ }
.t-body-1     { /* Emphasized body text */ }
.t-body-2     { /* Default body text */ }
.t-caption-1  { /* Supporting information */ }
.t-caption-2  { /* Metadata text */ }
.t-micro-1    { /* Labels and tags */ }
.t-micro-2    { /* Smallest interface text */ }

/* Color modifier classes */
.t-normal  { color: var(--foreground-primary); }
.t-dim     { color: var(--foreground-secondary); }
.t-dimmer  { color: var(--foreground-tertiary); }`"
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
  seoMeta: { title: "Typography Foundation Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

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

// Type scale data
const typeStyles = [
  {
    name: "Headline 1",
    size: "headline-1",
    specs: "52px / 56px",
  },
  {
    name: "Headline 2",
    size: "headline-2",
    specs: "35px / 40px",
  },
  {
    name: "Body 1",
    size: "body-1",
    specs: "24px / 32px",
  },
  {
    name: "Body 2",
    size: "body-2",
    specs: "19px / 32px",
  },
  {
    name: "Caption 1",
    size: "caption-1",
    specs: "14px / 20px",
  },
  {
    name: "Caption 2",
    size: "caption-2",
    specs: "12px / 16px",
  },
  {
    name: "Micro 1",
    size: "micro-1",
    specs: "11px / 16px",
  },
  {
    name: "Micro 2",
    size: "micro-2",
    specs: "8px / 12px",
  },
];

// Typography specifications
const typeSpecifications = [
  {
    name: "Headline 1",
    size: "headline-1",
    specs: "52px / 56px • Bold • Large displays",
    demo: "Hero Headlines",
  },
  {
    name: "Headline 2",
    size: "headline-2",
    specs: "35px / 40px • Bold • Section headers",
    demo: "Section Headlines",
  },
  {
    name: "Body 1",
    size: "body-1",
    specs: "24px / 32px • Medium • Emphasized content",
    demo: "Emphasized body text with larger size",
  },
  {
    name: "Body 2",
    size: "body-2",
    specs: "19px / 32px • Regular • Default body text",
    demo: "Default body text for paragraphs and content",
  },
  {
    name: "Caption 1",
    size: "caption-1",
    specs: "14px / 20px • Regular • Supporting information",
    demo: "Supporting information and descriptions",
  },
  {
    name: "Caption 2",
    size: "caption-2",
    specs: "12px / 16px • Regular • Metadata",
    demo: "Metadata and small supporting text",
  },
  {
    name: "Micro 1",
    size: "micro-1",
    specs: "11px / 16px • Medium • Labels and tags",
    demo: "LABELS AND CATEGORY TAGS",
  },
  {
    name: "Micro 2",
    size: "micro-2",
    specs: "8px / 12px • Medium • Smallest interface text",
    demo: "SMALLEST INTERFACE LABELS",
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

// Typography Specifications
.spec-grid {
  display: flex;
  flex-direction: column;
  gap: var(--unit-big);
}

.spec-item {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--unit-smaller);

  @include tablet {
    grid-template-columns: 1fr 2fr;
    align-items: start;
  }
}

.spec-info {
  display: flex;
  flex-direction: column;
  gap: var(--unit-tinier);
}

.spec-demo {
  padding: var(--unit-smaller);
  background: var(--background-secondary);
  border-radius: var(--radii-tiny);
  min-height: 60px;
  display: flex;
  align-items: center;
}

.spec-sample {
  overflow: hidden;
}
</style>
