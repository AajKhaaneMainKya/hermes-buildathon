'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const ZONE_NAMES = ['Zone Alpha', 'Zone Beta', 'Zone Gamma']

export default function ZonesTab() {
  const { state, addZone, removeZone } = useApp()
  const [participantCount, setParticipantCount] = useState('')

  const handleGenerate = () => {
    const n = Number(participantCount) || 0
    if (n <= 0) return
    const count = Math.min(3, Math.ceil(n / 15))
    for (let i = 0; i < count; i++) {
      const mentor = state.mentors[i]
      addZone({
        id: crypto.randomUUID(),
        name: ZONE_NAMES[i],
        mentorName: mentor?.name || '',
        maxBuilders: Math.ceil(n / count),
      })
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Zone auto-suggest</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="number"
            className="bg-zinc-800 sm:w-48"
            placeholder="Participant count"
            value={participantCount}
            onChange={(e) => setParticipantCount(e.target.value)}
          />
          <Button onClick={handleGenerate}>Generate zones</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.zones.map((z) => {
          const teamCount = state.teams.filter((t) => t.zoneId === z.id).length
          const participantCountInZone = state.participants.filter((p) => p.zone === z.id).length
          return (
            <Card key={z.id} className="border-zinc-700 bg-zinc-900">
              <CardHeader>
                <CardTitle className="text-zinc-100">{z.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">Mentor</label>
                  <Select
                    value={z.mentorName || undefined}
                    onValueChange={(v) => {
                      removeZone(z.id)
                      addZone({ ...z, mentorName: v ?? '' })
                    }}
                  >
                    <SelectTrigger className="w-full bg-zinc-800">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      {state.mentors.map((m) => (
                        <SelectItem key={m.id} value={m.name}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-xs text-zinc-500">
                  {teamCount} teams · {participantCountInZone} participants · max {z.maxBuilders}
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeZone(z.id)}>
                  Remove zone
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {state.zones.length === 0 && <p className="text-sm text-zinc-500">No zones yet. Generate zones above.</p>}
    </div>
  )
}
