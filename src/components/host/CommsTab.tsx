'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
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

const NOTIF_STYLES: Record<string, string> = {
  broadcast: 'border-violet-700 text-violet-300',
  dm: 'border-blue-700 text-blue-300',
  idea_lock: 'border-amber-600 text-amber-300',
  time_warning: 'border-red-700 text-red-300',
  submission: 'border-emerald-700 text-emerald-300',
  status: 'border-zinc-600 text-zinc-300',
  shortlist: 'border-amber-600 text-amber-300',
  registration: 'border-blue-700 text-blue-300',
  cross_zone: 'border-orange-700 text-orange-300',
}

export default function CommsTab() {
  const { state, notify } = useApp()
  const [broadcast, setBroadcast] = useState('')
  const [dmTarget, setDmTarget] = useState('')
  const [dmMsg, setDmMsg] = useState('')

  const sendBroadcast = () => {
    if (!broadcast.trim()) return
    notify(`[Broadcast] ${broadcast.trim()}`, 'broadcast')
    setBroadcast('')
  }

  const sendDm = () => {
    if (!dmTarget || !dmMsg.trim()) return
    notify(`[DM to ${dmTarget}] ${dmMsg.trim()}`, 'dm')
    setDmMsg('')
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-zinc-700 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-100">Broadcast</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Textarea
              className="bg-zinc-800"
              placeholder="Message to everyone..."
              value={broadcast}
              onChange={(e) => setBroadcast(e.target.value)}
            />
            <Button onClick={sendBroadcast}>Send broadcast</Button>
          </CardContent>
        </Card>

        <Card className="border-zinc-700 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-100">Direct message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={dmTarget} onValueChange={(v) => setDmTarget((v ?? ""))}>
              <SelectTrigger className="w-full bg-zinc-800">
                <SelectValue placeholder="Select mentor" />
              </SelectTrigger>
              <SelectContent>
                {state.mentors.map((m) => (
                  <SelectItem key={m.id} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              className="bg-zinc-800"
              placeholder="Message..."
              value={dmMsg}
              onChange={(e) => setDmMsg(e.target.value)}
            />
            <Button onClick={sendDm}>Send DM</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Mentor recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.keys(state.mentorRecommendations).length === 0 && (
            <p className="text-sm text-zinc-500">No recommendations submitted yet.</p>
          )}
          {Object.entries(state.mentorRecommendations).map(([mentorName, teamIds]) => (
            <div key={mentorName} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm">
              <span className="font-medium text-zinc-200">{mentorName}:</span>{' '}
              <span className="text-zinc-400">
                {teamIds.length === 0
                  ? 'no recommendations'
                  : teamIds.map((id) => state.teams.find((t) => t.id === id)?.name || id).join(', ')}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Cross-zone flags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {state.crossZoneFlags.length === 0 && <p className="text-sm text-zinc-500">No cross-zone flags yet.</p>}
          {state.crossZoneFlags.map((f, i) => (
            <div key={i} className="rounded-md border border-orange-800 bg-orange-950 px-3 py-2 text-sm text-orange-200">
              <span className="font-medium">{f.teamName}</span> — {f.reason}{' '}
              <span className="text-xs text-orange-400">{f.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Notification log</CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 space-y-1.5 overflow-y-auto">
          {state.notifLog.length === 0 && <p className="text-sm text-zinc-500">No notifications yet.</p>}
          {state.notifLog.map((n, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="w-14 shrink-0 text-zinc-600">{n.time}</span>
              <Badge variant="outline" className={NOTIF_STYLES[n.type] || 'border-zinc-600 text-zinc-300'}>
                {n.type}
              </Badge>
              <span className="text-zinc-400">{n.msg}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
