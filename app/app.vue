<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { applySiteTitleTemplate } from "~/utils/seoSiteTitle";

/**
 * Site-wide title pattern — see https://nuxt.com/docs/4.x/getting-started/seo-meta
 * Page-level code passes only the page chunk via useSeoMeta({ title }); this template adds `siteName` from runtimeConfig.
 */
const config = useRuntimeConfig();

useHead({
  titleTemplate: (titleChunk) =>
    applySiteTitleTemplate(
      titleChunk,
      String(config.public.siteName ?? ""),
    ),
});
</script>
