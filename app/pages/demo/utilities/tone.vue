<template>
  <section class="section">
    <!-- Audio Context Status -->
    <div class="status-card mt-big">
      <div class="controls" v-if="!isAudioReady">
        <button @click="startAudio" class="btn btn-primary">
          🎵 Start Audio
        </button>
      </div>
    </div>

    <!-- P5 Canvas -->
    <div class="canvas-container">
      <P5
        @setup="setup"
        @draw="draw"
        @mouse-pressed="mousePressed"
        @mouse-dragged="mouseDragged"
      />
    </div>

    <!-- Controls -->
    <div class="controls-section" v-if="isAudioReady">
      <div class="control-buttons">
        <button @click="toggleRain" class="btn">
          {{ isRaining ? "Stop Rain" : "Start Rain" }}
        </button>
        <button @click="clearRaindrops" class="btn">Clear All</button>
      </div>
    </div>
  </section>
</template>

<script setup>
import pageTransitionDefault from "~/assets/scripts/pages/transitionDefault";

// Lazy load Tone.js only when needed
let Tone = null;

// Page setup
PageSetup({
  seoMeta: { title: "Raindrop Symphony" },
});

definePageMeta({
  pageTransition: pageTransitionDefault(),
});

// State
const isAudioReady = ref(false);
const isRaining = ref(false);
const raindrops = ref([]);
let canvas = null;
let synth = null;
let reverb = null;
let lastDragTime = 0;
let lastDragX = 0;
let lastDragY = 0;

// Musical scales for different raindrop notes
const customScale = [
  "C4",
  "D4",
  "F4",
  "G4",
  "Ab4",
  "C5",
  "D5",
  "F5",
  "G5",
  "Ab5",
  "C6",
  "D7",
  "F7",
  "G7",
  "Ab7",
];

// Color mapping for each note (consistent across octaves)
const noteColors = {
  C: { r: 0x48, g: 0x78, b: 0xa8 }, // 4878A8 - Blue
  D: { r: 0x56, g: 0x2f, b: 0x49 }, // 562F49 - Purple/Magenta
  F: { r: 0x74, g: 0x7f, b: 0x8a }, // 747F8A - Gray
  G: { r: 0x8a, g: 0x65, b: 0x3c }, // 8A653C - Brown/Orange
  Ab: { r: 0xe5, g: 0x28, b: 0x17 }, // E52817 - Red
};

// Helper function to get note name from full note (e.g., "C3" -> "C")
const getNoteFromString = (noteString) => {
  return noteString.replace(/[0-9]/g, "");
};

// Raindrop class
class Raindrop {
  constructor(x, y, size = null) {
    this.x = x;
    this.y = y;
    this.initialSize = size || Math.random() * 8 + 4;
    this.currentSize = 0;
    this.maxSize = this.initialSize * 8; // Maximum ripple size
    this.expansionSpeed = this.initialSize * 0.3 + Math.random() * 2;
    this.opacity = 255;
    this.hasPlayed = false;
    this.isFading = false; // Track if ripple has started fading
    this.note = customScale[Math.floor(Math.random() * customScale.length)];
    const noteKey = getNoteFromString(this.note);
    this.color = noteColors[noteKey];
  }

  update() {
    // Play note immediately when raindrop appears
    if (!this.hasPlayed) {
      this.playNote();
      this.hasPlayed = true;
    }

    // Expand the main ripple
    this.currentSize += this.expansionSpeed;

    // Fade out main ripple
    if (this.currentSize > this.maxSize * 0.5) {
      this.isFading = true;
      this.opacity -= 2;
    }
  }

  draw(sk) {
    if (this.opacity <= 0) return;

    sk.push();
    sk.noFill();
    sk.strokeWeight(2);

    // Draw main ripple (only if it has some size)
    if (this.currentSize > 0) {
      sk.stroke(this.color.r, this.color.g, this.color.b, this.opacity);
      sk.ellipse(this.x, this.y, this.currentSize);
    }

    sk.pop();
  }

