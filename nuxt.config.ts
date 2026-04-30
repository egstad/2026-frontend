// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  routeRules: {
    // ISR caches HTML + payload; skip in dev so Sanity title changes show on refresh.
    ...(import.meta.dev ? {} : { "/work": { isr: 60 * 10 } }),
  },
  modules: ["@pinia/nuxt", "@nuxt/image"],
  image: {
    sanity: {
      projectId: "p9yhyed1",
      dataset: "production",
    },
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      "2xl": 1536,
      "3xl": 1920,
      "4xl": 2560,
      "5xl": 3840,
      "6xl": 7680,
    },
  },
  runtimeConfig: {
    public: {
      arenaAccessToken: "", // Auto-populated from NUXT_PUBLIC_ARENA_ACCESS_TOKEN
      /** Absolute site origin for canonical URLs and OG fallbacks, e.g. https://example.com */
      siteUrl: "https://egstad.com",
      /**
       * Appended to page titles as ` | {siteName}` (HTML + og:title). Set in config or
       * `NUXT_PUBLIC_SITE_NAME`. Leave empty to use only the CMS / slug title.
       */
      siteName: "Jordan Egstad",
      /**
       * Used when a Sanity `page` has no `metaDescription`, and for non-Sanity pages that omit description.
       * `NUXT_PUBLIC_DEFAULT_META_DESCRIPTION`.
       */
      defaultMetaDescription:
        "Starting with the idea, staying until it’s clear. A designer and developer.",
      /**
       * Fallback share image path (`public/`). Resolved to an absolute URL with `siteUrl`.
       * `NUXT_PUBLIC_DEFAULT_OG_IMAGE_PATH`.
       */
      defaultOgImagePath: "/images/og-default.jpg",
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
