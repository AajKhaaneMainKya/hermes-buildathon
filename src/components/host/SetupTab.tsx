'use client'

import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { defaultState, saveState } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import JudgesSetupSection from './JudgesSetupSection'

function DangerButton({
  label,
  onConfirm,
}: {
  label: string
  onConfirm: () => void
}) {
  const [armed, setArmed] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleClick = () => {
    if (!armed) {
      setArmed(true)
      timeoutRef.current = setTimeout(() => setArmed(false), 3000)
      return
    }
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setArmed(false)
    onConfirm()
  }

  return (
    <Button variant="destructive" onClick={handleClick}>
      {armed ? 'Click again to confirm' : label}
    </Button>
  )
}

export default function SetupTab() {
  const { state, setEventSettings, setHermesUrl, setPasscodes, addMentor, removeMentor, resetEventData } = useApp()
  const [mentorName, setMentorName] = useState('')
  const [mentorTelegram, setMentorTelegram] = useState('')

  const handleAddMentor = () => {
    if (!mentorName.trim()) return
    addMentor({ id: crypto.randomUUID(), name: mentorName.trim(), telegram: mentorTelegram.trim() })
    setMentorName('')
    setMentorTelegram('')
  }

  const handleFullReset = () => {
    saveState(defaultState())
    window.location.reload()
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
            <div className="flex items-center gap-2">
              <Input
                type="date"
                className="bg-zinc-800"
                value={state.eventDate}
                onChange={(e) => setEventSettings({ eventDate: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setEventSettings({ eventDate: new Date().toISOString().split('T')[0] })}
                className="shrink-0 text-xs whitespace-nowrap text-violet-400 underline hover:text-violet-300"
              >
                Set to today
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              Set this to today&apos;s date on event day. The timeline will not activate until the date matches.
            </p>
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

      <JudgesSetupSection />

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

      <Card className="border-red-900 bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-red-300">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-red-200">⚠ Reset event data</p>
              <p className="text-xs text-red-400/80">
                Clears all teams, zones, participants, scores, and logs. Keeps passcodes, mentor/judge
                registrations, and Hermes URL.
              </p>
            </div>
            <DangerButton label="Reset event data" onConfirm={resetEventData} />
          </div>
          <Separator className="bg-red-900/50" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-red-200">⚠ Full factory reset</p>
              <p className="text-xs text-red-400/80">Clears everything including passcodes and registrations.</p>
            </div>
            <DangerButton label="Full reset" onConfirm={handleFullReset} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
