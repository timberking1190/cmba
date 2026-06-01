import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vdlpmjmpaalesmddwabo.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_rYOxJ1k52TaEuYPPxkjjPg_yKLcIUqC'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } })
  if (!key) return response
  const supabase = createServerClient(url, key, {
    cookies: {
      get(name) { return request.cookies.get(name)?.value },
      set(name, value, options) {
        request.cookies.set({ name, value, ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value, ...options })
      },
      remove(name, options) {
        request.cookies.set({ name, value: '', ...options })
        response = NextResponse.next({ request: { headers: request.headers } })
        response.cookies.set({ name, value: '', ...options })
      },
    },
  })
  const { data: { user } } = await supabase.auth.getUser()
  if (request.nextUrl.pathname.startsWith('/admin') && !user)
    return NextResponse.redirect(new URL('/login', request.url))
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user)
    return NextResponse.redirect(new URL('/login', request.url))
  return response
}

export const config = { matcher: ['/admin/:path*', '/dashboard/:path*'] }
