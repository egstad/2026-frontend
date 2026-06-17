<script setup lang="ts">
import PageSetup from "~/composables/PageSetup";
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";
import { useDiscogsCollection } from "~/composables/useDiscogs";

PageSetup({
  seoMeta: { title: "Music" },
});

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

const USERNAME = "egstad";

const {
  data: releases,
  pending: loading,
  error,
} = await useDiscogsCollection(USERNAME, { sort: "added" });
</script>

<template>
  <div class="music-page">
    <div v-if="loading" class="loading">Loading collection...</div>

    <div v-else-if="error" class="error">Error: {{ error.message }}</div>

    <Grid v-else-if="releases?.length" class="records-grid">
      <Column
        v-for="release in releases"
        :key="release.instance_id"
        span="6"
        span-tablet="4"
        span-laptop="3"
        span-desktop="2"
      >
        <RecordCard :release="release" />
      </Column>
    </Grid>
  </div>
</template>

<style lang="scss" scoped>
@use "~/assets/styles/global" as *;

.music-page {
  width: 100%;
  min-height: 100vh;
}

.loading,
.error {
  color: var(--foreground-tertiary);
  padding: var(--unit-big);
  text-align: center;
}

.error {
  color: var(--red-500);
}

.records-grid {
  row-gap: var(--unit-base);
}
</style>
