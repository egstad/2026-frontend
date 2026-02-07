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
          The Vid component provides optimized video playback via Mux HLS
          streaming (with Safari native fallback) or direct src for local
          files. It includes adaptive bitrate, lazy loading via
          IntersectionObserver, automatic viewport-based pause/resume,
          subtitle/caption support, audio detection, and preset-based
          configuration.
        </Text>

        <Text size="micro-1" class="mt-big">Mux Playback</Text>
        <Text color="dim" class="mt-tinier mb-smallest"
          >Pass a Mux playback ID for HLS adaptive streaming. Poster
          thumbnails are auto-generated from Mux.</Text
        >
        <Code
          language="vue"
          theme="github-dark"
          :code="`<Vid playbackId='your-mux-playback-id' alt='Video title' />`"
        />

        <Text size="micro-1" class="mt-big">Local Files</Text>
        <Text color="dim" class="mt-tinier mb-smallest"
          >Use src for direct video files. Supports .mp4, .mov, .webm,
          etc.</Text
        >
        <Code
          language="vue"
          theme="github-dark"
          :code="`<Vid src='/video/example.mp4' alt='Local video' />`"
        />

        <Text size="micro-1" class="mt-big">Default Preset</Text>
        <Text color="dim" class="mt-tinier mb-smallest"
          >User-controlled video with visible controls. No autoplay, not
          muted, no loop.</Text
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
          >You can override preset settings with individual props. The
          example below is an ambient video, but features controls instead
          of click-to-play.</Text
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

      <!-- Features -->
      <DemoPageBody class="mt-bigger">
        <Text>Features</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Built-in capabilities that work automatically.
        </Text>
        <Code
          class="my-small"
          language="vue"
          theme="github-dark"
          :code="`<!-- HLS adaptive bitrate streaming -->
• Mux videos stream via HLS.js (Safari uses native HLS)
• Adaptive quality based on network conditions

<!-- Lazy loading & viewport awareness -->
• Videos only load when scrolled into view
• Auto-pauses when scrolling out, resumes on re-entry

<!-- Audio & captions detection -->
• Mute/unmute button appears only on videos with audio
• CC button appears only on videos with subtitle tracks
• Controls: top-left, hover to show (cursor), always visible (touch)

<!-- Subtitles -->
<Vid playbackId='id' defaultSubtitleLang='en' />
• Subtitles disabled by default, user enables via CC button

<!-- Accessibility (ambient preset) -->
• Click anywhere on video to play/pause
• Spacebar and Enter key support
• Dynamic ARIA labels with play/pause state
• Cursor pointer indicates interactivity`"
        />
      </DemoPageBody>

      <!-- Presets -->
      <DemoPageBody class="mt-bigger">
        <Text>Presets</Text>
        <Space size="tinier" />
        <Text size="body-2" color="dim">
          Use presets for common video configurations. Individual props
          override preset values.
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
  playbackId='abc123'            /* Mux playback ID (preferred) */
  src='/path/to/video.mp4'       /* Direct video URL fallback */
  poster='/path/to/poster.jpg'   /* Custom poster (auto-generated for Mux) */
  alt='Video description'        /* Alt text for accessibility */
  width='400'                    /* Video width */
  height='300'                   /* Video height */
  preset='default'               /* default | ambient */
  autoplay='null'                /* Override: auto-start playback */
  loop='null'                    /* Override: loop playback */
  muted='null'                   /* Override: start muted */
  controls='null'                /* Override: show video controls */
  playsinline='true'             /* Play inline on mobile */
  loading='lazy'                 /* lazy | eager */
  defaultSubtitleLang='en'       /* Enable subtitles for language */
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
  seoMeta: { title: "Vid Component Documentation" },
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
</style>
