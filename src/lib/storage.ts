import { AppState } from './types'

const KEY = 'bno_v3'

export function defaultState(): AppState {
  return {
    passcodes: { host: 'host123', mentor: 'mentor123', judge: 'judge123' },
    hermesUrl: '',
    eventName: 'Hermes Buildathon',
    eventDate: '',
    startTime: '09:00',
    mentors: [],
    zones: [],
    teams: [],
    hostScores: {},
    judgeScores: {},
    ideaLockStatus: {},
    crossZoneFlags: [],
    shortlist: [],
    notifLog: [],
    mentorRecommendations: {},
    floorOpen: false,
    judgingStep: 1,
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...JSON.parse(raw) }
  } catch {
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {}
}
