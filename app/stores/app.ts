import { defineStore } from "pinia";

export const useAppStore = defineStore("app", {
  state: () => ({
    appHasLoaded: false as boolean | false,
    routeIsTransitioning: true as boolean | true,
    theme: "dark" as "dark" | "light",
    themeOverride: "system" as "system" | "light" | "dark" | "geocities",
    autoplayVideos: true as boolean,
  }),
  actions: {
    setAppHasLoaded(loaded: boolean) {
      this.appHasLoaded = loaded;
    },
    setRouteIsTransitioning(transitioning: boolean) {
      this.routeIsTransitioning = transitioning;
    },
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = this.theme;
    },
    setThemeOverride(val: "system" | "light" | "dark" | "geocities") {
      this.themeOverride = val;
    },
    toggleAutoplayVideos() {
      this.autoplayVideos = !this.autoplayVideos;
    },
    setAutoplayVideos(val: boolean) {
      this.autoplayVideos = val;
    },
  },
});
