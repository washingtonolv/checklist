-- No existing rows or foreign keys are removed. Restrict constraints protect historical tasks.
alter table public.task_templates alter column category_id drop not null;
alter table public.task_instances alter column category_id drop not null;

-- RLS remains enabled. Only the immutable General Administrator may permanently delete.
alter policy categories_admin_delete on public.categories
  using ((select private.dd_is_admin()) and (select auth.uid()) = '313596fc-5730-42e6-a8fd-a694d2ef5832'::uuid);
alter policy task_templates_admin_delete on public.task_templates
  using ((select private.dd_is_admin()) and (select auth.uid()) = '313596fc-5730-42e6-a8fd-a694d2ef5832'::uuid);

-- Invoker permissions + existing RLS; all model fields, store links and audit commit together.
create function public.save_task_template(p_id uuid, p_input jsonb)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  v_id uuid;
  v_category uuid := nullif(p_input->>'categoryId', '')::uuid;
  v_previous_category uuid;
  v_stores uuid[];
begin
  if not private.dd_is_admin() then raise exception 'Acesso restrito à administração.'; end if;
  select array_agg(distinct value::uuid) into v_stores from jsonb_array_elements_text(p_input->'storeIds');
  if coalesce(cardinality(v_stores), 0) = 0 then raise exception 'Selecione pelo menos uma loja.'; end if;
  if p_id is not null then
    select category_id into v_previous_category from public.task_templates where id = p_id for update;
    if not found then raise exception 'Modelo não encontrado.'; end if;
  end if;
  if v_category is not null and not exists (
    select 1 from public.categories where id = v_category and (active or id = v_previous_category)
  ) then raise exception 'Categoria inválida ou arquivada.'; end if;
  if p_id is null then
    insert into public.task_templates (title, description, category_id, recurrence, due_time, once_due_date, photo_requirement, active, created_by)
    values (p_input->>'title', coalesce(p_input->>'description',''), v_category, (p_input->>'recurrence')::public.recurrence,
      (p_input->>'dueTime')::time, case when p_input->>'recurrence' = 'once' then (p_input->>'onceDueDate')::date end,
      (p_input->>'photoRequirement')::public.photo_requirement, (p_input->>'active')::boolean, auth.uid()) returning id into v_id;
  else
    update public.task_templates set title = p_input->>'title', description = coalesce(p_input->>'description',''),
      category_id = v_category, recurrence = (p_input->>'recurrence')::public.recurrence, due_time = (p_input->>'dueTime')::time,
      once_due_date = case when p_input->>'recurrence' = 'once' then (p_input->>'onceDueDate')::date end,
      photo_requirement = (p_input->>'photoRequirement')::public.photo_requirement, active = (p_input->>'active')::boolean
    where id = p_id returning id into v_id;
    delete from public.template_stores where template_id = v_id;
  end if;
  insert into public.template_stores(template_id, store_id) select v_id, unnest(v_stores);
  perform public.log_audit(case when p_id is null then 'template.created' else 'template.updated' end,
    'template', v_id::text, jsonb_build_object('title', p_input->>'title', 'active', p_input->'active'));
  return v_id;
end;
$$;
revoke all on function public.save_task_template(uuid,jsonb) from public, anon;
grant execute on function public.save_task_template(uuid,jsonb) to authenticated;

-- Delete audit belongs to the same transaction, including deletes through the Data API.
create function private.audit_management_delete() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  perform public.log_audit(case when tg_table_name = 'categories' then 'category.deleted' else 'template.deleted' end,
    case when tg_table_name = 'categories' then 'category' else 'template' end,
    old.id::text, to_jsonb(old));
  return old;
end;
$$;
revoke all on function private.audit_management_delete() from public, anon;
grant execute on function private.audit_management_delete() to authenticated;
create trigger audit_category_delete after delete on public.categories for each row execute function private.audit_management_delete();
create trigger audit_template_delete after delete on public.task_templates for each row execute function private.audit_management_delete();
-- Archived categories must remain readable when referenced by tasks in an accessible store.
alter policy categories_select_active on public.categories using (
  (select private.dd_is_admin()) or (
    (select private.dd_role()) is not null and (
      active or exists (select 1 from public.task_instances t
        where t.category_id = categories.id and private.dd_has_store_access(t.store_id))
    )
  )
);
