# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Keeping this file current

Update this file whenever you add, remove, or meaningfully change a feature — new pages, stores, composables, content types, SEO patterns, style conventions, or config keys. Keep entries concise; the goal is to give future Claude instances architectural context that isn't obvious from reading individual files.

## Commands

```bash
npm run dev        # dev server at http://localhost:3000
npm run build      # production build
npm run preview    # preview production build locally
npx nuxt upgrade   # upgrade Nuxt
```

No test runner is configured. No linter is configured.

## Architecture

**Nuxt 4 personal portfolio site** for Jordan Egstad. Content is managed in Sanity CMS; video assets are hosted on Mux.

### Content layer

- **Sanity project**: project ID and dataset are defined in `nuxt.config.ts` and `app/utils/sanity.ts`
- Two clients in `app/utils/sanity.ts`: `sanityClient` (CDN, for page data) and `sanityApiClient` (live, for SEO so CMS changes appear without CDN delay).
- Mux helper functions in the same file: `getMuxThumbnail`, `getMuxAnimatedGif`, `getMuxStreamUrl`.
- All GROQ queries live inline in the page/composable that uses them, not in a centralized query file — except URL-query parsing helpers in `app/utils/workQuery.ts`.
- The primary content type is **`artifact`** — media items (images or Mux videos) with EXIF metadata, categories, and tags. Other types: `page`, `log`, `workHistory`, `great`, `portrait`, `client`.

### SEO

Two patterns for setting page SEO:

1. **Sanity-backed pages** — call `useSanityPageSeo(slug)` (composable). Fetches the matching `page` document from Sanity and resolves title, description, and OG image. Uses `sanityApiClient` (no CDN cache).
2. **Static/non-CMS pages** — call `PageSetup({ seoMeta: { title, description, ... } })`. Fills in defaults from `runtimeConfig.public` for any missing fields.

Both paths go through `app/assets/scripts/pages/seo.ts` (`pageSEO()`) which shapes the final `useSeoMeta()` call, and `app/utils/seoSiteTitle.ts` (`applySiteTitleTemplate()`) which appends ` | Jordan Egstad` to page titles. The site-wide title template is registered once in `app/app.vue`.

### Pinia stores

- **`device`** (`app/stores/device.ts`) — viewport dimensions, scroll state, input type (touch/cursor), user preferences (motion, theme). Populated entirely by client-only plugins in `app/plugins/device/`.
- **`app`** (`app/stores/app.ts`) — `appHasLoaded`, `routeIsTransitioning`, `theme`, `themeOverride` (`"system" | "light" | "dark" | "geocities"`), `autoplayVideos`. The `themeOverride` and `autoplayVideos` fields are persisted to localStorage — see **User settings** below.
- **`artifact`** (`app/stores/artifact.ts`) — holds `randomSeed` used to deterministically shuffle the work grid. Call `reshuffle()` to re-randomize.

### Component hierarchy

Components use an atomic naming convention with numbered prefixes that control auto-import priority. All subdirectories are imported without path prefix so components can be used without namespace:

- `1-atom/` — `Pic`, `Vid`, `Text`, `Grid`, `Column`, `Space`, `Iconography`, `Code`, `PortableTextSpan`
- `2-molecule/` — `BaseButton`, `BaseInput`, `BaseSelect`, `BaseTextarea`, `BaseSearch`, `Tooltip`
- `3-organism/` — `MediaCard`, `FeedCard`, `MasonryGrid`, `Carousel`, `WorkMediaLightbox`, `ArtifactMetaPanel`, etc.
- `4-template/` — `GridSliceCenter`
- `about/`, `demo/` — page-specific and component-showcase components

### Work page (`/work`)

