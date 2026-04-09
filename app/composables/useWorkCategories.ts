import { sanityClient } from "~/utils/sanity";
import type { Category } from "~/types/sanity";

export function useWorkCategories() {
  const nuxtApp = useNuxtApp();
  return useAsyncData<Category[]>(
    "workCategories",
    () =>
      sanityClient.fetch<Category[]>(`
        *[_type == "category"] | order(name asc) { _id, name, slug }
      `),
    {
      default: () => [] as Category[],
      getCachedData: (key) =>
        nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    },
  );
}
