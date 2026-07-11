'use client'

import { useApp } from '@/context/AppContext'
import Leaderboard from '@/components/shared/Leaderboard'

export default function LeaderboardTab() {
  const { state, setRankingBasis } = useApp()

  return (
    <Leaderboard
      teams={state.teams}
      zones={state.zones}
      hostScores={state.hostScores}
      judgeScores={state.judgeScores}
      basis={state.rankingBasis}
      onBasisChange={setRankingBasis}
      eventName={state.eventName}
    />
  )
}
