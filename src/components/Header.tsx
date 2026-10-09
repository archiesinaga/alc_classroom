'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props { userEmail: string }

export default function Header({ userEmail }: Props) {
  const [dateStr, setDateStr] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const now = new Date()
    setDateStr(now.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }))
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9L12 15L23 9L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M5 11.5V17.5C5 17.5 7.5 20 12 20C16.5 20 19 17.5 19 17.5V11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="brand-title">Bimbel Grade Manager</div>
            <div className="brand-subtitle">Sistem Input Nilai Siswa</div>
          </div>
        </div>
        <div className="header-right">
          {dateStr && <div className="date-badge">{dateStr}</div>}
          <div className="user-email">{userEmail}</div>
          <button id="logout-btn" className="btn btn-ghost btn-sm" onClick={handleLogout}>Keluar</button>
        </div>
      </div>
    </header>
  )
}
