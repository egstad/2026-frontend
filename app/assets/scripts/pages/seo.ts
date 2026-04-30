import type { SEOData } from "~/types/SEOData";

export default function pageSEO(seoData: SEOData) {
  const title = seoData.title;
  const ogTitle = seoData.ogTitle ?? title;
  const ogImage = seoData.ogImage ?? seoData.image;
  const description = seoData.description;
  const ogDescription = seoData.ogDescription ?? description;

  return {
    title,
    ogTitle,
    ogType: "website" as const,
    ...(description
      ? { description, ogDescription: ogDescription ?? description }
      : {}),
    ...(ogImage
      ? {
          ogImage,
          twitterImage: ogImage,
          twitterCard: "summary_large_image" as const,
        }
      : {}),
    ...(seoData.canonicalUrl ? { ogUrl: seoData.canonicalUrl } : {}),
  };
}
