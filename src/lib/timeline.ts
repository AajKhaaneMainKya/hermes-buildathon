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
    bannerMessage: '4:30pm — Final judgment begins. Score live, mentor by mentor. Leaderboard is now visible to everyone.',
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

export function getEventMinutes(startTime: string): number {
  const now = new Date()
  const [h, m] = startTime.split(':').map(Number)
  const start = new Date(now)
  start.setHours(h, m, 0, 0)
  return Math.floor((now.getTime() - start.getTime()) / 60000)
}

export function getCurrentCheckpoint(minutes: number): Checkpoint | null {
  return [...CHECKPOINTS].reverse().find((c) => minutes >= c.minutesFromStart) || null
}

export function getProgress(minutes: number): number {
  const total = 510
  return Math.min(100, Math.max(0, Math.round((minutes / total) * 100)))
}
