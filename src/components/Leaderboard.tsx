'use client'

import { useMemo, useState } from 'react'
import type { Student, Record as StudentRecord } from '@/lib/types'

type StudentWithRecords = Student & { records: StudentRecord[] }

interface Props {
  students: StudentWithRecords[]
  onClose: () => void
  onSelectStudent: (id: string) => void
}

function computeScore(records: StudentRecord[]) {
  const scores = records.filter(r => r.category === 'nilai' && r.type !== 'bonus')
  const avg = scores.length
    ? scores.reduce((a, b) => a + (b.value ?? 0), 0) / scores.length
    : 0
  const bonus = records.filter(r => r.type === 'bonus').reduce((a, b) => a + (b.value ?? 0), 0)
  const total = avg + bonus
  return { avg: scores.length ? avg : null, bonus, total, entryCount: records.length }
}

const MEDAL = ['🥇', '🥈', '🥉']
const RANK_COLORS = [
  'leaderboard-gold',
  'leaderboard-silver',
  'leaderboard-bronze',
]

export default function Leaderboard({ students, onClose, onSelectStudent }: Props) {
  const [classFilter, setClassFilter] = useState('Semua')

  const classes = useMemo(() => {
    const set = new Set<string>()
    students.forEach(s => { if (s.class_name) set.add(s.class_name) })
    return ['Semua', ...Array.from(set).sort()]
  }, [students])

  const ranked = useMemo(() => {
    const filtered = classFilter === 'Semua'
      ? students
      : students.filter(s => s.class_name === classFilter)

    return filtered
      .map(s => ({ ...s, ...computeScore(s.records) }))
      .sort((a, b) => b.total - a.total)
  }, [students, classFilter])

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="leaderboard-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="leaderboard-header">
          <div className="leaderboard-title-row">
            <span className="leaderboard-trophy">🏆</span>
            <div>
              <h2 className="leaderboard-title">Leaderboard Siswa</h2>
              <p className="leaderboard-subtitle">Ranking berdasarkan total nilai keseluruhan</p>
            </div>
          </div>
          <button className="btn-close-leaderboard" onClick={onClose} aria-label="Tutup">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Class filter */}
        {classes.length > 1 && (
          <div className="leaderboard-filters">
            {classes.map(c => (
              <button
                key={c}
                className={`filter-tab${classFilter === c ? ' active' : ''}`}
                onClick={() => setClassFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Podium top 3 */}
        {ranked.length >= 1 && (
          <div className="podium-row">
            {[ranked[1], ranked[0], ranked[2]].map((s, idx) => {
              if (!s) return <div key={`podium-empty-${idx}`} className="podium-slot empty" />
              // idx 0 = ranked[1] (2nd), idx 1 = ranked[0] (1st), idx 2 = ranked[2] (3rd)
              const actualRankIndex = [1, 0, 2][idx] // maps visual position → actual rank (0-based)
              return (
                <div
                  key={s.id}
                  className={`podium-slot podium-pos-${actualRankIndex}`}
                  onClick={() => { onSelectStudent(s.id); onClose() }}
                >
                  <div className="podium-medal">{MEDAL[actualRankIndex]}</div>
                  <div className="podium-avatar" style={{ background: actualRankIndex === 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : actualRankIndex === 1 ? 'linear-gradient(135deg,#6366f1,#4f46e5)' : 'linear-gradient(135deg,#94a3b8,#64748b)' }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="podium-name">{s.name}</div>
                  {s.class_name && <div className="podium-class">{s.class_name}</div>}
                  <div className="podium-score">{s.total.toFixed(1)}</div>
                  <div className={`podium-stand podium-stand-${actualRankIndex}`} />
                </div>
              )
            })}
          </div>
        )}

        {/* Full ranking list */}
        <div className="leaderboard-list">
          {ranked.length === 0 ? (
            <div className="leaderboard-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <p>Tidak ada siswa di kelas ini.</p>
            </div>
          ) : ranked.map((s, i) => {
            const isTop = i < 3
            return (
              <div
                key={s.id}
                className={`leaderboard-row${isTop ? ' ' + RANK_COLORS[i] : ''}`}
                onClick={() => { onSelectStudent(s.id); onClose() }}
              >
                <div className="lb-rank">
                  {isTop ? MEDAL[i] : <span className="lb-rank-num">#{i + 1}</span>}
                </div>
                <div className="lb-avatar">{s.name.charAt(0).toUpperCase()}</div>
                <div className="lb-info">
                  <div className="lb-name">{s.name}</div>
                  <div className="lb-meta">
                    {s.class_name && <span className="lb-class-badge">{s.class_name}</span>}
                    <span>{s.entryCount} entri</span>
                  </div>
                </div>
                <div className="lb-scores">
                  <div className="lb-total">{s.total.toFixed(1)}</div>
                  <div className="lb-breakdown">
                    Rata-rata: {s.avg !== null ? s.avg.toFixed(1) : '-'}
                    {s.bonus > 0 && <span className="lb-bonus"> +{s.bonus} bonus</span>}
                  </div>
                </div>
                <div className="lb-bar-wrap">
                  <div
                    className="lb-bar"
                    style={{ width: `${Math.min(100, (s.total / (ranked[0]?.total || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        <div className="leaderboard-footer">
          Total {ranked.length} siswa · Klik nama untuk lihat detail
        </div>
      </div>
    </div>
  )
}
