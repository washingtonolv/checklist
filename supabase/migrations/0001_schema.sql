-- CHECKLIST OPERACIONAL D&D
-- Estrutura principal, funções, triggers, RLS e Storage.
-- Execute este arquivo no SQL Editor do Supabase (ou via supabase db push).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.user_role as enum ('admin', 'supervisor', 'manager');
create type public.recurrence as enum ('daily', 'weekly', 'monthly', 'once');
create type public.photo_requirement as enum ('required', 'optional', 'none');
create type public.task_status as enum ('pending', 'in_progress', 'completed', 'correction_requested', 'rejected');
create type public.execution_action as enum (
  'created',
  'started',
  'completed',
  'correction_requested',
  'rejected',
  'approved',
  'reopened',
  'photo_added',
  'photo_removed',
  'observation',
  'updated'
);

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role public.user_role not null default 'manager',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index profiles_email_key on public.profiles (lower(email));

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  active boolean not null default true,
  manager_id uuid,
  created_at timestamptz not null default now(),
  constraint stores_code_key unique (code),
  constraint stores_manager_id_fkey foreign key (manager_id) references public.profiles (id) on delete set null
);

create table public.store_supervisors (
  store_id uuid not null,
  supervisor_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (store_id, supervisor_id),
  constraint store_supervisors_store_id_fkey foreign key (store_id) references public.stores (id) on delete cascade,
  constraint store_supervisors_supervisor_id_fkey foreign key (supervisor_id) references public.profiles (id) on delete cascade
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint categories_name_key unique (name)
);

create table public.task_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category_id uuid not null,
  recurrence public.recurrence not null,
  due_time time not null default '18:00',
  once_due_date date,
  photo_requirement public.photo_requirement not null default 'optional',
  active boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now(),
  constraint task_templates_category_id_fkey foreign key (category_id) references public.categories (id) on delete restrict,
  constraint task_templates_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null
);

create table public.template_stores (
  template_id uuid not null,
  store_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (template_id, store_id),
  constraint template_stores_template_id_fkey foreign key (template_id) references public.task_templates (id) on delete cascade,
  constraint template_stores_store_id_fkey foreign key (store_id) references public.stores (id) on delete cascade
);

create table public.task_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null,
  store_id uuid not null,
  title text not null,
  description text not null default '',
  category_id uuid not null,
  recurrence public.recurrence not null,
  period_key text not null,
  due_date date not null,
  due_time time not null,
  status public.task_status not null default 'pending',
  photo_requirement public.photo_requirement not null default 'optional',
  completed_at timestamptz,
  completed_by uuid,
  approved_at timestamptz,
  approved_by uuid,
  observation text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint task_instances_template_id_fkey foreign key (template_id) references public.task_templates (id) on delete restrict,
  constraint task_instances_store_id_fkey foreign key (store_id) references public.stores (id) on delete cascade,
  constraint task_instances_category_id_fkey foreign key (category_id) references public.categories (id) on delete restrict,
  constraint task_instances_completed_by_fkey foreign key (completed_by) references public.profiles (id) on delete set null,
  constraint task_instances_approved_by_fkey foreign key (approved_by) references public.profiles (id) on delete set null,
  constraint task_instances_template_store_period_key unique (template_id, store_id, period_key)
);

create table public.task_photos (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes integer not null default 0,
  width integer,
  height integer,
  is_original boolean not null default false,
  uploaded_by uuid,
  created_at timestamptz not null default now(),
  constraint task_photos_task_id_fkey foreign key (task_id) references public.task_instances (id) on delete cascade,
  constraint task_photos_uploaded_by_fkey foreign key (uploaded_by) references public.profiles (id) on delete set null,
  constraint task_photos_storage_path_key unique (storage_path)
);

create table public.task_executions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  action public.execution_action not null,
  note text not null default '',
  user_id uuid,
  previous_status public.task_status,
  new_status public.task_status,
  created_at timestamptz not null default now(),
  constraint task_executions_task_id_fkey foreign key (task_id) references public.task_instances (id) on delete cascade,
  constraint task_executions_user_id_fkey foreign key (user_id) references public.profiles (id) on delete set null
);

