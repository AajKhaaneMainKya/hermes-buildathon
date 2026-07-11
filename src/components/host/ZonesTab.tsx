'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Zone, ZoneColor } from '@/lib/types'
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

const ZONE_COLORS: { id: ZoneColor; swatch: string; leftBorder: string }[] = [
  { id: 'violet', swatch: 'bg-violet-500', leftBorder: 'border-l-violet-500' },
  { id: 'emerald', swatch: 'bg-emerald-500', leftBorder: 'border-l-emerald-500' },
  { id: 'amber', swatch: 'bg-amber-500', leftBorder: 'border-l-amber-500' },
  { id: 'blue', swatch: 'bg-blue-500', leftBorder: 'border-l-blue-500' },
  { id: 'rose', swatch: 'bg-rose-500', leftBorder: 'border-l-rose-500' },
  { id: 'cyan', swatch: 'bg-cyan-500', leftBorder: 'border-l-cyan-500' },
]

function colorMeta(color?: ZoneColor) {
  return ZONE_COLORS.find((c) => c.id === color) || ZONE_COLORS[0]
}

function ColorPicker({ value, onChange }: { value: ZoneColor; onChange: (c: ZoneColor) => void }) {
  return (
    <div className="flex gap-2">
      {ZONE_COLORS.map((c) => (
        <button
          key={c.id}
          type="button"
          aria-label={c.id}
          onClick={() => onChange(c.id)}
          className={`h-6 w-6 rounded-full ${c.swatch} ${
            value === c.id ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''
          }`}
        />
      ))}
    </div>
  )
}

interface ZoneFormValues {
  name: string
  mentorName: string
  maxBuilders: string
  color: ZoneColor
}

function ZoneForm({
  initial,
  mentors,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial: ZoneFormValues
  mentors: { id: string; name: string }[]
  onSubmit: (values: ZoneFormValues) => void
  onCancel?: () => void
  submitLabel: string
}) {
  const [values, setValues] = useState<ZoneFormValues>(initial)

  const handleSubmit = () => {
    if (!values.name.trim()) return
    onSubmit(values)
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          className="bg-zinc-800"
          placeholder="Zone name"
          value={values.name}
          onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
        />
        <Select
          value={values.mentorName || 'unassigned'}
          onValueChange={(v) => setValues((val) => ({ ...val, mentorName: !v || v === 'unassigned' ? '' : v }))}
        >
          <SelectTrigger className="w-full bg-zinc-800">
            <SelectValue placeholder="Unassigned">
              {(v: string) => (v === 'unassigned' || !v ? 'Unassigned' : v)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {mentors.map((m) => (
              <SelectItem key={m.id} value={m.name}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:items-center">
        <Input
          type="number"
          min={1}
          className="bg-zinc-800"
          placeholder="Max builders (optional)"
          value={values.maxBuilders}
          onChange={(e) => setValues((v) => ({ ...v, maxBuilders: e.target.value }))}
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">Colour</span>
          <ColorPicker value={values.color} onChange={(color) => setValues((v) => ({ ...v, color }))} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit}>{submitLabel}</Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}

export default function ZonesTab() {
  const { state, addZone, updateZone, removeZone } = useApp()
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleAdd = (values: ZoneFormValues) => {
    addZone({
      id: crypto.randomUUID(),
      name: values.name.trim(),
      mentorName: values.mentorName,
      maxBuilders: values.maxBuilders ? Number(values.maxBuilders) : undefined,
      color: values.color,
    })
  }

  const handleUpdate = (zone: Zone, values: ZoneFormValues) => {
    updateZone({
      ...zone,
      name: values.name.trim(),
      mentorName: values.mentorName,
      maxBuilders: values.maxBuilders ? Number(values.maxBuilders) : undefined,
      color: values.color,
    })
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Add zone</CardTitle>
        </CardHeader>
        <CardContent>
          <ZoneForm
            key={state.zones.length}
            initial={{ name: '', mentorName: '', maxBuilders: '', color: 'violet' }}
            mentors={state.mentors}
            onSubmit={handleAdd}
            submitLabel="Add zone"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {state.zones.map((z) => {
          const teamCount = state.teams.filter((t) => t.zoneId === z.id).length
          const participantCountInZone = state.participants.filter((p) => p.zone === z.id).length
          const meta = colorMeta(z.color)
          const isEditing = editingId === z.id

          return (
            <Card key={z.id} className={`border-l-4 border-zinc-700 bg-zinc-900 ${meta.leftBorder}`}>
              <CardHeader>
                <CardTitle className="text-zinc-100">{z.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <ZoneForm
                    initial={{
                      name: z.name,
                      mentorName: z.mentorName,
                      maxBuilders: z.maxBuilders != null ? String(z.maxBuilders) : '',
                      color: z.color || 'violet',
                    }}
                    mentors={state.mentors}
                    onSubmit={(values) => handleUpdate(z, values)}
                    onCancel={() => setEditingId(null)}
                    submitLabel="Save"
                  />
                ) : (
                  <>
                    <div className="text-sm text-zinc-300">
                      Mentor: {z.mentorName || <span className="text-zinc-500">Unassigned</span>}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {teamCount} teams · {participantCountInZone} participants ·{' '}
                      {z.maxBuilders ? `max ${z.maxBuilders}` : 'no limit'}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setEditingId(z.id)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeZone(z.id)}>
                        Remove zone
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {state.zones.length === 0 && <p className="text-sm text-zinc-500">No zones yet. Add one above.</p>}
    </div>
  )
}
