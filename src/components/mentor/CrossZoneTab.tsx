'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function CrossZoneTab({ mentorName }: { mentorName: string }) {
  const { state, addCrossZoneFlag, notify } = useApp()

  const myZones = state.zones.filter((z) => z.mentorName === mentorName)
  const otherTeams = state.teams.filter((t) => !myZones.some((z) => z.id === t.zoneId))

  const [teamId, setTeamId] = useState('')
  const [reason, setReason] = useState('')

  const submitFlag = () => {
    const team = otherTeams.find((t) => t.id === teamId)
    if (!team || !reason.trim()) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    addCrossZoneFlag({ teamId: team.id, teamName: team.name, reason: reason.trim(), time })
    notify(`[Cross-zone flag] ${mentorName} flagged ${team.name}: ${reason.trim()}`, 'cross_zone')
    setReason('')
    setTeamId('')
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Flag a strong team outside your zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Select value={teamId} onValueChange={(v) => setTeamId((v ?? ""))}>
            <SelectTrigger className="w-full bg-zinc-800">
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
          <Textarea
            className="bg-zinc-800"
            placeholder="Why is this team worth flagging?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <Button onClick={submitFlag}>Submit flag</Button>
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">All cross-zone flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.crossZoneFlags.length === 0 && <p className="text-sm text-zinc-500">No flags yet.</p>}
          {state.crossZoneFlags.map((f, i) => (
            <div key={i} className="rounded-md border border-orange-800 bg-orange-950 px-3 py-2 text-sm text-orange-200">
              <span className="font-medium">{f.teamName}</span> — {f.reason}{' '}
              <span className="text-xs text-orange-400">{f.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
