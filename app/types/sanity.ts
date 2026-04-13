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

export interface Artifact {
  _id: string
  _type: 'artifact'
  _createdAt?: string
  title: string
  slug: {current: string}
  mediaType: 'image' | 'video'
  image?: SanityImage
  video?: MuxVideo
  alt?: string
  caption?: any[]
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

export interface Log {
  _id: string
  _type: 'log'
  title: string
  slug: {current: string}
  date: string
  content?: any[]
}
