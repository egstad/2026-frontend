<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>icons</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Iconography Component Overview -->
      <DemoPageBody>
        <Text>Iconography Component</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          The Iconography component provides a consistent interface for all
          icons in the design system. It uses Heroicons and handles sizing
          automatically.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Available props -->
<Iconography
  name='search'        /* Icon name */
  size='medium'        /* small | medium | large */
/>`"
        />
      </DemoPageBody>

      <!-- Size Variations -->
      <DemoPageBody class="mt-big">
        <Grid>
          <Column span="12">
            <Text class="mb-tiny">Size Variations</Text>
            <Text size="body-2" color="dim" class="mb-small">
              The Iconography component supports three size variations that
              scale appropriately for different contexts.
            </Text>
            <div class="size-grid">
              <div
                v-for="size in sizeVariations"
                :key="size.name"
                class="size-item"
              >
                <div class="size-display">
                  <Iconography :name="demoIconName" :size="size.value" />
                </div>
                <div class="size-meta">
                  <Text size="caption-2" color="dim">
                    <code>{{ size.code }}</code>
                  </Text>
                  <Text size="caption-2" color="dimmer">{{ size.name }}</Text>
                </div>
              </div>
            </div>
          </Column>
          <Column>
            <Code
              class="my-small"
              language="vue"
              theme="github-dark"
              :code="`<!-- Usage examples -->
<Iconography name='check' />
<Iconography name='loading' size='large' />
<Iconography name='arrow' size='small' />`"
          /></Column>
        </Grid>
      </DemoPageBody>

      <!-- Available Icons -->
      <DemoPageBody class="mt-big">
        <Text>Available Icons</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim" class="mb-small">
          All icons available in the design system with their corresponding
          names.
        </Text>
      </DemoPageBody>
      <Column span="12">
        <BaseButton
          size="small"
          class="mb-smallest"
          variant="secondary"
          @click="updateIconSize"
          >Cycle Size ({{ currentSize }})</BaseButton
        >
        <div class="icon-grid">
          <div
            v-for="icon in availableIcons"
            :key="icon.name"
            class="icon-item"
          >
            <div class="icon-display">
              <Iconography :name="icon.name" :size="currentSize" />
            </div>
            <div class="icon-meta">
              <Text size="caption-2" color="dim">
                <code>{{ icon.code }}</code>
              </Text>
              <Text size="caption-2" color="dimmer">{{
                icon.description
              }}</Text>
            </div>
          </div>
        </div>
      </Column>

      <!-- Usage Patterns -->
      <DemoPageBody class="mt-bigger">
        <Text>Usage Patterns</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Common patterns for using icons in your interface designs.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Action buttons -->
<BaseButton>
  <Iconography name='plus' size='small' />
  Add Item
</BaseButton>

<BaseButton variant='danger'>
  <Iconography name='trash' size='small' />
  Delete
</BaseButton>

<!-- Status indicators -->
<Iconography name='warning' size='small' />
<Iconography name='error' size='small' />
<Iconography name='info' size='small' />

<!-- Form controls -->
<BaseInput>
  <template #prefix>
    <Iconography name='search' size='small' />
  </template>
</BaseInput>

<!-- Navigation -->
<Iconography name='menu' size='medium' /> <!-- Mobile menu -->
<Iconography name='home' size='small' />  <!-- Home link -->
<Iconography name='external-link' size='small' /> <!-- External URLs -->

<!-- User interface -->
<Iconography name='user' size='medium' />
<Iconography name='bell' size='small' />
<Iconography name='settings' size='small' />

<!-- Loading and actions -->
<Iconography name='loading' size='medium' /> <!-- Animated spinner -->
<Iconography name='refresh' size='small' />  <!-- Refresh action -->`"
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
  seoMeta: { title: "Iconography Component Documentation" },
});

// Define page transitions
definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// Interactive demo state
const selectedIcon = ref("search");
const selectedSize = ref("medium");
const demoIconName = ref("search");

// Size cycling for icon grid
const currentSizeIndex = ref(1); // Start with medium
const sizeValues = ["small", "medium", "large"];
const currentSize = computed(() => sizeValues[currentSizeIndex.value]);

const updateIconSize = () => {
  currentSizeIndex.value = (currentSizeIndex.value + 1) % sizeValues.length;
};

