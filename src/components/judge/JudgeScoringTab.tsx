'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useSession } from '@/context/SessionContext'
import ScoringCard from '@/components/shared/ScoringCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function JudgeRecommendations({ judgeId }: { judgeId: string }) {
  const { state, setJudgeRecommendations, notify } = useApp()
  const [selection, setSelection] = useState<string[]>(state.judgeRecommendations[judgeId] || [])

  const toggle = (teamId: string) => {
    setSelection((prev) => {
      if (prev.includes(teamId)) return prev.filter((id) => id !== teamId)
      if (prev.length >= 3) return prev
      return [...prev, teamId]
    })
  }

  const submit = () => {
    setJudgeRecommendations(judgeId, selection)
    const judgeName = state.judges.find((j) => j.id === judgeId)?.name || judgeId
    const names = selection.length
      ? selection.map((id) => state.teams.find((t) => t.id === id)?.name).filter(Boolean).join(', ')
      : 'none'
    notify(`[Judge recommendations] ${judgeName}: ${names}`, 'status')
  }

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-zinc-100">Recommendations ({selection.length}/3)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {state.teams.length === 0 && <p className="text-sm text-zinc-500">No teams registered yet.</p>}
        {state.teams.map((t) => {
          const checked = selection.includes(t.id)
          return (
            <label key={t.id} className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={checked}
                disabled={!checked && selection.length >= 3}
                onChange={() => toggle(t.id)}
              />
              {t.name}
              {checked && (
                <Badge variant="outline" className="border-amber-600 text-amber-300">
                  recommended
                </Badge>
              )}
            </label>
          )
        })}
        <div className="pt-2">
          <Button onClick={submit}>{selection.length === 0 ? 'Submit: no recommendations' : 'Submit recommendations'}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function JudgeScoringTab() {
  const { state, setJudgeScore } = useApp()
  const { currentJudgeId } = useSession()

  const teams = [...state.teams].sort((a, b) => {
    const aShort = state.shortlist.includes(a.id) ? 0 : 1
    const bShort = state.shortlist.includes(b.id) ? 0 : 1
    return aShort - bShort
  })

  if (!currentJudgeId) {
    return <p className="text-sm text-zinc-500">Log in as a registered judge to score teams.</p>
  }

  return (
    <div className="space-y-4">
      <JudgeRecommendations judgeId={currentJudgeId} />

      {teams.length === 0 && <p className="text-sm text-zinc-500">No teams registered yet.</p>}
      {teams.map((t) => (
        <div key={t.id} className="space-y-1">
          {state.shortlist.includes(t.id) && (
            <Badge variant="outline" className="border-amber-600 text-amber-300">
              shortlisted
            </Badge>
          )}
          <ScoringCard
            team={t}
            scores={state.judgeScores[currentJudgeId]?.[t.id] || {}}
            onChange={(param, level) => setJudgeScore(currentJudgeId, t.id, param, level)}
            onOverflow={(param, value) => setJudgeScore(currentJudgeId, t.id, `${param}_overflow`, value)}
            onPowerup={(id, checked) => setJudgeScore(currentJudgeId, t.id, `pu_${id}`, checked)}
            onRaw={(param, value) => setJudgeScore(currentJudgeId, t.id, param, value)}
            onCrossChange={(param, level) => setJudgeScore(currentJudgeId, t.id, `${param}_cross`, level)}
            showSpoofCheck
          />
        </div>
      ))}
    </div>
  )
}
