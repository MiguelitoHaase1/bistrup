-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- 1. Comments table
create table comments (
  id uuid default gen_random_uuid() primary key,
  parent_id uuid references comments(id) on delete cascade,
  page_path text not null,
  x_percent numeric not null default 0,
  y_percent numeric not null default 0,
  text text not null,
  image_url text,
  author text not null default 'Anonym',
  created_at timestamptz default now() not null
);

-- 2. Indexes
create index idx_comments_page_path on comments(page_path);
create index idx_comments_parent_id on comments(parent_id);

-- 3. RLS: open access (no auth required)
alter table comments enable row level security;
create policy "Allow all reads" on comments for select using (true);
create policy "Allow all inserts" on comments for insert with check (true);
create policy "Allow all updates" on comments for update using (true);
create policy "Allow all deletes" on comments for delete using (true);

-- 4. Anchor-based positioning (element-relative)
alter table comments add column if not exists anchor_selector text;
alter table comments add column if not exists anchor_offset_x numeric default 0;
alter table comments add column if not exists anchor_offset_y numeric default 0;

-- 5. Enable real-time for live collaboration
alter publication supabase_realtime add table comments;

-- 6. Storage bucket for comment images
insert into storage.buckets (id, name, public) values ('comment-images', 'comment-images', true);

-- 7. Storage policies: public read + upload
create policy "Public read comment images"
  on storage.objects for select
  using (bucket_id = 'comment-images');

create policy "Public upload comment images"
  on storage.objects for insert
  with check (bucket_id = 'comment-images');
