export type Role = 'host' | 'mentor' | 'judge'
export type TrackId = 'virality' | 'revenue' | 'agency'
export type TeamStatus = 'building' | 'locked' | 'scoring' | 'shortlisted' | 'eliminated'
export type NotifType =
  | 'broadcast'
  | 'dm'
  | 'idea_lock'
  | 'time_warning'
  | 'submission'
  | 'status'
  | 'shortlist'
  | 'registration'
  | 'cross_zone'

export interface Mentor {
  id: string
  name: string
  telegram: string
}

export interface Zone {
  id: string
  name: string
  mentorName: string // display name, matches Mentor.name
  maxBuilders: number
}

export interface Team {
  id: string
  name: string
  project: string
  members: string
  zoneId: string
  track: TrackId
  status: TeamStatus
  mentorNotes: string
  mentorScores: Record<string, number | boolean | string>
  mentorLock: 'yes' | 'no' | null
  mentorLockReason: string | null
}

export interface CrossZoneFlag {
  teamId: string
  teamName: string
  reason: string
  time: string
}

export interface NotifEntry {
  time: string
  msg: string
  type: NotifType
}

export interface AppState {
  passcodes: { host: string; mentor: string; judge: string }
  hermesUrl: string
  eventName: string
  eventDate: string
  startTime: string // 'HH:MM', default '09:00'
  mentors: Mentor[]
  zones: Zone[]
  teams: Team[]
  hostScores: Record<string, Record<string, number | boolean | string>> // teamId -> scores
  judgeScores: Record<string, Record<string, number | boolean | string>>
  ideaLockStatus: Record<string, 'pending' | 'yes' | 'no'> // mentorName -> status
  crossZoneFlags: CrossZoneFlag[]
  shortlist: string[] // teamIds (exactly 5 for demo)
  notifLog: NotifEntry[]
  mentorRecommendations: Record<string, string[]> // mentorName -> teamIds (0-3)
  floorOpen: boolean // true after host opens cross-zone input in judging step 3
  judgingStep: 1 | 2 | 3 | 4
}
