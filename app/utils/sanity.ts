import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url/lib/types/types'

export const sanityClient = createClient({
  projectId: 'p9yhyed1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const builder = createImageUrlBuilder(sanityClient)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}

// Mux video helpers
export function getMuxThumbnail(
  playbackId: string,
  options?: {width?: number; height?: number; time?: number},
) {
  const {width = 640, height = 360, time = 0} = options || {}
  return `https://image.mux.com/${playbackId}/thumbnail.jpg?width=${width}&height=${height}&time=${time}`
}

export function getMuxAnimatedGif(playbackId: string, options?: {width?: number; fps?: number}) {
  const {width = 320, fps = 15} = options || {}
  return `https://image.mux.com/${playbackId}/animated.gif?width=${width}&fps=${fps}`
}

export function getMuxStreamUrl(playbackId: string, options?: {defaultSubtitleLang?: string}) {
  const base = `https://stream.mux.com/${playbackId}.m3u8`
  if (options?.defaultSubtitleLang) {
    return `${base}?default_subtitles_lang=${options.defaultSubtitleLang}`
  }
  return base
}
