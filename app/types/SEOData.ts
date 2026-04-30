/** Input for `pageSEO()` → `useSeoMeta` */
export interface SEOData {
  title: string;
  /** Meta description and og:description; omit when empty */
  description?: string;
  /** Raw URL for meta/twitter image */
  image?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  /** Absolute canonical URL for og:url and link[rel=canonical] */
  canonicalUrl?: string;
}
