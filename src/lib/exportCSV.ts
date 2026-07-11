export function toCSV(rows: Record<string, string | number>[]): string {
  if (!rows.length) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const val = String(r[h] ?? '').replace(/"/g, '""')
          return val.includes(',') || val.includes('"') || val.includes('\n') ? `"${val}"` : val
        })
        .join(',')
    ),
  ]
  return lines.join('\n')
}

export function csvFilename(eventName: string, suffix: string): string {
  const slug = (eventName || 'hermes-bno')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const date = new Date().toISOString().slice(0, 10)
  return `${slug}-${suffix}-${date}.csv`
}

export function downloadCSV(filename: string, rows: Record<string, string | number>[]): void {
  const csv = toCSV(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
