'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DemoCounter({ teamName }: { teamName?: string }) {
  const [secondsLeft, setSecondsLeft] = useState(300)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const mm = Math.floor(secondsLeft / 60)
  const ss = secondsLeft % 60
  const color =
    secondsLeft <= 10 && secondsLeft > 0
      ? 'text-red-400'
      : secondsLeft === 0
        ? 'text-red-500'
        : secondsLeft <= 60
          ? 'text-amber-400'
          : 'text-violet-400'

  return (
    <div className="flex flex-col items-center gap-4 py-8">
      {teamName && <div className="text-lg font-semibold text-zinc-200">{teamName}</div>}
      <div className={`text-7xl font-bold tabular-nums ${color}`}>
        {mm}:{String(ss).padStart(2, '0')}
      </div>
      <div className="flex gap-2">
        <Button onClick={() => setRunning((r) => !r)} disabled={secondsLeft === 0}>
          {running ? 'Pause' : 'Start'}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setRunning(false)
            setSecondsLeft(300)
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
