-- Classification is stored independently of current names and staff assignments.
alter table public.stores add column region text;
alter table public.stores add column operation_type text;
update public.stores s set
  region = case when s.name ~* '(^|[^[:alpha:]])PB[[:space:]]*-' then 'nordeste' else 'rio_de_janeiro' end,
  operation_type = case when s.name !~* '(^|[^[:alpha:]])PB[[:space:]]*-' and exists (
    select 1 from public.store_supervisors ss join public.profiles p on p.id = ss.supervisor_id
    where ss.store_id = s.id and lower(btrim(p.name)) = 'layane andrade' and p.role = 'supervisor'
  ) then 'franquia_natura' else 'dd_multimarcas' end;
alter table public.stores alter column region set not null;
alter table public.stores alter column operation_type set not null;
alter table public.stores alter column region set default 'rio_de_janeiro';
alter table public.stores alter column operation_type set default 'dd_multimarcas';
alter table public.stores add constraint stores_region_check check (region in ('rio_de_janeiro', 'nordeste'));
alter table public.stores add constraint stores_operation_type_check check (operation_type in ('dd_multimarcas', 'franquia_natura'));
alter table public.stores add constraint stores_region_operation_check check (region <> 'nordeste' or operation_type = 'dd_multimarcas');
-- No triggers infer classification on subsequent renames/reassignments. Existing RLS is unchanged.
