-- =============================================================
-- AMTEHI — Row Level Security & Trigger Setup (Supabase)
-- Jalankan di Supabase SQL Editor SETELAH `prisma migrate` membuat tabel.
-- Prisma tidak mengelola RLS, jadi policy didefinisikan manual di sini.
-- =============================================================

-- ---------- FK profiles.id → auth.users(id) dengan CASCADE ----------
-- Prisma tidak bisa mereferensikan tabel di schema `auth`, jadi FK ditambah manual.
-- Tanpa ini, menghapus user dari Supabase Auth meninggalkan baris profiles yatim.
alter table public.profiles
  drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references auth.users(id) on delete cascade;

-- ---------- Trigger: auto-buat profile saat user baru sign-up ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Pengguna'),
    now(),
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Aktifkan RLS di semua tabel ----------
alter table public.profiles       enable row level security;
alter table public.lost_items     enable row level security;
alter table public.found_items    enable row level security;
alter table public.claim_requests enable row level security;

-- Helper: cek apakah current user admin
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------- PROFILES ----------
-- Semua user terautentikasi bisa melihat profil (untuk tampil nama pemilik item)
drop policy if exists "profiles_select_all" on public.profiles;
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Hanya pemilik yang bisa update profilnya
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ---------- LOST ITEMS ----------
drop policy if exists "lost_select_all" on public.lost_items;
create policy "lost_select_all"
  on public.lost_items for select using (true);

drop policy if exists "lost_insert_own" on public.lost_items;
create policy "lost_insert_own"
  on public.lost_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "lost_update_own" on public.lost_items;
create policy "lost_update_own"
  on public.lost_items for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "lost_delete_own" on public.lost_items;
create policy "lost_delete_own"
  on public.lost_items for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------- FOUND ITEMS ----------
drop policy if exists "found_select_all" on public.found_items;
create policy "found_select_all"
  on public.found_items for select using (true);

drop policy if exists "found_insert_own" on public.found_items;
create policy "found_insert_own"
  on public.found_items for insert
  with check (auth.uid() = user_id);

drop policy if exists "found_update_own" on public.found_items;
create policy "found_update_own"
  on public.found_items for update
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "found_delete_own" on public.found_items;
create policy "found_delete_own"
  on public.found_items for delete
  using (auth.uid() = user_id or public.is_admin());

-- ---------- CLAIM REQUESTS ----------
-- Pengaju klaim & admin bisa melihat klaim. (Pemilik item dicek di aplikasi.)
drop policy if exists "claims_select_own_or_admin" on public.claim_requests;
create policy "claims_select_own_or_admin"
  on public.claim_requests for select
  using (auth.uid() = claimant_id or public.is_admin());

drop policy if exists "claims_insert_own" on public.claim_requests;
create policy "claims_insert_own"
  on public.claim_requests for insert
  with check (auth.uid() = claimant_id);

-- Hanya admin yang boleh mengubah status klaim (review)
drop policy if exists "claims_update_admin" on public.claim_requests;
create policy "claims_update_admin"
  on public.claim_requests for update
  using (public.is_admin());

-- ---------- ADMIN LOGS ----------
-- Audit trail: hanya admin yang boleh membaca. Penulisan dilakukan backend
-- via service role (bypass RLS), jadi tidak ada policy insert untuk anon.
alter table public.admin_logs enable row level security;

drop policy if exists "admin_logs_select_admin" on public.admin_logs;
create policy "admin_logs_select_admin"
  on public.admin_logs for select
  using (public.is_admin());

-- =============================================================
-- Catatan: Backend AMTEHI memakai SERVICE ROLE key yang bypass RLS.
-- Policy di atas adalah lapisan pertahanan kedua untuk akses langsung
-- via anon key (mis. Supabase client di frontend / Realtime).
-- =============================================================
