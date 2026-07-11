'use client'

import { useSyncExternalStore } from 'react'
import { Role } from '@/lib/types'
import { SessionProvider, useSession } from '@/context/SessionContext'
import Login from './Login'
import HostDashboard from './host/HostDashboard'
import MentorDashboard from './mentor/MentorDashboard'
import JudgeDashboard from './judge/JudgeDashboard'

const SESSION_KEY = 'bno_session'

interface Session {
  role: Role
  mentorName?: string
}

const listeners = new Set<() => void>()
function emitChange() {
  listeners.forEach((l) => l())
}
function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
function getSnapshot(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}
function getServerSnapshot(): string | null {
  return null
}

function parseSession(raw: string | null): Session | null {
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function AppInner() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const session = parseSession(raw)
  const { setCurrentJudgeId } = useSession()

  const handleLogin = (role: Role, mentorName?: string) => {
    const next: Session = { role, mentorName }
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    } catch {}
    emitChange()
  }

  const handleLogout = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {}
    setCurrentJudgeId(null)
    emitChange()
  }

  if (!session) return <Login onLogin={handleLogin} />

  if (session.role === 'host') return <HostDashboard onLogout={handleLogout} />
  if (session.role === 'mentor') return <MentorDashboard mentorName={session.mentorName || ''} onLogout={handleLogout} />
  return <JudgeDashboard onLogout={handleLogout} />
}

export default function App() {
  return (
    <SessionProvider>
      <AppInner />
    </SessionProvider>
  )
}
