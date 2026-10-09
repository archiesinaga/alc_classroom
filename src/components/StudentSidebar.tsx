'use client'

import { useState } from 'react'
import type { Student, Record as StudentRecord } from '@/lib/types'
import { CLASS_OPTIONS } from '@/lib/types'

type StudentWithRecords = Student & { records: StudentRecord[] }

interface Props {
  students: StudentWithRecords[]
  activeId: string | null
  onSelect: (id: string) => void
  onAddStudent: (name: string, className: string) => Promise<boolean>
  onShowLeaderboard: () => void
}

export default function StudentSidebar({ students, activeId, onSelect, onAddStudent, onShowLeaderboard }: Props) {
  const [query, setQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [newClass, setNewClass] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = students.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))

  async function handleAdd() {
    const name = newName.trim()
    if (!name) return
    setLoading(true)
    const ok = await onAddStudent(name, newClass)
    if (ok) { setNewName(''); setNewClass('') }
    setLoading(false)
  }

  function getLastAttendance(records: StudentRecord[]) {
    return [...records].find(r => r.category === 'kehadiran') ?? null
  }

  function getAverage(records: StudentRecord[]) {
    const scores = records.filter(r => r.category === 'nilai' && r.type !== 'bonus')
    if (!scores.length) return '-'
    return (scores.reduce((a, b) => a + (b.value ?? 0), 0) / scores.length).toFixed(0)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Daftar Siswa</h2>
        <span className="student-count">{students.length} siswa</span>
      </div>

      {/* Leaderboard button */}
      <button id="leaderboard-btn" className="btn-leaderboard" onClick={onShowLeaderboard}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M8 17H5a2 2 0 0 0-2 2v2h18v-2a2 2 0 0 0-2-2h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 3L14.5 8.5L21 9.3L16.5 13.5L17.6 20L12 17L6.4 20L7.5 13.5L3 9.3L9.5 8.5L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
        </svg>
        Leaderboard
      </button>

      {/* Search */}
      <div className="search-wrapper">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
          <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <input
          id="search-student"
          type="text"
          className="search-input"
          placeholder="Cari siswa..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Add student form */}
      <div className="add-student-form">
        <div className="add-student-inputs">
          <input
            id="new-student-name"
            type="text"
            className="input"
            placeholder="Nama siswa baru..."
            maxLength={50}
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <select
            id="new-student-class"
            className="input select-input"
            value={newClass}
            onChange={e => setNewClass(e.target.value)}
          >
            <option value="">Pilih Kelas...</option>
            {CLASS_OPTIONS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <button id="add-student-btn" className="btn btn-primary btn-add" onClick={handleAdd} disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          )}
          Tambah
        </button>
      </div>

      {/* List */}
      <div className="student-list">
        {filtered.length === 0 ? (
          <div className="empty-state-sidebar">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <p>{query ? 'Siswa tidak ditemukan.' : 'Belum ada siswa.\nTambahkan siswa baru!'}</p>
          </div>
        ) : filtered.map(s => {
          const lastAttend = getLastAttendance(s.records)
          const avg = getAverage(s.records)
          const isActive = s.id === activeId

          return (
            <div
              key={s.id}
              className={`student-item${isActive ? ' active' : ''}`}
              onClick={() => onSelect(s.id)}
            >
              <div className="student-item-avatar">{s.name.charAt(0).toUpperCase()}</div>
              <div className="student-item-info">
                <div className="student-item-name">{s.name}</div>
                <div className="student-item-sub">
                  {s.class_name && <span className="item-class-tag">{s.class_name}</span>}
                  Rata-rata: {avg}{avg !== '-' ? ' / 100' : ''} · {s.records.length} entri
                </div>
              </div>
              {lastAttend && (
                <span className={`student-item-badge badge-${lastAttend.type}`}>
                  {lastAttend.type === 'hadir' ? '✓' : lastAttend.type === 'sakit' ? '🤒' : '✗'} {lastAttend.type}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
