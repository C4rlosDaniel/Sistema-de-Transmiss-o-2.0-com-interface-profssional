
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin new.updated_at = now(); return new; end; $$;

-- Storage policies: allow anon and authenticated to read/write the 'media' bucket
create policy "media read" on storage.objects for select to anon, authenticated using (bucket_id = 'media');
create policy "media insert" on storage.objects for insert to anon, authenticated with check (bucket_id = 'media');
create policy "media update" on storage.objects for update to anon, authenticated using (bucket_id = 'media');
create policy "media delete" on storage.objects for delete to anon, authenticated using (bucket_id = 'media');
