-- Additive R2 coexistence migration. Leaves legacy Vercel photo data, table
-- privileges and storage policies unchanged. Never run earlier destructive drafts.
begin;
create table public.r2_task_photos (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  storage_path text not null unique,
  mime_type text not null check (mime_type = 'image/webp'),
  size_bytes integer not null check (size_bytes between 1 and 1048576),
  width integer check (width between 1 and 1600),
  height integer check (height between 1 and 1600),
  is_original boolean not null default false check (not is_original),
  uploaded_by uuid,
  created_at timestamptz not null default now(),
  expired_at timestamptz,
  constraint r2_task_photos_task_id_fkey foreign key(task_id) references public.task_instances(id) on delete cascade,
  constraint r2_task_photos_uploaded_by_fkey foreign key(uploaded_by) references public.profiles(id) on delete set null
);
create index r2_task_photos_task_idx on public.r2_task_photos(task_id);
create index r2_task_photos_expiration_idx on public.r2_task_photos(created_at) where expired_at is null;
create index r2_task_photos_uploader_idx on public.r2_task_photos(uploaded_by);
alter table public.r2_task_photos enable row level security;
revoke all on public.r2_task_photos from public, anon, authenticated;
grant select, delete on public.r2_task_photos to authenticated;
grant all on public.r2_task_photos to service_role;
create policy r2_photos_read on public.r2_task_photos for select to authenticated using (
  exists(select 1 from public.task_instances t where t.id=task_id and private.dd_has_store_access(t.store_id))
);
create policy r2_photos_admin_delete on public.r2_task_photos for delete to authenticated using (private.dd_is_admin());

create function private.limit_r2_photos() returns trigger language plpgsql security invoker set search_path = '' as $$
declare store_id uuid;
begin
  select t.store_id into store_id from public.task_instances t where t.id=new.task_id for update;
  if store_id is null or new.storage_path <> 'lojas/' || store_id::text || '/' || to_char(new.created_at at time zone 'UTC','YYYY/MM/DD') || '/' || new.task_id::text || '/' || new.id::text || '.webp' then
    raise exception 'Chave R2 inválida para esta atividade.';
  end if;
  if (select count(*) from public.r2_task_photos where task_id=new.task_id) >= 5 then
    raise exception 'Limite de 5 fotos por atividade atingido.';
  end if;
  return new;
end;
$$;
create trigger limit_r2_photos before insert on public.r2_task_photos for each row execute function private.limit_r2_photos();

-- Preserve every existing task authorization/status rule. Only broaden the
-- required-evidence lookup to accept real R2 evidence as well as legacy photos.
do $patch$
declare definition text;
begin
  select pg_get_functiondef('private.enforce_task_rules()'::regprocedure) into definition;
  if (length(definition)-length(replace(definition,'select 1 from public.task_photos',''))) / length('select 1 from public.task_photos') <> 1 then
    raise exception 'Unexpected task rules. Review compatibility before applying this migration.';
  end if;
  definition := replace(definition,'select 1 from public.task_photos',
    'select 1 from (select task_id,is_original from public.task_photos union all select task_id,is_original from public.r2_task_photos) as evidence');
  execute definition;
end;
$patch$;

create function public.expire_r2_photo(p_id uuid) returns void language plpgsql security invoker set search_path = '' as $$
declare p public.r2_task_photos;
begin
  select * into p from public.r2_task_photos where id=p_id for update;
  if p.id is null or p.expired_at is not null or p.created_at > now()-interval '90 days' then return; end if;
  insert into public.audit_logs(actor_id,action,entity_type,entity_id,details)
    values(null,'task.photo_expired','task',p.task_id::text,jsonb_build_object('photoId',p.id,'storagePath',p.storage_path,'provider','r2'));
  update public.r2_task_photos set expired_at=now() where id=p.id;
end;
$$;
revoke all on function public.expire_r2_photo(uuid) from public,anon,authenticated;
grant execute on function public.expire_r2_photo(uuid) to service_role;

create function public.delete_r2_photo(p_id uuid) returns void language plpgsql security invoker set search_path = '' as $$
declare p public.r2_task_photos;
begin
  delete from public.r2_task_photos where id=p_id returning * into p;
  if p.id is null then raise exception 'Foto não encontrada ou sem permissão.'; end if;
  perform public.log_audit('task.photo_removed','task',p.task_id::text,jsonb_build_object('photoId',p.id,'storagePath',p.storage_path,'provider','r2'));
end;
$$;
revoke all on function public.delete_r2_photo(uuid) from public,anon;
grant execute on function public.delete_r2_photo(uuid) to authenticated;
notify pgrst, 'reload schema';
commit;
