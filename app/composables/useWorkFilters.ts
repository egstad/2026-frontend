import { sortFromQuery, viewFromQuery } from '~/utils/workQuery'
import type { SortOption, ViewOption } from '~/utils/workQuery'
import { useArtifactStore } from '~/stores/artifact'

export function useWorkFilters() {
  const route = useRoute()
  const router = useRouter()
  const artifactStore = useArtifactStore()

  const activeSort = computed(() => sortFromQuery(route.query.s))
  const activeView = computed(() => viewFromQuery(route.query.v))

  function buildQuery(patch: Record<string, string | undefined>) {
    const q: Record<string, string> = {}
    for (const key of ['c', 's', 'v'] as const) {
      const val = Object.hasOwn(patch, key)
        ? patch[key]
        : (route.query[key] as string | undefined)
      if (val) q[key] = val
    }
    return q
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function setSort(option: SortOption) {
    if (option === 'random' && activeSort.value === 'random') {
      artifactStore.reshuffle()
    }
    router.push({
      query: buildQuery({ s: option === 'random' ? undefined : option }),
    })
    scrollToTop()
  }

  function setView(option: ViewOption) {
    router.push({
      query: buildQuery({ v: option === 'inline' ? undefined : option }),
    })
    scrollToTop()
  }

  return { activeSort, activeView, setSort, setView }
}
