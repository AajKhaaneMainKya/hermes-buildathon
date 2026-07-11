'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { useSession } from '@/context/SessionContext'
import { Role } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const ROLE_META: Record<Role, { label: string; accent: string }> = {
  host: { label: 'Host', accent: 'violet' },
  mentor: { label: 'Mentor', accent: 'emerald' },
  judge: { label: 'Judge', accent: 'amber' },
}

const ROLE_BUTTON_CLASSES: Record<Role, string> = {
  host: 'border-violet-700 bg-violet-950 text-violet-300',
  mentor: 'border-emerald-700 bg-emerald-950 text-emerald-300',
  judge: 'border-amber-600 bg-amber-950 text-amber-300',
}

export default function Login({
  onLogin,
}: {
  onLogin: (role: Role, mentorName?: string) => void
}) {
  const { state } = useApp()
  const { setCurrentJudgeId } = useSession()
  const [role, setRole] = useState<Role>('host')
  const [passcode, setPasscode] = useState('')
  const [mentorName, setMentorName] = useState('')
  const [error, setError] = useState('')
  const [judgeStep, setJudgeStep] = useState(false)
  const [selectedJudgeId, setSelectedJudgeId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passcode !== state.passcodes[role]) {
      setError('Incorrect passcode.')
      return
    }
    if (role === 'mentor' && state.mentors.length > 0 && !mentorName) {
      setError('Select your name.')
      return
    }
    setError('')
    if (role === 'judge' && state.judges.length > 0) {
      setJudgeStep(true)
      return
    }
    onLogin(role, role === 'mentor' ? mentorName : undefined)
  }

  const handleJudgeContinue = () => {
    if (!selectedJudgeId) {
      setError('Select who you are.')
      return
    }
    setError('')
    setCurrentJudgeId(selectedJudgeId)
    onLogin('judge')
  }

  if (judgeStep) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <Card className="w-full max-w-sm border-zinc-700 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-center text-zinc-100">Which judge are you?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedJudgeId} onValueChange={(v) => setSelectedJudgeId(v ?? '')}>
              <SelectTrigger className="w-full bg-zinc-800">
                <SelectValue placeholder="Select your name">
                  {(v: string) => (v ? state.judges.find((j) => j.id === v)?.name : 'Select your name')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {state.judges.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button className="w-full" onClick={handleJudgeContinue}>
              Continue
            </Button>
            <button
              type="button"
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
              onClick={() => {
                setJudgeStep(false)
                setError('')
              }}
            >
              ← back
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      <Card className="w-full max-w-sm border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-center text-zinc-100">{state.eventName || 'Hermes BNO'}</CardTitle>
          <p className="text-center text-xs text-zinc-500">Sign in to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(ROLE_META) as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r)
                    setError('')
                  }}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition-colors ${
                    role === r ? ROLE_BUTTON_CLASSES[r] : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {ROLE_META[r].label}
                </button>
              ))}
            </div>

            {role === 'mentor' && state.mentors.length > 0 && (
              <Select value={mentorName} onValueChange={(v) => setMentorName(v ?? '')}>
                <SelectTrigger className="w-full bg-zinc-800">
                  <SelectValue placeholder="Select your name" />
                </SelectTrigger>
                <SelectContent>
                  {state.mentors.map((m) => (
                    <SelectItem key={m.id} value={m.name}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Input
              type="password"
              placeholder="Passcode"
              className="bg-zinc-800"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
            />

            {error && <p className="text-xs text-red-400">{error}</p>}

            <Button type="submit" className="w-full">
              Enter
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
