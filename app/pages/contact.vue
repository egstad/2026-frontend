<script setup lang="ts">
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

PageSetup();
useSanityPageSeo("contact");

definePageMeta({
  pageTransition: pageTransitionDefault(),
});
</script>

<template>
  <Grid class="contact-page mt-big">
    <Column>
      <Text is="h1" size="headline-1">Contact</Text>
    </Column>
  </Grid>
</template>
