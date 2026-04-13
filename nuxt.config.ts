// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  routeRules: {
    "/work": { isr: 60 * 10 }, // revalidate every 10 min
  },
  modules: ["@pinia/nuxt", "@nuxt/image"],
  image: {
    sanity: {
      projectId: "p9yhyed1",
      dataset: "production",
    },
  },
  runtimeConfig: {
    public: {
      arenaAccessToken: "", // Auto-populated from NUXT_PUBLIC_ARENA_ACCESS_TOKEN
    },
  },
  plugins: [
    { src: "~/plugins/device/deviceInfo.ts", mode: "client" },
    { src: "~/plugins/device/deviceDimensions.ts", mode: "client" },
    { src: "~/plugins/device/deviceMotionPreference.ts", mode: "client" },
    { src: "~/plugins/device/deviceThemePreference.ts", mode: "client" },
    { src: "~/plugins/device/deviceScroll.ts", mode: "client" },
    { src: "~/plugins/device/deviceResize.ts", mode: "client" },
    { src: "~/plugins/tweakpane.ts", mode: "client" },
    { src: "~/plugins/gsap.client.ts", mode: "client" },
  ],
  pinia: {
    storesDirs: ["./stores/app", "./stores/device"],
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      script: [
        {
          // Synchronously hide the page before first paint if the intro hasn't
          // played this session. Runs before any stylesheet or framework code.
          innerHTML: `(function(){try{if(!sessionStorage.getItem('site-intro-played')){document.documentElement.classList.add('intro-pending');}}catch(e){}})();`,
          tagPosition: "head",
        },
      ],
    },
  },
  css: ["~/assets/styles/main.scss"],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "~/assets/styles/_global.scss" as *;
          `,
        },
      },
    },
  },
  components: [
    // Default components directory (includes P5.vue, etc.)
    { path: `~/components`, pathPrefix: false },
    // Auto-import components without path prefixes for cleaner imports
    { path: `~/components/1-atom`, pathPrefix: false },
    { path: `~/components/2-molecule`, pathPrefix: false },
    { path: `~/components/3-organism`, pathPrefix: false },
    { path: `~/components/4-template`, pathPrefix: false },
    { path: `~/components/about`, pathPrefix: false },
  ],
  compatibilityDate: "2025-10-18",
});
