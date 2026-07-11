'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function JudgesSetupSection() {
  const { state, addJudge, removeJudge } = useApp()
  const [judgeName, setJudgeName] = useState('')
  const [judgeTelegram, setJudgeTelegram] = useState('')

  const handleAddJudge = () => {
    if (!judgeName.trim()) return
    addJudge({ id: 'j' + Date.now(), name: judgeName.trim(), telegram: judgeTelegram.trim() })
    setJudgeName('')
    setJudgeTelegram('')
  }

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader>
        <CardTitle className="text-zinc-100">Register judges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            className="bg-zinc-800"
            placeholder="Name"
            value={judgeName}
            onChange={(e) => setJudgeName(e.target.value)}
          />
          <Input
            className="bg-zinc-800"
            placeholder="@Telegram"
            value={judgeTelegram}
            onChange={(e) => setJudgeTelegram(e.target.value)}
          />
          <Button onClick={handleAddJudge}>+ Add judge</Button>
        </div>
        <Separator className="bg-zinc-800" />
        <div className="space-y-2">
          {state.judges.length === 0 && <p className="text-sm text-zinc-500">No judges registered yet.</p>}
          {state.judges.map((j) => (
            <div
              key={j.id}
              className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <div>
                  <div className="text-sm font-medium text-zinc-200">{j.name}</div>
                  <div className="text-xs text-zinc-500">{j.telegram}</div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeJudge(j.id)}>
                Remove
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