  playNote() {
    if (synth && isAudioReady.value) {
      try {
        const velocity = Math.max(0.3, Math.min(1.0, this.initialSize / 12));
        synth.triggerAttackRelease(this.note, "4n", undefined, velocity);
      } catch (error) {
        console.error("Error playing note:", error);
      }
    }
  }

  isDead() {
    return this.opacity <= 0;
  }
}

// Audio setup
const startAudio = async () => {
  try {
    // Lazy load Tone.js only when user starts audio
    if (!Tone) {
      Tone = await import("tone");
    }

    await Tone.start();

    // Create reverb effect
    reverb = new Tone.Reverb({
      decay: 10,
      wet: 0.7,
      preDelay: 0.05,
    }).toDestination();

    // Create vibrato effect for warble
    const vibrato = new Tone.Vibrato({
      frequency: 4, // Vibrato rate (Hz)
      depth: 0.02, // Vibrato depth (0-1)
      type: "sine",
    }).connect(reverb);

    // Create polyphonic synth with vibrato and reverb
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: "sine",
      },
      envelope: {
        attack: 0.01,
        decay: 10,
        sustain: 0.1,
        release: 4,
      },
    }).connect(vibrato);

    // Set volume
    synth.volume.value = -12;

    isAudioReady.value = true;
    console.log("🎵 Audio system ready");
  } catch (error) {
    console.error("❌ Failed to start audio:", error);
  }
};

// P5 event handlers
const setup = (sk) => {
  canvas = sk;
  // sk.background(5, 10, 20);
};

const draw = (sk) => {
  // Create glass surface background
  sk.fill(0, 0, 0);
  sk.noStroke();
  sk.rect(0, 0, sk.width, sk.height);

  // Automatically spawn raindrops when raining
  if (isRaining.value && Math.random() < 0.08) {
    addRaindrop(Math.random() * sk.width, Math.random() * sk.height);
  }

  // Update and draw raindrops
  raindrops.value = raindrops.value.filter((drop) => {
    drop.update();
    drop.draw(sk);
    return !drop.isDead();
  });
};

const mousePressed = (sk) => {
  if (isAudioReady.value) {
    addRaindrop(sk.mouseX, sk.mouseY);
  }
};

const mouseDragged = (sk) => {
  if (isAudioReady.value) {
    addRaindrop(sk.mouseX, sk.mouseY);
  }
};

// Helper functions
const addRaindrop = (x, y) => {
  raindrops.value.push(new Raindrop(x, y));
};

const toggleRain = () => {
  isRaining.value = !isRaining.value;
};

const clearRaindrops = () => {
  raindrops.value = [];
};

// Cleanup
onUnmounted(() => {
  try {
    if (synth) {
      synth.dispose();
      synth = null;
    }
    if (reverb) {
      reverb.dispose();
      reverb = null;
    }
    console.log("🧹 Audio cleanup complete");
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
});
</script>

<style lang="scss" scoped>
.section {
  margin-bottom: var(--unit-large);
}

header {
  margin-bottom: var(--unit-big);

  > * {
    max-width: 50ch;
  }
}

.status-card {
  background: var(--color-bg-secondary);
  border-radius: var(--radius-medium);
  padding: var(--unit-medium);
  margin-bottom: var(--unit-big);

  .controls {
    margin-top: var(--unit-small);
  }
}

.canvas-container {
  width: 100vw;
  height: 100vh;
  border-radius: var(--radius-medium);
  overflow: hidden;
  margin-bottom: var(--unit-big);
  box-shadow: var(--shadow-medium);
}

.controls-section {
  display: flex;
  flex-direction: column;
  gap: var(--unit-small);

  .control-buttons {
    display: flex;
    gap: var(--unit-small);
    flex-wrap: wrap;
  }
}

.btn {
  padding: var(--unit-small) var(--unit-medium);
  border: none;
  border-radius: var(--radius-small);
  background: var(--color-accent);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-accent-hover);
    transform: translateY(-2px);
  }

  &.btn-primary {
    background: var(--color-primary);

    &:hover {
      background: var(--color-primary-hover);
    }
  }
}
</style>
