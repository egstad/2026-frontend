/**
 * Sanity image utilities
 * Optimized for all devices from mobile to 4K
 */

interface ImageUrlOptions {
  width: number
  height?: number
  quality?: number
  dpr?: number
  fit?: 'clip' | 'crop' | 'fill' | 'fillmax' | 'max' | 'scale' | 'min'
}

/**
 * Quality scales with display size and device pixel ratio.
 *
 * Larger display = more visible detail = higher quality.
 * Higher DPR = smaller individual pixels = artifacts less visible,
 * so we reduce quality for a significant file size win with no
 * perceptible loss.
 */
function getQualityForWidth(width: number, dpr: number = 1): number {
  let q: number
  if (width <= 600) q = 75
  else if (width <= 1200) q = 80
  else if (width <= 2000) q = 85
  else q = 90

  if (dpr >= 3) q -= 10
  else if (dpr >= 2) q -= 5

  return Math.max(q, 60)
}

/**
 * Build a Sanity image URL.
 *
 * When `dpr` is provided (1–3), Sanity multiplies `w` server-side
 * so the CDN serves exactly `width × dpr` physical pixels.
 * Combined with `auto=format`, the CDN negotiates avif/webp/jpeg
 * based on the browser's Accept header.
 */
export function sanityImageUrl(baseUrl: string, options: ImageUrlOptions): string {
  const {width, height, quality, dpr, fit = 'clip'} = options
  const effectiveDpr = dpr ? Math.min(Math.ceil(dpr), 3) : 1
  const q = quality ?? getQualityForWidth(width, effectiveDpr)

  let url = `${baseUrl}?w=${width}&auto=format&q=${q}&fit=${fit}`
  if (height) url += `&h=${height}`
  if (effectiveDpr > 1) url += `&dpr=${effectiveDpr}`
  return url
}

/**
 * Build srcset string for responsive images
 */
export function sanityImageSrcset(
  baseUrl: string,
  widths: number[],
  options: Omit<ImageUrlOptions, 'width'> = {},
): string {
  return widths
    .map((w) => {
      const q = options.quality ?? getQualityForWidth(w)
      return `${sanityImageUrl(baseUrl, {...options, width: w, quality: q})} ${w}w`
    })
    .join(', ')
}

/**
 * Srcset widths covering all devices from mobile to 4K
 * Same widths used everywhere for cache consistency
 *
 * Mobile (320-480px × 3x DPR) → picks ~1200w
 * Tablet (768-1024px × 2x DPR) → picks ~2000w
 * Desktop (1280-1920px × 2x DPR) → picks ~3200w
 * 4K (3840px × 1x DPR) → picks 4000w
 */
export const SRCSET_WIDTHS = [400, 600, 800, 1200, 1600, 2000, 2400, 3200, 4000]

/**
 * Compute the URL that WorkMediaLightbox will use when it opens this image,
 * based on current viewport dimensions, the asset's aspect ratio, and the
 * optional natural-size cap (prevents upscaling past source resolution).
 *
 * Mirrors the contain-fit + cap logic in applyFlipDimensions exactly so the
 * URL is byte-for-byte identical to what upgradeImgSrcset will set — meaning
 * a preload started here will be a guaranteed HTTP cache hit.
 *
 * Returns null on the server or for missing inputs.
 */
export function lightboxImageUrl(
  imageUrl: string,
  aspectRatio: number,
  opts: { maxNaturalW?: number; maxNaturalH?: number } = {},
): string | null {
  if (!import.meta.client || !imageUrl || !aspectRatio) return null

  const sw = window.innerWidth
  const vh = window.innerHeight
  const naturalH = sw / aspectRatio
  let w = naturalH <= vh ? sw : vh * aspectRatio
  let h = naturalH <= vh ? naturalH : vh

  const { maxNaturalW, maxNaturalH } = opts
  if (maxNaturalW !== undefined || maxNaturalH !== undefined) {
    const scaleByW = maxNaturalW !== undefined && w > maxNaturalW ? maxNaturalW / w : 1
    const scaleByH = maxNaturalH !== undefined && h > maxNaturalH ? maxNaturalH / h : 1
    const scale = Math.min(scaleByW, scaleByH)
    if (scale < 1) {
      w = Math.round(w * scale)
      // h scaled proportionally but not needed for the URL
    }
  }

  // physicalW already accounts for DPR — do NOT pass dpr to sanityImageUrl.
  // Sanity's dpr param multiplies w server-side, so passing both would serve
  // cssW × dpr² pixels (up to 4× more data than the display needs).
  const dpr = Math.min(Math.ceil(window.devicePixelRatio || 1), 3)
  const physicalW = Math.round(w * dpr)
  const targetW = SRCSET_WIDTHS.find((width) => width >= physicalW) ?? SRCSET_WIDTHS.at(-1) ?? 4000

  return sanityImageUrl(imageUrl, { width: targetW })
}

/**
 * Build a Mux thumbnail URL
 */
export function muxThumbnailUrl(
  playbackId: string,
  options: {width?: number; height?: number; time?: number} = {},
): string {
  const {width = 640, height, time = 0} = options
  let url = `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${width}&time=${time}`
  if (height) {
    url += `&height=${height}&fit_mode=crop`
  }
  return url
}

/**
 * Build Mux thumbnail srcset
 */
export function muxThumbnailSrcset(
  playbackId: string,
  widths: number[],
  options: {square?: boolean} = {},
): string {
  return widths
    .map((w) => {
      const height = options.square ? w : undefined
      return `${muxThumbnailUrl(playbackId, {width: w, height})} ${w}w`
    })
    .join(', ')
}
