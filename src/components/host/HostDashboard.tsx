'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import Timeline from '@/components/shared/Timeline'
import ZonesTab from './ZonesTab'
import TeamsTab from './TeamsTab'
import CommsTab from './CommsTab'
import ScoringTab from './ScoringTab'
import JudgingTab from './JudgingTab'
import LeaderboardTab from './LeaderboardTab'
import DemoTab from './DemoTab'
import SetupTab from './SetupTab'

const TABS = [
  { value: 'zones', label: 'Zones' },
  { value: 'teams', label: 'Teams' },
  { value: 'comms', label: 'Comms' },
  { value: 'scoring', label: 'Scoring' },
  { value: 'judging', label: 'Judging' },
  { value: 'leaderboard', label: 'Leaderboard' },
  { value: 'demo', label: 'Demo' },
  { value: 'setup', label: 'Setup' },
]

export default function HostDashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState('zones')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl space-y-6 p-4 sm:p-6">
        <header className="flex items-center justify-between">
          <span className="rounded-full border border-violet-700 bg-violet-950 px-3 py-1 text-xs font-semibold text-violet-300">
            Host
          </span>
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
          <TabsContent value="zones">
            <ZonesTab />
          </TabsContent>
          <TabsContent value="teams">
            <TeamsTab />
          </TabsContent>
          <TabsContent value="comms">
            <CommsTab />
          </TabsContent>
          <TabsContent value="scoring">
            <ScoringTab />
          </TabsContent>
          <TabsContent value="judging">
            <JudgingTab />
          </TabsContent>
          <TabsContent value="leaderboard">
            <LeaderboardTab />
          </TabsContent>
          <TabsContent value="demo">
            <DemoTab />
          </TabsContent>
          <TabsContent value="setup">
            <SetupTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
