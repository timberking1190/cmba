import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdlpmjmpaalesmddwabo.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rYOxJ1k52TaEuYPPxkjjPg_yKLcIUqC'
export function createClient() {
  const cookieStore = cookies()
  return createServerClient(url, key, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
      set(name: string, value: string, options: CookieOptions) {
        try { cookieStore.set({ name, value, ...options }) } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.set({ name, value: '', ...options }) } catch {}
      },
    },
  })
}
