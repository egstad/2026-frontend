<template>
  <div class="site-wrapper">
    <SiteIntro />
    <Header />
    <SiteHeader />
    <main class="site-content">
      <Scrim />
      <NuxtPage />
    </main>
  </div>
</template>

<script setup>
import { onMounted, watch } from "vue";
import { useAppStore } from "~/stores/app";

const app = useAppStore();
const route = useRoute();

onMounted(() => {
  app.setAppHasLoaded(true);
  app.setRouteIsTransitioning(false);
});

watch(
  () => route.path,
  () => {
    app.setRouteIsTransitioning(true);
  },
);
</script>
