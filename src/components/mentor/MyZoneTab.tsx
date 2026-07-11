'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { TeamStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const LOCK_REASONS = ['misalignment', 'pivoting', 'unclear', 'other']

export default function MyZoneTab({ mentorName }: { mentorName: string }) {
  const {
    state,
    updateTeamStatus,
    setMentorNote,
    setIdeaLock,
    setMentorRecommendations,
    notify,
  } = useApp()
  const [flagReason, setFlagReason] = useState(LOCK_REASONS[0])
  const [flagText, setFlagText] = useState('')

  const myZones = state.zones.filter((z) => z.mentorName === mentorName)
  const myTeams = state.teams.filter((t) => myZones.some((z) => z.id === t.zoneId))

  const currentLockStatus = state.ideaLockStatus[mentorName] || null
  const currentRecs = useMemo(() => state.mentorRecommendations[mentorName] || [], [state.mentorRecommendations, mentorName])
  const [recSelection, setRecSelection] = useState<string[]>(currentRecs)

  const confirmLocked = () => {
    setIdeaLock(mentorName, 'yes')
    notify(`[Idea lock] ${mentorName}: all ideas locked.`, 'idea_lock')
  }

  const flagIssue = () => {
    setIdeaLock(mentorName, 'no')
    notify(`[Idea lock] ${mentorName} flagged an issue: ${flagReason} — ${flagText || 'no details'}`, 'idea_lock')
    setFlagText('')
  }

  const toggleRec = (teamId: string) => {
    setRecSelection((prev) => {
      if (prev.includes(teamId)) return prev.filter((id) => id !== teamId)
      if (prev.length >= 3) return prev
      return [...prev, teamId]
    })
  }

  const submitRecs = () => {
    setMentorRecommendations(mentorName, recSelection)
    const names = recSelection.length
      ? recSelection.map((id) => state.teams.find((t) => t.id === id)?.name).filter(Boolean).join(', ')
      : 'none'
    notify(`[Mentor recommendations] ${mentorName}: ${names}`, 'status')
  }

  return (
    <div className="space-y-6">
      {currentLockStatus === 'pending' && (
        <Card className="border-amber-700 bg-amber-950">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-amber-200">
              Host has triggered an idea lock check. Confirm all your teams have locked their ideas.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={confirmLocked}>
                All locked
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentLockStatus !== 'yes' && (
        <Card className="border-zinc-700 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-100">Flag an idea-lock issue</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 sm:flex-row">
            <Select value={flagReason} onValueChange={(v) => setFlagReason((v ?? ""))}>
              <SelectTrigger className="w-full bg-zinc-800 sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOCK_REASONS.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              className="bg-zinc-800"
              placeholder="Details..."
              value={flagText}
              onChange={(e) => setFlagText(e.target.value)}
            />
            <Button variant="outline" onClick={flagIssue}>
              Flag issue
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">
            My zone{myZones.length > 0 ? ` — ${myZones.map((z) => z.name).join(', ')}` : ''}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {myTeams.length === 0 && <p className="text-sm text-zinc-500">No teams assigned to your zone yet.</p>}
          {myTeams.map((t) => (
            <div key={t.id} className="space-y-2 rounded-md border border-zinc-800 bg-zinc-950 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-semibold text-zinc-100">{t.name}</div>
                  <div className="text-xs text-zinc-500">{t.project}</div>
                </div>
                <Select value={t.status} onValueChange={(v) => updateTeamStatus(t.id, v as TeamStatus)}>
                  <SelectTrigger size="sm" className="w-36 bg-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(['building', 'locked', 'scoring', 'shortlisted', 'eliminated'] as TeamStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                className="bg-zinc-800"
                placeholder="Notes on this team..."
                value={t.mentorNotes}
                onChange={(e) => setMentorNote(t.id, e.target.value)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Recommendations ({recSelection.length}/3)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {myTeams.map((t) => {
            const checked = recSelection.includes(t.id)
            return (
              <label key={t.id} className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!checked && recSelection.length >= 3}
                  onChange={() => toggleRec(t.id)}
                />
                {t.name}
                {checked && (
                  <Badge variant="outline" className="border-emerald-700 text-emerald-300">
                    recommended
                  </Badge>
                )}
              </label>
            )
          })}
          <div className="flex gap-2 pt-2">
            <Button onClick={submitRecs}>
              {recSelection.length === 0 ? 'Submit: no recommendations' : 'Submit recommendations'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
