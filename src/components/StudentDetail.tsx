'use client'

import { useState } from 'react'
import type { Student, Record as StudentRecord } from '@/lib/types'

type StudentWithRecords = Student & { records: StudentRecord[] }

interface Props {
  student: StudentWithRecords
  onAddGrade: (studentId: string, type: 'latihan' | 'quiz' | 'bonus', value: number, note: string) => Promise<void>
  onAddAttendance: (studentId: string, status: 'hadir' | 'sakit' | 'absen') => Promise<void>
  onDeleteRecord: (studentId: string, recordId: string) => Promise<void>
  onDeleteStudent: (id: string) => Promise<void>
}

const GRADE_TYPES = [
  { value: 'latihan', label: '📝 Latihan' },
  { value: 'quiz', label: '📊 Quiz' },
  { value: 'bonus', label: '⭐ Bonus Point' },
] as const

const TYPE_LABELS: { [key: string]: string } = {
  latihan: '📝 Latihan', quiz: '📊 Quiz', bonus: '⭐ Bonus',
  hadir: '✓ Hadir', sakit: '🤒 Sakit', absen: '✗ Absen',
}

export default function StudentDetail({ student, onAddGrade, onAddAttendance, onDeleteRecord, onDeleteStudent }: Props) {
  const [gradeType, setGradeType] = useState<'latihan' | 'quiz' | 'bonus'>('latihan')
  const [gradeValue, setGradeValue] = useState('')
  const [gradeNote, setGradeNote] = useState('')
  const [gradeSaving, setGradeSaving] = useState(false)
  const [attendSaving, setAttendSaving] = useState(false)
  const [filter, setFilter] = useState('semua')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [gradeError, setGradeError] = useState('')
  const [pendingDeleteRecordId, setPendingDeleteRecordId] = useState<string | null>(null)

  // Stats
  const scores = student.records.filter(r => r.category === 'nilai' && r.type !== 'bonus')
  const avg = scores.length ? (scores.reduce((a, b) => a + (b.value ?? 0), 0) / scores.length).toFixed(1) : '-'
  const bonus = student.records.filter(r => r.type === 'bonus').reduce((a, b) => a + (b.value ?? 0), 0)
  const hadirCount = student.records.filter(r => r.type === 'hadir').length

  async function handleSaveGrade() {
    setGradeError('')
    const val = parseFloat(gradeValue)
    if (!gradeValue || isNaN(val) || val < 0 || val > 100) {
      setGradeError('Masukkan nilai antara 0 – 100')
      return
    }
    setGradeSaving(true)
    await onAddGrade(student.id, gradeType, val, gradeNote)
    setGradeValue('')
    setGradeNote('')
    setGradeSaving(false)
  }

  async function handleAttendance(status: 'hadir' | 'sakit' | 'absen') {
    setAttendSaving(true)
    await onAddAttendance(student.id, status)
    setAttendSaving(false)
  }

  // Filter records
  let records = [...student.records]
  if (filter === 'kehadiran') records = records.filter(r => r.category === 'kehadiran')
  else if (filter !== 'semua') records = records.filter(r => r.category === 'nilai' && r.type === filter)

  return (
    <div className="student-detail">
      {/* Header */}
      <div className="detail-header">
        <div className="student-avatar">{student.name.charAt(0).toUpperCase()}</div>
        <div className="detail-info">
          <div className="detail-name">{student.name}</div>
          <div className="detail-stats">
            <span className="stat-chip">Rata-rata: {avg}</span>
            <span className="stat-chip stat-bonus">Bonus: {bonus} pts</span>
            <span className="stat-chip stat-attend">Hadir: {hadirCount}x</span>
          </div>
        </div>
        <div className="detail-actions">
          <button id="delete-student-btn" className="btn btn-danger-outline btn-sm" onClick={() => setShowDeleteModal(true)}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Hapus Siswa
          </button>
        </div>
      </div>

      {/* Input Section */}
      <div className="input-section">
        {/* Grade Input */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><span>📝</span> Input Nilai</h3>
          </div>
          <div className="grade-input-grid">
            <div className="input-group">
              <label className="input-label" htmlFor="grade-type">Jenis Nilai</label>
              <select id="grade-type" className="input select-input" value={gradeType} onChange={e => setGradeType(e.target.value as typeof gradeType)}>
                {GRADE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" htmlFor="grade-value">Nilai / Poin</label>
              <input
                id="grade-value"
                type="number"
                className="input"
                placeholder="0 – 100"
                min={0} max={100}
                value={gradeValue}
                onChange={e => { setGradeValue(e.target.value); setGradeError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSaveGrade()}
              />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label className="input-label" htmlFor="grade-note">Keterangan (opsional)</label>
              <input
                id="grade-note"
                type="text"
                className="input"
                placeholder="cth: Bab 3 Aljabar"
                maxLength={60}
                value={gradeNote}
                onChange={e => setGradeNote(e.target.value)}
              />
            </div>
            {gradeError && <p style={{ color: 'var(--red)', fontSize: '0.8rem', gridColumn: 'span 2' }}>⚠ {gradeError}</p>}
            <div className="input-group input-group-action" style={{ gridColumn: 'span 2' }}>
              <button id="save-grade-btn" className="btn btn-primary btn-full" onClick={handleSaveGrade} disabled={gradeSaving}>
                {gradeSaving ? <span className="spinner" /> : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                )}
                {gradeSaving ? 'Menyimpan...' : 'Simpan Nilai'}
              </button>
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title"><span>📋</span> Catat Kehadiran</h3>
          </div>
          <div className="attendance-buttons">
            <button id="attend-hadir" className="btn-attend btn-hadir" onClick={() => handleAttendance('hadir')} disabled={attendSaving}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Hadir
            </button>
            <button id="attend-sakit" className="btn-attend btn-sakit" onClick={() => handleAttendance('sakit')} disabled={attendSaving}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Sakit
            </button>
            <button id="attend-absen" className="btn-attend btn-absen" onClick={() => handleAttendance('absen')} disabled={attendSaving}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M15 9L9 15M9 9L15 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              Absen (Tanpa Keterangan)
            </button>
          </div>
        </div>
      </div>

      {/* Records */}
      <div className="card records-card">
        <div className="card-header">
          <h3 className="card-title"><span>📜</span> Riwayat Nilai & Kehadiran</h3>
          <div className="filter-tabs">
            {['semua', 'latihan', 'quiz', 'bonus', 'kehadiran'].map(f => (
              <button
                key={f}
                className={`filter-tab${filter === f ? ' active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="records-wrapper">
          {records.length === 0 ? (
            <div className="empty-records"><p>Tidak ada data untuk filter ini.</p></div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tanggal & Waktu</th>
                  <th>Jenis</th>
                  <th>Nilai / Poin</th>
                  <th>Keterangan</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const dateStr = new Date(r.date).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })
                  const val = r.value ?? 0
                  const scoreClass = r.type === 'bonus' ? '' : val >= 80 ? 'score-high' : val >= 60 ? 'score-mid' : 'score-low'
                  const scoreDisplay = r.category === 'kehadiran' ? '—' : r.type === 'bonus' ? `+${val} pts` : `${val} / 100`

                  return (
                    <tr key={r.id}>
                      <td>{dateStr}</td>
                      <td><span className={`type-badge type-${r.type}`}>{TYPE_LABELS[r.type]}</span></td>
                      <td><span className={`score-val ${scoreClass}`}>{scoreDisplay}</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{r.note || '—'}</td>
                      <td>
                        <button className="btn-delete-row" onClick={() => setPendingDeleteRecordId(r.id)} title="Hapus">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <div className={`modal-overlay${showDeleteModal ? ' open' : ''}`} onClick={() => setShowDeleteModal(false)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-icon">🗑️</div>
          <h3 className="modal-title">Hapus Siswa?</h3>
          <p className="modal-text">
            Seluruh data nilai dan kehadiran <strong>{student.name}</strong> akan dihapus secara permanen.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setShowDeleteModal(false)}>Batal</button>
            <button id="confirm-delete-btn" className="btn btn-danger" onClick={() => { setShowDeleteModal(false); onDeleteStudent(student.id) }}>
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>

      {/* Delete Record Confirmation Modal */}
      <div className={`modal-overlay${pendingDeleteRecordId ? ' open' : ''}`} onClick={() => setPendingDeleteRecordId(null)}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          <div className="modal-icon">🗑️</div>
          <h3 className="modal-title">Hapus Entri?</h3>
          <p className="modal-text">
            Data nilai/kehadiran ini akan dihapus secara permanen dan tidak bisa dikembalikan.
          </p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => setPendingDeleteRecordId(null)}>Batal</button>
            <button className="btn btn-danger" onClick={() => { if (pendingDeleteRecordId) { onDeleteRecord(student.id, pendingDeleteRecordId); setPendingDeleteRecordId(null) } }}>
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