create table public.task_observations (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null,
  user_id uuid,
  content text not null,
  created_at timestamptz not null default now(),
  constraint task_observations_task_id_fkey foreign key (task_id) references public.task_instances (id) on delete cascade,
  constraint task_observations_user_id_fkey foreign key (user_id) references public.profiles (id) on delete set null
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_logs_actor_id_fkey foreign key (actor_id) references public.profiles (id) on delete set null
);

create index task_instances_store_due_idx on public.task_instances (store_id, due_date, due_time);
create index task_instances_status_idx on public.task_instances (status);
create index task_instances_template_idx on public.task_instances (template_id);
create index task_photos_task_idx on public.task_photos (task_id);
create index task_executions_task_idx on public.task_executions (task_id, created_at);
create index task_observations_task_idx on public.task_observations (task_id, created_at);
create index audit_logs_created_idx on public.audit_logs (created_at desc);

-- ---------------------------------------------------------------------------
-- Funções auxiliares de autorização
-- ---------------------------------------------------------------------------
create or replace function public.dd_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true;
$$;

create or replace function public.dd_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.dd_role() = 'admin', false);
$$;

create or replace function public.dd_can_review()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.dd_role() in ('admin', 'supervisor'), false);
$$;

create or replace function public.dd_has_store_access(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then false
    when public.dd_is_admin() then true
    else exists (
      select 1 from public.stores s
      where s.id = p_store_id and s.manager_id = auth.uid()
    ) or exists (
      select 1 from public.store_supervisors ss
      where ss.store_id = p_store_id and ss.supervisor_id = auth.uid()
    )
  end;
$$;

create or replace function public.dd_storage_store_id(p_name text)
returns uuid
language plpgsql
immutable
as $$
begin
  return ((storage.foldername(p_name))[1])::uuid;
exception when others then
  return null;
end;
$$;

create or replace function public.dd_storage_task_id(p_name text)
returns uuid
language plpgsql
immutable
as $$
begin
  return ((storage.foldername(p_name))[2])::uuid;
exception when others then
  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Triggers de integridade e auditoria
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger task_instances_set_updated_at
before update on public.task_instances
for each row execute function public.set_updated_at();

create or replace function public.enforce_task_rules()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  if new.status = 'completed' and new.photo_requirement = 'required' then
    if not exists (
      select 1 from public.task_photos
      where task_id = new.id and is_original = false
    ) then
      raise exception 'Foto obrigatória: anexe pelo menos uma evidência antes de concluir.';
    end if;
  end if;

  -- service_role não possui auth.uid(); ele é usado apenas no servidor.
  if auth.uid() is null then
    return new;
  end if;

  v_role := public.dd_role();
  if v_role is null then
    raise exception 'Usuário sem perfil ativo.';
  end if;

  if v_role <> 'admin' then
    if new.template_id is distinct from old.template_id
      or new.store_id is distinct from old.store_id
      or new.title is distinct from old.title
      or new.description is distinct from old.description
      or new.category_id is distinct from old.category_id
      or new.recurrence is distinct from old.recurrence
      or new.period_key is distinct from old.period_key
      or new.due_date is distinct from old.due_date
      or new.due_time is distinct from old.due_time
      or new.photo_requirement is distinct from old.photo_requirement
      or new.created_at is distinct from old.created_at then
      raise exception 'Campos estruturais da atividade são protegidos.';
    end if;

    if v_role = 'manager' then
      if new.approved_at is distinct from old.approved_at
        or new.approved_by is distinct from old.approved_by then
        raise exception 'Somente a supervisão pode aprovar execuções.';
      end if;
    end if;

    if new.completed_by is not null
      and new.completed_by <> auth.uid()
      and new.completed_at is distinct from old.completed_at then
      raise exception 'A conclusão deve ser registrada pelo próprio usuário.';
    end if;
  end if;

  return new;
end;
$$;

create trigger task_instances_enforce_rules
before update on public.task_instances
for each row execute function public.enforce_task_rules();

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return new;
  end if;
  if public.dd_is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role
    or new.active is distinct from old.active
    or new.email is distinct from old.email then
    raise exception 'Somente a gerente comercial pode alterar perfil, status ou e-mail.';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_privileges
before update on public.profiles
for each row execute function public.protect_profile_privileges();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
  v_role public.user_role := 'manager';
begin
  v_name := coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1));
  if (new.raw_user_meta_data ->> 'role') in ('admin', 'supervisor', 'manager') then
    v_role := (new.raw_user_meta_data ->> 'role')::public.user_role;
  end if;

  insert into public.profiles (id, name, email, role, active)
  values (new.id, v_name, new.email, v_role, true)
  on conflict (id) do update
    set name = excluded.name,
        email = excluded.email;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RPC de geração de atividades e auditoria
