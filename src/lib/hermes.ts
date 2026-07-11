import { NotifType } from './types'

export async function callHermes(url: string, text: string, type: NotifType): Promise<void> {
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, type, source: 'bno-tracker' }),
    })
  } catch {}
}
