'use client'

import { useState } from 'react'
import { useApp } from '@/context/AppContext'
import { Judge, Team } from '@/lib/types'
import { TRACKS } from '@/lib/tracks'
import { aggregateJudgeScores, calcScore } from '@/lib/scoring'
import { csvFilename, downloadCSV } from '@/lib/exportCSV'
import ScoringCard from '@/components/shared/ScoringCard'
import { DownloadButton } from '@/components/shared/DownloadButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type ScoreMap = Record<string, number | boolean | string>

function buildBreakdownRows(
  team: Team,
  hostScores: Record<string, ScoreMap>,
  judgeScores: Record<string, Record<string, ScoreMap>>,
  judges: Judge[]
) {
  const track = TRACKS[team.track]
  const mentorResult = calcScore(team.mentorScores || {}, team.track)
  const hostResult = calcScore(hostScores[team.id] || {}, team.track)
  const judgeAvgResult = aggregateJudgeScores(judgeScores, team.id, team.track, 'avg')

  return track.params.map((p) => {
    const mentorL = Number(team.mentorScores?.[p.id]) || 1
    const hostL = Number(hostScores[team.id]?.[p.id]) || 1
    const judgeLevels: Record<string, number> = {}
    judges.forEach((j) => {
      judgeLevels[j.id] = Number(judgeScores[j.id]?.[team.id]?.[p.id]) || 0
    })
    const scoredLevels = Object.values(judgeLevels).filter((l) => l > 0)
    const judgesAvgL = scoredLevels.length
      ? Math.round(scoredLevels.reduce((a, b) => a + b, 0) / scoredLevels.length)
      : 1

    return {
      param: p,
      mentorL,
      mentorPts: mentorResult.breakdown[p.id] || 0,
      hostL,
      hostPts: hostResult.breakdown[p.id] || 0,
      judgeLevels,
      judgesAvgL,
      judgesAvgPts: judgeAvgResult.breakdown[p.id] || 0,
    }
  })
}

export default function ScoringTab() {
  const { state, setHostScore } = useApp()
  const [teamId, setTeamId] = useState(state.teams[0]?.id || '')

  const team = state.teams.find((t) => t.id === teamId)
  const breakdownRows = team ? buildBreakdownRows(team, state.hostScores, state.judgeScores, state.judges) : []

  const downloadBreakdown = () => {
    const rows = state.teams.flatMap((t) =>
      buildBreakdownRows(t, state.hostScores, state.judgeScores, state.judges).map((r) => {
        const base: Record<string, string | number> = {
          'Team name': t.name,
          Track: TRACKS[t.track].name,
          Parameter: r.param.name,
          Weight: r.param.weight,
          'L (mentor)': r.mentorL,
          'Pts (mentor)': r.mentorPts,
          'L (host)': r.hostL,
          'Pts (host)': r.hostPts,
        }
        state.judges.forEach((j) => {
          base[`L (${j.name})`] = r.judgeLevels[j.id] || ''
        })
        base['L (judges avg)'] = r.judgesAvgL
        base['Pts (judges avg)'] = r.judgesAvgPts
        return base
      })
    )
    downloadCSV(csvFilename(state.eventName, 'scoring-breakdown'), rows)
  }

  const downloadJudgeScores = () => {
    const rows: Record<string, string | number>[] = []
    state.teams.forEach((t) => {
      const track = TRACKS[t.track]
      state.judges.forEach((j) => {
        const judgeTeamScores = state.judgeScores[j.id]?.[t.id]
        if (!judgeTeamScores || Object.keys(judgeTeamScores).length === 0) return
        const result = calcScore(judgeTeamScores, t.track)
        track.params.forEach((p) => {
          rows.push({
            'Team name': t.name,
            Track: track.name,
            Parameter: p.name,
            'Judge name': j.name,
            'L score': Number(judgeTeamScores[p.id]) || 1,
            Points: result.breakdown[p.id] || 0,
          })
        })
      })
    })
    downloadCSV(csvFilename(state.eventName, 'judge-scores'), rows)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Select value={teamId} onValueChange={(v) => setTeamId((v ?? ""))}>
          <SelectTrigger className="w-full bg-zinc-800 sm:w-72">
            <SelectValue placeholder="Select a team to score">
              {(v: string | null) => (v ? state.teams.find((t) => t.id === v)?.name : 'Select a team to score')}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {state.teams.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2">
          <DownloadButton label="Download scoring breakdown CSV" onClick={downloadBreakdown} disabled={state.teams.length === 0} />
          <DownloadButton label="Download judge scores CSV" onClick={downloadJudgeScores} disabled={state.judges.length === 0} />
        </div>
      </div>

      {!team && <p className="text-sm text-zinc-500">Select a team above to begin scoring.</p>}

      {team && (
        <>
          <ScoringCard
            team={team}
            scores={state.hostScores[team.id] || {}}
            onChange={(param, level) => setHostScore(team.id, param, level)}
            onOverflow={(param, value) => setHostScore(team.id, `${param}_overflow`, value)}
            onPowerup={(id, checked) => setHostScore(team.id, `pu_${id}`, checked)}
            onRaw={(param, value) => setHostScore(team.id, param, value)}
            onCrossChange={(param, level) => setHostScore(team.id, `${param}_cross`, level)}
            showSpoofCheck
          />

          <Card className="border-zinc-700 bg-zinc-900">
            <CardHeader>
              <CardTitle className="text-zinc-100">Score breakdown</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-left text-xs text-zinc-500">
                    <th className="px-2 py-2 font-medium">Parameter</th>
                    <th className="px-2 py-2 text-right font-medium">Weight</th>
                    <th className="px-2 py-2 text-right font-medium">L mentor</th>
                    <th className="px-2 py-2 text-right font-medium">Pts mentor</th>
                    <th className="px-2 py-2 text-right font-medium">L host</th>
                    <th className="px-2 py-2 text-right font-medium">Pts host</th>
                    {state.judges.map((j) => (
                      <th key={j.id} className="px-2 py-2 text-right font-medium">
                        L {j.name}
                      </th>
                    ))}
                    <th className="px-2 py-2 text-right font-medium">L judges avg</th>
                    <th className="px-2 py-2 text-right font-medium">Pts judges avg</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownRows.map((r) => (
                    <tr key={r.param.id} className="border-b border-zinc-900 last:border-0">
                      <td className="px-2 py-2 text-zinc-200">{r.param.name}</td>
                      <td className="px-2 py-2 text-right text-zinc-400">×{r.param.weight}</td>
                      <td className="px-2 py-2 text-right text-zinc-400">L{r.mentorL}</td>
                      <td className="px-2 py-2 text-right text-zinc-300">{r.mentorPts}</td>
                      <td className="px-2 py-2 text-right text-zinc-400">L{r.hostL}</td>
                      <td className="px-2 py-2 text-right text-zinc-300">{r.hostPts}</td>
                      {state.judges.map((j) => (
                        <td key={j.id} className="px-2 py-2 text-right text-zinc-400">
                          {r.judgeLevels[j.id] ? `L${r.judgeLevels[j.id]}` : '—'}
                        </td>
                      ))}
                      <td className="px-2 py-2 text-right text-zinc-400">L{r.judgesAvgL}</td>
                      <td className="px-2 py-2 text-right font-semibold text-zinc-100">{r.judgesAvgPts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
