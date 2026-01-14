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
          loading and error states. It uses NuxtImg for local images and
          supports external images with comprehensive optimization options.
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
/>`"
        />
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- External image -->
<Pic
  src='https://example.com/image.jpg'
  alt='External image'
  external
  width='400'
  height='300'
/>

<!-- Demo loading state -->
<Pic
  src='/images/construct.jpg'
  alt='Demo loading state'
  width='400'
  height='300'
  blockLoading
/>`"
        />
      </DemoPageBody>

      <!-- Image States -->
      <DemoPageBody class="mt-big">
        <Text>Image States</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim" class="mb-small">
          The Pic component automatically handles loading and error states with
          visual feedback for better user experience.
        </Text>
      </DemoPageBody>
      <Space />

      <Column span-laptop="4">
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

      <Column span-laptop="4">
        <div class="state-demo">
          <Pic
            src="/images/construct.jpg"
            width="300"
            height="200"
            alt="loading image"
            blockLoading
          />
          <Text size="caption-2" color="dim" class="mt-smallest mb-small">
            Loading State
          </Text>
        </div>
      </Column>

      <Column span-laptop="4">
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
  sizes='(max-width: 768px) 100vw, 50vw'
  placeholder='true'           /* Show placeholder */
  loading='lazy'               /* lazy | eager */
  :quality='80'                 /* Image quality (1-100) */
  format='webp'                /* Image format */
  densities='1x 2x'            /* Pixel density support */
  preload='false'              /* Preload image */

  /* State control */
  showLoading='true'           /* Show loading state */
  showError='true'             /* Show error state */
  blockLoading='false'         /* Block loading for demo purposes */
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

// Run common mount/unmount scripts. Setup SEO, etc.
PageSetup({
  seoMeta: { title: "Pic Component Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Interactive demo state
const selectedImageSrc = ref("/images/construct.jpg");
const selectedWidth = ref("300");
const selectedQuality = ref("80");
const interactiveKey = ref(0);

// Loading state demos
const loadingImageSrc = ref(
  "https://deelay.me/3000/https://picsum.photos/300/200?random=1"
);
const loadingKey = ref(0);

// Custom loading demo
const customLoadingSrc = ref("/images/construct.jpg");
const customLoadingKey = ref(0);

// Computed for interactive demo
const selectedImageAlt = computed(() => {
  if (selectedImageSrc.value.includes("construct"))
    return "Construction site example";
  if (selectedImageSrc.value.includes("unsplash"))
    return "External image example";
  return "Demo image";
});

// Demo functions
const triggerLoading = () => {
  // Force a reload by changing the key and using a delayed image service
  loadingKey.value += 1;
  const randomId = Math.floor(Math.random() * 1000);
  loadingImageSrc.value = `https://deelay.me/3000/https://picsum.photos/300/200?random=${randomId}&t=${Date.now()}`;
};

const triggerCustomLoading = () => {
  customLoadingKey.value += 1;
  customLoadingSrc.value = `/images/construct.jpg?t=${Date.now()}`;
};

// BaseSelect options
const imageOptions = [
  {
    label: "Local Image (construct.jpg)",
    value: "/images/construct.jpg",
  },
  {
    label: "External Image (Unsplash)",
    value:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=200&fit=crop",
  },
  {
    label: "Broken Image (Error State)",
    value: "/images/nonexistent.jpg",
  },
];

const sizeOptions = [
  { label: "Small (200px)", value: "200" },
  { label: "Medium (300px)", value: "300" },
  { label: "Large (400px)", value: "400" },
  { label: "X-Large (500px)", value: "500" },
];

const qualityOptions = [
  { label: "Low (60)", value: "60" },
  { label: "Medium (80)", value: "80" },
  { label: "High (90)", value: "90" },
  { label: "Maximum (100)", value: "100" },
];
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

.demo {
  margin-top: var(--unit-biggest);
  width: 100%;
}

// State demos
.state-demo {
  text-align: center;
}

.image-container {
  background: var(--background-secondary);
  border-radius: var(--radii-tiny);
  padding: var(--unit-small);
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Option demos
.option-demo {
  background: var(--background-secondary);
  padding: var(--unit-small);
  border-radius: var(--radii-small);
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
  min-height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}

// Custom state demos
.custom-demo {
  background: var(--background-secondary);
  padding: var(--unit-small);
  border-radius: var(--radii-small);
  text-align: center;
}

.custom-loading,
.custom-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--foreground-secondary);
}
</style>
