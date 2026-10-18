-- Apply through Supabase migrations before enabling final-package selection.
-- The parent lock serializes selections for one vendor; any error rolls back all changes.
begin;

create or replace function public.set_vendor_final_package(
  p_vendor_id uuid,
  p_package_id uuid
)
returns public.vendor_packages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_vendor public.vendors%rowtype;
  v_package public.vendor_packages%rowtype;
begin
  if v_user_id is null or not exists (
    select 1 from public.profiles as profile
    where profile.id = v_user_id and profile.status = 'active'
  ) then
    raise exception 'An active authenticated account is required' using errcode = '42501';
  end if;

  select vendor.* into v_vendor
  from public.vendors as vendor
  where vendor.id = p_vendor_id and vendor.user_id = v_user_id
  for update;
  if not found then
    raise exception 'Vendor not found' using errcode = 'P0002';
  end if;
  if v_vendor.status = 'batal' then
    raise exception 'Cancelled vendors cannot select a final package' using errcode = '22023';
  end if;

  select package.* into v_package
  from public.vendor_packages as package
  where package.id = p_package_id
    and package.vendor_id = p_vendor_id
    and package.user_id = v_user_id
  for update;
  if not found then
    raise exception 'Package not found for vendor' using errcode = 'P0002';
  end if;

  update public.vendor_packages
  set is_final = false
  where vendor_id = p_vendor_id and user_id = v_user_id and is_final = true;

  update public.vendor_packages
  set is_final = true
  where id = p_package_id and vendor_id = p_vendor_id and user_id = v_user_id
  returning * into v_package;

  update public.vendors
  set status = 'deal'
  where id = p_vendor_id and user_id = v_user_id;

  return v_package;
end;
$$;

-- SECURITY DEFINER intentionally bypasses table RLS only after the explicit
-- account, ownership, and parent checks above. Anonymous callers cannot execute it.
revoke all on function public.set_vendor_final_package(uuid, uuid) from public, anon, authenticated;
grant execute on function public.set_vendor_final_package(uuid, uuid) to authenticated;

commit;
