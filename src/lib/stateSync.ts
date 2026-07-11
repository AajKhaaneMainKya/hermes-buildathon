import { supabase, EVENT_ID } from './supabase'
import { AppState } from './types'
import { defaultState } from './storage'

// Load state from Supabase
// Falls back to defaultState if no row exists yet, or if Supabase is unreachable
export async function loadRemoteState(): Promise<AppState> {
  try {
    const { data, error } = await supabase
      .from('event_state')
      .select('state')
      .eq('event_id', EVENT_ID)
      .single()

    if (error || !data?.state || Object.keys(data.state).length === 0) {
      return defaultState()
    }

    return { ...defaultState(), ...data.state } as AppState
  } catch (err) {
    console.error('Failed to load remote state:', err)
    return defaultState()
  }
}

// Save full state to Supabase (upsert)
export async function saveRemoteState(state: AppState): Promise<void> {
  try {
    await supabase
      .from('event_state')
      .upsert({
        event_id: EVENT_ID,
        state: state as unknown as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      })
  } catch (err) {
    console.error('Failed to save remote state:', err)
  }
}

// Subscribe to real-time state changes from other devices
// Calls onUpdate whenever another device saves state
export function subscribeToStateChanges(
  onUpdate: (newState: AppState) => void
): () => void {
  const channel = supabase
    .channel('event_state_changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'event_state',
        filter: `event_id=eq.${EVENT_ID}`,
      },
      (payload) => {
        const incoming = payload.new as { state: AppState }
        if (incoming?.state) {
          onUpdate({ ...defaultState(), ...incoming.state })
        }
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}
