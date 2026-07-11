'use client'

import { useEffect, useRef, useState } from 'react'
import { useApp } from '@/context/AppContext'
import { CHECKPOINTS, getCurrentCheckpoint, getElapsedLabel, getEventMinutes, getProgress } from '@/lib/timeline'
import Banner from './Banner'

export default function Timeline() {
  const { state, notify } = useApp()
  const [currentTime, setCurrentTime] = useState('')
  const [eventMinutes, setEventMinutes] = useState(0)
  const [elapsedLabel, setElapsedLabel] = useState('')
  const lastFiredRef = useRef<number>(-1)

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const hh = now.getHours().toString().padStart(2, '0')
      const mm = now.getMinutes().toString().padStart(2, '0')
      const ss = now.getSeconds().toString().padStart(2, '0')
      setCurrentTime(`${hh}:${mm}:${ss}`)

      const mins = getEventMinutes(state.startTime, state.eventDate)
      setEventMinutes(mins)
      setElapsedLabel(getElapsedLabel(mins, state.startTime, state.eventDate))

      const eventName = state.eventName || 'Hermes BNO'
      document.title = `${hh}:${mm} · ${eventName}`

      const cp = getCurrentCheckpoint(mins)
      if (cp && cp.minutesFromStart !== lastFiredRef.current) {
        lastFiredRef.current = cp.minutesFromStart
        notify(cp.bannerMessage, 'time_warning')
      }
    }

    tick() // run immediately on mount
    const id = setInterval(tick, 1000)
    return () => {
      clearInterval(id)
      document.title = state.eventName || 'Hermes BNO'
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.startTime, state.eventDate, state.eventName])

  const checkpoint = getCurrentCheckpoint(eventMinutes)
  const progress = getProgress(eventMinutes)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <span className="font-medium text-zinc-300">Event timeline</span>
        <div className="text-right">
          <div className="font-mono text-lg font-bold tabular-nums text-violet-400">{currentTime || '--:--:--'}</div>
          <div className="text-xs text-zinc-400">{elapsedLabel}</div>
        </div>
      </div>

      {checkpoint && <Banner key={checkpoint.label} type={checkpoint.type} message={checkpoint.bannerMessage} />}

      {eventMinutes === -1 ? (
        <div className="flex items-center gap-2 py-2 text-sm text-zinc-400">
          <span className="text-amber-400">⏳</span>
          <span>
            {state.eventDate
              ? `Event scheduled for ${new Date(state.eventDate + 'T12:00:00').toLocaleDateString('en-IN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}`
              : 'Set event date in Setup to enable timeline tracking'}
          </span>
        </div>
      ) : (
        <>
          <div className="relative h-2 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-violet-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="flex justify-between">
            {CHECKPOINTS.map((cp) => {
              const isCurrent = cp.label === checkpoint?.label
              const isPast = eventMinutes >= cp.minutesFromStart && !isCurrent
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
        </>
      )}
    </div>
  )
}