The most complex page. Key behaviors:
- Three **view modes** (`inline`, `feed`, `text`) and three **sort modes** (`random`, `newest`, `oldest`) driven by URL query params `?v=` and `?s=`. Category filter uses `?c=`.
- Random sort uses a seeded Fisher-Yates shuffle (`seededShuffle`) keyed to `artifactStore.randomSeed` so re-clicking "random" produces a different order.
- **Masonry layout** is used on mobile/tablet (<1024 px); a `flex-wrap` grid is used on desktop. The column count is frozen while the lightbox is open to prevent HLS.js reinitialization on grid-toggle.
- **Infinite scroll** via an `IntersectionObserver` sentinel element at the bottom of the list; page size is 50 items (100 in text view).
- GSAP-driven enter/leave transitions on the results container stagger only the cards in the viewport; off-screen cards are shown instantly.

### Lightbox (`useWorkLightbox`)

Module-level singleton refs (not `useState`) share state across all component instances. Uses a **FLIP animation** pattern: the opening card records its DOM rect (`firstRect`), teleports its media element into a shared stage in `WorkMediaLightbox`, then GSAP animates from the first rect to the stage rect. Closing reverses the motion. `hasTeleport` distinguishes card-opens (with media teleport) from text-row opens (lightbox renders media directly).

### Styles

SCSS with design tokens as CSS custom properties. `_global.scss` is injected into every SFC automatically via Vite's `additionalData` so tokens and mixins are always available without import.

Structure: `foundations/` (reset, units, color, layout, typography, effects, motion) → `atoms/` (buttons, inputs) → component `<style scoped>` blocks.

Responsive breakpoint mixins (defined in `_mixins.scss`) are used as `@include tablet`, `@include laptop`, `@include desktop`.

### Page transitions

All pages call `definePageMeta({ pageTransition: pageTransitionDefault() })`. The default transition is a GSAP-driven `out-in` fade (leave: 0.4s, enter: 1s with 0.25s delay). The `app` store's `routeIsTransitioning` flag is set/cleared around transitions.

### User settings

A Settings modal (`SiteSettings.vue`) is opened from the primary nav in `SiteHeader.vue`. It exposes two user-controlled preferences:

- **Theme** — `"system" | "light" | "dark" | "geocities"`. `"system"` resolves to the OS color-scheme preference at the time it's applied. `"geocities"` activates the egg mode (`useEggMode`) and is **not** persisted to localStorage (treated as ephemeral; next load resets to `"system"`).
- **Autoplay videos** — boolean. Controls whether `Vid` components with `preset="ambient"` autoplay. When off, a centered play icon overlay appears on paused videos; clicking the overlay plays inline without opening the lightbox.

#### Initialization priority (`autoplayVideos`)

Handled entirely by `app/plugins/settings.client.ts` in this order (highest priority last):

1. Store default — `true`
2. OS reduced-motion preference (`device.userMotionReduced === true`) → `false`
3. Saved localStorage value → always wins

#### Persistence

`app/plugins/settings.client.ts` reads and writes a single `"site-settings"` key in `localStorage`:

```json
{ "themeOverride": "dark", "autoplayVideos": false }
```

A `watch` on the relevant store fields writes back on every change. Plugins run alphabetically; `device/` plugins run before `settings.client.ts` (`d` < `s`), so `device.userMotionReduced` is populated before the settings plugin reads it.

### Device plugins (client-only)

All six plugins in `app/plugins/device/` run client-side only and write into the `device` Pinia store: `deviceInfo` (touch/cursor/mobile detection), `deviceDimensions` (viewport/doc size, DPI), `deviceMotionPreference` (sets `device.userMotionReduced` only — autoplay initialization is delegated to `settings.client.ts`), `deviceThemePreference`, `deviceScroll`, `deviceResize`. Access them via `useDeviceStore()`.

### Runtime config

`nuxt.config.ts` `runtimeConfig.public` keys:
- `siteUrl` — canonical origin (`https://egstad.com`)
- `siteName` — appended to all page titles (`Jordan Egstad`)
- `defaultMetaDescription` — fallback for pages without a Sanity description
- `defaultOgImagePath` — fallback OG image path (resolved from `public/`)
- `arenaAccessToken` — set via `NUXT_PUBLIC_ARENA_ACCESS_TOKEN` env var

The `/work` route uses ISR (10-minute cache) in production; disabled in dev so Sanity changes appear on refresh.
