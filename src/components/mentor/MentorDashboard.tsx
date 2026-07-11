'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Timeline from '@/components/shared/Timeline'
import Leaderboard from '@/components/shared/Leaderboard'
import { useApp } from '@/context/AppContext'
import MyZoneTab from './MyZoneTab'
import MentorScoringTab from './MentorScoringTab'
import CrossZoneTab from './CrossZoneTab'

const TABS = [
  { value: 'zone', label: 'My Zone' },
  { value: 'score', label: 'Score Zone' },
  { value: 'crosszone', label: 'Cross-zone flags' },
  { value: 'leaderboard', label: 'Leaderboard' },
]

export default function MentorDashboard({ mentorName, onLogout }: { mentorName: string; onLogout: () => void }) {
  const { state } = useApp()
  const [tab, setTab] = useState('zone')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-emerald-700 bg-emerald-950 px-3 py-1 text-xs font-semibold text-emerald-300">
              Mentor
            </span>
            {mentorName && <span className="text-sm text-zinc-400">{mentorName}</span>}
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
          <TabsContent value="zone">
            <MyZoneTab mentorName={mentorName} />
          </TabsContent>
          <TabsContent value="score">
            <MentorScoringTab mentorName={mentorName} />
          </TabsContent>
          <TabsContent value="crosszone">
            <CrossZoneTab mentorName={mentorName} />
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
