'use client'

import { Team, Zone, RankingBasis } from '@/lib/types'
import { TRACKS } from '@/lib/tracks'
import { ScoreResult, aggregateJudgeScores, calcScore, computeTeamTotal } from '@/lib/scoring'
import { csvFilename, downloadCSV } from '@/lib/exportCSV'
import { DownloadButton } from './DownloadButton'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-950 border-amber-600 text-amber-300',
  2: 'bg-zinc-800 border-zinc-500 text-zinc-200',
  3: 'bg-orange-950 border-orange-700 text-orange-300',
}

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank] || 'bg-zinc-800 border-zinc-700 text-zinc-400'
  return (
    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${style}`}>
      {rank}
    </div>
  )
}

const BASIS_LABELS: Record<RankingBasis, string> = {
  judges_avg: 'Judges — average',
  judges_sum: 'Judges — sum',
  host: 'Host score',
  mentor: 'Mentor score',
  all_avg: 'All scorers — average',
  all_sum: 'All scorers — sum',
}

const BASIS_SHORT: Record<RankingBasis, string> = {
  judges_avg: 'judges avg',
  judges_sum: 'judges sum',
  host: 'host',
  mentor: 'mentor',
  all_avg: 'all avg',
  all_sum: 'all sum',
}

const BASIS_OPTIONS: RankingBasis[] = ['judges_avg', 'judges_sum', 'host', 'mentor', 'all_avg', 'all_sum']

function emptyResult(): ScoreResult {
  return { base: 0, overflow: 0, powerup: 0, crossTrack: 0, total: 0, breakdown: {} }
}

function combineResults(a: ScoreResult, b: ScoreResult, c: ScoreResult, mode: 'avg' | 'sum'): ScoreResult {
  const combine = (x: number, y: number, z: number) => (mode === 'avg' ? Math.round((x + y + z) / 3) : x + y + z)
  return {
    base: combine(a.base, b.base, c.base),
    overflow: combine(a.overflow, b.overflow, c.overflow),
    powerup: combine(a.powerup, b.powerup, c.powerup),
    crossTrack: combine(a.crossTrack, b.crossTrack, c.crossTrack),
    total: combine(a.total, b.total, c.total),
    breakdown: {},
  }
}

export default function Leaderboard({
  teams,
  zones,
  hostScores,
  judgeScores,
  basis,
  onBasisChange,
  eventName,
  title,
}: {
  teams: Team[]
  zones: Zone[]
  hostScores: Record<string, Record<string, number | boolean | string>>
  judgeScores: Record<string, Record<string, Record<string, number | boolean | string>>>
  basis: RankingBasis
  onBasisChange?: (basis: RankingBasis) => void
  eventName?: string
  title?: string
}) {
  const rows = teams
    .map((t) => {
      const mentorResult = calcScore(t.mentorScores || {}, t.track)
      const hostResult = calcScore(hostScores[t.id] || {}, t.track)
      const judgeAvgResult = aggregateJudgeScores(judgeScores, t.id, t.track, 'avg')
      const judgeSumResult = aggregateJudgeScores(judgeScores, t.id, t.track, 'sum')
      const total = computeTeamTotal(t.id, t.track, hostScores, t.mentorScores || {}, judgeScores, basis)

      let primary: ScoreResult
      switch (basis) {
        case 'judges_avg':
          primary = judgeAvgResult
          break
        case 'judges_sum':
          primary = judgeSumResult
          break
        case 'host':
          primary = hostResult
          break
        case 'mentor':
          primary = mentorResult
          break
        case 'all_avg':
          primary = combineResults(hostResult, mentorResult, judgeAvgResult, 'avg')
          break
        case 'all_sum':
          primary = combineResults(hostResult, mentorResult, judgeSumResult, 'sum')
          break
        default:
          primary = emptyResult()
      }

      const zone = zones.find((z) => z.id === t.zoneId)
      const hasScores =
        Object.keys(t.mentorScores || {}).length > 0 ||
        Object.keys(hostScores[t.id] || {}).length > 0 ||
        Object.keys(judgeScores).some((jid) => Object.keys(judgeScores[jid]?.[t.id] || {}).length > 0)

      return { team: t, zone, mentorResult, hostResult, judgeAvgResult, judgeSumResult, primary, total, hasScores }
    })
    .filter((r) => r.hasScores)
    .sort((a, b) => b.total - a.total)

  const handleDownload = () => {
    const csvRows = rows.map((r, i) => ({
      Rank: i + 1,
      'Team name': r.team.name,
      Type: r.team.type === 'solo' ? 'Solo' : 'Team',
      Zone: r.zone?.name || '',
      Track: TRACKS[r.team.track].name,
      Members: r.team.members,
      Status: r.team.status,
      'Mentor score': r.mentorResult.total,
      'Host score': r.hostResult.total,
      'Judges avg': r.judgeAvgResult.total,
      'Judges sum': r.judgeSumResult.total,
      'Base pts': r.primary.base,
      'Overflow pts': r.primary.overflow,
      'Power-up pts': r.primary.powerup,
      'Cross-track bonus': r.primary.crossTrack,
      [`Total (${BASIS_SHORT[basis]})`]: r.total,
    }))
    downloadCSV(csvFilename(eventName || 'hermes-bno', 'leaderboard'), csvRows)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {title && <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>}
        <div className="ml-auto flex items-center gap-2">
          {onBasisChange ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Sort by:</span>
              <Select value={basis} onValueChange={(v) => onBasisChange((v as RankingBasis) ?? 'judges_avg')}>
                <SelectTrigger size="sm" className="w-48 bg-zinc-800">
                  <SelectValue>{(v: RankingBasis) => BASIS_LABELS[v]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {BASIS_OPTIONS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {BASIS_LABELS[b]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <span className="text-xs text-zinc-500">Sorted by {BASIS_LABELS[basis]}</span>
          )}
          <DownloadButton label="Download leaderboard CSV" onClick={handleDownload} disabled={rows.length === 0} />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="py-10 text-center text-sm text-zinc-500">No scores yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-zinc-800">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-left text-xs text-zinc-500">
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Team</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Zone</th>
                <th className="px-3 py-2 font-medium">Track</th>
                <th className="px-3 py-2 text-right font-medium">Mentor</th>
                <th className="px-3 py-2 text-right font-medium">Host</th>
                <th className="px-3 py-2 text-right font-medium">Judges avg</th>
                <th className="px-3 py-2 text-right font-medium">Judges sum</th>
                <th className="px-3 py-2 text-right font-medium">Total ({BASIS_SHORT[basis]})</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.team.id} className="border-b border-zinc-900 bg-zinc-950 last:border-0">
                  <td className="px-3 py-2">
                    <RankBadge rank={i + 1} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-zinc-100">{r.team.name}</div>
                    <div className="text-xs text-zinc-500">{r.team.project}</div>
                  </td>
                  <td className="px-3 py-2">
                    {r.team.type === 'solo' ? (
                      <Badge variant="outline" className="border-amber-600 text-amber-300">
                        Solo
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                        Team
                      </Badge>
                    )}
                  </td>
                  <td className="px-3 py-2 text-zinc-400">{r.zone?.name || '—'}</td>
                  <td className="px-3 py-2 text-zinc-400">{TRACKS[r.team.track].name}</td>
                  <td className="px-3 py-2 text-right text-zinc-300">{r.mentorResult.total}</td>
                  <td className="px-3 py-2 text-right text-zinc-300">{r.hostResult.total}</td>
                  <td className="px-3 py-2 text-right text-zinc-300">{r.judgeAvgResult.total}</td>
                  <td className="px-3 py-2 text-right text-zinc-300">{r.judgeSumResult.total}</td>
                  <td className="px-3 py-2 text-right text-base font-bold text-zinc-100">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
