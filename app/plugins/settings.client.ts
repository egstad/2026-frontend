import { watch } from "vue";
import { useAppStore } from "~/stores/app";
import { useDeviceStore } from "~/stores/device";

const STORAGE_KEY = "site-settings";

export default defineNuxtPlugin(() => {
  const app = useAppStore();
  const device = useDeviceStore();

  // ── Restore ────────────────────────────────────────────────────────────────
  // Priority (highest last wins):
  //   1. store default (autoplayVideos: true)
  //   2. OS reduced-motion preference → autoplay off
  //   3. user's saved localStorage value → always wins
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const saved = raw ? (JSON.parse(raw) as Record<string, unknown>) : null;

    // Geocities is ephemeral — don't auto-activate egg mode on load
    if (saved?.themeOverride && saved.themeOverride !== "geocities") {
      app.setThemeOverride(saved.themeOverride as "system" | "light" | "dark");
    }

    if (typeof saved?.autoplayVideos === "boolean") {
      // Explicit saved preference — highest priority
      app.setAutoplayVideos(saved.autoplayVideos);
    } else if (device.userMotionReduced) {
      // No saved preference; OS says reduce motion → disable autoplay
      app.setAutoplayVideos(false);
    }
    // else: keep store default (true)
  } catch {}

  // ── Persist on change ──────────────────────────────────────────────────────
  watch(
    () => ({ themeOverride: app.themeOverride, autoplayVideos: app.autoplayVideos }),
    ({ themeOverride, autoplayVideos }) => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            // Store "system" when Geocities is active so next load is clean
            themeOverride: themeOverride === "geocities" ? "system" : themeOverride,
            autoplayVideos,
          }),
        );
      } catch {}
    },
  );
});
