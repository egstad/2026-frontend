import type { LocationQueryValue } from "vue-router";

/**
 * Single category slug from `?category=…`, or `undefined` for “All”
 * (missing key, empty string, or `null` from the router).
 */
export function workCategoryFromQuery(
  raw: LocationQueryValue | LocationQueryValue[] | undefined,
): string | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (entry === undefined || entry === null) continue;
      const s = String(entry).trim();
      if (s.length) return s;
    }
    return undefined;
  }
  const s = String(raw).trim();
  return s.length ? s : undefined;
}
