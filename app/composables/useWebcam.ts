import { ref, onUnmounted, type Ref } from "vue";

export interface WebcamConstraints {
  video?: boolean | MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

export interface WebcamState {
  isActive: Ref<boolean>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  stream: Ref<MediaStream | null>;
  hasPermission: Ref<boolean>;
  aspectRatio: Ref<number | null>;
}

export interface WebcamMethods {
  start: (constraints?: WebcamConstraints) => Promise<MediaStream | null>;
  stop: () => void;
  attachToVideo: (videoElement: HTMLVideoElement) => void;
  captureFrame: (
    canvasElement: HTMLCanvasElement,
    videoElement?: HTMLVideoElement
  ) => void;
  takePhoto: (width?: number, height?: number) => string | null;
  startCanvasStream: (
    canvasElement: HTMLCanvasElement,
    videoElement?: HTMLVideoElement
  ) => void;
  stopCanvasStream: () => void;
}

export function useWebcam(): WebcamState & WebcamMethods {
  const isActive = ref(false);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const stream = ref<MediaStream | null>(null);
  const hasPermission = ref(false);
  const aspectRatio = ref<number | null>(16 / 9);

  let videoElement: HTMLVideoElement | null = null;
  let animationFrameId: number | null = null;
  let canvasStreamElement: HTMLCanvasElement | null = null;

  const start = async (
    constraints: WebcamConstraints = { video: true, audio: false }
  ): Promise<MediaStream | null> => {
    isLoading.value = true;
    error.value = null;

    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia is not supported in this browser");
      }

      // Request media stream
      const mediaStream = await navigator.mediaDevices.getUserMedia(
        constraints
      );

      stream.value = mediaStream;
      isActive.value = true;
      hasPermission.value = true;
      isLoading.value = false;

      return mediaStream;
    } catch (err) {
      isLoading.value = false;
      isActive.value = false;

      if (err instanceof Error) {
        switch (err.name) {
          case "NotAllowedError":
            error.value =
              "Camera access denied. Please allow camera permissions and try again.";
            break;
          case "NotFoundError":
            error.value =
              "No camera found. Please connect a camera and try again.";
            break;
          case "NotReadableError":
            error.value = "Camera is already in use by another application.";
            break;
          case "OverconstrainedError":
            error.value = "Camera constraints cannot be satisfied.";
            break;
          default:
            error.value = err.message || "Failed to access camera";
        }
      } else {
        error.value = "An unexpected error occurred";
      }

      console.error("Webcam error:", err);
      return null;
    }
  };

  const stop = (): void => {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => {
        track.stop();
      });
      stream.value = null;
    }

    if (videoElement) {
      videoElement.srcObject = null;
    }

    isActive.value = false;
    error.value = null;
    aspectRatio.value = null;
  };

  const attachToVideo = (video: HTMLVideoElement): void => {
    if (!stream.value) {
      error.value = "No active stream to attach. Call start() first.";
      return;
    }

    videoElement = video;
    video.srcObject = stream.value;

    // Calculate aspect ratio when video metadata loads
    const updateAspectRatio = () => {
      if (video.videoWidth && video.videoHeight) {
        aspectRatio.value = video.videoWidth / video.videoHeight;
      }
    };

    // Listen for metadata to get video dimensions
    video.addEventListener("loadedmetadata", updateAspectRatio);

    // Also check if metadata is already loaded
    if (video.readyState >= 1) {
      updateAspectRatio();
    }

    video.play().catch((err) => {
      error.value = "Failed to play video stream";
      console.error("Video play error:", err);
    });
  };

  const captureFrame = (
    canvas: HTMLCanvasElement,
    video?: HTMLVideoElement
  ): void => {
    const sourceVideo = video || videoElement;

    if (!sourceVideo) {
      error.value =
        "No video element available for capture. Attach stream to video first.";
      return;
    }

    if (!stream.value || !isActive.value) {
      error.value = "No active stream available for capture";
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      error.value = "Failed to get canvas 2D context";
      return;
    }

    // Set canvas dimensions to match video
    canvas.width = sourceVideo.videoWidth || sourceVideo.width || 640;
    canvas.height = sourceVideo.videoHeight || sourceVideo.height || 480;

    // Draw the current video frame to canvas
    ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);
  };

  const takePhoto = (
    width: number = 640,
    height: number = 480
  ): string | null => {
    if (!videoElement || !stream.value || !isActive.value) {
      error.value = "No active video stream for photo capture";
      return null;
    }

    // Create a temporary canvas for photo capture
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      error.value = "Failed to create canvas for photo";
      return null;
    }

    // Draw video frame to canvas
    ctx.drawImage(videoElement, 0, 0, width, height);

    // Return base64 data URL
    return canvas.toDataURL("image/png");
  };

  const startCanvasStream = (
    canvas: HTMLCanvasElement,
    video?: HTMLVideoElement
  ): void => {
    const sourceVideo = video || videoElement;

    if (!sourceVideo) {
      error.value =
        "No video element available for canvas stream. Attach stream to video first.";
      return;
    }

    if (!stream.value || !isActive.value) {
      error.value = "No active stream available for canvas stream";
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      error.value = "Failed to get canvas 2D context";
      return;
    }

    // Stop any existing animation frame
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    canvasStreamElement = canvas;

    const drawFrame = () => {
      if (!sourceVideo || !canvas || !stream.value || !isActive.value) {
        return;
      }

      // Set canvas dimensions to match video (only if they've changed)
      const videoWidth = sourceVideo.videoWidth || sourceVideo.width || 640;
      const videoHeight = sourceVideo.videoHeight || sourceVideo.height || 480;

      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }

      // Draw the current video frame to canvas
      ctx.drawImage(sourceVideo, 0, 0, canvas.width, canvas.height);

      // Schedule next frame
      animationFrameId = requestAnimationFrame(drawFrame);
    };

    // Start the animation loop
    drawFrame();
  };

  const stopCanvasStream = (): void => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    canvasStreamElement = null;
  };

  // Cleanup on unmount
  onUnmounted(() => {
    stop();
    stopCanvasStream();
  });

  return {
    // State
    isActive,
    isLoading,
    error,
    stream,
    hasPermission,
    aspectRatio,

    // Methods
    start,
    stop,
    attachToVideo,
    captureFrame,
    takePhoto,
    startCanvasStream,
    stopCanvasStream,
  };
}
