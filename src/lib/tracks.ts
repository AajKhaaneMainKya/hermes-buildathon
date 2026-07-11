import { TrackId } from './types'

export interface TrackParam {
  id: string
  name: string
  weight: number
  levels: string[] // L1 to L5 descriptions, index 0 = L1
  overflow?: {
    threshold: number // value at which overflow starts
    per: number // per N units
    pts: number // points per N (already weight-adjusted)
  }
}

export interface Track {
  id: string
  name: string
  base: number
  params: TrackParam[]
}

export const TRACKS: Record<string, Track> = {
  virality: {
    id: 'virality',
    name: 'Virality',
    base: 164,
    params: [
      {
        id: 'impressions',
        name: 'Impressions & views',
        weight: 1,
        levels: ['Under 100', '101–1k', '1k–2.5k', '2.5k–5k', '5k–7.5k'],
        overflow: { threshold: 7500, per: 1000, pts: 1 },
      },
      {
        id: 'reactions',
        name: 'Reactions & comments',
        weight: 2,
        levels: ['Under 3', '3–10', '11–25', '26–50', '51–100'],
        overflow: { threshold: 100, per: 100, pts: 2 },
      },
      {
        id: 'visitors',
        name: 'Amplification (visitors)',
        weight: 10,
        levels: ['Under 10', '11–50', '51–250', '251–1000', '1000+'],
        overflow: { threshold: 1000, per: 100, pts: 10 },
      },
      {
        id: 'signups_v',
        name: 'Signups / meaningful actions',
        weight: 25,
        levels: ['Up to 5', '6–25', '26–100', '101–250', '251–1000'],
        overflow: { threshold: 1000, per: 50, pts: 25 },
      },
    ],
  },
  revenue: {
    id: 'revenue',
    name: 'Revenue',
    base: 208,
    params: [
      {
        id: 'signups_r',
        name: 'Signups',
        weight: 20,
        levels: ['0', '1–25', '26–100', '101–250', '251+'],
        overflow: { threshold: 250, per: 50, pts: 20 },
      },
      {
        id: 'product_quality',
        name: 'Live product quality',
        weight: 8,
        levels: ['Broken flow', 'Rough MVP', 'Working product', 'Polished', '10x / magical'],
      },
      {
        id: 'revenue_gen',
        name: 'Revenue generated',
        weight: 12,
        levels: ['$0', '<$100', '$100–$500', '$500–$2k', '$2k+'],
      },
      {
        id: 'waitlist',
        name: 'Waitlist',
        weight: 4,
        levels: ['0', '1–50', '51–250', '251–1000', '1000+'],
        overflow: { threshold: 1000, per: 250, pts: 4 },
      },
      {
        id: 'biz_impact',
        name: 'Business impact / founder fit',
        weight: 2,
        levels: [
          'Anyone could build this',
          'Generic interest',
          'Some domain exposure',
          'Direct operator',
          'Deep founder-market fit',
        ],
      },
      {
        id: 'why_now',
        name: 'Why now',
        weight: 1,
        levels: [
          'Could have been built 5yr ago',
          'Riding general trends',
          'Clear tailwind 2yr',
          'Specific unlock 12mo',
          'Window opened <6mo',
        ],
      },
      {
        id: 'moat',
        name: 'Moat & defensibility',
        weight: 1,
        levels: [
          'Copyable in a weekend',
          'First-mover only',
          'Workflow lock-in',
          'Data flywheel',
          'Compounding moat',
        ],
      },
      {
        id: 'som',
        name: 'SOM (size of market)',
        weight: 2,
        levels: [
          'No market defined',
          'Vague large market claim',
          'Defined segment with rough size',
          'Verified TAM/SAM with data',
          'Precise SOM with bottoms-up math',
        ],
      },
      {
        id: 'right_to_win',
        name: 'Right to win',
        weight: 2,
        levels: [
          'No advantage stated',
          'Generic first-mover claim',
          'Some relevant background',
          'Clear unfair advantage',
          'Compounding structural advantage visible in the build',
        ],
      },
    ],
  },
  agency: {
    id: 'agency',
    name: 'AI as Agency',
    base: 164,
    params: [
      {
        id: 'working_product',
        name: 'Working product / real output',
        weight: 20,
        levels: [
          'Demo only / canned',
          '<30% task success',
          '50–70% success (staged)',
          '70–85% on real surfaces',
          '85%+ over 3+ runs',
        ],
      },
      {
        id: 'agentic_org',
        name: 'Agentic org structure',
        weight: 5,
        levels: [
          'Monolithic agent',
          '2–3 hardcoded handoffs',
          'Clear roles (mgr + specialists)',
          'Dynamic mgr + delegation',
          'Full multi-agent system',
        ],
      },
      {
        id: 'observability',
        name: 'Observability',
        weight: 7,
        levels: [
          'console.log only',
          'Logs to file',
          'Step-by-step per run',
          'Trace tree + cost per step',
          'Prod-grade: diff, alerts, search',
        ],
      },
      {
        id: 'eval_iteration',
        name: 'Evaluation & iteration',
        weight: 5,
        levels: [
          'No evals',
          'Manual spot-checks',
          'Named eval set',
          'Automated CI pipeline',
          'Closed-loop: failed runs → evals',
        ],
      },
      {
        id: 'handoffs_memory',
        name: 'Agent handoffs + memory',
        weight: 2,
        levels: [
          'Remembers nothing',
          '1–2 fields in task',
          'Context in task, lost at handoff',
          'Across 1–2 handoffs',
          'Full history across all handoffs',
        ],
      },
      {
        id: 'cost_latency',
        name: 'Cost & latency per task',
        weight: 1,
        levels: [
          '>30min or >$5',
          '10–30min or $2–5',
          '5–10min or $0.50–$2',
          '1–5min or $0.10–$0.50',
          '<1min and <$0.10',
        ],
      },
      {
        id: 'mgmt_ui',
        name: 'Management UI',
        weight: 1,
        levels: [
          'CLI / code only',
          'Basic web, dev only',
          'Functional UI (PM with docs)',
          'Clean UI, non-eng with walkthrough',
          'Non-eng onboards agent in <10min',
        ],
      },
    ],
  },
}

