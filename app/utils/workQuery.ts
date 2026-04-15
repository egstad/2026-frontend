import type {LocationQueryValue} from 'vue-router'

export type SortOption = 'random' | 'newest' | 'oldest'
export type ViewOption = 'inline' | 'feed' | 'text'

const VALID_SORTS: SortOption[] = ['random', 'newest', 'oldest']
const VALID_VIEWS: ViewOption[] = ['inline', 'feed', 'text']

function rawFromQuery(v: LocationQueryValue | LocationQueryValue[] | undefined): string | undefined {
  if (v == null) return undefined
  if (Array.isArray(v)) {
    for (const entry of v) {
      if (entry == null) continue
      const s = String(entry).trim()
      if (s.length) return s
    }
    return undefined
  }
  const s = String(v).trim()
  return s.length ? s : undefined
}

export function sortFromQuery(v: LocationQueryValue | LocationQueryValue[] | undefined): SortOption {
  const raw = rawFromQuery(v)
  return VALID_SORTS.includes(raw as SortOption) ? (raw as SortOption) : 'random'
}

export function viewFromQuery(v: LocationQueryValue | LocationQueryValue[] | undefined): ViewOption {
  const raw = rawFromQuery(v)
  return VALID_VIEWS.includes(raw as ViewOption) ? (raw as ViewOption) : 'inline'
}

export function categoryFromQuery(v: LocationQueryValue | LocationQueryValue[] | undefined): string | undefined {
  return rawFromQuery(v)
}
