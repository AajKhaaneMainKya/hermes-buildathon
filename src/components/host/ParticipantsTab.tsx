'use client'

import { useMemo, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Participant } from '@/lib/types'
import { toast } from '@/components/shared/Toast'
import { csvFilename, downloadCSV } from '@/lib/exportCSV'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DownloadButton } from '@/components/shared/DownloadButton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function parseCSV(raw: string): Participant[] {
  const lines = raw.trim().split('\n').filter(Boolean)
  return lines
    .filter((l) => !l.toLowerCase().startsWith('name'))
    .map((l) => {
      const [name, email] = l.split(',').map((s) => s.trim())
      return { id: 'p' + Date.now() + Math.random(), name, email: email || '' }
    })
    .filter((p) => p.name)
}

export default function ParticipantsTab() {
  const { state, setParticipants, removeParticipant, assignParticipantZone } = useApp()
  const [csv, setCsv] = useState('')
  const [search, setSearch] = useState('')

  const handleImport = () => {
    const parsed = parseCSV(csv)
    if (parsed.length === 0) return

    const existingEmails = new Set(state.participants.filter((p) => p.email).map((p) => p.email.toLowerCase()))
    const seen = new Set<string>()
    const deduped = parsed.filter((p) => {
      if (!p.email) return true
      const key = p.email.toLowerCase()
      if (existingEmails.has(key) || seen.has(key)) return false
      seen.add(key)
      return true
    })

    setParticipants([...state.participants, ...deduped])
    toast.success(`${deduped.length} participants imported`)
    setCsv('')
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return state.participants
    return state.participants.filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
  }, [state.participants, search])

  const assignAllUnassigned = () => {
    if (state.zones.length === 0) {
      toast('No zones to assign to yet.')
      return
    }
    const unassigned = state.participants.filter((p) => !p.zone)
    if (unassigned.length === 0) {
      toast('No unassigned participants.')
      return
    }
    unassigned.forEach((p, i) => {
      const zone = state.zones[i % state.zones.length]
      assignParticipantZone(p.id, zone.id)
    })
  }

  const clearAll = () => {
    setParticipants([])
  }

  const downloadRoster = () => {
    const rows = state.participants.map((p) => ({
      Name: p.name,
      Email: p.email,
      Zone: state.zones.find((z) => z.id === p.zone)?.name || '',
      Assigned: p.zone ? 'yes' : 'no',
    }))
    downloadCSV(csvFilename(state.eventName, 'roster'), rows)
  }

  const downloadZoneAssignment = () => {
    const rows = state.participants
      .filter((p) => p.zone)
      .map((p) => {
        const zone = state.zones.find((z) => z.id === p.zone)
        return {
          Zone: zone?.name || '',
          Mentor: zone?.mentorName || '',
          'Participant name': p.name,
          'Participant email': p.email,
        }
      })
      .sort((a, b) => a.Zone.localeCompare(b.Zone))
    downloadCSV(csvFilename(state.eventName, 'zone-assignment'), rows)
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Import participants</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-xs text-zinc-500">CSV format: name, email (header row optional)</p>
          <Textarea
            className="min-h-32 bg-zinc-800 font-mono text-xs"
            placeholder={'Alice Sharma, alice@x.com\nBob Mehta, bob@y.com'}
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
          />
          <Button onClick={handleImport}>Import</Button>
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-zinc-100">Participant roster ({state.participants.length})</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Input
              className="w-56 bg-zinc-800"
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" size="sm" onClick={assignAllUnassigned}>
              Assign all unassigned
            </Button>
            <DownloadButton
              label="Download roster CSV"
              onClick={downloadRoster}
              disabled={state.participants.length === 0}
            />
            <DownloadButton
              label="Download zone assignment CSV"
              onClick={downloadZoneAssignment}
              disabled={state.participants.every((p) => !p.zone)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {filtered.length === 0 && <p className="text-sm text-zinc-500">No participants yet.</p>}
          {filtered.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <div>
                <div className="text-sm font-medium text-zinc-200">{p.name}</div>
                <div className="text-xs text-zinc-500">{p.email}</div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={p.zone || 'unassigned'}
                  onValueChange={(v) => assignParticipantZone(p.id, !v || v === 'unassigned' ? undefined : v)}
                >
                  <SelectTrigger size="sm" className="w-36 bg-zinc-800">
                    <SelectValue>
                      {(v: string) => (v === 'unassigned' || !v ? 'Unassigned' : state.zones.find((z) => z.id === v)?.name)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {state.zones.map((z) => (
                      <SelectItem key={z.id} value={z.id}>
                        {z.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={() => removeParticipant(p.id)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {state.participants.length > 0 && (
            <div className="pt-2">
              <Button variant="destructive" size="sm" onClick={clearAll}>
                Clear all participants
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
