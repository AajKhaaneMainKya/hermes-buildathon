import { AppState } from './types'

export function defaultState(): AppState {
  return {
    passcodes: { host: 'host123', mentor: 'mentor123', judge: 'judge123' },
    hermesUrl: '',
    eventName: 'Hermes Buildathon',
    eventDate: '',
    startTime: '09:00',
    mentors: [],
    judges: [],
    zones: [],
    teams: [],
    participants: [],
    hostScores: {},
    judgeScores: {},
    ideaLockStatus: {},
    crossZoneFlags: [],
    shortlist: [],
    notifLog: [],
    mentorRecommendations: {},
    judgeRecommendations: {},
    floorOpen: false,
    judgingStep: 1,
    rankingBasis: 'judges_avg',
  }
}
