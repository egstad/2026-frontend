<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>layout</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Grid columns -->
      <Column span="12">
        <div class="grid-demo mb-bigger">
          <div class="grid-visual">
            <div v-for="i in 12" :key="i" class="grid-column">
              <Text size="micro-1">{{ i }}</Text>
            </div>
          </div>
        </div>
      </Column>

      <!-- Grid System Overview -->
      <DemoPageBody>
        <Text>12-Column Grid System </Text>
        <Space size="tinier" />

        <Text color="dim">
          The grid system is made up of twelve columns. Using it is easy enough,
          just create a <code>Grid</code> element and organize your content in a
          <code>Column</code>, like so:
        </Text>
        <Code
          class="py-small"
          language="javascript"
          theme="github-dark"
          code="<Grid>
  <Column>hello world</Column>
</Grid>"
        />
      </DemoPageBody>
      <DemoPageBody>
        <Text size="body-2" color="dim">
          To adjust the width, or span, of a column, use the
          <code>span</code> prop. By default a column will span all columns
          available.
        </Text>
        <Code
          class="pt-small mb-0"
          language="javascript"
          theme="github-dark"
          :code="`// span all columns
<Column></Column>
<Column span='12'></Column>

// span a specific column amount
<Column span='2'></Column>
<Column span='6'></Column>
`"
        />
      </DemoPageBody>
      <Column span="12" class="mt-bigger">
        <!-- 12 columns (full width) -->
        <div class="span-example">
          <Grid class="example-grid">
            <Column span="12" class="example-column">
              <div class="column-content">
                <Code language="javascript" theme="github-dark" code="span='12'"
                  >Code</Code
                >
              </div>
            </Column>
          </Grid>
        </div>
      </Column>
      <Column span="12">
        <div class="span-example">
          <Grid class="example-grid">
            <Column span="6" class="example-column">
              <div class="column-content">
                <Code
                  language="javascript"
                  theme="github-dark"
                  code="span='6'"
                ></Code>
              </div>
            </Column>
            <Column span="6" class="example-column">
              <div class="column-content">
                <Code
                  language="javascript"
                  theme="github-dark"
                  code="span='6'"
                ></Code>
              </div>
            </Column>
          </Grid>
        </div>
      </Column>
      <Column span="12" class="mb-bigger">
        <div class="span-example">
          <Grid class="example-grid">
            <Column span="8" class="example-column">
              <div class="column-content">
                <Code
                  language="javascript"
                  theme="github-dark"
                  code="span='8'"
                ></Code>
              </div>
            </Column>
            <Column span="4" class="example-column">
              <div class="column-content">
                <Code
                  language="javascript"
                  theme="github-dark"
                  code="span='4'"
                ></Code>
              </div>
            </Column>
          </Grid>
        </div>
      </Column>

      <!-- Responsive Spans -->
      <DemoPageBody>
        <Text>Responsive Column Spans</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Columns can adapt to different screen sizes by using responsive span
          values. This allows for mobile-first responsive design where content
          reflows optimally at each breakpoint.
        </Text>
        <Code
          class="my-small"
          language="javascript"
          theme="github-dark"
          :code="`// Full width on mobile, half on tablet, third on desktop\n<Column \n  span='12' \n  span-tablet='6' \n  span-desktop='4'\n></Column>`"
        />
      </DemoPageBody>
      <DemoPageBody>
        <Text size="body-2" color="dim">
          Resize your browser to see how these columns adapt from full width
          (mobile) to half width (tablet) to third width (desktop).
        </Text>
        <Space size="bigger" />
      </DemoPageBody>
      <Column span="12">
        <div class="span-example">
          <Grid class="example-grid">
            <Column
              span="4"
              spanTablet="6"
              spanDesktop="8"
              class="example-column"
            >
              <div class="column-content">
                <Code
                  language="javascript"
                  theme="github-dark"
                  code="4 → 6 → 8"
                ></Code>
              </div>
            </Column>
            <Column
              span="4"
              spanTablet="3"
              spanDesktop="2"
              class="example-column"
            >
              <div class="column-content">
                <Code
                  language="javascript"
                  theme="github-dark"
                  code="4 → 3 → 2"
                ></Code>
              </div>
            </Column>
            <Column
              span="4"
              spanTablet="3"
              spanDesktop="2"
              class="example-column"
            >
              <div class="column-content">
                <Code
                  language="javascript"
                  theme="github-dark"
                  code="4 → 3 → 2"
                ></Code>
              </div>
            </Column>
          </Grid>
        </div>
      </Column>

      <!-- Responsive Behavior -->
      <DemoPageBody class="mt-bigger">
        <Text>Responsive Breakpoints</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          The grid system automatically adapts to different screen sizes using
          our predefined breakpoints. Grid margins scale fluidly to maintain
          optimal spacing across all devices.
        </Text>
        <Space size="big" />
        <Code
          language="javascript"
          theme="github-dark"
          :code="`// Available breakpoints\n$mobile: 360px\n$phablet: 500px\n$tablet: 600px\n$laptop: 900px\n$desktop: 1200px\n$ultrawide: 1440px`"
        />
        <Space size="bigger" />
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
  seoMeta: { title: "Layout System Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Layout variables from the layout system
const layoutVariables = [
  {
    name: "Grid Margin",
    variable: "--grid-margin",
    value: "clamp(var(--unit-smaller), 4vw, var(--unit-big))",
  },
  {
    name: "Grid Gap",
    variable: "--grid-gap",
    value: "var(--unit-tinier)",
  },
  {
    name: "Grid Margin (Desktop)",
    variable: "--grid-margin",
    value: "var(--unit-bigger) @desktop",
  },
];

// Responsive breakpoints
const breakpoints = [
  { name: "Mobile", value: "360px" },
  { name: "Phablet", value: "500px" },
  { name: "Tablet", value: "600px" },
  { name: "Laptop", value: "900px" },
  { name: "Desktop", value: "1200px" },
  { name: "Ultrawide", value: "1600px" },
];
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

.demo {
  margin-top: var(--unit-biggest);
  width: 100%;
}

// Layout Variables
.variable-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--unit-smaller);
  margin-bottom: var(--unit-big);
}

