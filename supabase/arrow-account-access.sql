create or replace function private.arrow_account_active()
returns boolean language sql stable security definer set search_path = ''
as $$ select auth.uid() is not null and exists(select 1 from public.profiles where id = auth.uid() and banned_at is null) $$;
revoke all on function private.arrow_account_active() from public, anon;
grant execute on function private.arrow_account_active() to authenticated;
do $$
declare target text;
begin
 for target in select tablename from pg_tables where schemaname='public' and (tablename like 'field_%' or tablename like 'ravin_%' or tablename in ('todos','notes','relay_calendar_events','waypoint_items','waypoint_captures')) loop
  execute format('drop policy if exists arrow_active_account on public.%I',target);
  execute format('create policy arrow_active_account on public.%I as restrictive for all to authenticated using ((select private.arrow_account_active())) with check ((select private.arrow_account_active()))',target);
 end loop;
end $$;
