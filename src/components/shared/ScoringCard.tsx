'use client'

import { Team } from '@/lib/types'
import { TRACKS, POWERUPS, CROSS_TRACK_BONUS } from '@/lib/tracks'
import { calcScore, spoofCheck } from '@/lib/scoring'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const LEVEL_CLASSES: Record<number, string> = {
  1: 'bg-zinc-700 border-zinc-600 text-zinc-300',
  2: 'bg-blue-950 border-blue-700 text-blue-300',
  3: 'bg-emerald-950 border-emerald-700 text-emerald-300',
  4: 'bg-violet-950 border-violet-700 text-violet-300',
  5: 'bg-amber-950 border-amber-600 text-amber-300',
}
const DEFAULT_CLASS = 'bg-zinc-800 border-zinc-700 text-zinc-400'

function LevelRow({
  levels,
  selected,
  onSelect,
}: {
  levels: string[]
  selected: number
  onSelect: (level: number) => void
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {levels.map((_, idx) => {
          const level = idx + 1
          const isSelected = selected === level
          return (
            <button
              key={level}
              type="button"
              onClick={() => onSelect(level)}
              className={`rounded-md border px-3 py-1.5 text-sm font-semibold transition-colors ${
                isSelected ? LEVEL_CLASSES[level] : DEFAULT_CLASS
              }`}
            >
              L{level}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-zinc-500">{levels[selected - 1]}</p>
    </div>
  )
}

export interface ScoringCardProps {
  team: Team
  scores: Record<string, number | boolean | string>
  onChange: (param: string, level: number) => void
  onOverflow: (param: string, value: number) => void
  onPowerup: (id: string, checked: boolean) => void
  onNotes?: (text: string) => void
  onRaw?: (param: string, value: number) => void
  onCrossChange?: (param: string, level: number) => void
  showSpoofCheck?: boolean
}

export default function ScoringCard({
  team,
  scores,
  onChange,
  onOverflow,
  onPowerup,
  onNotes,
  onRaw,
  onCrossChange,
  showSpoofCheck,
}: ScoringCardProps) {
  const track = TRACKS[team.track]
  const result = calcScore(scores, team.track)
  const warnings = showSpoofCheck && team.track === 'virality' ? spoofCheck(scores) : []
  const crossEntries = CROSS_TRACK_BONUS.filter((e) => e.sourceTrack !== team.track)

  return (
    <Card className="border-zinc-700 bg-zinc-900">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle className="text-zinc-100">{team.name}</CardTitle>
          <p className="text-xs text-zinc-500">{team.project}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-zinc-700 text-zinc-300">
            {track.name}
          </Badge>
          <div className="text-right">
            <div className="text-xl font-bold text-zinc-100">{result.total}</div>
            <div className="text-[10px] text-zinc-500">total</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {team.track === 'virality' && showSpoofCheck && (
          <div className="grid grid-cols-3 gap-2 rounded-md border border-zinc-800 bg-zinc-950 p-3">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-500">Impressions (raw)</label>
              <Input
                type="number"
                className="h-8 bg-zinc-900"
                value={Number(scores.impressions_raw) || ''}
                onChange={(e) => onRaw?.('impressions_raw', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-500">Visitors (raw)</label>
              <Input
                type="number"
                className="h-8 bg-zinc-900"
                value={Number(scores.visitors_raw) || ''}
                onChange={(e) => onRaw?.('visitors_raw', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-500">Signups (raw)</label>
              <Input
                type="number"
                className="h-8 bg-zinc-900"
                value={Number(scores.signups_v_raw) || ''}
                onChange={(e) => onRaw?.('signups_v_raw', Number(e.target.value))}
              />
            </div>
          </div>
        )}

        {warnings.map((w) => (
          <div key={w.param} className="rounded-md border border-red-700 bg-red-950 px-3 py-2 text-xs text-red-300">
            {w.message}
          </div>
        ))}

        <div className="space-y-4">
          {track.params.map((p) => {
            const level = Number(scores[p.id]) || 1
            return (
              <div key={p.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-200">{p.name}</span>
                  <span className="text-xs text-zinc-500">weight ×{p.weight}</span>
                </div>
                <LevelRow levels={p.levels} selected={level} onSelect={(l) => onChange(p.id, l)} />
                {p.overflow && level === 5 && (
                  <div className="flex items-center gap-2 pt-1">
                    <label className="text-xs text-zinc-500">
                      Overflow (raw count beyond {p.overflow.threshold}):
                    </label>
                    <Input
                      type="number"
                      className="h-8 w-28 bg-zinc-800"
                      value={Number(scores[`${p.id}_overflow`]) || ''}
                      onChange={(e) => onOverflow(p.id, Number(e.target.value))}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {crossEntries.length > 0 && onCrossChange && (
          <div className="space-y-3 rounded-md border border-zinc-800 bg-zinc-950 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Cross-track bonus (capped at 50)
            </div>
            {crossEntries.map((e) => {
              const sourceParam = TRACKS[e.sourceTrack].params.find((p) => p.id === e.paramId)
              if (!sourceParam) return null
              const level = Number(scores[`${e.paramId}_cross`]) || 1
              return (
                <div key={e.paramId} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">
                      {sourceParam.name}{' '}
                      <span className="text-zinc-600">({TRACKS[e.sourceTrack].name})</span>
                    </span>
                    <span className="text-xs text-zinc-500">
                      bonus weight ×{e.bonusWeight}, max {e.maxBonus}
                    </span>
                  </div>
                  <LevelRow
                    levels={sourceParam.levels}
                    selected={level}
                    onSelect={(l) => onCrossChange(e.paramId, l)}
                  />
                </div>
              )
            })}
            <div className="text-right text-xs text-zinc-400">Bonus applied: +{result.crossTrack}</div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Power-ups</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {POWERUPS.map((pu) => {
              const checked = Boolean(scores[`pu_${pu.id}`])
              return (
                <label
                  key={pu.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-md border px-2.5 py-2 text-xs ${
                    checked ? 'border-amber-600 bg-amber-950 text-amber-300' : 'border-zinc-700 bg-zinc-800 text-zinc-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-0.5"
                    checked={checked}
                    onChange={(e) => onPowerup(pu.id, e.target.checked)}
                  />
                  <span>
                    <span className="block font-semibold">
                      {pu.name} (+{pu.pts})
                    </span>
                    <span className="block text-[10px] opacity-70">{pu.evidence}</span>
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {onNotes && (
          <div className="space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Notes</div>
            <Textarea
              className="bg-zinc-800"
              value={team.mentorNotes}
              onChange={(e) => onNotes(e.target.value)}
              placeholder="Notes on this team's progress..."
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-4 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
          <span>base {result.base}</span>
          <span>overflow {result.overflow}</span>
          <span>power-ups {result.powerup}</span>
          {result.crossTrack > 0 && <span>cross-track {result.crossTrack}</span>}
          <span className="font-bold text-zinc-200">total {result.total}</span>
        </div>
      </CardContent>
    </Card>
  )
}
