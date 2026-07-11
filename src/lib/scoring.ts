import { TRACKS, POWERUPS, CROSS_TRACK_BONUS } from './tracks'
import { TrackId } from './types'

export interface ScoreResult {
  base: number
  overflow: number
  powerup: number
  crossTrack: number
  total: number
  breakdown: Record<string, number>
}

export function calcScore(
  scores: Record<string, number | boolean | string>,
  track: TrackId
): ScoreResult {
  const params = TRACKS[track].params
  let base = 0
  let overflow = 0
  const breakdown: Record<string, number> = {}

  params.forEach((p) => {
    const l = Number(scores[p.id]) || 1
    const pts = (l - 1) * p.weight
    base += pts
    breakdown[p.id] = pts

    if (p.overflow && l === 5) {
      const extra = Number(scores[`${p.id}_overflow`]) || 0
      if (extra > 0) {
        const overflowPts = Math.floor(extra / p.overflow.per) * p.overflow.pts
        overflow += overflowPts
        breakdown[`${p.id}_overflow`] = overflowPts
      }
    }
  })

  let powerup = 0
  POWERUPS.forEach((pu) => {
    if (scores[`pu_${pu.id}`]) powerup += pu.pts
  })

  const { crossTrack } = calcCrossTrackBonus(scores, track)

  return { base, overflow, powerup, crossTrack, total: base + overflow + powerup + crossTrack, breakdown }
}

export function calcCrossTrackBonus(
  scores: Record<string, number | boolean | string>,
  teamTrack: TrackId
): { crossTrack: number } {
  const entries = CROSS_TRACK_BONUS.filter((e) => e.sourceTrack !== teamTrack)
  let total = 0
  entries.forEach((e) => {
    const l = Number(scores[`${e.paramId}_cross`]) || 1
    const pts = Math.min((l - 1) * e.bonusWeight, e.maxBonus)
    total += pts
  })
  return { crossTrack: Math.min(total, 50) }
}

export interface SpoofWarning {
  param: string
  message: string
}

export function spoofCheck(scores: Record<string, number | boolean | string>): SpoofWarning[] {
  const warnings: SpoofWarning[] = []
  const impressions = Number(scores.impressions_raw) || 0
  const visitors = Number(scores.visitors_raw) || 0
  const signups = Number(scores.signups_v_raw) || 0

  if (visitors > 0 && impressions > 0) {
    const ctr = visitors / impressions
    if (ctr > 0.1) {
      warnings.push({
        param: 'visitors',
        message: `CTR breach: ${(ctr * 100).toFixed(1)}% CTR exceeds 10% max. Visitors param drops to L1 unless a non-social traffic source is proved.`,
      })
    }
  }

  if (signups > 0 && visitors > 0) {
    const cvr = signups / visitors
    if (cvr > 0.5) {
      warnings.push({
        param: 'signups_v',
        message: `CVR breach: ${(cvr * 100).toFixed(1)}% conversion exceeds 50% max. Signups param drops to L1 unless a direct-share source is proved.`,
      })
    }
  }

  return warnings
}
