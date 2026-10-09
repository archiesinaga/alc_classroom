-- ============================================
-- BIMBEL GRADE MANAGER — Supabase SQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Students table
create table if not exists public.students (
  id          uuid primary key default gen_random_uuid(),
  teacher_id  uuid references auth.users(id) on delete cascade not null,
  name        text not null,
  class_name  text,
  created_at  timestamptz default now() not null
);

-- 2. Records table (grades + attendance)
create table if not exists public.records (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid references public.students(id) on delete cascade not null,
  category    text not null check (category in ('nilai', 'kehadiran')),
  type        text not null check (type in ('latihan','quiz','bonus','hadir','sakit','absen')),
  value       numeric check (value >= 0 and value <= 100),
  note        text,
  date        timestamptz default now() not null
);

-- 3. Enable Row Level Security
alter table public.students enable row level security;
alter table public.records  enable row level security;

-- 4. RLS Policies for students
create policy "Guru dapat lihat siswa sendiri"
  on public.students for select
  using (teacher_id = auth.uid());

create policy "Guru dapat tambah siswa"
  on public.students for insert
  with check (teacher_id = auth.uid());

create policy "Guru dapat hapus siswa sendiri"
  on public.students for delete
  using (teacher_id = auth.uid());

-- 5. RLS Policies for records
create policy "Guru dapat lihat nilai siswa sendiri"
  on public.records for select
  using (
    student_id in (
      select id from public.students where teacher_id = auth.uid()
    )
  );

create policy "Guru dapat tambah nilai"
  on public.records for insert
  with check (
    student_id in (
      select id from public.students where teacher_id = auth.uid()
    )
  );

create policy "Guru dapat hapus nilai siswa sendiri"
  on public.records for delete
  using (
    student_id in (
      select id from public.students where teacher_id = auth.uid()
    )
  );

-- 6. Index for performance
create index if not exists idx_students_teacher_id on public.students(teacher_id);
create index if not exists idx_records_student_id on public.records(student_id);
create index if not exists idx_records_date on public.records(date desc);
