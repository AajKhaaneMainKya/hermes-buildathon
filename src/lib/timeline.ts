export interface Checkpoint {
  minutesFromStart: number
  label: string
  shortLabel: string
  type: 'info' | 'warning' | 'critical' | 'success'
  bannerMessage: string
}

export const CHECKPOINTS: Checkpoint[] = [
  {
    minutesFromStart: 0,
    label: 'Setup',
    shortLabel: 'Setup',
    type: 'info',
    bannerMessage:
      'Setup time. Get the room ready. Mentors arrive 9–9:45, introductions, timeline walkthrough, zone assignments confirmed.',
  },
  {
    minutesFromStart: 60,
    label: 'Build starts',
    shortLabel: 'Build',
    type: 'info',
    bannerMessage: 'Build time starts. Zone assignments confirmed. First milestone: all builder ideas locked within 15 minutes.',
  },
  {
    minutesFromStart: 120,
    label: 'Idea lock',
    shortLabel: 'Lock',
    type: 'critical',
    bannerMessage: "CRITICAL: Idea lock begins now. Message all mentors — every minute wasted is a minute builders don't get.",
  },
  {
    minutesFromStart: 135,
    label: 'Lock check',
    shortLabel: 'Check',
    type: 'critical',
    bannerMessage: '11:15am — Are all ideas locked? Every mentor must confirm yes or flag an issue. Host resolves blockers immediately.',
  },
  {
    minutesFromStart: 180,
    label: 'First rating',
    shortLabel: '12pm',
    type: 'warning',
    bannerMessage:
      "12:00pm — Ask mentors to rate their zones on the rubric. Most will be L1–L2. Look for zones that understand what they're building and why.",
  },
  {
    minutesFromStart: 240,
    label: 'Progress',
    shortLabel: '1pm',
    type: 'warning',
    bannerMessage: '1:00pm — Check movement. Some teams at L2–L3, a few at L4. Zones with no movement since 12pm need closer mentor attention.',
  },
  {
    minutesFromStart: 300,
    label: 'Focus shift',
    shortLabel: '2pm',
    type: 'warning',
    bannerMessage: '2:00pm — Mentors shift attention to standout teams. Push L3–L4–L5 by 3pm. Teams below L3 get less mentor time intentionally.',
  },
  {
    minutesFromStart: 360,
    label: 'Shortlist',
    shortLabel: '3pm',
    type: 'info',
    bannerMessage: '3:00pm — 5 to 8 teams should be in contention for final shortlist. Run the shortlist now.',
  },
  {
    minutesFromStart: 420,
    label: 'Build closes',
    shortLabel: 'Close',
    type: 'critical',
    bannerMessage: '4:00pm — BUILD TIME CLOSED. No more changes to products.',
  },
  {
    minutesFromStart: 450,
    label: 'Judging',
    shortLabel: 'Judge',
    type: 'critical',
    bannerMessage:
      '4:30pm — Final judgment begins. Score live, mentor by mentor. Leaderboard is now visible to all roles — mentors and judges can see live rankings.',
  },
  {
    minutesFromStart: 480,
    label: 'Demo',
    shortLabel: 'Demo',
    type: 'success',
    bannerMessage: '5:00pm — Top 5 demo time. 5 minutes per team. Announce the shortlist and start the timer.',
  },
  {
    minutesFromStart: 510,
    label: 'End',
    shortLabel: 'End',
    type: 'success',
    bannerMessage: '5:30pm — Closing remarks. Great buildathon.',
  },
]

export function getEventMinutes(startTime: string, eventDate: string): number {
  const now = new Date()

  // If an event date is configured, check it matches today
  if (eventDate) {
    const today = now.toISOString().split('T')[0] // 'YYYY-MM-DD'
    if (today !== eventDate) return -1 // not today — return sentinel
  }

  const [h, m] = startTime.split(':').map(Number)
  const start = new Date(now)
  start.setHours(h, m, 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 60000)
}

export function getElapsedLabel(minutes: number, startTime: string, eventDate: string): string {
  if (!eventDate) {
    // No date set — just show elapsed from startTime today
    if (minutes < 0) {
      const abs = Math.abs(minutes)
      const h = Math.floor(abs / 60)
      const m = abs % 60
      return h > 0 ? `Starts in ${h}h ${m}m` : `Starts in ${m}m`
    }
    if (minutes >= 510) return 'Event ended'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m elapsed` : `${m}m elapsed`
  }

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Event date is in the future
  if (eventDate > today) {
    const eventMs = new Date(eventDate + 'T' + startTime + ':00').getTime()
    const diffMs = eventMs - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    return `Starts in ${diffDays} day${diffDays !== 1 ? 's' : ''}`
  }

  // Event date was in the past
  if (eventDate < today) return 'Event ended'

  // Event date is today
  if (minutes < 0) {
    const abs = Math.abs(minutes)
    const h = Math.floor(abs / 60)
    const m = abs % 60
    return h > 0 ? `Starts in ${h}h ${m}m` : `Starts in ${m}m`
  }
  if (minutes >= 510) return 'Event ended'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m elapsed` : `${m}m elapsed`
}

export function getCurrentCheckpoint(minutes: number): Checkpoint | null {
  if (minutes < 0) return null
  return [...CHECKPOINTS].reverse().find((c) => minutes >= c.minutesFromStart) || null
}

export function getProgress(minutes: number): number {
  if (minutes < 0) return 0
  const total = 510
  return Math.min(100, Math.max(0, Math.round((minutes / total) * 100)))
}