.variable-item {
  padding: var(--unit-smaller);
  background: var(--border-primary);
  border-radius: var(--radii-tiny);
}

.variable-info {
  display: flex;
  flex-direction: column;
  gap: var(--unit-tiniest);
}

.variable-name {
  font-weight: 500;
  color: var(--foreground-primary);
}

.variable-var,
.variable-value {
  font-family: monospace;
  font-size: 10px;
}

.grid-visual {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--grid-gap);
}

.grid-column {
  background: var(--border-primary);
  border-radius: var(--radii-tiny);
  padding: var(--unit-small) var(--unit-tiniest);
  text-align: center;
  min-height: 30vmax;
  display: flex;
  // align-items: center;
  justify-content: center;
  color: var(--foreground-primary);
}

.example-grid {
  margin-top: var(--unit-tinier);
  border-radius: var(--radii-tiny);
}

.example-column {
  display: flex;
}

.column-content {
  background: var(--border-primary);
  color: var(--foreground-primary);
  border-radius: var(--radii-tiny);
  text-align: center;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Responsive Breakpoints
.responsive-demo {
  margin-bottom: var(--unit-big);
}

.breakpoint-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--unit-tinier);
}

.breakpoint-item {
  padding: var(--unit-smaller);
  background: var(--border-primary);
  border-radius: var(--radii-tiny);
  text-align: center;
}

.breakpoint-name {
  font-weight: 500;
  color: var(--foreground-primary);
  display: block;
  margin-bottom: var(--unit-tiniest);
}

.breakpoint-value {
  font-family: monospace;
  font-size: 10px;
}
</style>
