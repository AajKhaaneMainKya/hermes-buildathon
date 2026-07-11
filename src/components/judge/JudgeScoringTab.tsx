'use client'

import { useApp } from '@/context/AppContext'
import ScoringCard from '@/components/shared/ScoringCard'
import { Badge } from '@/components/ui/badge'

export default function JudgeScoringTab() {
  const { state, setJudgeScore } = useApp()

  const teams = [...state.teams].sort((a, b) => {
    const aShort = state.shortlist.includes(a.id) ? 0 : 1
    const bShort = state.shortlist.includes(b.id) ? 0 : 1
    return aShort - bShort
  })

  if (teams.length === 0) {
    return <p className="text-sm text-zinc-500">No teams registered yet.</p>
  }

  return (
    <div className="space-y-4">
      {teams.map((t) => (
        <div key={t.id} className="space-y-1">
          {state.shortlist.includes(t.id) && (
            <Badge variant="outline" className="border-amber-600 text-amber-300">
              shortlisted
            </Badge>
          )}
          <ScoringCard
            team={t}
            scores={state.judgeScores[t.id] || {}}
            onChange={(param, level) => setJudgeScore(t.id, param, level)}
            onOverflow={(param, value) => setJudgeScore(t.id, `${param}_overflow`, value)}
            onPowerup={(id, checked) => setJudgeScore(t.id, `pu_${id}`, checked)}
            onRaw={(param, value) => setJudgeScore(t.id, param, value)}
            onCrossChange={(param, level) => setJudgeScore(t.id, `${param}_cross`, level)}
            showSpoofCheck
          />
        </div>
      ))}
    </div>
  )
}
