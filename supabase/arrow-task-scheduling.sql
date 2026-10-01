create or replace function public.arrow_schedule_task(p_task_id uuid,p_date date,p_start time,p_end time)
returns uuid language plpgsql security invoker set search_path=''
as $$
declare uid uuid := auth.uid(); task public.todos%rowtype; event_id uuid;
begin
 if not private.arrow_account_active() then raise exception 'Active ARROW account required'; end if;
 if p_date is null or p_start is null or p_end is null or p_end<=p_start or extract(epoch from (p_end-p_start))/60>240 then raise exception 'Choose a valid focus block of up to four hours'; end if;
 perform pg_advisory_xact_lock(hashtextextended(uid::text,0));
 select * into task from public.todos where id=p_task_id and user_id=uid for update;
 if not found or task.completed then raise exception 'This task is no longer open'; end if;
 if exists(select 1 from public.relay_calendar_events e where e.user_id=uid and e.event_date=p_date and e.source_key is distinct from ('schedule:'||p_task_id::text)
   and (e.is_all_day or e.start_time is null or (e.start_time<p_end and coalesce(e.end_time,e.start_time+interval '1 hour')>p_start))) then raise exception 'Your calendar changed. Preview a new schedule to avoid this conflict'; end if;
 insert into public.relay_calendar_events(user_id,title,event_date,is_all_day,start_time,end_time,source_key)
 values(uid,task.title,p_date,false,p_start,p_end,'schedule:'||p_task_id::text)
 on conflict(user_id,source_key) do update set title=excluded.title,event_date=excluded.event_date,start_time=excluded.start_time,end_time=excluded.end_time,is_all_day=false
 returning id into event_id;
 update public.todos set scheduled_on=p_date,scheduled_start=p_start,estimated_minutes=extract(epoch from (p_end-p_start))/60 where id=p_task_id and user_id=uid;
 return event_id;
end $$;
revoke all on function public.arrow_schedule_task(uuid,date,time,time) from public,anon;
grant execute on function public.arrow_schedule_task(uuid,date,time,time) to authenticated;
create or replace function private.arrow_sync_scheduled_task()
returns trigger language plpgsql security invoker set search_path=''
as $$
begin
 if tg_op='DELETE' then
   update public.todos set scheduled_on=null,scheduled_start=null where user_id=old.user_id and 'schedule:'||id::text=old.source_key;
   return old;
 end if;
 if new.source_key like 'schedule:%' then
   update public.todos set scheduled_on=case when new.is_all_day then null else new.event_date end,scheduled_start=case when new.is_all_day then null else new.start_time end,
      estimated_minutes=case when new.end_time>new.start_time then extract(epoch from (new.end_time-new.start_time))/60 else estimated_minutes end
   where user_id=new.user_id and 'schedule:'||id::text=new.source_key;
 end if;
 return new;
end $$;
drop trigger if exists arrow_sync_scheduled_task on public.relay_calendar_events;
create trigger arrow_sync_scheduled_task after insert or update or delete on public.relay_calendar_events for each row execute function private.arrow_sync_scheduled_task();
alter function public.arrow_touch_updated_at() set search_path='';
create or replace function public.current_app_role()
returns public.app_role language sql stable security definer set search_path=''
as $$ select coalesce((select role from public.profiles where id=auth.uid() and banned_at is null),'user'::public.app_role) $$;
