'use client'

import React, { createContext, useContext, useState } from 'react'

interface SessionContextValue {
  currentJudgeId: string | null
  setCurrentJudgeId: (id: string | null) => void
}

const SessionContext = createContext<SessionContextValue | null>(null)

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [currentJudgeId, setCurrentJudgeId] = useState<string | null>(null)
  return (
    <SessionContext.Provider value={{ currentJudgeId, setCurrentJudgeId }}>{children}</SessionContext.Provider>
  )
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
