// ~/composables/PageSetup.ts
import { onMounted } from "vue";
import pageSEO from "~/assets/scripts/pages/seo";
import type { SEOData } from "~/types/SEOData";
import { applySiteTitleTemplate } from "~/utils/seoSiteTitle";

interface PageSetupOptions {
  seoMeta?: SEOData;
}

export default function PageSetup(options?: PageSetupOptions) {
  const nuxt = useNuxtApp();

  if (options?.seoMeta) {
    const defaults = useSeoPublicDefaults();
    const resolved: SEOData = { ...options.seoMeta };
    if (!resolved.ogTitle) {
      resolved.ogTitle = applySiteTitleTemplate(resolved.title, defaults.siteName);
    }
    const desc = resolved.description?.trim();
    if (!desc && defaults.defaultMetaDescription) {
      resolved.description = defaults.defaultMetaDescription;
    }
    const hasCustomImage = Boolean(resolved.ogImage ?? resolved.image);
    if (!hasCustomImage) {
      resolved.ogImage = defaults.defaultOgImageUrl;
    }
    useSeoMeta(pageSEO(resolved));
    const canonical = options.seoMeta.canonicalUrl;
    if (canonical) {
      useHead({
        link: [{ rel: "canonical", href: canonical }],
      });
    }
  }

  onMounted(() => {
    (nuxt.$dimensions as any).set();
  });
}
