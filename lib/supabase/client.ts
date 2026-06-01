import { createBrowserClient } from '@supabase/ssr'
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdlpmjmpaalesmddwabo.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rYOxJ1k52TaEuYPPxkjjPg_yKLcIUqC'
export function createClient() {
  return createBrowserClient(url, key)
}
