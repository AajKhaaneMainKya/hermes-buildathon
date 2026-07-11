'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function SetupTab() {
  const { state, setEventSettings, setHermesUrl, setPasscodes, addMentor, removeMentor } = useApp()
  const [mentorName, setMentorName] = useState('')
  const [mentorTelegram, setMentorTelegram] = useState('')

  const handleAddMentor = () => {
    if (!mentorName.trim()) return
    addMentor({ id: crypto.randomUUID(), name: mentorName.trim(), telegram: mentorTelegram.trim() })
    setMentorName('')
    setMentorTelegram('')
  }

  return (
    <div className="space-y-6">
      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Event settings</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Event name</label>
            <Input
              className="bg-zinc-800"
              value={state.eventName}
              onChange={(e) => setEventSettings({ eventName: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Event date</label>
            <Input
              type="date"
              className="bg-zinc-800"
              value={state.eventDate}
              onChange={(e) => setEventSettings({ eventDate: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Start time</label>
            <Input
              type="time"
              className="bg-zinc-800"
              value={state.startTime}
              onChange={(e) => setEventSettings({ startTime: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Hermes webhook</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            className="bg-zinc-800"
            placeholder="https://hermes.example.com/webhook/..."
            value={state.hermesUrl}
            onChange={(e) => setHermesUrl(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Passcodes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Host</label>
            <Input
              className="bg-zinc-800"
              value={state.passcodes.host}
              onChange={(e) => setPasscodes({ host: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Mentor</label>
            <Input
              className="bg-zinc-800"
              value={state.passcodes.mentor}
              onChange={(e) => setPasscodes({ mentor: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-zinc-500">Judge</label>
            <Input
              className="bg-zinc-800"
              value={state.passcodes.judge}
              onChange={(e) => setPasscodes({ judge: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Mentors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              className="bg-zinc-800"
              placeholder="Mentor name"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
            />
            <Input
              className="bg-zinc-800"
              placeholder="Telegram handle"
              value={mentorTelegram}
              onChange={(e) => setMentorTelegram(e.target.value)}
            />
            <Button onClick={handleAddMentor}>Add mentor</Button>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="space-y-2">
            {state.mentors.length === 0 && <p className="text-sm text-zinc-500">No mentors registered yet.</p>}
            {state.mentors.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium text-zinc-200">{m.name}</div>
                  <div className="text-xs text-zinc-500">{m.telegram}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeMentor(m.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
