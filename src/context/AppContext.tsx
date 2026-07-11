'use client'

import React, { createContext, useContext, useEffect, useReducer, useRef } from 'react'
import { AppState, CrossZoneFlag, Judge, Mentor, NotifEntry, Participant, Team, TeamStatus, Zone } from '@/lib/types'
import { defaultState, loadState, saveState } from '@/lib/storage'

type Action =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'SET_PASSCODES'; payload: Partial<AppState['passcodes']> }
  | { type: 'SET_HERMES_URL'; payload: string }
  | { type: 'SET_EVENT_SETTINGS'; payload: Partial<Pick<AppState, 'eventName' | 'eventDate' | 'startTime'>> }
  | { type: 'ADD_MENTOR'; payload: Mentor }
  | { type: 'REMOVE_MENTOR'; payload: string }
  | { type: 'ADD_JUDGE'; payload: Judge }
  | { type: 'REMOVE_JUDGE'; payload: string }
  | { type: 'ADD_ZONE'; payload: Zone }
  | { type: 'REMOVE_ZONE'; payload: string }
  | { type: 'ADD_TEAM'; payload: Team }
  | { type: 'REMOVE_TEAM'; payload: string }
  | { type: 'UPDATE_TEAM_STATUS'; payload: { teamId: string; status: TeamStatus } }
  | { type: 'SET_PARTICIPANTS'; payload: Participant[] }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'REMOVE_PARTICIPANT'; payload: string }
  | { type: 'ASSIGN_PARTICIPANT_ZONE'; payload: { participantId: string; zoneId: string | undefined } }
  | { type: 'SET_HOST_SCORE'; payload: { teamId: string; param: string; value: number | boolean | string } }
  | {
      type: 'SET_JUDGE_SCORE'
      payload: { judgeId: string; teamId: string; param: string; value: number | boolean | string }
    }
  | { type: 'SET_MENTOR_SCORE'; payload: { teamId: string; param: string; value: number | boolean | string } }
  | { type: 'SET_MENTOR_NOTE'; payload: { teamId: string; notes: string } }
  | { type: 'SET_IDEA_LOCK'; payload: { mentorName: string; status: 'pending' | 'yes' | 'no' } }
  | { type: 'SET_MENTOR_LOCK'; payload: { teamId: string; lock: 'yes' | 'no'; reason: string | null } }
  | { type: 'ADD_CROSS_ZONE_FLAG'; payload: CrossZoneFlag }
  | { type: 'SET_SHORTLIST'; payload: string[] }
  | { type: 'LOG_NOTIF'; payload: NotifEntry }
  | { type: 'SET_MENTOR_RECOMMENDATIONS'; payload: { mentorName: string; teamIds: string[] } }
  | { type: 'SET_JUDGE_RECOMMENDATIONS'; payload: { judgeId: string; teamIds: string[] } }
  | { type: 'SET_FLOOR_OPEN'; payload: boolean }
  | { type: 'SET_JUDGING_STEP'; payload: 1 | 2 | 3 | 4 }
  | { type: 'SET_RANKING_BASIS'; payload: AppState['rankingBasis'] }
  | { type: 'RESET_EVENT_DATA' }
  | { type: 'FULL_RESET' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload
    case 'SET_PASSCODES':
      return { ...state, passcodes: { ...state.passcodes, ...action.payload } }
    case 'SET_HERMES_URL':
      return { ...state, hermesUrl: action.payload }
    case 'SET_EVENT_SETTINGS':
      return { ...state, ...action.payload }
    case 'ADD_MENTOR':
      return { ...state, mentors: [...state.mentors, action.payload] }
    case 'REMOVE_MENTOR':
      return { ...state, mentors: state.mentors.filter((m) => m.id !== action.payload) }
    case 'ADD_JUDGE':
      return { ...state, judges: [...state.judges, action.payload] }
    case 'REMOVE_JUDGE':
      return { ...state, judges: state.judges.filter((j) => j.id !== action.payload) }
    case 'ADD_ZONE':
      return { ...state, zones: [...state.zones, action.payload] }
    case 'REMOVE_ZONE':
      return { ...state, zones: state.zones.filter((z) => z.id !== action.payload) }
    case 'ADD_TEAM':
      return { ...state, teams: [...state.teams, action.payload] }
    case 'REMOVE_TEAM':
      return { ...state, teams: state.teams.filter((t) => t.id !== action.payload) }
    case 'UPDATE_TEAM_STATUS':
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.payload.teamId ? { ...t, status: action.payload.status } : t
        ),
      }
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload }
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] }
    case 'REMOVE_PARTICIPANT':
      return { ...state, participants: state.participants.filter((p) => p.id !== action.payload) }
    case 'ASSIGN_PARTICIPANT_ZONE':
      return {
        ...state,
        participants: state.participants.map((p) =>
          p.id === action.payload.participantId ? { ...p, zone: action.payload.zoneId } : p
        ),
      }
    case 'SET_HOST_SCORE': {
      const { teamId, param, value } = action.payload
      return {
        ...state,
        hostScores: {
          ...state.hostScores,
          [teamId]: { ...state.hostScores[teamId], [param]: value },
        },
      }
    }
    case 'SET_JUDGE_SCORE': {
      const { judgeId, teamId, param, value } = action.payload
      return {
        ...state,
        judgeScores: {
          ...state.judgeScores,
          [judgeId]: {
            ...state.judgeScores[judgeId],
            [teamId]: { ...(state.judgeScores[judgeId]?.[teamId] || {}), [param]: value },
          },
        },
      }
    }
    case 'SET_MENTOR_SCORE': {
      const { teamId, param, value } = action.payload
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === teamId ? { ...t, mentorScores: { ...t.mentorScores, [param]: value } } : t
        ),
      }
    }
    case 'SET_MENTOR_NOTE':
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.payload.teamId ? { ...t, mentorNotes: action.payload.notes } : t
        ),
      }
    case 'SET_IDEA_LOCK':
      return {
        ...state,
        ideaLockStatus: { ...state.ideaLockStatus, [action.payload.mentorName]: action.payload.status },
      }
    case 'SET_MENTOR_LOCK':
      return {
        ...state,
        teams: state.teams.map((t) =>
          t.id === action.payload.teamId
            ? { ...t, mentorLock: action.payload.lock, mentorLockReason: action.payload.reason }
            : t
        ),
      }
    case 'ADD_CROSS_ZONE_FLAG':
      return { ...state, crossZoneFlags: [...state.crossZoneFlags, action.payload] }
    case 'SET_SHORTLIST':
      return { ...state, shortlist: action.payload }
    case 'LOG_NOTIF':
      return { ...state, notifLog: [action.payload, ...state.notifLog].slice(0, 200) }
    case 'SET_MENTOR_RECOMMENDATIONS':
      return {
        ...state,
        mentorRecommendations: {
          ...state.mentorRecommendations,
          [action.payload.mentorName]: action.payload.teamIds,
        },
      }
    case 'SET_JUDGE_RECOMMENDATIONS':
      return {
        ...state,
        judgeRecommendations: {
          ...state.judgeRecommendations,
          [action.payload.judgeId]: action.payload.teamIds,
        },
      }
    case 'SET_FLOOR_OPEN':
      return { ...state, floorOpen: action.payload }
    case 'SET_JUDGING_STEP':
      return { ...state, judgingStep: action.payload }
    case 'SET_RANKING_BASIS':
      return { ...state, rankingBasis: action.payload }
    case 'RESET_EVENT_DATA': {
      const fresh = defaultState()
      return {
        ...fresh,
        passcodes: state.passcodes,
        hermesUrl: state.hermesUrl,
        eventName: state.eventName,
        eventDate: state.eventDate,
        startTime: state.startTime,
        mentors: state.mentors,
        judges: state.judges,
      }
    }
    case 'FULL_RESET':
      return defaultState()
    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  setPasscodes: (payload: Partial<AppState['passcodes']>) => void
  setHermesUrl: (url: string) => void
  setEventSettings: (payload: Partial<Pick<AppState, 'eventName' | 'eventDate' | 'startTime'>>) => void
  addMentor: (mentor: Mentor) => void
  removeMentor: (id: string) => void
  addJudge: (judge: Judge) => void
  removeJudge: (id: string) => void
  addZone: (zone: Zone) => void
  removeZone: (id: string) => void
  addTeam: (team: Team) => void
  removeTeam: (id: string) => void
  updateTeamStatus: (teamId: string, status: TeamStatus) => void
  setParticipants: (participants: Participant[]) => void
  addParticipant: (participant: Participant) => void
  removeParticipant: (id: string) => void
  assignParticipantZone: (participantId: string, zoneId: string | undefined) => void
  setHostScore: (teamId: string, param: string, value: number | boolean | string) => void
  setJudgeScore: (judgeId: string, teamId: string, param: string, value: number | boolean | string) => void
  setMentorScore: (teamId: string, param: string, value: number | boolean | string) => void
  setMentorNote: (teamId: string, notes: string) => void
  setIdeaLock: (mentorName: string, status: 'pending' | 'yes' | 'no') => void
  setMentorLock: (teamId: string, lock: 'yes' | 'no', reason: string | null) => void
  addCrossZoneFlag: (flag: CrossZoneFlag) => void
  setShortlist: (teamIds: string[]) => void
  logNotif: (entry: NotifEntry) => void
  setMentorRecommendations: (mentorName: string, teamIds: string[]) => void
  setJudgeRecommendations: (judgeId: string, teamIds: string[]) => void
  setFloorOpen: (open: boolean) => void
  setJudgingStep: (step: 1 | 2 | 3 | 4) => void
  setRankingBasis: (basis: AppState['rankingBasis']) => void
  resetEventData: () => void
  fullReset: () => void
  notify: (text: string, type: NotifEntry['type']) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultState())
  const hydrated = useRef(false)

  useEffect(() => {
    dispatch({ type: 'HYDRATE', payload: loadState() })
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (hydrated.current) saveState(state)
  }, [state])

  const notify = async (text: string, type: NotifEntry['type']) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    dispatch({ type: 'LOG_NOTIF', payload: { time, msg: text, type } })
    const { callHermes } = await import('@/lib/hermes')
    await callHermes(state.hermesUrl, text, type)
  }

  const value: AppContextValue = {
    state,
    dispatch,
    setPasscodes: (payload) => dispatch({ type: 'SET_PASSCODES', payload }),
    setHermesUrl: (url) => dispatch({ type: 'SET_HERMES_URL', payload: url }),
    setEventSettings: (payload) => dispatch({ type: 'SET_EVENT_SETTINGS', payload }),
    addMentor: (mentor) => dispatch({ type: 'ADD_MENTOR', payload: mentor }),
    removeMentor: (id) => dispatch({ type: 'REMOVE_MENTOR', payload: id }),
    addJudge: (judge) => dispatch({ type: 'ADD_JUDGE', payload: judge }),
    removeJudge: (id) => dispatch({ type: 'REMOVE_JUDGE', payload: id }),
    addZone: (zone) => dispatch({ type: 'ADD_ZONE', payload: zone }),
    removeZone: (id) => dispatch({ type: 'REMOVE_ZONE', payload: id }),
    addTeam: (team) => dispatch({ type: 'ADD_TEAM', payload: team }),
    removeTeam: (id) => dispatch({ type: 'REMOVE_TEAM', payload: id }),
    updateTeamStatus: (teamId, status) => dispatch({ type: 'UPDATE_TEAM_STATUS', payload: { teamId, status } }),
    setParticipants: (participants) => dispatch({ type: 'SET_PARTICIPANTS', payload: participants }),
    addParticipant: (participant) => dispatch({ type: 'ADD_PARTICIPANT', payload: participant }),
    removeParticipant: (id) => dispatch({ type: 'REMOVE_PARTICIPANT', payload: id }),
    assignParticipantZone: (participantId, zoneId) =>
      dispatch({ type: 'ASSIGN_PARTICIPANT_ZONE', payload: { participantId, zoneId } }),
    setHostScore: (teamId, param, value) => dispatch({ type: 'SET_HOST_SCORE', payload: { teamId, param, value } }),
    setJudgeScore: (judgeId, teamId, param, value) =>
      dispatch({ type: 'SET_JUDGE_SCORE', payload: { judgeId, teamId, param, value } }),
    setMentorScore: (teamId, param, value) =>
      dispatch({ type: 'SET_MENTOR_SCORE', payload: { teamId, param, value } }),
    setMentorNote: (teamId, notes) => dispatch({ type: 'SET_MENTOR_NOTE', payload: { teamId, notes } }),
    setIdeaLock: (mentorName, status) => dispatch({ type: 'SET_IDEA_LOCK', payload: { mentorName, status } }),
    setMentorLock: (teamId, lock, reason) => dispatch({ type: 'SET_MENTOR_LOCK', payload: { teamId, lock, reason } }),
    addCrossZoneFlag: (flag) => dispatch({ type: 'ADD_CROSS_ZONE_FLAG', payload: flag }),
    setShortlist: (teamIds) => dispatch({ type: 'SET_SHORTLIST', payload: teamIds }),
    logNotif: (entry) => dispatch({ type: 'LOG_NOTIF', payload: entry }),
    setMentorRecommendations: (mentorName, teamIds) =>
      dispatch({ type: 'SET_MENTOR_RECOMMENDATIONS', payload: { mentorName, teamIds } }),
    setJudgeRecommendations: (judgeId, teamIds) =>
      dispatch({ type: 'SET_JUDGE_RECOMMENDATIONS', payload: { judgeId, teamIds } }),
    setFloorOpen: (open) => dispatch({ type: 'SET_FLOOR_OPEN', payload: open }),
    setJudgingStep: (step) => dispatch({ type: 'SET_JUDGING_STEP', payload: step }),
    setRankingBasis: (basis) => dispatch({ type: 'SET_RANKING_BASIS', payload: basis }),
    resetEventData: () => dispatch({ type: 'RESET_EVENT_DATA' }),
    fullReset: () => dispatch({ type: 'FULL_RESET' }),
    notify,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
