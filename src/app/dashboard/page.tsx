import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch students with their records in one query
  const { data: students } = await supabase
    .from('students')
    .select('*, records(*)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: true })
    .order('date', { ascending: false, referencedTable: 'records' })

  return <DashboardClient user={user} initialStudents={students ?? []} />
}
