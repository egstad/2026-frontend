/**
 * Public SEO fallbacks from `runtimeConfig` (nuxt.config + NUXT_PUBLIC_*).
 * Used by `useSanityPageSeo` and `PageSetup`.
 */
export function useSeoPublicDefaults() {
  const config = useRuntimeConfig();
  const requestURL = useRequestURL();
  const p = config.public as {
    siteUrl?: string;
    siteName?: string;
    defaultMetaDescription?: string;
    /** Path on this site — file under `public/`, e.g. `/images/og-default.jpg` */
    defaultOgImagePath?: string;
  };

  const siteUrl = String(p.siteUrl ?? "").trim();
  const origin = siteUrl
    ? siteUrl.replace(/\/$/, "")
    : requestURL.origin;

  const siteName = String(p.siteName ?? "").trim();
  const defaultMetaDescription = String(p.defaultMetaDescription ?? "").trim();

  const defaultOgImagePathRaw =
    String(p.defaultOgImagePath ?? "/og-default.png").trim() || "/og-default.png";
  const pathForOrigin = defaultOgImagePathRaw.startsWith("/")
    ? defaultOgImagePathRaw
    : `/${defaultOgImagePathRaw}`;

  /** Absolute `og:image` URL for the local `public` fallback */
  const defaultOgImageUrl = `${origin}${pathForOrigin}`;

  return {
    origin,
    siteName,
    defaultMetaDescription,
    defaultOgImageUrl,
  };
}
