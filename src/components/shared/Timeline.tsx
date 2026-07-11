'use client'

import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { CHECKPOINTS, getCurrentCheckpoint, getEventMinutes, getProgress } from '@/lib/timeline'
import Banner from './Banner'

export default function Timeline() {
  const { state, notify } = useApp()
  const [minutes, setMinutes] = useState(() => getEventMinutes(state.startTime))
  const [now, setNow] = useState<Date | null>(null)
  const lastCheckpoint = useRef<string | null>(null)

  useEffect(() => {
    const tick = () => {
      setMinutes(getEventMinutes(state.startTime))
      setNow(new Date())
    }
    tick()
    const id = setInterval(tick, 10000)
    return () => clearInterval(id)
  }, [state.startTime])

  const checkpoint = getCurrentCheckpoint(minutes)
  const progress = getProgress(minutes)

  useEffect(() => {
    if (!checkpoint) return
    if (lastCheckpoint.current === null) {
      lastCheckpoint.current = checkpoint.label
      return
    }
    if (lastCheckpoint.current !== checkpoint.label) {
      lastCheckpoint.current = checkpoint.label
      notify(checkpoint.bannerMessage, 'time_warning')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkpoint?.label])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span className="font-medium text-zinc-300">{state.eventName}</span>
        <span className="tabular-nums">
          {now ? now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
        </span>
      </div>

      {checkpoint && <Banner type={checkpoint.type} message={checkpoint.bannerMessage} />}

      <div className="relative h-2 overflow-hidden rounded-full bg-zinc-800">
        <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex justify-between">
        {CHECKPOINTS.map((cp) => {
          const isCurrent = cp.label === checkpoint?.label
          const isPast = minutes >= cp.minutesFromStart && !isCurrent
          return (
            <div key={cp.label} className="flex flex-col items-center gap-1" title={cp.label}>
              <div
                className={
                  isCurrent
                    ? 'h-2.5 w-2.5 animate-pulse rounded-full bg-violet-500'
                    : isPast
                      ? 'h-2 w-2 rounded-full bg-emerald-600'
                      : 'h-2 w-2 rounded-full bg-zinc-700'
                }
              />
              <span className="hidden text-[10px] text-zinc-600 sm:block">{cp.shortLabel}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
