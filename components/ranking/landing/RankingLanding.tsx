import { RankingExperience } from '@/components/ranking/landing/RankingExperience'
import {
  getRankingCreators,
  getRankingWorks,
  RANKING_WORKS,
  type RankingRouteState,
} from '@/lib/ranking-page-data'

export function RankingLanding({ state }: { state: RankingRouteState }) {
  const works = state.view === 'overview' ? RANKING_WORKS : getRankingWorks(state)
  const creators = state.view === 'creators' ? getRankingCreators(state) : []

  return <RankingExperience state={state} works={works} creators={creators} />
}
