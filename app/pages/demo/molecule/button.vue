<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>buttons</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid>
      <!-- Component Overview -->
      <GridSliceCenter>
        <Text class="mb-tinier">Component Overview</Text>
        <Text size="body-2" color="dim">
          Interactive button components with multiple variants, sizes, and
          states. Built using the BaseButton component with consistent styling
          from the design system. Supports icons, loading states, and follows
          accessibility best practices.
        </Text>
      </GridSliceCenter>

      <!-- Button Variants -->
      <GridSliceCenter class="mt-bigger">
        <Text class="mb-tinier">Button Variants</Text>
        <Text size="body-2" color="dim" class="mb-small">
          Different visual styles for various interaction contexts and hierarchy
          levels.
        </Text>

        <div class="my-bigger">
          <table class="button-table">
            <tbody>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Primary</Text>
                </td>
                <td class="button-example">
                  <BaseButton variant="primary">Click me</BaseButton>
                </td>
              </tr>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Secondary</Text>
                </td>
                <td class="button-example">
                  <BaseButton variant="secondary">Click me</BaseButton>
                </td>
              </tr>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Ghost</Text>
                </td>
                <td class="button-example">
                  <BaseButton variant="ghost">Click me</BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GridSliceCenter>

      <!-- Button Sizes -->
      <GridSliceCenter>
        <Text class="mb-tinier">Button Sizes</Text>
        <Text size="body-2" color="dim" class="mb-small">
          Different sizes for various layout contexts and emphasis levels.
        </Text>

        <div class="my-bigger">
          <table class="button-table">
            <tbody>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Small</Text>
                </td>
                <td class="button-example">
                  <BaseButton size="small">Click me</BaseButton>
                </td>
              </tr>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Default</Text>
                </td>
                <td class="button-example">
                  <BaseButton>Click me</BaseButton>
                </td>
              </tr>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Large</Text>
                </td>
                <td class="button-example">
                  <BaseButton size="large">Click me</BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GridSliceCenter>

      <!-- Button States -->
      <GridSliceCenter>
        <Text class="mb-tinier">Button States</Text>
        <Text size="body-2" color="dim" class="mb-small">
          Different interaction states including disabled and loading states.
        </Text>

        <div class="my-bigger">
          <table class="button-table">
            <tbody>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Default</Text>
                </td>
                <td class="button-example">
                  <BaseButton>Click me</BaseButton>
                </td>
              </tr>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Disabled</Text>
                </td>
                <td class="button-example">
                  <BaseButton disabled>Click me</BaseButton>
                </td>
              </tr>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Loading</Text>
                </td>
                <td class="button-example">
                  <BaseButton loading>Loading...</BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </GridSliceCenter>

      <!-- Button Icons -->
      <GridSliceCenter>
        <Text class="mb-tinier">Button Icons</Text>
        <Text size="body-2" color="dim" class="mb-small">
          Buttons can include icons in leading or trailing positions for
          enhanced meaning.
        </Text>

        <div class="my-bigger">
          <table class="button-table">
            <tbody>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Leading Icon</Text>
                </td>
                <td class="button-example">
                  <BaseButton icon="check" icon-position="leading">
                    Save Changes
                  </BaseButton>
                </td>
              </tr>
              <tr>
                <td class="button-name">
                  <Text size="micro-1">Trailing Icon</Text>
                </td>
                <td class="button-example">
                  <BaseButton icon="arrow" icon-position="trailing">
                    Continue
                  </BaseButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
  seoMeta: { title: "Buttons Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});
</script>

<style lang="scss" scoped>
.button-table {
  width: 100%;
  border-collapse: collapse;

  tr {
    border-top: 1px solid var(--border-primary);

    &:last-child {
      border-bottom: 1px solid var(--border-primary);
    }
  }

  td {
    padding: var(--unit-small) 0;
    vertical-align: middle;

    &:last-child {
      padding-left: var(--unit-smaller);
    }

    &.button-name {
      width: 140px;
    }

    &.button-example {
      text-align: left;
    }
  }
}
</style>
