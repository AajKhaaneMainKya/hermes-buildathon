'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import ScoringCard from '@/components/shared/ScoringCard'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ScoringTab() {
  const { state, setHostScore } = useApp()
  const [teamId, setTeamId] = useState(state.teams[0]?.id || '')

  const team = state.teams.find((t) => t.id === teamId)

  return (
    <div className="space-y-4">
      <Select value={teamId} onValueChange={(v) => setTeamId((v ?? ""))}>
        <SelectTrigger className="w-full bg-zinc-800 sm:w-72">
          <SelectValue placeholder="Select a team to score" />
        </SelectTrigger>
        <SelectContent>
          {state.teams.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!team && <p className="text-sm text-zinc-500">Select a team above to begin scoring.</p>}

      {team && (
        <ScoringCard
          team={team}
          scores={state.hostScores[team.id] || {}}
          onChange={(param, level) => setHostScore(team.id, param, level)}
          onOverflow={(param, value) => setHostScore(team.id, `${param}_overflow`, value)}
          onPowerup={(id, checked) => setHostScore(team.id, `pu_${id}`, checked)}
          onRaw={(param, value) => setHostScore(team.id, param, value)}
          onCrossChange={(param, level) => setHostScore(team.id, `${param}_cross`, level)}
          showSpoofCheck
        />
      )}
    </div>
  )
}
