export interface SanityImage {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface MuxVideo {
  _type: 'mux.video'
  asset: {
    _ref: string
    playbackId: string
    status: string
  }
}

export interface Tag {
  _id: string
  name: string
  slug: {current: string}
}

export interface Category {
  _id: string
  name: string
  slug: {current: string}
}

export interface Client {
  _id: string
  _type: 'client'
  name: string
  slug: {current: string}
  website?: string
  featured?: boolean
}

export interface ImageMetadata {
  dimensions?: {
    width: number
    height: number
    aspectRatio: number
  }
}

export interface VideoMetadata {
  aspectRatio?: string // Mux returns as "16:9" string format
}

export interface PortableTextMarkDefExternal {
  _key: string
  _type: 'link'
  href: string
}

export interface PortableTextMarkDefInternal {
  _key: string
  _type: 'internalLink'
  reference: {
    _type: 'page' | 'log' | 'artifact'
    slug: {current: string}
    title: string
  }
}

export type PortableTextMarkDef = PortableTextMarkDefExternal | PortableTextMarkDefInternal

export interface PortableTextSpanNode {
  _type: 'span'
  _key?: string
  text?: string
  marks?: string[]
}

export interface PortableTextBlock {
  _type: 'block'
  _key?: string
  style?: string
  listItem?: 'bullet' | 'number'
  level?: number
  children?: PortableTextSpanNode[]
  markDefs?: PortableTextMarkDef[]
}

export interface MediaEmbedMedia {
  mediaType: 'image' | 'video'
  alt?: string
  title?: string
  imageUrl?: string
  imageMeta?: ImageMetadata
  muxPlaybackId?: string
  videoMeta?: VideoMetadata
  autoplay?: boolean
}

export interface Artifact extends MediaEmbedMedia {
  _id: string
  _key?: string
  _type: 'artifact'
  _createdAt?: string
  title: string
  slug: {current: string}
  mediaType: 'image' | 'video'
  image?: SanityImage
  video?: MuxVideo
  alt?: string
  caption?: PortableTextBlock[]
  captionText?: string
  categories?: Category[]
  tags?: Tag[]
  clients?: Client[]
  autoplay?: boolean
  dateTaken?: string
  locationName?: string
  camera?: string
  lens?: string
  focalLength?: string
  aperture?: string
  shutterSpeed?: string
  iso?: number
  // Resolved URLs and metadata
  imageUrl?: string
  imageMeta?: ImageMetadata
  videoMeta?: VideoMetadata
  muxPlaybackId?: string
}

export interface WorkHistory {
  _id: string
  _type: 'workHistory'
  employer: string
  roles: string[]
  dateRange?: string
  mediaType?: 'image' | 'video'
  imageUrl?: string
  muxPlaybackId?: string
}

export interface Great {
  _id: string
  _type: 'great'
  name: string
  imageUrl?: string
}

export interface Portrait {
  _id: string
  _type: 'portrait'
  mediaType: 'image' | 'video'
  title?: string
  alt?: string
  autoplay?: boolean
  imageUrl?: string
  muxPlaybackId?: string
}

export type LogMediaSize = 'small' | 'default' | 'large' | 'full'

export interface LogInlineMedia extends MediaEmbedMedia {
  _type: 'media'
  _key: string
  size?: LogMediaSize
  caption?: PortableTextBlock[]
  // Raw image object — needed to apply crop/hotspot via urlFor()
  image?: SanityImage & { crop?: Record<string, number>; hotspot?: Record<string, number> }
}

export interface LogArtifactRef {
  _type: 'artifactRef'
  _key: string
  size?: LogMediaSize
  artifact?: Artifact
}

export interface LogGalleryItem extends MediaEmbedMedia {
  _type: 'artifact' | 'galleryMedia'
  _key?: string
  caption?: PortableTextBlock[]
}

export type LogGallerySize = 'small' | 'large'

export interface LogGallery {
  _type: 'gallery'
  _key: string
  size?: LogGallerySize
  items?: LogGalleryItem[]
}

export type LogKind = 'long-form' | 'short-form'

export interface LogAsset extends MediaEmbedMedia {
  mediaType: 'image' | 'video' | 'youtube'
  youtubeUrl?: string
  image?: SanityImage & { crop?: Record<string, number>; hotspot?: Record<string, number> }
}

export interface LogYouTube {
  _type: 'youtube'
  _key: string
  url: string
  size?: LogMediaSize
  caption?: PortableTextBlock[]
}

export interface Log {
  _id: string
  _type: 'log'
  kind?: LogKind
  title: string
  slug: {current: string}
  date: string
  excerpt?: string
  categories?: Category[]
  tags?: Tag[]
  // short-form
  asset?: LogAsset
  body?: PortableTextBlock[]
  // long-form
  content?: (PortableTextBlock | LogArtifactRef | LogInlineMedia | LogGallery | LogYouTube)[]
}

/** `_type == "page"` — fields match `useSanityPageSeo` GROQ projection */
export interface SanityPageSeo {
  metaTitle?: string | null
  metaDescription?: string | null
  ogImage?: Pick<SanityImage, 'asset'> | null
}
