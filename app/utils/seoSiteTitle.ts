/**
 * Shared with `app.vue` `titleTemplate` and OG `og:title` (Unhead does not apply
 * `titleTemplate` to `ogTitle` the same way as the document title).
 */
export function applySiteTitleTemplate(
  titleChunk: string | null | undefined,
  siteName: string,
): string {
  const site = siteName.trim();
  const chunk = titleChunk?.trim() ?? "";
  if (chunk && site) return `${chunk} | ${site}`;
  if (chunk) return chunk;
  return site;
}
