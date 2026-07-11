import { Team } from '@/lib/types'
import { TRACKS } from '@/lib/tracks'
import { calcScore } from '@/lib/scoring'
import { Card, CardContent } from '@/components/ui/card'

const RANK_STYLES: Record<number, string> = {
  1: 'bg-amber-950 border-amber-600 text-amber-300',
  2: 'bg-zinc-800 border-zinc-500 text-zinc-200',
  3: 'bg-orange-950 border-orange-700 text-orange-300',
}

function RankBadge({ rank }: { rank: number }) {
  const style = RANK_STYLES[rank] || 'bg-zinc-800 border-zinc-700 text-zinc-400'
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${style}`}>
      {rank}
    </div>
  )
}

export default function Leaderboard({
  teams,
  scores,
  title,
}: {
  teams: Team[]
  scores: Record<string, Record<string, number | boolean | string>>
  title?: string
}) {
  const rows = teams
    .filter((t) => scores[t.id] && Object.keys(scores[t.id]).length > 0)
    .map((t) => ({ team: t, result: calcScore(scores[t.id] || {}, t.track) }))
    .sort((a, b) => b.result.total - a.result.total)

  if (rows.length === 0) {
    return <div className="py-10 text-center text-sm text-zinc-500">No scores yet.</div>
  }

  return (
    <div className="space-y-2">
      {title && <h3 className="text-sm font-semibold text-zinc-300">{title}</h3>}
      {rows.map((r, i) => (
        <Card key={r.team.id} className="border-zinc-700 bg-zinc-900">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <RankBadge rank={i + 1} />
              <div>
                <div className="font-semibold text-zinc-100">{r.team.name}</div>
                <div className="text-xs text-zinc-500">
                  {r.team.project} · {TRACKS[r.team.track].name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-zinc-100">{r.result.total}</div>
              <div className="text-[11px] text-zinc-500">
                {r.result.base}+{r.result.overflow}ovf+{r.result.powerup}pu
                {r.result.crossTrack ? `+${r.result.crossTrack}xt` : ''}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
