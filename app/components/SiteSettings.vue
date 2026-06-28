<template>
  <Teleport to="body">
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div
        v-if="modelValue"
        ref="modalEl"
        class="settings"
        role="dialog"
        aria-modal="true"
        aria-label="Site settings"
        @keydown="onKeydown"
      >
        <Grid class="settings__grid">
          <!-- Col 1: label + settings -->
          <Column span-mobile="6" span-tablet="3" span-laptop="3" span-desktop="2">
            <ul class="settings__col">
              <li class="settings__heading">
                <Text color="dimmer">Settings</Text>
              </li>
              <li class="settings__item">
                <BaseSelect
                  variant="text"
                  label="Theme"
                  :model-value="themeOverride"
                  :options="themeOptions"
                  @update:model-value="onThemeChange"
                />
              </li>
              <li class="settings__item">
                <BaseSelect
                  variant="text"
                  label="Autoplay"
                  :model-value="autoplayValue"
                  :options="autoplayOptions"
                  @update:model-value="onAutoplayChange"
                />
              </li>
            </ul>
          </Column>

          <!-- Close button col -->
          <Column span-mobile="6" span-tablet="3" span-laptop="3" span-desktop="2">
            <button
              ref="closeBtn"
              class="settings__close"
              aria-label="Close settings"
              @click="close"
            >
              <Text color="dimmer">Close</Text>
            </button>
          </Column>
        </Grid>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { gsap } from "gsap";
import { useAppStore } from "~/stores/app";
import { useDeviceStore } from "~/stores/device";
import { useEggMode } from "~/composables/useEggMode";

const props = defineProps<{ modelValue: boolean }>();
const emit = defineEmits<{ "update:modelValue": [val: boolean] }>();

const app = useAppStore();
const device = useDeviceStore();
const { isActive: eggActive, toggle: toggleEgg } = useEggMode();

const modalEl = ref<HTMLElement | null>(null);
const closeBtn = ref<HTMLElement | null>(null);
let triggerEl: HTMLElement | null = null;

// ─── Theme ────────────────────────────────────────────────────────────────────

const themeOptions = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Geocities", value: "geocities" },
];

const themeOverride = computed(() => app.themeOverride);

function applyTheme(val: string) {
  if (val === "system") {
    const pref = device.userThemePreference;
    const resolved =
      pref && pref.theme !== "no-preference" ? pref.theme : "dark";
    document.documentElement.dataset.theme = resolved;
  } else {
    document.documentElement.dataset.theme = val;
  }
}

function onThemeChange(val: string) {
  const leavingGeocities = themeOverride.value === "geocities";
  const enteringGeocities = val === "geocities";

  if (enteringGeocities && !eggActive.value) toggleEgg();
  if (leavingGeocities && eggActive.value) toggleEgg();

  app.setThemeOverride(val as "system" | "light" | "dark" | "geocities");
  if (!enteringGeocities) applyTheme(val);
}

// ─── Autoplay ─────────────────────────────────────────────────────────────────

const autoplayOptions = [
  { label: "On", value: "on" },
  { label: "Off", value: "off" },
];

const autoplayValue = computed(() => (app.autoplayVideos ? "on" : "off"));

function onAutoplayChange(val: string) {
  app.setAutoplayVideos(val === "on");
}

// ─── Open / close ─────────────────────────────────────────────────────────────

function close() {
  emit("update:modelValue", false);
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      triggerEl = document.activeElement as HTMLElement | null;
      nextTick(() => closeBtn.value?.focus());
    } else {
      triggerEl?.focus();
      triggerEl = null;
    }
  },
);

// ─── Focus trap ───────────────────────────────────────────────────────────────

function getFocusable(): HTMLElement[] {
  if (!modalEl.value) return [];
  return Array.from(
    modalEl.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    close();
    return;
  }
  if (e.key !== "Tab") return;

  const focusable = getFocusable();
  if (!focusable.length) return;

  const first = focusable[0]!;
  const last = focusable[focusable.length - 1]!;

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// ─── GSAP transitions ─────────────────────────────────────────────────────────

function onEnter(el: Element, done: () => void) {
  gsap.fromTo(
    el,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 0.25,
      ease: "power2.out",
      onComplete: done,
    },
  );
}

function onLeave(el: Element, done: () => void) {
  gsap.to(el, {
    opacity: 0,
    duration: 0.2,
    ease: "power2.in",
    onComplete: done,
  });
}
</script>

<style lang="scss" scoped>
.settings {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: var(--background-primary);
  overflow-y: auto;
}

.settings__grid {
  padding-top: var(--unit-smallest);
}

.settings__col {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.settings__heading {
  margin-bottom: var(--unit-tinier);
}

.settings__item {
  display: flex;
  align-items: baseline;
}

.settings__close {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  appearance: none;
  color: var(--foreground-quaternary);
  transition: color var(--transition-fast);
  font-size: var(--t-caption-1-size);
  line-height: var(--t-caption-1-leading);

  &:hover {
    color: var(--foreground-primary);
  }
}
</style>
