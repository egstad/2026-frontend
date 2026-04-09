import type { Category } from "~/types/sanity";

export function useWorkCategories() {
  return useState<Category[]>("workCategories", () => []);
}
