import { supabase } from './supabase'

export const GOOGLE_TOKEN_KEY = 'welcon_google_access_token'

export function saveGoogleToken(token: string) {
  sessionStorage.setItem(GOOGLE_TOKEN_KEY, token)
}

export function getStoredGoogleToken(): string | null {
  return sessionStorage.getItem(GOOGLE_TOKEN_KEY)
}

export function clearGoogleToken() {
  sessionStorage.removeItem(GOOGLE_TOKEN_KEY)
}

export function resolveGoogleToken(providerToken?: string | null): string | undefined {
  if (providerToken) {
    saveGoogleToken(providerToken)
    return providerToken
  }
  return getStoredGoogleToken() ?? undefined
}

export async function reconnectGoogleCalendar() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href,
      scopes: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error) throw error
}
