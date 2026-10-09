-- ============================================
-- MIGRATION: Tambah kolom class_name ke students
-- Jalankan di Supabase SQL Editor
-- ============================================

-- Tambah kolom class_name (nullable)
alter table public.students
  add column if not exists class_name text;
