export type BannerType = 'info' | 'warning' | 'critical' | 'success'

const STYLES: Record<BannerType, string> = {
  info: 'bg-blue-950 border-blue-700 text-blue-300',
  warning: 'bg-amber-950 border-amber-700 text-amber-300',
  critical: 'bg-red-950 border-red-700 text-red-300',
  success: 'bg-emerald-950 border-emerald-700 text-emerald-300',
}

export default function Banner({
  type,
  message,
  onDismiss,
}: {
  type: BannerType
  message: string
  onDismiss?: () => void
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-md border px-4 py-2.5 text-sm font-medium ${STYLES[type]}`}
    >
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="shrink-0 text-xs opacity-70 hover:opacity-100">
          Dismiss
        </button>
      )}
    </div>
  )
}