-- ---------------------------------------------------------------------------
create or replace function public.generate_task_instances(p_today date default current_date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
  v_period_key text;
  v_due_date date;
  v_created integer := 0;
begin
  if auth.uid() is not null and not public.dd_is_admin() then
    raise exception 'Somente a gerente comercial pode gerar atividades.';
  end if;

  for r in
    select
      t.id,
      t.title,
      t.description,
      t.category_id,
      t.recurrence,
      t.due_time,
      t.once_due_date,
      t.photo_requirement,
      ts.store_id
    from public.task_templates t
    join public.template_stores ts on ts.template_id = t.id
    join public.stores s on s.id = ts.store_id
    where t.active = true and s.active = true
  loop
    if r.recurrence = 'daily' then
      v_period_key := to_char(p_today, 'YYYY-MM-DD');
      v_due_date := p_today;
    elsif r.recurrence = 'weekly' then
      v_period_key := to_char(p_today, 'IYYY-"W"IW');
      v_due_date := (date_trunc('week', p_today::timestamp) + interval '6 days')::date;
    elsif r.recurrence = 'monthly' then
      v_period_key := to_char(p_today, 'YYYY-MM');
      v_due_date := (date_trunc('month', p_today::timestamp) + interval '1 month - 1 day')::date;
    else
      continue when r.once_due_date is null or r.once_due_date > p_today;
      v_period_key := 'once';
      v_due_date := r.once_due_date;
    end if;

    insert into public.task_instances (
      template_id, store_id, title, description, category_id, recurrence,
      period_key, due_date, due_time, status, photo_requirement
    )
    values (
      r.id, r.store_id, r.title, r.description, r.category_id, r.recurrence,
      v_period_key, v_due_date, r.due_time, 'pending', r.photo_requirement
    )
    on conflict (template_id, store_id, period_key) do nothing;

    if found then
      v_created := v_created + 1;
    end if;
  end loop;

  return v_created;
end;
$$;

create or replace function public.log_audit(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_details jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_id, action, entity_type, entity_id, details)
  values (auth.uid(), p_action, p_entity_type, p_entity_id, coalesce(p_details, '{}'::jsonb));
end;
$$;

revoke all on function public.generate_task_instances(date) from public;
revoke all on function public.log_audit(text, text, text, jsonb) from public;
grant execute on function public.generate_task_instances(date) to authenticated, service_role;
grant execute on function public.log_audit(text, text, text, jsonb) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.stores enable row level security;
alter table public.store_supervisors enable row level security;
alter table public.categories enable row level security;
alter table public.task_templates enable row level security;
alter table public.template_stores enable row level security;
alter table public.task_instances enable row level security;
alter table public.task_photos enable row level security;
alter table public.task_executions enable row level security;
alter table public.task_observations enable row level security;
alter table public.audit_logs enable row level security;

-- Perfis: leitura autenticada para permitir joins de nomes; alteração apenas do próprio nome.
create policy profiles_select_authenticated on public.profiles
for select to authenticated using (true);

create policy profiles_update_self on public.profiles
for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Lojas
create policy stores_select_access on public.stores
for select to authenticated
using (public.dd_is_admin() or public.dd_has_store_access(id));

create policy stores_admin_insert on public.stores
for insert to authenticated
with check (public.dd_is_admin());

create policy stores_admin_update on public.stores
for update to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

create policy stores_admin_delete on public.stores
for delete to authenticated
using (public.dd_is_admin());

-- Vínculos de supervisão
create policy store_supervisors_select_access on public.store_supervisors
for select to authenticated
using (public.dd_is_admin() or public.dd_has_store_access(store_id));

create policy store_supervisors_admin_all on public.store_supervisors
for all to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

-- Categorias
create policy categories_select_active on public.categories
for select to authenticated
using (public.dd_is_admin() or active = true);

create policy categories_admin_write on public.categories
for all to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

-- Modelos de tarefas
create policy task_templates_select_access on public.task_templates
for select to authenticated
using (
  public.dd_is_admin()
  or (
    active = true
    and exists (
      select 1 from public.template_stores ts
      where ts.template_id = id and public.dd_has_store_access(ts.store_id)
    )
  )
);

create policy task_templates_admin_write on public.task_templates
for all to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

create policy template_stores_select_access on public.template_stores
for select to authenticated
using (public.dd_is_admin() or public.dd_has_store_access(store_id));

create policy template_stores_admin_write on public.template_stores
for all to authenticated
using (public.dd_is_admin())
with check (public.dd_is_admin());

-- Atividades
create policy task_instances_select_access on public.task_instances
for select to authenticated
using (public.dd_has_store_access(store_id));

create policy task_instances_update_access on public.task_instances
for update to authenticated
using (public.dd_has_store_access(store_id))
with check (public.dd_has_store_access(store_id));

-- Fotos
create policy task_photos_select_access on public.task_photos
for select to authenticated
using (
  exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

create policy task_photos_insert_access on public.task_photos
for insert to authenticated
with check (
  exists (
    select 1 from public.task_instances t
    where t.id = task_id
      and public.dd_has_store_access(t.store_id)
      and (t.status <> 'completed' or public.dd_can_review())
  )
);

create policy task_photos_admin_delete on public.task_photos
for delete to authenticated
using (public.dd_is_admin());

-- Execuções
create policy task_executions_select_access on public.task_executions
for select to authenticated
using (
  exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

create policy task_executions_insert_self on public.task_executions
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

-- Observações
create policy task_observations_select_access on public.task_observations
for select to authenticated
using (
  exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

create policy task_observations_insert_self on public.task_observations
for insert to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.task_instances t
    where t.id = task_id and public.dd_has_store_access(t.store_id)
  )
);

-- Auditoria: somente administração
create policy audit_logs_admin_select on public.audit_logs
for select to authenticated
using (public.dd_is_admin());

-- ---------------------------------------------------------------------------
-- Storage privado de evidências
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'evidencias',
  'evidencias',
  false,
  10485760,
  array['image/webp', 'image/jpeg', 'image/png']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists evidencias_select_access on storage.objects;
create policy evidencias_select_access on storage.objects
for select to authenticated
using (
  bucket_id = 'evidencias'
  and public.dd_has_store_access(public.dd_storage_store_id(name))
);

drop policy if exists evidencias_insert_access on storage.objects;
create policy evidencias_insert_access on storage.objects
for insert to authenticated
with check (
  bucket_id = 'evidencias'
  and public.dd_has_store_access(public.dd_storage_store_id(name))
  and exists (
    select 1 from public.task_instances t
    where t.id = public.dd_storage_task_id(name)
      and t.store_id = public.dd_storage_store_id(name)
      and (t.status <> 'completed' or public.dd_can_review())
  )
);

drop policy if exists evidencias_admin_delete on storage.objects;
create policy evidencias_admin_delete on storage.objects
for delete to authenticated
using (bucket_id = 'evidencias' and public.dd_is_admin());

-- ---------------------------------------------------------------------------
-- Permissões de tabelas (RLS continua sendo a barreira de acesso)
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

