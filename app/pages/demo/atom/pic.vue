<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>pic</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Pic Component Overview -->
      <DemoPageBody>
        <Text>Pic Component</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          The Pic component provides optimized image loading with built-in
          error states. It uses NuxtImg for local and Sanity CDN images,
          with automatic srcset generation, format negotiation (AVIF/WebP),
          and native LQIP placeholder blur-up.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Basic usage -->
<Pic
  src='/images/construct.jpg'
  alt='Description of image'
  width='400'
  height='300'
/>

<!-- Sanity CDN image (auto-detected, uses Sanity provider) -->
<Pic
  src='https://cdn.sanity.io/images/project/dataset/hash-800x600.jpg'
  alt='Sanity image'
/>

<!-- External image -->
<Pic
  src='https://example.com/image.jpg'
  alt='External image'
  external
  width='400'
  height='300'
/>`"
        />
      </DemoPageBody>

      <!-- Image States -->
      <DemoPageBody class="mt-big">
        <Text>Image States</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim" class="mb-small">
          The Pic component automatically handles loading and error states.
          Loading uses NuxtImg's native LQIP placeholder (blurred thumbnail
          that fades to the full image). Errors display a fallback message.
        </Text>
      </DemoPageBody>
      <Space />

      <Column span-laptop="6">
        <div class="state-demo">
          <Pic
            src="/images/construct.jpg"
            alt="Construction site example"
            width="300"
            height="200"
          />
          <Text size="caption-2" color="dim" class="mt-smallest mb-small">
            Default (Success)
          </Text>
        </div>
      </Column>

      <Column span-laptop="6">
        <div class="state-demo">
          <Pic
            src="/images/nonexistent-image.jpg"
            alt="Error example"
            width="300"
            height="200"
          />
          <Text size="caption-2" color="dim" class="mt-smallest mb-small">
            Error State
          </Text>
        </div>
      </Column>

      <!-- Props Documentation -->
      <DemoPageBody class="mt-bigger">
        <Text>Available Props</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Complete list of props available for the Pic component.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Core props -->
<Pic
  src='/path/to/image.jpg'     /* Image source (required) */
  alt='Image description'      /* Alt text (required) */
  external='false'             /* External image flag */
  width='400'                  /* Image width */
  height='300'                 /* Image height */

  /* Optimization props */
  sizes='sm:100vw md:50vw'     /* NuxtImg breakpoint sizes */
  placeholder='true'           /* LQIP blur-up placeholder */
  loading='lazy'               /* lazy | eager */
  :quality='80'                /* Image quality (1-100) */
  format='webp'                /* Image format */
  densities='1x 2x'           /* Pixel density support */
  preload='false'              /* Preload image */

  /* State control */
  showError='true'             /* Show error state */
/>`"
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

PageSetup({
  seoMeta: { title: "Pic Component Documentation" },
});

definePageMeta({
  pageTransition: pageTransitionDefault(),
});
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

.demo {
  margin-top: var(--unit-biggest);
  width: 100%;
}

.state-demo {
  text-align: center;
}
</style>
