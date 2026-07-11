interface DownloadButtonProps {
  label?: string
  onClick: () => void
  disabled?: boolean
}

export function DownloadButton({ label = 'Download CSV', onClick, disabled }: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <span>↓</span>
      <span>{label}</span>
    </button>
  )
}
