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
  name: string
  slug: {current: string}
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

export interface Media {
  _id: string
  _type: 'media'
  _createdAt?: string
  title: string
  slug: {current: string}
  mediaType: 'image' | 'video'
  image?: SanityImage
  video?: MuxVideo
  alt?: string
  caption?: any[]
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

export interface Log {
  _id: string
  _type: 'log'
  title: string
  slug: {current: string}
  date: string
  content?: any[]
}
