<template>
  <div>
    <section>
      <DemoPageHeader>
        <template #title>construct</template>
      </DemoPageHeader>
      <DemoSectionNav />
    </section>
  </div>
</template>

<script setup>
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";
import DemoTypeStyles from "~/components/demo/TypeStyles.vue";
import DemoImages from "~/components/demo/Images.vue";
import DemoPageHeader from "~/components/demo/PageHeader.vue";
import DemoButtons from "~/components/demo/Buttons.vue";
import DemoSectionNav from "~/components/demo/SectionNav.vue";

// Run common mount/unmount scripts. Seup SEO, etc.
PageSetup({
  seoMeta: { title: "Index" },
});

// Define page transitions or other page meta
definePageMeta({
  pageTransition: pageTransitionDefault(),
});
</script>

<style lang="scss" scoped>
section {
  margin-bottom: var(--unit-huge);

  header {
    padding-top: var(--unit-small);
    padding-bottom: var(--unit-big);
  }
}
</style>
