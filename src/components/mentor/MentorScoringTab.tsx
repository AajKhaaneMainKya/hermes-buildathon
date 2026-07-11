'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import ScoringCard from '@/components/shared/ScoringCard'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function MentorScoringTab({ mentorName }: { mentorName: string }) {
  const { state, setMentorScore, setMentorNote } = useApp()

  const myZones = state.zones.filter((z) => z.mentorName === mentorName)
  const myTeams = state.teams.filter((t) => myZones.some((z) => z.id === t.zoneId))
  const otherTeams = state.teams.filter((t) => !myZones.some((z) => z.id === t.zoneId))

  const [crossTeamId, setCrossTeamId] = useState('')
  const crossTeam = otherTeams.find((t) => t.id === crossTeamId)

  return (
    <div className="space-y-6">
      {myTeams.length === 0 && <p className="text-sm text-zinc-500">No teams in your zone yet.</p>}
      {myTeams.map((t) => (
        <ScoringCard
          key={t.id}
          team={t}
          scores={t.mentorScores}
          onChange={(param, level) => setMentorScore(t.id, param, level)}
          onOverflow={(param, value) => setMentorScore(t.id, `${param}_overflow`, value)}
          onPowerup={(id, checked) => setMentorScore(t.id, `pu_${id}`, checked)}
          onRaw={(param, value) => setMentorScore(t.id, param, value)}
          onCrossChange={(param, level) => setMentorScore(t.id, `${param}_cross`, level)}
          onNotes={(text) => setMentorNote(t.id, text)}
          showSpoofCheck
        />
      ))}

      {state.floorOpen && (
        <div className="space-y-3 rounded-md border border-emerald-800 bg-emerald-950/40 p-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-emerald-700 text-emerald-300">
              Floor open
            </Badge>
            <span className="text-sm text-emerald-200">Score a team outside your zone.</span>
          </div>
          <Select value={crossTeamId} onValueChange={(v) => setCrossTeamId((v ?? ""))}>
            <SelectTrigger className="w-full bg-zinc-800 sm:w-72">
              <SelectValue placeholder="Select a team">
                {(v: string) => (v ? otherTeams.find((t) => t.id === v)?.name : 'Select a team')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {otherTeams.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {crossTeam && (
            <ScoringCard
              team={crossTeam}
              scores={crossTeam.mentorScores}
              onChange={(param, level) => setMentorScore(crossTeam.id, param, level)}
              onOverflow={(param, value) => setMentorScore(crossTeam.id, `${param}_overflow`, value)}
              onPowerup={(id, checked) => setMentorScore(crossTeam.id, `pu_${id}`, checked)}
              onRaw={(param, value) => setMentorScore(crossTeam.id, param, value)}
              onCrossChange={(param, level) => setMentorScore(crossTeam.id, `${param}_cross`, level)}
              onNotes={(text) => setMentorNote(crossTeam.id, text)}
              showSpoofCheck
            />
          )}
        </div>
      )}
    </div>
  )
}
