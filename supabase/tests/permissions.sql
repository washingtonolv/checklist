
begin;
do $$
declare a uuid:=gen_random_uuid(); m uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); i uuid:=gen_random_uuid();
 sa uuid:=gen_random_uuid(); sb uuid:=gen_random_uuid(); cat uuid; t uuid:=gen_random_uuid();
begin
 perform set_config('test.admin_id',a::text,true);
 perform set_config('test.manager_id',m::text,true);
 perform set_config('test.other_id',b::text,true);
 perform set_config('test.inactive_id',i::text,true);
 perform set_config('test.store_a',sa::text,true);
 insert into auth.users(id,email,raw_user_meta_data,raw_app_meta_data) values
 (a,'test-'||a||'@example.invalid','{"name":"Test admin"}','{"role":"admin"}'),
 (m,'test-'||m||'@example.invalid','{"name":"Manager","role":"admin"}','{"role":"manager"}'),
 (b,'test-'||b||'@example.invalid','{"name":"Other manager"}','{"role":"manager"}'),
 (i,'test-'||i||'@example.invalid','{"name":"Inactive manager"}','{"role":"manager"}');
 if (select role from public.profiles where id=m)<>'manager' then raise exception 'Editable metadata escalated privileges'; end if;
 update public.profiles set active=false where id=i;
 insert into public.stores(id,name,code,manager_id) values(sa,'Test A','test-'||sa,m),(sb,'Test B','test-'||sb,b);
 insert into public.store_supervisors(store_id,supervisor_id) values(sa,i);
 select id into cat from public.categories limit 1;
 insert into public.task_templates(id,title,category_id,recurrence,photo_requirement) values(t,'Test template',cat,'daily','required');
 insert into public.template_stores(template_id,store_id) values(t,sa),(t,sb);
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.admin_id'),true);
set local role authenticated;
do $$ declare n int; begin
 if not private.dd_is_admin() then raise exception 'Admin not recognized';end if;
 n:=public.generate_task_instances(current_date);
 if n<>2 then raise exception 'Expected 2 tasks, got %',n;end if;
 if public.generate_task_instances(current_date)<>0 then raise exception 'Generation not idempotent';end if;
 if (select count(*) from public.stores)<>2 then raise exception 'Admin access failed';end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('test.manager_id'),true);
set local role authenticated;
do $$ declare task uuid; denied boolean:=false; begin
 if (select count(*) from public.stores)<>1 then raise exception 'Store isolation failed';end if;
 if (select count(*) from public.task_instances)<>1 then raise exception 'Task isolation failed';end if;
 if (select count(*) from public.task_templates)<>1 then raise exception 'Template access failed';end if;
 if exists(select 1 from public.profiles where id=current_setting('test.other_id')::uuid) then raise exception 'Cross-store profile leak';end if;
 begin perform public.generate_task_instances(current_date);exception when others then denied:=true;end;
 if not denied then raise exception 'Manager generated tasks';end if;
 denied:=false;
 begin update public.profiles set role='admin' where id=auth.uid();exception when others then denied:=true;end;
 if not denied then raise exception 'Self escalation allowed';end if;
 select id into task from public.task_instances limit 1;
 denied:=false;
 begin update public.task_instances set status='completed',completed_at=now(),completed_by=auth.uid() where id=task;exception when others then denied:=true;end;
 if not denied then raise exception 'Completed without required photo';end if;
 update public.task_instances set status='in_progress' where id=task;
 if (select status from public.task_instances where id=task)<>'in_progress' then raise exception 'Start failed';end if;
 denied:=false;
 begin update public.task_instances set status='rejected' where id=task;exception when others then denied:=true;end;
 if not denied then raise exception 'Manager review allowed';end if;
 denied:=false;
 begin insert into public.task_photos(task_id,storage_path,mime_type,uploaded_by) values(task,current_setting('test.store_a')||'/'||task||'/fake.webp','image/webp',auth.uid());exception when others then denied:=true;end;
 if not denied then raise exception 'Nonexistent photo accepted';end if;
 perform public.log_audit('test.action','task',task::text,'{}');
end $$;
reset role;
select set_config('request.jwt.claim.sub',current_setting('test.inactive_id'),true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.stores)<>0 or (select count(*) from public.task_instances)<>0 or (select count(*) from public.categories)<>0 then
 raise exception 'Inactive user retained store access';end if;
end $$;
reset role;
do $$ begin
 if has_function_privilege('anon','public.generate_task_instances(date)','execute')
 or has_function_privilege('anon','public.log_audit(text,text,text,jsonb)','execute') then raise exception 'Anonymous RPC executable';end if;
 if exists(select 1 from pg_tables where schemaname='public' and not rowsecurity) then raise exception 'RLS missing';end if;
 if exists(select 1 from storage.buckets where id='evidencias' and public) then raise exception 'Public evidence bucket';end if;
end $$;
select 'Passed: tenant isolation, metadata escalation, inactive access, task generation idempotency, mandatory photos, review permissions, private storage, anonymous RPC denial' as result;
rollback;