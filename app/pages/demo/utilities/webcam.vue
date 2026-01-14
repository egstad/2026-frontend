<template>
  <Grid class="mb-huge">
    <Column>
      <DemoPageHeader>
        <template #title>
          <div>webcam</div>
          <BaseButton
            v-if="!isActive"
            @click="startWebcam"
            class="mt-tiny"
            :disabled="isLoading || isActive"
          >
            Start Camera
          </BaseButton>
          <BaseButton v-else @click="stopWebcam" :disabled="!isActive"
            >Stop Camera</BaseButton
          >
        </template>
      </DemoPageHeader>
    </Column>

    <!-- <Column>
      <div class="status">
        <Text>Status: {{ isActive ? "Active" : "Inactive" }}</Text>
        <Text v-if="isLoading">Loading camera...</Text>
        <Text v-if="error" class="error">{{ error }}</Text>
        <Text v-if="hasPermission" class="success"
          >Camera permission granted</Text
        >
      </div>
    </Column> -->

    <!-- Video Display -->
    <Column span-laptop="6">
      <Text size="micro-1" class="mt-small mb-tiny">Video Element</Text>
      <div class="video-section">
        <video
          ref="videoRef"
          class="video-element"
          muted
          autoplay
          playsinline
          :style="{
            'aspect-ratio': aspectRatio ? aspectRatio.toString() : undefined,
          }"
        ></video>
      </div>
    </Column>

    <!-- Canvas Display -->
    <Column span-laptop="6">
      <Text size="micro-1" class="mt-small mb-tiny">Canvas</Text>
      <canvas
        ref="canvasRef"
        class="canvas-element"
        width="640"
        height="480"
        :style="{
          'aspect-ratio': aspectRatio ? aspectRatio.toString() : undefined,
        }"
      ></canvas>
      <div class="mt-tinier" v-if="isActive">
        <BaseButton
          v-if="!isCanvasStreaming"
          size="small"
          class="mr-tinier"
          @click="captureToCanvas"
          :disabled="isCanvasStreaming"
        >
          Take Picture
        </BaseButton>
        <BaseButton
          v-if="!isCanvasStreaming"
          size="small"
          class="mr-tinier"
          @click="startRealTimeCanvas"
        >
          Start Stream
        </BaseButton>
        <BaseButton
          v-if="isCanvasStreaming"
          size="small"
          @click="stopRealTimeCanvas"
          >Stop Stream</BaseButton
        >
      </div>
    </Column>
  </Grid>
</template>

<script setup lang="ts">
import { ref } from "vue";
import DemoPageHeader from "~/components/demo/PageHeader.vue";
import { useWebcam } from "~/composables/useWebcam";

// Composable
const {
  isActive,
  isLoading,
  start,
  stop,
  attachToVideo,
  captureFrame,
  startCanvasStream,
  stopCanvasStream,
  aspectRatio,
} = useWebcam();

// Template refs
const videoRef = ref<HTMLVideoElement>();
const canvasRef = ref<HTMLCanvasElement>();

// Photo state
const photoDataUrl = ref<string | null>(null);

// Canvas stream state
const isCanvasStreaming = ref(false);

const startWebcam = async () => {
  const stream = await start({
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user", // Front camera
    },
    audio: false,
  });

  if (stream && videoRef.value) {
    attachToVideo(videoRef.value);
  }
};

const stopWebcam = () => {
  stopCanvasStream();
  stop();
  photoDataUrl.value = null;
  isCanvasStreaming.value = false;
};

const captureToCanvas = () => {
  if (canvasRef.value) {
    captureFrame(canvasRef.value);
  }
};

const startRealTimeCanvas = () => {
  if (canvasRef.value) {
    startCanvasStream(canvasRef.value);
    isCanvasStreaming.value = true;
  }
};

const stopRealTimeCanvas = () => {
  stopCanvasStream();
  isCanvasStreaming.value = false;
};

// SEO
useHead({
  title: "Webcam Demo",
  meta: [
    {
      name: "description",
      content:
        "Demo of the useWebcam composable with video and canvas integration",
    },
  ],
});
</script>

<style scoped>
canvas,
video,
img {
  display: block;
  width: 100%;
  height: auto;
  background-color: var(--background-secondary);
}
</style>