export const POWERUPS = [
  { id: 'wispr', name: 'Wispr Flow', pts: 25, evidence: '500+ words dictated during event' },
  { id: 'elevenlabs', name: 'ElevenLabs', pts: 25, evidence: 'Voice does real work in product' },
  { id: 'convex', name: 'Convex', pts: 25, evidence: 'Convex stores real product state' },
  { id: 'linkup', name: 'Linkup', pts: 25, evidence: 'Live search doing real work' },
  { id: 'dodo', name: 'Dodo Payments', pts: 25, evidence: 'Live checkout in product' },
  { id: 'cloudflare', name: 'Cloudflare', pts: 25, evidence: 'Hosting / Workers doing real work' },
]

export const CROSS_TRACK_BONUS: Array<{
  sourceTrack: TrackId
  paramId: string
  originalWeight: number
  bonusWeight: number
  maxBonus: number
}> = [
  { sourceTrack: 'virality', paramId: 'signups_v', originalWeight: 25, bonusWeight: 12.5, maxBonus: 50 },
  { sourceTrack: 'virality', paramId: 'visitors', originalWeight: 10, bonusWeight: 5, maxBonus: 20 },
  { sourceTrack: 'virality', paramId: 'reactions', originalWeight: 2, bonusWeight: 1, maxBonus: 4 },
  { sourceTrack: 'revenue', paramId: 'signups_r', originalWeight: 20, bonusWeight: 10, maxBonus: 40 },
  { sourceTrack: 'revenue', paramId: 'product_quality', originalWeight: 8, bonusWeight: 4, maxBonus: 16 },
  { sourceTrack: 'revenue', paramId: 'revenue_gen', originalWeight: 12, bonusWeight: 6, maxBonus: 24 },
  { sourceTrack: 'agency', paramId: 'working_product', originalWeight: 20, bonusWeight: 10, maxBonus: 40 },
  { sourceTrack: 'agency', paramId: 'observability', originalWeight: 7, bonusWeight: 3.5, maxBonus: 14 },
]
