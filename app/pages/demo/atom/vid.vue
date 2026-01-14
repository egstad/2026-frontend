<template>
  <section>
    <Grid>
      <Column>
        <DemoPageHeader>
          <template #title>vid</template>
        </DemoPageHeader>
      </Column>
    </Grid>

    <Grid class="demo">
      <!-- Vid Component Overview -->
      <DemoPageBody>
        <Text>Vid Component</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          The Vid component provides optimized video playback with built-in
          loading and error states. It supports various playback modes and
          controls for different use cases.
        </Text>

        <Text size="micro-1" class="mt-big">Default Preset</Text>
        <Text color="dim" class="mt-tinier mb-smallest"
          >User-controlled video with visible controls. No autoplay, not muted,
          no loop.</Text
        >
        <Code
          language="vue"
          theme="github-dark"
          :code="`<Vid src='URL' alt='Alt text' />`"
        />
        <Vid src="/video/me.mp4" alt="Default video" />

        <Text size="micro-1" class="mt-big">Ambient Preset</Text>
        <Text color="dim" class="mt-tinier mb-smallest"
          >Video that autoplays, loops, and is muted. No controls. Click to
          play/pause.</Text
        >
        <Code
          language="vue"
          theme="github-dark"
          :code="`<Vid src='URL' alt='Alt text' preset='ambient' />`"
        />
        <Vid src="/video/tokyo.mp4" alt="Ambient video" preset="ambient" />

        <Text size="micro-1" class="mt-big">Custom Override</Text>
        <Text color="dim" class="mt-tinier mb-smallest"
          >You can override preset settings with individual props. The example
          below is an ambient video, but features controls instead of
          click-to-play.</Text
        >
        <Code
          language="vue"
          theme="github-dark"
          :code="`<Vid src='URL' alt='Alt text' preset='ambient' controls />`"
        />
        <Vid
          src="/video/leaves.mp4"
          alt="Custom video"
          preset="ambient"
          controls
        />
      </DemoPageBody>

      <!-- Accessibility -->
      <DemoPageBody class="mt-bigger">
        <Text>Accessibility Features</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Built-in accessibility improvements for better user experience.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Click-to-play when controls are hidden -->

<!-- Clickable + keyboard accessible -->
<Vid preset='ambient' />

<!-- Features: -->
• Click anywhere on video to play/pause
• Spacebar and Enter key support
• Focus indicators for keyboard navigation
• Dynamic ARIA labels with play/pause state
• Cursor pointer indicates interactivity
• Hover and active states for visual feedback`"
        />
      </DemoPageBody>

      <!-- Presets -->
      <DemoPageBody class="mt-bigger">
        <Text>Presets</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Use presets for common video configurations. Individual props override
          preset values.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- Available presets: -->

preset='default'    // User-controlled video
  autoplay: false   // User clicks to play
  muted: false      // Audio enabled
  controls: true    // Show video controls
  loop: false       // Play once

preset='ambient'    // Background video
  autoplay: true    // Starts automatically
  muted: true       // Silent playback
  controls: false   // No controls visible
  loop: true        // Continuous playback

// Override preset values:
<Vid preset='ambient' :muted='false' />  // Ambient with sound
<Vid preset='default' :loop='true' />    // Controlled but looping`"
        />
      </DemoPageBody>

      <!-- Props Documentation -->
      <DemoPageBody class="mt-bigger">
        <Text>Available Props</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Complete list of props available for the Vid component.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<Vid
  src='/path/to/video.mp4'      /* Video source (required) */
  width='400'                   /* Video width */
  height='300'                  /* Video height */
  alt='Video description'       /* Alt text for accessibility */
  autoplay='null'               /* Auto-start playback */
  loop='null'                   /* Loop playback */
  muted='null'                  /* Start muted */
  controls='null'               /* Show video controls */
  playsinline='true'            /* Play inline on mobile */
  loading='lazy'                /* lazy | eager (uses Observer for lazy) */
  poster='/path/to/poster.jpg'  /* Poster image */
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
  seoMeta: { title: "Vid Component Documentation" },
});

// Define page transitions
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

// State demos
.state-demo {
  text-align: center;
  background: var(--background-secondary);
  padding: var(--unit-small);
  border-radius: var(--radii-small);
}

// Mode demos
.mode-demo {
  background: var(--background-secondary);
  padding: var(--unit-small);
  border-radius: var(--radii-small);
}

// Advanced demos
.advanced-demo {
  background: var(--background-secondary);
  padding: var(--unit-small);
  border-radius: var(--radii-small);
  text-align: center;
}

// Lazy loading demos
.lazy-demo {
  background: var(--background-secondary);
  padding: var(--unit-small);
  border-radius: var(--radii-small);
  text-align: center;
}
</style>
