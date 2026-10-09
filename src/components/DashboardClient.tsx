'use client'

import { useState, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Student, Record as StudentRecord } from '@/lib/types'
import Header from './Header'
import StudentSidebar from './StudentSidebar'
import WelcomeScreen from './WelcomeScreen'
import StudentDetail from './StudentDetail'
import Leaderboard from './Leaderboard'

type StudentWithRecords = Student & { records: StudentRecord[] }

interface Props {
  user: User
  initialStudents: StudentWithRecords[]
}

export default function DashboardClient({ user, initialStudents }: Props) {
  const supabase = createClient()
  const [students, setStudents] = useState<StudentWithRecords[]>(initialStudents)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null)
  const [showLeaderboard, setShowLeaderboard] = useState(false)

  const showToast = useCallback((msg: string, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }, [])

  // ── ADD STUDENT ──────────────────────────────
  const addStudent = useCallback(async (name: string, className: string) => {
    const dup = students.find(s => s.name.toLowerCase() === name.toLowerCase())
    if (dup) { showToast('Siswa dengan nama ini sudah ada!', 'error'); return false }

    const { data, error } = await supabase
      .from('students')
      .insert({ name, teacher_id: user.id, class_name: className || null })
      .select()
      .single()

    if (error) { showToast('Gagal menambah siswa: ' + error.message, 'error'); return false }
    const newStudent: StudentWithRecords = { ...data, records: [] }
    setStudents(prev => [...prev, newStudent])
    setActiveId(data.id)
    const classInfo = className ? ` (${className})` : ''
    showToast(`✓ Siswa "${name}"${classInfo} berhasil ditambahkan`, 'success')
    return true
  }, [students, supabase, user.id, showToast])

  // ── DELETE STUDENT ───────────────────────────
  const deleteStudent = useCallback(async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id)
    if (error) { showToast('Gagal menghapus siswa', 'error'); return }
    const name = students.find(s => s.id === id)?.name
    setStudents(prev => prev.filter(s => s.id !== id))
    if (activeId === id) setActiveId(null)
    showToast(`Siswa "${name}" dihapus`, 'info')
  }, [students, activeId, supabase, showToast])

  // ── ADD GRADE ────────────────────────────────
  const addGrade = useCallback(async (
    studentId: string,
    type: 'latihan' | 'quiz' | 'bonus',
    value: number,
    note: string
  ) => {
    const { data, error } = await supabase
      .from('records')
      .insert({ student_id: studentId, category: 'nilai', type, value, note: note || null })
      .select()
      .single()

    if (error) { showToast('Gagal menyimpan nilai', 'error'); return }
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, records: [data, ...s.records] } : s
    ))
    const labels = { latihan: 'Latihan', quiz: 'Quiz', bonus: 'Bonus Point' }
    showToast(`✓ Nilai ${labels[type]} (${value}) tersimpan`, 'success')
  }, [supabase, showToast])

  // ── ADD ATTENDANCE ───────────────────────────
  const addAttendance = useCallback(async (
    studentId: string,
    status: 'hadir' | 'sakit' | 'absen'
  ) => {
    const { data, error } = await supabase
      .from('records')
      .insert({ student_id: studentId, category: 'kehadiran', type: status })
      .select()
      .single()

    if (error) { showToast('Gagal mencatat kehadiran', 'error'); return }
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, records: [data, ...s.records] } : s
    ))
    const labels = { hadir: 'Hadir ✓', sakit: 'Sakit 🤒', absen: 'Absen ✗' }
    showToast(`Kehadiran dicatat: ${labels[status]}`, 'success')
  }, [supabase, showToast])

  // ── DELETE RECORD ────────────────────────────
  const deleteRecord = useCallback(async (studentId: string, recordId: string) => {
    const { error } = await supabase.from('records').delete().eq('id', recordId)
    if (error) { showToast('Gagal menghapus entri', 'error'); return }
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, records: s.records.filter(r => r.id !== recordId) } : s
    ))
    showToast('Entri dihapus', 'info')
  }, [supabase, showToast])

  const activeStudent = students.find(s => s.id === activeId) ?? null

  return (
    <>
      <Header userEmail={user.email ?? ''} />
      <div className="main-layout">
        <StudentSidebar
          students={students}
          activeId={activeId}
          onSelect={setActiveId}
          onAddStudent={addStudent}
          onShowLeaderboard={() => setShowLeaderboard(true)}
        />
        <section className="content-panel">
          {activeStudent ? (
            <StudentDetail
              student={activeStudent}
              onAddGrade={addGrade}
              onAddAttendance={addAttendance}
              onDeleteRecord={deleteRecord}
              onDeleteStudent={deleteStudent}
            />
          ) : (
            <WelcomeScreen />
          )}
        </section>
      </div>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard
          students={students}
          onClose={() => setShowLeaderboard(false)}
          onSelectStudent={id => { setActiveId(id); setShowLeaderboard(false) }}
        />
      )}

      {/* Toast */}
      <div className={`toast ${toast ? toast.type + ' show' : ''}`}>
        {toast?.msg}
      </div>
    </>
  )
}
