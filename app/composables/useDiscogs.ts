/**
 * Discogs API composable
 * Fetch a public user's collection from Discogs
 * Uses Nuxt's $fetch for SSR compatibility
 */

const DISCOGS_API = 'https://api.discogs.com'
const USER_AGENT = 'egstad-portfolio/1.0'

export interface DiscogsArtist {
  name: string
  id: number
}

export interface DiscogsLabel {
  name: string
  catno: string
  id: number
}

export interface DiscogsFormat {
  name: string
  qty: string
  descriptions?: string[]
}

export interface DiscogsBasicInformation {
  id: number
  title: string
  year: number
  thumb: string
  cover_image: string
  formats: DiscogsFormat[]
  labels: DiscogsLabel[]
  artists: DiscogsArtist[]
  genres: string[]
  styles: string[]
}

export interface DiscogsRelease {
  id: number
  instance_id: number
  date_added: string
  rating: number
  basic_information: DiscogsBasicInformation
}

export interface DiscogsCollectionResponse {
  pagination: {
    page: number
    pages: number
    per_page: number
    items: number
  }
  releases: DiscogsRelease[]
}

export function useDiscogs() {
  const headers = {
    'User-Agent': USER_AGENT,
  }

  /**
   * Fetch a page of a user's collection (folder 0 = "All")
   */
  async function getCollection(
    username: string,
    options: {page?: number; perPage?: number; sort?: 'added' | 'artist' | 'title' | 'year'; sortOrder?: 'asc' | 'desc'} = {},
  ): Promise<DiscogsCollectionResponse> {
    const {page = 1, perPage = 50, sort = 'added', sortOrder = 'desc'} = options

    return $fetch<DiscogsCollectionResponse>(`${DISCOGS_API}/users/${username}/collection/folders/0/releases`, {
      headers,
      params: {page, per_page: perPage, sort, sort_order: sortOrder},
    })
  }

  /**
   * Fetch ALL releases in a user's collection (handles pagination automatically)
   */
  async function getAllCollectionReleases(
    username: string,
    options: {sort?: 'added' | 'artist' | 'title' | 'year'; sortOrder?: 'asc' | 'desc'} = {},
  ): Promise<DiscogsRelease[]> {
    const allReleases: DiscogsRelease[] = []
    let page = 1
    let hasMore = true

    while (hasMore) {
      const response = await getCollection(username, {...options, page, perPage: 100})
      allReleases.push(...response.releases)

      hasMore = page < response.pagination.pages
      page++
    }

    return allReleases
  }

  return {
    getCollection,
    getAllCollectionReleases,
  }
}

/**
 * Async data composable for fetching a user's full collection
 */
export function useDiscogsCollection(
  username: string,
  options: {sort?: 'added' | 'artist' | 'title' | 'year'; sortOrder?: 'asc' | 'desc'} = {},
) {
  const discogs = useDiscogs()

  return useAsyncData(`discogs-collection-${username}`, () => discogs.getAllCollectionReleases(username, options))
}
