-- Local seed: listing-images bucket + policies (idempotent-ish)

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set public = excluded.public;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'listing images upload'
  ) then
    create policy "listing images upload"
    on storage.objects for insert
    to authenticated
    with check (
      bucket_id = 'listing-images'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'listing images update own'
  ) then
    create policy "listing images update own"
    on storage.objects for update
    to authenticated
    using (
      bucket_id = 'listing-images'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'listing images delete own'
  ) then
    create policy "listing images delete own"
    on storage.objects for delete
    to authenticated
    using (
      bucket_id = 'listing-images'
      and (storage.foldername(name))[1] = auth.uid()::text
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'listing images public read'
  ) then
    create policy "listing images public read"
    on storage.objects for select
    to public
    using (bucket_id = 'listing-images');
  end if;
end $$;
