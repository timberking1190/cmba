"use client"
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient as createClientImport } from '@/lib/supabase/client'

export default function Page() {
  return (
    <div className="p-8">
      <div className="font-mono text-[11px] tracking-[2px] uppercase text-red-500 mb-1">Admin</div>
      <h1 className="font-display text-4xl text-white tracking-wide mb-2">Standings Manager</h1>
      <p className="text-gray-400 text-sm">View and override division standings</p>
      <div className="mt-8 border border-white/8 p-8 text-center text-gray-400">
        <p className="font-mono text-xs tracking-[2px] uppercase mb-2">Coming Soon</p>
        <p className="text-sm">This module is in development.</p>
      </div>
    </div>
  )
}