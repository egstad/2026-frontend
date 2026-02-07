/**
 * Are.na API composable
 * Easily fetch channels and blocks from Are.na
 * Uses Nuxt's $fetch for SSR compatibility
 */

const ARENA_API = 'https://api.are.na/v2'

// Types
export interface ArenaUser {
  id: number
  slug: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  avatar: string
  avatar_image: {
    thumb: string
    display: string
  }
}

export interface ArenaSource {
  url?: string
  title?: string
  provider?: {
    name: string
    url: string
  }
}

export interface ArenaImage {
  filename: string
  content_type: string
  updated_at: string
  thumb: {url: string}
  square: {url: string}
  display: {url: string}
  large: {url: string}
  original: {
    url: string
    file_size: number
    file_size_display: string
  }
}

export interface ArenaBlock {
  id: number
  title: string | null
  updated_at: string
  created_at: string
  state: string
  comment_count: number
  generated_title: string
  content_html: string | null
  description_html: string | null
  visibility: string
  content: string | null
  description: string | null
  source: ArenaSource | null
  image: ArenaImage | null
  embed: {
    type: string
    title: string
    author_name: string
    author_url: string
    source_url: string
    thumbnail_url: string
    width: number
    height: number
    html: string
  } | null
  base_class: 'Block'
  class: 'Image' | 'Text' | 'Link' | 'Media' | 'Attachment' | 'Channel'
  user: ArenaUser
  position: number
  connected_at: string
  connected_by_user_id: number
}

export interface ArenaChannel {
  id: number
  title: string
  created_at: string
  updated_at: string
  added_to_at: string
  published: boolean
  open: boolean
  collaboration: boolean
  slug: string
  length: number
  kind: string
  status: string
  user_id: number
  metadata: {
    description: string | null
  }
  contents?: ArenaBlock[]
  user: ArenaUser
}

export interface ArenaChannelResponse extends ArenaChannel {
  contents: ArenaBlock[]
  base_class: 'Channel'
  page: number
  per: number
  current_page: number
  total_pages: number
}

interface UseArenaOptions {
  accessToken?: string
}

export function useArena(options: UseArenaOptions = {}) {
  const {accessToken} = options

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  /**
   * Fetch a channel by slug or ID
   */
  async function getChannel(slugOrId: string | number): Promise<ArenaChannel> {
    return $fetch<ArenaChannel>(`${ARENA_API}/channels/${slugOrId}`, {headers})
  }

  /**
   * Fetch channel contents with pagination
   * @param sort - 'position' (default) or 'updated_at'
   * @param direction - 'asc' or 'desc'
   */
  async function getChannelContents(
    slugOrId: string | number,
    options: {page?: number; per?: number; sort?: 'position' | 'updated_at'; direction?: 'asc' | 'desc'} = {},
  ): Promise<ArenaChannelResponse> {
    const {page = 1, per = 20, sort, direction} = options
    const params: Record<string, string | number> = {page, per}
    if (sort) params.sort = sort
    if (direction) params.direction = direction

    return $fetch<ArenaChannelResponse>(`${ARENA_API}/channels/${slugOrId}/contents`, {
      headers,
      params,
    })
  }

  /**
   * Fetch ALL contents from a channel (handles pagination automatically)
   */
  async function getAllChannelContents(
    slugOrId: string | number,
    options: {per?: number} = {},
  ): Promise<ArenaBlock[]> {
    const {per = 100} = options
    const allBlocks: ArenaBlock[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await getChannelContents(slugOrId, {page, per})
      allBlocks.push(...response.contents)

      hasMore = page < response.total_pages
      page++
    }

    return allBlocks
  }

  /**
   * Fetch a single block by ID
   */
  async function getBlock(blockId: number): Promise<ArenaBlock> {
    return $fetch<ArenaBlock>(`${ARENA_API}/blocks/${blockId}`, {headers})
  }

  /**
   * Search channels
   */
  async function searchChannels(
    query: string,
    options: {page?: number; per?: number} = {},
  ): Promise<{channels: ArenaChannel[]; total_pages: number}> {
    const {page = 1, per = 20} = options
    return $fetch<{channels: ArenaChannel[]; total_pages: number}>(`${ARENA_API}/search/channels`, {
      headers,
      params: {q: query, page, per},
    })
  }

  /**
   * Get user profile
   */
  async function getUser(userSlug: string): Promise<ArenaUser> {
    return $fetch<ArenaUser>(`${ARENA_API}/users/${userSlug}`, {headers})
  }

  /**
   * Get user's channels (uses user ID for better compatibility)
   */
  async function getUserChannels(
    userSlug: string,
    options: {page?: number; per?: number} = {},
  ): Promise<{channels: ArenaChannel[]; total_pages: number; length: number}> {
    const {page = 1, per = 20} = options
    // First get the user to get their ID
    const user = await getUser(userSlug)
    // Then fetch channels using the ID
    return $fetch<{channels: ArenaChannel[]; total_pages: number; length: number}>(
      `${ARENA_API}/users/${user.id}/channels`,
      {
        headers,
        params: {page, per},
      },
    )
  }

  return {
    getChannel,
    getChannelContents,
    getAllChannelContents,
    getBlock,
    searchChannels,
    getUserChannels,
  }
}

/**
 * Async data composable for fetching a channel
 */
export function useArenaChannel(slugOrId: string | number, options: UseArenaOptions = {}) {
  const arena = useArena(options)

  return useAsyncData(`arena-channel-${slugOrId}`, () => arena.getChannel(slugOrId))
}

/**
 * Async data composable for fetching channel contents
 */
export function useArenaChannelContents(
  slugOrId: string | number,
  options: UseArenaOptions & {page?: number; per?: number} = {},
) {
  const {page, per, ...arenaOptions} = options
  const arena = useArena(arenaOptions)

  return useAsyncData(`arena-channel-contents-${slugOrId}-${page}-${per}`, () =>
    arena.getChannelContents(slugOrId, {page, per}),
  )
}
