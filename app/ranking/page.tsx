import { RankingLanding } from '@/components/ranking/landing/RankingLanding'
import {
  VALID_RANKING_GENRES,
  VALID_RANKING_SORTS,
  VALID_RANKING_TYPES,
  VALID_RANKING_VIEWS,
  getRankingCreators,
  getRankingWorks,
  type RankingContentType,
  type RankingGenreKey,
  type RankingRouteState,
  type RankingSort,
  type RankingView,
} from '@/lib/ranking-page-data'

type SearchParams = Promise<{
  view?: string | string[]
  type?: string | string[]
  sort?: string | string[]
  genre?: string | string[]
  page?: string | string[]
}>

const first = (value?: string | string[]) => Array.isArray(value) ? value[0] : value

function normalizeState(query: Awaited<SearchParams>): RankingRouteState {
  const rawView = first(query.view)
  const rawType = first(query.type)
  const rawSort = first(query.sort)
  const rawGenre = first(query.genre)
  const rawPage = Number.parseInt(first(query.page) ?? '1', 10)
  const genre = rawGenre && VALID_RANKING_GENRES.has(rawGenre as RankingGenreKey)
    ? rawGenre as RankingGenreKey
    : null

  let state: RankingRouteState = {
    view: 'overview',
    type: null,
    sort: null,
    genre,
    page: 1,
  }

  if (rawView && VALID_RANKING_VIEWS.has(rawView as Exclude<RankingView, 'overview'>)) {
    state = { ...state, view: rawView as RankingView }
  } else if (
    rawType && rawSort &&
    VALID_RANKING_TYPES.has(rawType as RankingContentType) &&
    VALID_RANKING_SORTS.has(rawSort as RankingSort)
  ) {
    state = {
      ...state,
      type: rawType as RankingContentType,
      sort: rawSort as RankingSort,
    }
  } else if (rawView || rawType || rawSort) {
    return { view: 'overview', type: null, sort: null, genre: null, page: 1 }
  }

  if (state.view !== 'overview' || state.type) {
    const total = state.view === 'creators'
      ? getRankingCreators(state).length
      : getRankingWorks(state).length
    const totalPages = Math.max(1, Math.ceil(total / 20))
    state.page = Number.isFinite(rawPage) ? Math.min(totalPages, Math.max(1, rawPage)) : 1
  }

  return state
}

export default async function RankingPage({ searchParams }: { searchParams: SearchParams }) {
  const state = normalizeState(await searchParams)
  return <RankingLanding state={state} />
}