// Available icons
const availableIcons = [
  // Original icons
  {
    name: "search",
    code: "name='search'",
    description: "Search and find functionality",
  },
  {
    name: "check",
    code: "name='check'",
    description: "Confirmation and success states",
  },
  {
    name: "arrow",
    code: "name='arrow'",
    description: "Navigation and dropdowns",
  },
  {
    name: "loading",
    code: "name='loading'",
    description: "Loading and processing states",
  },
  {
    name: "close",
    code: "name='close'",
    description: "Close and cancel actions",
  },
  {
    name: "document",
    code: "name='document'",
    description: "Files and documents",
  },
  {
    name: "chevron-up-down",
    code: "name='chevron-up-down'",
    description: "Sorting and reordering",
  },
  // Navigation & Actions
  {
    name: "menu",
    code: "name='menu'",
    description: "Mobile menu and navigation",
  },
  {
    name: "home",
    code: "name='home'",
    description: "Homepage navigation",
  },
  {
    name: "plus",
    code: "name='plus'",
    description: "Add and create actions",
  },
  {
    name: "edit",
    code: "name='edit'",
    description: "Edit and modify content",
  },
  {
    name: "trash",
    code: "name='trash'",
    description: "Delete and remove actions",
  },
  {
    name: "settings",
    code: "name='settings'",
    description: "Configuration and preferences",
  },
  {
    name: "external-link",
    code: "name='external-link'",
    description: "External links and references",
  },
  // Status & Feedback
  {
    name: "warning",
    code: "name='warning'",
    description: "Warnings and caution alerts",
  },
  {
    name: "error",
    code: "name='error'",
    description: "Errors and danger states",
  },
  {
    name: "info",
    code: "name='info'",
    description: "Information and help content",
  },
  {
    name: "eye",
    code: "name='eye'",
    description: "Show and visibility states",
  },
  {
    name: "eye-slash",
    code: "name='eye-slash'",
    description: "Hide and private states",
  },
  // User & Account
  {
    name: "user",
    code: "name='user'",
    description: "User profile and account",
  },
  {
    name: "users",
    code: "name='users'",
    description: "Teams and multiple users",
  },
  {
    name: "bell",
    code: "name='bell'",
    description: "Notifications and alerts",
  },
  // Content & Media
  {
    name: "image",
    code: "name='image'",
    description: "Photos and images",
  },
  {
    name: "folder",
    code: "name='folder'",
    description: "File organization",
  },
  {
    name: "calendar",
    code: "name='calendar'",
    description: "Dates and scheduling",
  },
  {
    name: "clock",
    code: "name='clock'",
    description: "Time and duration",
  },
  {
    name: "mail",
    code: "name='mail'",
    description: "Email and messages",
  },
  {
    name: "heart",
    code: "name='heart'",
    description: "Likes and favorites",
  },
  {
    name: "star",
    code: "name='star'",
    description: "Ratings and bookmarks",
  },
  // Interface Controls
  {
    name: "filter",
    code: "name='filter'",
    description: "Filter and sort content",
  },
  {
    name: "refresh",
    code: "name='refresh'",
    description: "Reload and update",
  },
  {
    name: "download",
    code: "name='download'",
    description: "Download files",
  },
  {
    name: "upload",
    code: "name='upload'",
    description: "Upload files",
  },
  {
    name: "share",
    code: "name='share'",
    description: "Share content",
  },
  {
    name: "copy",
    code: "name='copy'",
    description: "Copy to clipboard",
  },
  {
    name: "more",
    code: "name='more'",
    description: "More options menu",
  },
];

// Size variations
const sizeVariations = [
  {
    name: "Small",
    value: "small",
    code: "size='small'",
  },
  {
    name: "Medium (Default)",
    value: "medium",
    code: "size='medium'",
  },
  {
    name: "Large",
    value: "large",
    code: "size='large'",
  },
];

// BaseSelect options
const iconOptions = computed(() =>
  availableIcons.map((icon) => ({
    label: icon.description,
    value: icon.name,
  }))
);

const sizeOptions = computed(() =>
  sizeVariations.map((size) => ({
    label: size.name,
    value: size.value,
  }))
);
</script>

<style lang="scss" scoped>
@use "~/assets/styles/mixins" as *;

.demo {
  margin-top: var(--unit-biggest);
  width: 100%;
}

// Icon Grid
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(182px, 1fr));
  gap: var(--grid-gap);
  margin-bottom: var(--unit-bigger);
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--unit-small);
  background: var(--background-secondary);
  border-radius: var(--radii-tiny);
  text-align: center;
}

.icon-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  margin-bottom: var(--unit-small);
  background: var(--background-primary);
  border-radius: var(--radii-tiny);
  color: var(--foreground-primary);
}

.icon-meta {
  display: flex;
  flex-direction: column;
  gap: var(--unit-tinier);
}

// Size Grid
.size-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--grid-gap);
}

.size-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--unit-small);
  background: var(--background-secondary);
  border-radius: var(--radii-tiny);
  text-align: center;
}

.size-display {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin-bottom: var(--unit-small);
  background: var(--background-primary);
  border-radius: var(--radii-tiny);
  color: var(--foreground-primary);
}

.size-meta {
  display: flex;
  flex-direction: column;
  gap: var(--unit-tinier);
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
    grid-template-columns: repeat(2, 1fr);
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
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--foreground-primary);
}

// Context Examples
.context-examples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--grid-gap);
}

.context-item {
  padding: var(--unit-small);
  background: var(--background-secondary);
  border-radius: var(--radii-tiny);
}

.loading-example {
  display: flex;
  align-items: center;
}

.nav-example {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--unit-small);
  background: var(--background-primary);
  border-radius: var(--radii-tiny);
}
</style>
