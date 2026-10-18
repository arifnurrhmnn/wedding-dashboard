-- Manual integration regression test: use a DISPOSABLE Supabase test database
-- with 20261017000100_set_vendor_final_package.sql already applied and at least
-- two active test profiles. Run as the database owner with psql -f this-file.sql.
-- All fixtures, profile changes, and the failure trigger roll back at the end.
\set ON_ERROR_STOP on
begin;

create temporary table vendor_rpc_test_users as
select id, row_number() over (order by id) as position
from (select id from public.profiles where status = 'active' order by id limit 2) as users;

do $$ begin
  if (select count(*) from vendor_rpc_test_users) <> 2 then
    raise exception 'Create two active test accounts in the disposable test database first';
  end if;
  if has_function_privilege('anon', 'public.set_vendor_final_package(uuid,uuid)', 'EXECUTE') then
    raise exception 'Anonymous execution must be revoked';
  end if;
  if not has_function_privilege('authenticated', 'public.set_vendor_final_package(uuid,uuid)', 'EXECUTE') then
    raise exception 'Authenticated execution must be granted';
  end if;
end $$;

insert into public.vendors (id, user_id, nama, kategori, status)
select 'f0000000-0000-4000-8000-000000000001'::uuid, id, 'RPC first vendor', 'Lainnya', 'prospek' from vendor_rpc_test_users where position = 1
union all
select 'f0000000-0000-4000-8000-000000000002', id, 'RPC second vendor', 'Lainnya', 'prospek' from vendor_rpc_test_users where position = 1
union all
select 'f0000000-0000-4000-8000-000000000003', id, 'RPC other user vendor', 'Lainnya', 'prospek' from vendor_rpc_test_users where position = 2;

insert into public.vendor_packages (id, vendor_id, user_id, nama_paket, harga, is_final)
select 'f1000000-0000-4000-8000-000000000001'::uuid, 'f0000000-0000-4000-8000-000000000001'::uuid, id, 'Old final', 100, true from vendor_rpc_test_users where position = 1
union all
select 'f1000000-0000-4000-8000-000000000002', 'f0000000-0000-4000-8000-000000000001', id, 'New final', 200, false from vendor_rpc_test_users where position = 1
union all
select 'f1000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000002', id, 'Wrong parent', 300, false from vendor_rpc_test_users where position = 1
union all
select 'f1000000-0000-4000-8000-000000000004', 'f0000000-0000-4000-8000-000000000003', id, 'Wrong user', 400, false from vendor_rpc_test_users where position = 2;

select set_config('request.jwt.claim.sub', id::text, true),
       set_config('request.jwt.claims', json_build_object('sub', id::text, 'role', 'authenticated')::text, true)
from vendor_rpc_test_users where position = 1;

do $$ begin
  begin
    perform public.set_vendor_final_package('f0000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000003');
    raise exception 'A package from another parent must fail';
  exception when sqlstate 'P0002' then null;
  end;
  begin
    perform public.set_vendor_final_package('f0000000-0000-4000-8000-000000000003', 'f1000000-0000-4000-8000-000000000004');
    raise exception 'A vendor from another account must fail';
  exception when sqlstate 'P0002' then null;
  end;
  if not (select is_final from public.vendor_packages where id = 'f1000000-0000-4000-8000-000000000001') then
    raise exception 'Invalid selections must preserve the previous final package';
  end if;
end $$;

update public.profiles set status = 'pending'
where id = (select id from vendor_rpc_test_users where position = 1);
do $$ begin
  begin
    perform public.set_vendor_final_package('f0000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000002');
    raise exception 'An inactive account must fail';
  exception when sqlstate '42501' then null;
  end;
end $$;
update public.profiles set status = 'active'
where id = (select id from vendor_rpc_test_users where position = 1);

create function public._test_vendor_rpc_force_failure()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.id = 'f0000000-0000-4000-8000-000000000001'::uuid
     and current_setting('test.vendor_rpc_failure', true) = 'on' then
    raise exception 'forced vendor RPC failure';
  end if;
  return new;
end $$;
create trigger vendor_rpc_test_failure before update of status on public.vendors
for each row execute function public._test_vendor_rpc_force_failure();

select set_config('test.vendor_rpc_failure', 'on', true);
do $$ begin
  begin
    perform public.set_vendor_final_package('f0000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000002');
    raise exception 'The injected vendor update failure must propagate';
  exception when sqlstate 'P0001' then
    if sqlerrm <> 'forced vendor RPC failure' then raise; end if;
  end;
  if not (select is_final from public.vendor_packages where id = 'f1000000-0000-4000-8000-000000000001')
     or (select is_final from public.vendor_packages where id = 'f1000000-0000-4000-8000-000000000002')
     or (select status from public.vendors where id = 'f0000000-0000-4000-8000-000000000001') <> 'prospek' then
    raise exception 'A late failure must roll back final-package and vendor changes';
  end if;
end $$;
select set_config('test.vendor_rpc_failure', 'off', true);

-- Execute as the actual application role to check RPC grants and RLS bypass
-- through the explicit ownership/account checks in the SECURITY DEFINER body.
set local role authenticated;
select public.set_vendor_final_package('f0000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000002');
reset role;
do $$ begin
  if (select count(*) from public.vendor_packages where vendor_id = 'f0000000-0000-4000-8000-000000000001' and is_final) <> 1
     or not (select is_final from public.vendor_packages where id = 'f1000000-0000-4000-8000-000000000002')
     or (select status from public.vendors where id = 'f0000000-0000-4000-8000-000000000001') <> 'deal' then
    raise exception 'A valid selection must produce one final package and deal status';
  end if;
end $$;

select set_config('request.jwt.claim.sub', '', true), set_config('request.jwt.claims', '{}', true);
do $$ begin
  begin
    perform public.set_vendor_final_package('f0000000-0000-4000-8000-000000000001', 'f1000000-0000-4000-8000-000000000002');
    raise exception 'A missing user identity must fail';
  exception when sqlstate '42501' then null;
  end;
end $$;

rollback;
