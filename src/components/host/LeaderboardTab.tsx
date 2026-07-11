'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import Leaderboard from '@/components/shared/Leaderboard'

export default function LeaderboardTab() {
  const { state } = useApp()
  const [source, setSource] = useState<'host' | 'judge'>('host')

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setSource('host')}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            source === 'host' ? 'border-violet-700 bg-violet-950 text-violet-300' : 'border-zinc-700 bg-zinc-800 text-zinc-400'
          }`}
        >
          Host scores
        </button>
        <button
          onClick={() => setSource('judge')}
          className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
            source === 'judge' ? 'border-amber-600 bg-amber-950 text-amber-300' : 'border-zinc-700 bg-zinc-800 text-zinc-400'
          }`}
        >
          Judge scores
        </button>
      </div>
      <Leaderboard teams={state.teams} scores={source === 'host' ? state.hostScores : state.judgeScores} />
    </div>
  )
}
