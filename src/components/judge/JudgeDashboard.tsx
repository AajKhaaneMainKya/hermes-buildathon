'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Timeline from '@/components/shared/Timeline'
import Leaderboard from '@/components/shared/Leaderboard'
import { useApp } from '@/context/AppContext'
import { useSession } from '@/context/SessionContext'
import JudgeScoringTab from './JudgeScoringTab'

const TABS = [
  { value: 'score', label: 'Score Teams' },
  { value: 'leaderboard', label: 'Leaderboard' },
]

export default function JudgeDashboard({ onLogout }: { onLogout: () => void }) {
  const { state } = useApp()
  const { currentJudgeId } = useSession()
  const [tab, setTab] = useState('score')

  const judgeName = state.judges.find((j) => j.id === currentJudgeId)?.name

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-600 bg-amber-950 px-3 py-1 text-xs font-semibold text-amber-300">
              Judge
            </span>
            {judgeName && <span className="text-sm text-zinc-400">{judgeName}</span>}
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Log out
          </Button>
        </header>

        <Timeline />

        <Tabs value={tab} onValueChange={(v) => setTab((v ?? ""))}>
          <TabsList className="h-auto flex-wrap justify-start">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="score">
            <JudgeScoringTab />
          </TabsContent>
          <TabsContent value="leaderboard">
            <Leaderboard
              teams={state.teams}
              zones={state.zones}
              hostScores={state.hostScores}
              judgeScores={state.judgeScores}
              basis="judges_avg"
              eventName={state.eventName}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
