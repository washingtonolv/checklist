-- Apply ONLY to a fresh isolated preview project. Never run against production.
begin;
drop policy if exists evidencias_select_access on storage.objects;
drop policy if exists evidencias_insert_access on storage.objects;
drop policy if exists evidencias_admin_delete on storage.objects;
alter table public.task_photos add column expired_at timestamptz;
-- R2 cannot be verified by a SQL storage.objects lookup. Only the server that
-- decoded/uploaded bytes may create metadata, preventing fabricated evidence.
revoke insert, update on public.task_photos from anon, authenticated;
drop policy task_photos_insert_access on public.task_photos;
create policy task_photos_insert_access on public.task_photos
for insert to authenticated with check (
  uploaded_by = (select auth.uid()) and not is_original
  and mime_type = 'image/webp' and size_bytes between 1 and 1048576
  and expired_at is null and created_at between now() - interval '5 minutes' and now() + interval '1 minute'
  and exists (select 1 from public.task_instances t where t.id = task_id
    and private.dd_has_store_access(t.store_id)
    and (t.status <> 'completed' or private.dd_can_review())
    and storage_path = 'lojas/' || t.store_id::text || '/' || to_char(created_at at time zone 'UTC', 'YYYY/MM/DD') || '/' || t.id::text || '/' || task_photos.id::text || '.webp')
);

-- Lock parent row: racing inserts are serialized across all app instances.
create function private.limit_r2_photos() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  perform 1 from public.task_instances where id = new.task_id for update;
  if (select count(*) from public.task_photos where task_id = new.task_id and not is_original) >= 5 then
    raise exception 'Limite de 5 fotos por atividade atingido.';
  end if;
  return new;
end;
$$;
create trigger limit_r2_photos before insert on public.task_photos for each row execute function private.limit_r2_photos();

-- Metadata and audit are committed together. Only the server retention role can call this.
create function public.expire_r2_photo(p_id uuid) returns void language plpgsql security invoker set search_path = '' as $$
declare p public.task_photos;
begin
  select * into p from public.task_photos where id = p_id for update;
  if p.id is null or p.expired_at is not null or p.created_at > now() - interval '90 days' then return; end if;
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,details)
    values(null,'task.photo_expired','task',p.task_id::text,jsonb_build_object('photoId',p.id,'storagePath',p.storage_path));
  update public.task_photos set expired_at = now() where id = p.id;
end;
$$;
revoke all on function public.expire_r2_photo(uuid) from public, anon, authenticated;
grant execute on function public.expire_r2_photo(uuid) to service_role;

create function public.delete_r2_photo(p_id uuid) returns void language plpgsql security invoker set search_path = '' as $$
declare p public.task_photos;
begin
  -- Existing admin DELETE policy and store SELECT policy are enforced by RLS.
  delete from public.task_photos where id = p_id returning * into p;
  if p.id is null then raise exception 'Foto não encontrada ou sem permissão.'; end if;
  perform public.log_audit('task.photo_removed','task',p.task_id::text,jsonb_build_object('photoId',p.id,'storagePath',p.storage_path));
end;
$$;
revoke all on function public.delete_r2_photo(uuid) from public, anon;
grant execute on function public.delete_r2_photo(uuid) to authenticated;
commit;
