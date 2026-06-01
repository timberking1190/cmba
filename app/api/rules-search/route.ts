import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json()
    if (!query?.trim()) {
      return NextResponse.json({ error: 'No query provided' }, { status: 400 })
    }

    // Fetch rules from Supabase server-side
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
    const { data: rules, error } = await supabase
      .from('rules')
      .select('rule_number, title, body, category')
      .eq('is_published', true)
      .order('sort_order')

    if (error) throw error

    const rulesContext = (rules || [])
      .map(r => `Rule ${r.rule_number} (${r.category}) — ${r.title}:\n${r.body}`)
      .join('\n\n')

    // --- AI path (requires ANTHROPIC_API_KEY in Vercel env) ---
    if (ANTHROPIC_KEY) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: `You are the CMBA rules expert. Answer questions CONCISELY based ONLY on the rules provided. 
Be direct and specific — cite the rule number when relevant. 
If the exact answer isn't in the rules, say so plainly in one sentence.
Never fabricate rules. Max 3 sentences.

CMBA RULES:
${rulesContext}`,
          messages: [{ role: 'user', content: query }],
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const answer = data.content?.[0]?.text || 'No answer available.'
        return NextResponse.json({ answer, source: 'ai' })
      }
    }

    // --- Fallback: smart keyword search ---
    const q = query.toLowerCase()
    const keywords = q.split(/\s+/).filter((w: string) => w.length > 3)

    const scored = (rules || []).map(r => {
      const text = `${r.title} ${r.body} ${r.category}`.toLowerCase()
      const score = keywords.reduce((s: number, kw: string) => {
        const matches = (text.match(new RegExp(kw, 'g')) || []).length
        return s + matches * (r.title.toLowerCase().includes(kw) ? 3 : 1)
      }, 0)
      return { ...r, score }
    }).filter((r: any) => r.score > 0).sort((a: any, b: any) => b.score - a.score)

    if (scored.length === 0) {
      return NextResponse.json({
        answer: `No rules found matching "${query}". Try searching for terms like "fouls", "timeout", "substitution", or "overtime".`,
        source: 'search',
      })
    }

    const top = scored.slice(0, 2)
    const answer = top.map((r: any) =>
      `Rule ${r.rule_number} — ${r.title}: ${r.body}`
    ).join('\n\n')

    return NextResponse.json({ answer, source: 'search' })

  } catch (err: any) {
    console.error('rules-search error:', err)
    return NextResponse.json(
      { error: 'Search failed. Please try again.' },
      { status: 500 }
    )
  }
}
