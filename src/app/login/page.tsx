'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showResend, setShowResend] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setShowResend(false)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setLoading(false)
        // Detect email-not-confirmed error and show friendly message
        if (
          error.message.toLowerCase().includes('email not confirmed') ||
          error.message.toLowerCase().includes('email address not confirmed')
        ) {
          setError('Email belum dikonfirmasi. Cek kotak masuk Anda dan klik link verifikasi.')
          setShowResend(true)
        } else if (error.message.toLowerCase().includes('invalid login credentials')) {
          setError('Email atau password salah. Silakan coba lagi.')
        } else {
          setError(error.message)
        }
        return
      }
      router.push('/dashboard')
      router.refresh()
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      setMessage('Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi, lalu login.')
      setMode('login')
      setLoading(false)
    }
  }

  async function handleResend() {
    setResendLoading(true)
    const { error } = await supabase.auth.resend({ type: 'signup', email })
    setResendLoading(false)
    if (error) {
      setError('Gagal mengirim ulang email: ' + error.message)
    } else {
      setMessage('Email konfirmasi telah dikirim ulang. Cek kotak masuk Anda.')
      setShowResend(false)
      setError('')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 3L1 9L12 15L23 9L12 3Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
              <path d="M5 11.5V17.5C5 17.5 7.5 20 12 20C16.5 20 19 17.5 19 17.5V11.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 className="login-title">Bimbel Grade Manager</h1>
          <p className="login-subtitle">
            {mode === 'login' ? 'Masuk ke akun guru Anda' : 'Daftarkan akun guru baru'}
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="guru@sekolah.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div className="form-error-block">
              <p className="form-error">⚠ {error}</p>
              {showResend && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: '8px', width: '100%' }}
                  onClick={handleResend}
                  disabled={resendLoading}
                >
                  {resendLoading ? <span className="spinner" /> : null}
                  {resendLoading ? 'Mengirim...' : '📧 Kirim ulang email konfirmasi'}
                </button>
              )}
            </div>
          )}
          {message && <p style={{ color: 'var(--green)', fontSize: '0.82rem' }}>✓ {message}</p>}

          <button id="submit-btn" type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Memproses...' : mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="login-footer">
          {mode === 'login' ? (
            <>Belum punya akun?{' '}
              <a
                href="#"
                role="button"
                tabIndex={0}
                onClick={e => { e.preventDefault(); setMode('register'); setError(''); setMessage(''); setShowResend(false) }}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMode('register'); setError(''); setMessage(''); setShowResend(false) } }}
              >Daftar sekarang</a>
            </>
          ) : (
            <>Sudah punya akun?{' '}
              <a
                href="#"
                role="button"
                tabIndex={0}
                onClick={e => { e.preventDefault(); setMode('login'); setError(''); setMessage(''); setShowResend(false) }}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMode('login'); setError(''); setMessage(''); setShowResend(false) } }}
              >Masuk</a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
