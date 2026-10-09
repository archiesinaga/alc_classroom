export interface Student {
  id: string
  teacher_id: string
  name: string
  class_name: string | null
  created_at: string
}

export const CLASS_OPTIONS = [
  'Kelas 7A', 'Kelas 7B', 'Kelas 7C',
  'Kelas 8A', 'Kelas 8B', 'Kelas 8C',
  'Kelas 9A', 'Kelas 9B', 'Kelas 9C',
  'Lainnya',
] as const

export interface Record {
  id: string
  student_id: string
  category: 'nilai' | 'kehadiran'
  type: 'latihan' | 'quiz' | 'bonus' | 'hadir' | 'sakit' | 'absen'
  value: number | null
  note: string | null
  date: string
}
