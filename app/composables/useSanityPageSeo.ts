import { sanityClient, urlFor } from "~/utils/sanity";
import pageSEO from "~/assets/scripts/pages/seo";
import type { SanityPageSeo } from "~/types/sanity";
import { applySiteTitleTemplate } from "~/utils/seoSiteTitle";

const PAGE_SEO_BY_SLUG = `*[_type == "page" && slug.current == $slug][0] {
  "metaTitle": coalesce(seoTitle, title),
  "metaDescription": select(
    type(metaDescription) == "string" => metaDescription,
    defined(metaDescription) => pt::text(metaDescription)
  ),
  ogImage {
    ...,
    hotspot,
    crop
  }
}`;

function fallbackMetaTitle(slug: string): string {
  if (!slug) return "";
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

/** CMS may send string, PT, or empty — never throw (throws break the whole seo computed → missing og tags). */
function plainMetaDescription(raw: unknown): string | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    const t = raw.trim();
    return t || undefined;
  }
  return undefined;
}

function resolveOgImageUrl(
  ogImage: SanityPageSeo["ogImage"],
): string | undefined {
  if (!ogImage?.asset) return undefined;
  try {
    return urlFor(ogImage).width(1200).height(630).fit("max").auto("format").url();
  } catch {
    return undefined;
  }
}

/**
 * Sanity `page` SEO by slug — sync composable (don’t `await useAsyncData` before `useSeoMeta`).
 */
export function useSanityPageSeo(slug: string) {
  const route = useRoute();
  const defaults = useSeoPublicDefaults();

  const { data } = useAsyncData(
    `page-seo-${slug}`,
    () =>
      sanityClient.fetch<SanityPageSeo | null>(PAGE_SEO_BY_SLUG, { slug }),
  );

  const canonicalUrl = `${defaults.origin}${route.path}`;

  /** Don’t pass this computed alone into useSeoMeta — Unhead drops `title` / breaks titleTemplate. */
  const seoFlat = computed(() => {
    const doc = data.value;
    const meta = doc?.metaTitle?.trim();
    const baseTitle = meta || fallbackMetaTitle(slug);
    const description =
      plainMetaDescription(doc?.metaDescription) ||
      defaults.defaultMetaDescription ||
      undefined;
    const ogImageUrl =
      resolveOgImageUrl(doc?.ogImage) ?? defaults.defaultOgImageUrl;
    const ogTitle = applySiteTitleTemplate(baseTitle, defaults.siteName);
    return pageSEO({
      title: baseTitle,
      description,
      ogTitle,
      ogDescription: description,
      ogImage: ogImageUrl,
      canonicalUrl,
    });
  });

  useSeoMeta({
    title: () => seoFlat.value.title,
    ogTitle: () => seoFlat.value.ogTitle,
    ogType: () => seoFlat.value.ogType,
    description: () => seoFlat.value.description,
    ogDescription: () => seoFlat.value.ogDescription,
    ogImage: () => seoFlat.value.ogImage,
    twitterImage: () => seoFlat.value.twitterImage,
    twitterCard: () => seoFlat.value.twitterCard,
    ogUrl: () => seoFlat.value.ogUrl,
  });

  useHead({
    link: [{ rel: "canonical", href: canonicalUrl }],
  });
}
