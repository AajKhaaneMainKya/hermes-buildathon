'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { TrackId, TeamStatus } from '@/lib/types'
import { TRACKS } from '@/lib/tracks'
import { csvFilename, downloadCSV } from '@/lib/exportCSV'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DownloadButton } from '@/components/shared/DownloadButton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STATUS_STYLES: Record<TeamStatus, string> = {
  building: 'border-zinc-600 bg-zinc-800 text-zinc-300',
  locked: 'border-blue-700 bg-blue-950 text-blue-300',
  scoring: 'border-violet-700 bg-violet-950 text-violet-300',
  shortlisted: 'border-amber-600 bg-amber-950 text-amber-300',
  eliminated: 'border-red-700 bg-red-950 text-red-300',
}

const LOCK_STYLES: Record<'pending' | 'yes' | 'no', string> = {
  pending: 'bg-amber-500',
  yes: 'bg-emerald-500',
  no: 'bg-red-500',
}

export default function TeamsTab() {
  const { state, addTeam, removeTeam, updateTeamStatus, setIdeaLock, notify } = useApp()
  const [entryType, setEntryType] = useState<'team' | 'solo'>('team')
  const [name, setName] = useState('')
  const [project, setProject] = useState('')
  const [members, setMembers] = useState('')
  const [zoneId, setZoneId] = useState('')
  const [track, setTrack] = useState<TrackId>('virality')

  const handleAdd = () => {
    if (!name.trim() || !zoneId) return
    addTeam({
      id: crypto.randomUUID(),
      name: name.trim(),
      project: project.trim(),
      members: entryType === 'solo' ? name.trim() : members.trim(),
      zoneId,
      track,
      status: 'building',
      type: entryType,
      mentorNotes: '',
      mentorScores: {},
      mentorLock: null,
      mentorLockReason: null,
    })
    notify(`[Registration] ${name.trim()} registered in ${state.zones.find((z) => z.id === zoneId)?.name || 'a zone'}`, 'registration')
    setName('')
    setProject('')
    setMembers('')
  }

  const triggerIdeaLockCheck = () => {
    state.mentors.forEach((m) => setIdeaLock(m.name, 'pending'))
    notify('Idea lock check: message all mentors — confirm every team has locked their idea, or flag an issue.', 'idea_lock')
  }

  const downloadTeams = () => {
    const rows = state.teams.map((t) => {
      const zone = state.zones.find((z) => z.id === t.zoneId)
      return {
        'Team name': t.name,
        Type: t.type === 'solo' ? 'Solo' : 'Team',
        'Project title': t.project,
        Members: t.members,
        Zone: zone?.name || '',
        Track: TRACKS[t.track].name,
        Status: t.status,
        'Idea locked': t.mentorLock === 'yes' ? 'yes' : 'no',
        'Mentor notes': t.mentorNotes,
      }
    })
    downloadCSV(csvFilename(state.eventName, 'teams'), rows)
  }

  return (
    <div className="space-y-6">
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
            <Input className="bg-zinc-800" placeholder="Members (comma separated)" value={members} onChange={(e) => setMembers(e.target.value)} />
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select value={zoneId} onValueChange={(v) => setZoneId((v ?? ""))}>
              <SelectTrigger className="w-full bg-zinc-800">
                <SelectValue placeholder="Zone">
                  {(v: string) => (v ? state.zones.find((z) => z.id === v)?.name : 'Zone')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {state.zones.map((z) => (
                  <SelectItem key={z.id} value={z.id}>
                    {z.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-zinc-100">Idea lock check</CardTitle>
          <Button size="sm" onClick={triggerIdeaLockCheck}>
            Trigger idea-lock check
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {state.mentors.length === 0 && <p className="text-sm text-zinc-500">No mentors registered.</p>}
            {state.mentors.map((m) => {
              const status = state.ideaLockStatus[m.name] || null
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300"
                >
                  {status && <span className={`h-2 w-2 rounded-full ${LOCK_STYLES[status]}`} />}
                  {!status && <span className="h-2 w-2 rounded-full bg-zinc-700" />}
                  <span>{m.name}</span>
                  {status === 'no' && <span className="text-red-400">flagged</span>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-zinc-100">Teams ({state.teams.length})</CardTitle>
          <DownloadButton label="Download teams CSV" onClick={downloadTeams} disabled={state.teams.length === 0} />
        </CardHeader>
        <CardContent className="space-y-2">
          {state.teams.length === 0 && <p className="text-sm text-zinc-500">No teams registered yet.</p>}
          {state.teams.map((t) => {
            const zone = state.zones.find((z) => z.id === t.zoneId)
            const memberCount = t.members.split(',').map((m) => m.trim()).filter(Boolean).length
            return (
              <div key={t.id}>
                <div className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
                      {t.name} <span className="font-normal text-zinc-500">— {t.project}</span>
                      {t.type === 'solo' && (
                        <Badge variant="outline" className="border-amber-600 text-amber-300">
                          Solo
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {zone?.name || 'No zone'} · {TRACKS[t.track].name}
                      {t.type === 'team' && ` · ${memberCount} member${memberCount !== 1 ? 's' : ''}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <Badge variant="outline" className={STATUS_STYLES[t.status]}>
                      {t.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => removeTeam(t.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
                <Separator className="bg-zinc-800" />
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
