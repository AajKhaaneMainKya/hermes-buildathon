'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import DemoCounter from '@/components/shared/DemoCounter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DemoTab() {
  const { state } = useApp()
  const shortlistTeams = state.shortlist
    .map((id) => state.teams.find((t) => t.id === id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t))
  const [activeId, setActiveId] = useState<string>(shortlistTeams[0]?.id || '')

  const activeTeam = shortlistTeams.find((t) => t.id === activeId)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="border-zinc-700 bg-zinc-900 lg:col-span-2">
        <CardContent>
          {shortlistTeams.length === 0 ? (
            <p className="py-10 text-center text-sm text-zinc-500">No shortlisted teams yet. Announce the top 5 in Judging.</p>
          ) : (
            <DemoCounter key={activeId} teamName={activeTeam?.name} />
          )}
        </CardContent>
      </Card>
      <Card className="border-zinc-700 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-100">Demo queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {shortlistTeams.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setActiveId(t.id)}
              className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm ${
                activeId === t.id ? 'border-violet-700 bg-violet-950 text-violet-300' : 'border-zinc-800 bg-zinc-950 text-zinc-300'
              }`}
            >
              <span>
                #{i + 1} {t.name}
              </span>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
