export type Role = 'host' | 'mentor' | 'judge'
export type TrackId = 'virality' | 'revenue' | 'agency'
export type TeamStatus = 'building' | 'locked' | 'scoring' | 'shortlisted' | 'eliminated'
export type RankingBasis = 'judges_avg' | 'judges_sum' | 'host' | 'mentor' | 'all_avg' | 'all_sum'
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

export interface Judge {
  id: string
  name: string
  telegram: string
}

export interface Participant {
  id: string
  name: string
  email: string
  zone?: string // zoneId, assigned after import
}

export type ZoneColor = 'violet' | 'emerald' | 'amber' | 'blue' | 'rose' | 'cyan'

export interface Zone {
  id: string
  name: string
  mentorName: string // display name, matches Mentor.name; '' = unassigned
  maxBuilders?: number
  color?: ZoneColor
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
  judges: Judge[]
  zones: Zone[]
  teams: Team[]
  participants: Participant[]
  hostScores: Record<string, Record<string, number | boolean | string>> // teamId -> scores
  judgeScores: Record<string, Record<string, Record<string, number | boolean | string>>> // judgeId -> teamId -> scores
  ideaLockStatus: Record<string, 'pending' | 'yes' | 'no'> // mentorName -> status
  crossZoneFlags: CrossZoneFlag[]
  shortlist: string[] // teamIds (exactly 5 for demo)
  notifLog: NotifEntry[]
  mentorRecommendations: Record<string, string[]> // mentorName -> teamIds (0-3)
  judgeRecommendations: Record<string, string[]> // judgeId -> teamIds (0-3)
  floorOpen: boolean // true after host opens cross-zone input in judging step 3
  judgingStep: 1 | 2 | 3 | 4
  rankingBasis: RankingBasis
}
