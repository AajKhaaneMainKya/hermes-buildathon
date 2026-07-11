'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { calcScore } from '@/lib/scoring'
import ScoringCard from '@/components/shared/ScoringCard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const STEPS = [
  { step: 1 as const, label: 'Collect recommendations' },
  { step: 2 as const, label: 'Score each recommendation' },
  { step: 3 as const, label: 'Open the floor' },
  { step: 4 as const, label: 'Select top 5' },
]

export default function JudgingTab() {
  const { state, setJudgingStep, setHostScore, setFloorOpen, setShortlist, updateTeamStatus, notify } = useApp()
  const [selected, setSelected] = useState<string[]>(state.shortlist)

  const recommendedTeamIds = useMemo(() => {
    const ids = new Set<string>()
    Object.values(state.mentorRecommendations).forEach((teamIds) => teamIds.forEach((id) => ids.add(id)))
    return Array.from(ids)
  }, [state.mentorRecommendations])

  const recommendationCounts = useMemo(() => {
    const counts: Record<string, string[]> = {}
    Object.entries(state.mentorRecommendations).forEach(([mentorName, teamIds]) => {
      teamIds.forEach((id) => {
        counts[id] = counts[id] || []
        counts[id].push(mentorName)
      })
    })
    return counts
  }, [state.mentorRecommendations])

  const ranked = useMemo(() => {
    return state.teams
      .map((t) => ({ team: t, result: calcScore(state.hostScores[t.id] || {}, t.track) }))
      .sort((a, b) => b.result.total - a.result.total)
  }, [state.teams, state.hostScores])

  const openFloor = () => {
    setFloorOpen(true)
    notify(
      '[Floor open] Cross-zone input is now valid. If you saw a strong team outside your zone, score it now.',
      'broadcast'
    )
  }

  const toggleSelect = (teamId: string) => {
    setSelected((prev) => {
      if (prev.includes(teamId)) return prev.filter((id) => id !== teamId)
      if (prev.length >= 5) return prev
      return [...prev, teamId]
    })
  }

  const announceTop5 = () => {
    if (selected.length !== 5) return
    setShortlist(selected)
    selected.forEach((id) => updateTeamStatus(id, 'shortlisted'))
    const names = selected.map((id) => state.teams.find((t) => t.id === id)?.name).filter(Boolean).join(', ')
    notify(`[Shortlist] Top 5 announced: ${names}`, 'shortlist')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((s) => (
          <button
            key={s.step}
            onClick={() => setJudgingStep(s.step)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              state.judgingStep === s.step
                ? 'border-violet-700 bg-violet-950 text-violet-300'
                : 'border-zinc-700 bg-zinc-800 text-zinc-400'
            }`}
          >
            {s.step}. {s.label}
          </button>
        ))}
      </div>

      {state.judgingStep === 1 && (
        <Card className="border-zinc-700 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-100">Step 1 — Collect recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recommendedTeamIds.length === 0 && (
              <p className="text-sm text-zinc-500">No mentor recommendations submitted yet.</p>
            )}
            {recommendedTeamIds.map((id) => {
              const team = state.teams.find((t) => t.id === id)
              if (!team) return null
              const mentors = recommendationCounts[id] || []
              return (
                <div key={id} className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <div>
                    <div className="text-sm font-semibold text-zinc-100">{team.name}</div>
                    <div className="text-xs text-zinc-500">recommended by {mentors.join(', ')}</div>
                  </div>
                  <Badge variant="outline" className="border-violet-700 text-violet-300">
                    {mentors.length}×
                  </Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {state.judgingStep === 2 && (
        <div className="space-y-4">
          {recommendedTeamIds.length === 0 && <p className="text-sm text-zinc-500">No recommended teams to score.</p>}
          {recommendedTeamIds.map((id) => {
            const team = state.teams.find((t) => t.id === id)
            if (!team) return null
            return (
              <div key={id} className="space-y-1">
                <p className="text-xs text-zinc-500">
                  Mentor notes: {team.mentorNotes || '—'} · Mentor lock: {team.mentorLock || 'pending'}
                </p>
                <ScoringCard
                  team={team}
                  scores={state.hostScores[team.id] || {}}
                  onChange={(param, level) => setHostScore(team.id, param, level)}
                  onOverflow={(param, value) => setHostScore(team.id, `${param}_overflow`, value)}
                  onPowerup={(pid, checked) => setHostScore(team.id, `pu_${pid}`, checked)}
                  onRaw={(param, value) => setHostScore(team.id, param, value)}
                  onCrossChange={(param, level) => setHostScore(team.id, `${param}_cross`, level)}
                  showSpoofCheck
                />
              </div>
            )
          })}
        </div>
      )}

      {state.judgingStep === 3 && (
        <Card className="border-zinc-700 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-100">Step 3 — Open the floor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-zinc-400">
              Opening the floor lets mentors score any team, not just their own zone.
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={state.floorOpen ? 'border-emerald-700 text-emerald-300' : 'border-zinc-600 text-zinc-400'}>
                {state.floorOpen ? 'Floor open' : 'Floor closed'}
              </Badge>
              <Button onClick={openFloor} disabled={state.floorOpen}>
                Open floor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {state.judgingStep === 4 && (
        <Card className="border-zinc-700 bg-zinc-900">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-zinc-100">Step 4 — Select top 5 ({selected.length}/5)</CardTitle>
            <Button onClick={announceTop5} disabled={selected.length !== 5}>
              Announce top 5
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {ranked.map(({ team, result }, i) => (
              <label
                key={team.id}
                className="flex cursor-pointer items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(team.id)}
                    onChange={() => toggleSelect(team.id)}
                    disabled={!selected.includes(team.id) && selected.length >= 5}
                  />
                  <span className="text-xs text-zinc-600">#{i + 1}</span>
                  <span className="text-sm font-medium text-zinc-200">{team.name}</span>
                </div>
                <span className="text-sm font-bold text-zinc-100">{result.total}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
