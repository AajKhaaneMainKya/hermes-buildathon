'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { TrackId } from '@/lib/types'
import { TRACKS } from '@/lib/tracks'
import { toast } from '@/components/shared/Toast'
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

export default function MentorRegisterTab({ mentorName }: { mentorName: string }) {
  const { state, addTeam, notify } = useApp()
  const [entryType, setEntryType] = useState<'team' | 'solo'>('team')
  const [name, setName] = useState('')
  const [project, setProject] = useState('')
  const [members, setMembers] = useState('')
  const [track, setTrack] = useState<TrackId>('virality')

  const myZone = state.zones.find((z) => z.mentorName === mentorName)

  const handleAdd = () => {
    if (!name.trim() || !myZone) return
    const resolvedMembers = entryType === 'solo' ? name.trim() : members.trim()
    addTeam({
      id: crypto.randomUUID(),
      name: name.trim(),
      project: project.trim(),
      members: resolvedMembers,
      zoneId: myZone.id,
      track,
      status: 'building',
      type: entryType,
      mentorNotes: '',
      mentorScores: {},
      mentorLock: null,
      mentorLockReason: null,
    })
    notify(`[Registration] ${name.trim()} registered in ${myZone.name}`, 'registration')
    toast.success(entryType === 'solo' ? 'Participant registered' : 'Team registered')
    setName('')
    setProject('')
    setMembers('')
  }

  if (!myZone) {
    return (
      <Card className="border-amber-700 bg-amber-950/40">
        <CardContent className="p-4 text-sm text-amber-200">
          You have not been assigned a zone yet. Ask the host to assign you one in Setup.
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-zinc-100">Register a team</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Competing as:</span>
          <div className="flex gap-1.5">
            <Button
              type="button"
              size="sm"
              variant={entryType === 'team' ? 'default' : 'outline'}
              onClick={() => setEntryType('team')}
            >
              Team
            </Button>
            <Button
              type="button"
              size="sm"
              variant={entryType === 'solo' ? 'default' : 'outline'}
              onClick={() => setEntryType('solo')}
            >
              Solo
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            className="bg-zinc-800"
            placeholder={entryType === 'solo' ? 'Participant name' : 'Team name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            className="bg-zinc-800"
            placeholder={entryType === 'solo' ? 'Idea title (optional)' : 'Project name'}
            value={project}
            onChange={(e) => setProject(e.target.value)}
          />
        </div>
        {entryType === 'solo' ? (
          <Input className="bg-zinc-800 text-zinc-500" placeholder="Name" value={name} disabled />
        ) : (
          <Input
            className="bg-zinc-800"
            placeholder="Members (comma separated)"
            value={members}
            onChange={(e) => setMembers(e.target.value)}
          />
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Zone</label>
            <div className="flex h-9 items-center rounded-md border border-zinc-700 bg-zinc-800 px-3 text-sm text-zinc-300">
              {myZone.name}
            </div>
          </div>
          <Select value={track} onValueChange={(v) => setTrack(v as TrackId)}>
            <SelectTrigger className="w-full bg-zinc-800">
              <SelectValue placeholder="Track">
                {(v: string) => (v ? TRACKS[v]?.name : 'Track')}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.values(TRACKS).map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAdd}>{entryType === 'solo' ? 'Register participant' : 'Register team'}</Button>
      </CardContent>
    </Card>
  )
}
