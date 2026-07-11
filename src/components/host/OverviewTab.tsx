'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { ZoneColor } from '@/lib/types'
import { TRACKS } from '@/lib/tracks'
import { getCurrentCheckpoint, getElapsedLabel, getEventMinutes } from '@/lib/timeline'
import { Badge } from '@/components/ui/badge'
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

const ZONE_ACCENT: Record<ZoneColor, string> = {
  violet: 'border-l-violet-500',
  emerald: 'border-l-emerald-500',
  amber: 'border-l-amber-500',
  blue: 'border-l-blue-500',
  rose: 'border-l-rose-500',
  cyan: 'border-l-cyan-500',
}

const STATUS_ICON: Record<string, string> = {
  building: '🔨',
  locked: '🔒',
  scoring: '🎯',
  shortlisted: '⭐',
  eliminated: '❌',
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-3 text-center">
      <div className="text-2xl font-bold text-zinc-100">{value}</div>
      <div className="text-xs text-zinc-500">{label}</div>
      {sub && <div className="text-[10px] text-zinc-600">{sub}</div>}
    </div>
  )
}

export default function OverviewTab() {
  const { state, notify } = useApp()
  const [currentTime, setCurrentTime] = useState('')
  const [elapsedLabel, setElapsedLabel] = useState('')
  const [eventMinutes, setEventMinutes] = useState(0)
  const [quickMsg, setQuickMsg] = useState('')
  const [quickTarget, setQuickTarget] = useState('everyone')

  // Live clock — same timeline data Timeline.tsx uses, own 1s tick so it reads as "live".
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const hh = now.getHours().toString().padStart(2, '0')
      const mm = now.getMinutes().toString().padStart(2, '0')
      const ss = now.getSeconds().toString().padStart(2, '0')
      setCurrentTime(`${hh}:${mm}:${ss}`)
      const mins = getEventMinutes(state.startTime, state.eventDate)
      setEventMinutes(mins)
      setElapsedLabel(getElapsedLabel(mins, state.startTime, state.eventDate))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [state.startTime, state.eventDate])

  // Safety-net auto-refresh — forces a re-render every 10s even with no state change,
  // in addition to the re-renders real-time Supabase updates already trigger via HYDRATE.
  const [, setRefreshTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setRefreshTick((t) => t + 1), 10000)
    return () => clearInterval(id)
  }, [])

  const checkpoint = getCurrentCheckpoint(eventMinutes)

  const totalEntries = state.teams.length
  const teamCount = state.teams.filter((t) => t.type === 'team').length
  const soloCount = state.teams.filter((t) => t.type === 'solo').length
  const lockedCount = state.teams.filter((t) => t.status !== 'building').length
  const shortlistedCount = state.teams.filter((t) => t.status === 'shortlisted').length
  const scoredCount = state.teams.filter((t) => Object.keys(t.mentorScores || {}).length > 0).length

  const recentFlags = [...state.crossZoneFlags].slice(-5).reverse()

  const sendQuick = () => {
    if (!quickMsg.trim()) return
    if (quickTarget === 'everyone') {
      notify(`[Broadcast] ${quickMsg.trim()}`, 'broadcast')
    } else {
      notify(`[DM to ${quickTarget}] ${quickMsg.trim()}`, 'dm')
    }
    setQuickMsg('')
  }

  return (
    <div className="space-y-6">
      {/* Section A — event status bar */}
      <Card className="border-zinc-700 bg-zinc-900">
        <CardContent className="space-y-2 p-4">
          <div className="text-lg font-bold text-zinc-100">{state.eventName || 'Hermes Buildathon'}</div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-mono text-2xl font-bold tabular-nums text-violet-400">
              {currentTime || '--:--:--'}
            </span>
            <span className="text-sm text-zinc-400">{elapsedLabel}</span>
            {checkpoint ? (
              <span className="text-sm text-zinc-300">
                <span className="font-semibold text-zinc-100">{checkpoint.label}</span>
                <span className="text-zinc-500"> — {checkpoint.bannerMessage}</span>
              </span>
            ) : (
              <span className="text-sm text-zinc-500">
                {state.eventDate ? 'Event not live today' : 'Set event date in Setup to enable timeline tracking'}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section B — live metrics grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Teams" value={String(teamCount)} />
        <Metric label="Solos" value={String(soloCount)} />
        <Metric label="Zones" value={String(state.zones.length)} />
        <Metric label="Idea locked" value={`${lockedCount}/${totalEntries}`} />
        <Metric label="Shortlisted" value={String(shortlistedCount)} />
        <Metric label="Scored" value={`${scoredCount}/${totalEntries}`} />
      </div>

      {/* Section C — zone breakdown cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {state.zones.map((z) => {
          const zoneTeams = state.teams.filter((t) => t.zoneId === z.id)
          const zoneTeamCount = zoneTeams.filter((t) => t.type === 'team').length
          const zoneSoloCount = zoneTeams.filter((t) => t.type === 'solo').length
          const lockStatus = state.ideaLockStatus[z.mentorName] || null
          return (
            <Card
              key={z.id}
              className={`border-l-4 border-zinc-700 bg-zinc-900 ${ZONE_ACCENT[z.color || 'violet']}`}
            >
              <CardHeader>
                <CardTitle className="text-zinc-100">
                  {z.name} <span className="font-normal text-zinc-500">· {z.mentorName || 'Unassigned'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xs text-zinc-500">
                  Teams: {zoneTeamCount} &nbsp; Solos: {zoneSoloCount} &nbsp; Total: {zoneTeams.length}
                  {z.maxBuilders ? ` / ${z.maxBuilders}` : ''}
                </div>

                {zoneTeams.length === 0 ? (
                  <p className="text-sm text-zinc-500">No teams registered yet</p>
                ) : (
                  <div className="space-y-1.5">
                    {zoneTeams.map((t) => (
                      <div key={t.id} className="flex items-center justify-between gap-2 text-sm">
                        <span className="truncate text-zinc-200">
                          {t.name}
                          {t.type === 'solo' && <span className="text-zinc-500"> (solo)</span>}
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                            {TRACKS[t.track].name}
                          </Badge>
                          <span className="text-xs text-zinc-400">
                            {STATUS_ICON[t.status]} {t.status}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-zinc-800 pt-2 text-xs text-zinc-500">
                  Idea lock:{' '}
                  {lockStatus === 'yes' ? (
                    <span className="text-emerald-400">✓ Confirmed</span>
                  ) : lockStatus === 'no' ? (
                    <span className="text-red-400">✗ Flagged</span>
                  ) : lockStatus === 'pending' ? (
                    <span className="text-amber-400">… Pending</span>
                  ) : (
                    <span className="text-zinc-600">Not checked yet</span>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
        {state.zones.length === 0 && <p className="text-sm text-zinc-500">No zones yet.</p>}
      </div>

      {/* Section D — cross-zone flags + quick broadcast */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-zinc-700 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-100">Recent cross-zone flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentFlags.length === 0 && <p className="text-sm text-zinc-500">No cross-zone flags yet.</p>}
            {recentFlags.map((f, i) => (
              <div key={i} className="rounded-md border border-orange-800 bg-orange-950 px-3 py-2 text-sm text-orange-200">
                🚩 <span className="font-medium">{f.teamName}</span> — &ldquo;{f.reason}&rdquo;{' '}
                <span className="text-xs text-orange-400">· {f.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-zinc-700 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-100">Quick broadcast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Input
              className="bg-zinc-800"
              placeholder="Message..."
              value={quickMsg}
              onChange={(e) => setQuickMsg(e.target.value)}
            />
            <div className="flex gap-2">
              <Select value={quickTarget} onValueChange={(v) => setQuickTarget(v ?? 'everyone')}>
                <SelectTrigger className="w-full bg-zinc-800">
                  <SelectValue>{(v: string) => (v === 'everyone' ? 'Everyone' : v)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="everyone">Everyone</SelectItem>
                  {state.mentors.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={sendQuick} className="shrink-0">
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
