// Define SEOData type inline instead of importing
export type SEOData = {
  title: string;
  description: string;
  image?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string | null;
};

export default function pageSEO(seoData: SEOData) {
  const defaultData: SEOData = {
    title: seoData.title,
    ogTitle: seoData.title,
    description: seoData.description,
    ogDescription: seoData.description,
    ogImage: seoData.image,
    twitterCard: seoData.image ? "summary_large_image" : null,
  };

  return { ...defaultData };
}
