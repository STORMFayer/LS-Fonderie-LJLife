-- Supabase rejects bare DELETE/UPDATE with no WHERE clause ("DELETE requires a WHERE
-- clause") as a safety guard. reset_week() intentionally wipes every row in these
-- tables, so add an explicit "where true" to satisfy that check.
create or replace function public.reset_week()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'AUTH_ERROR: admin requis';
  end if;

  delete from public.submissions where true;
  update public.employees set total_minerais = 0, total_paid = 0 where true;
  delete from public.orders where true;

  insert into public.journal (category, action, details, utilisateur)
  values ('reset', 'Reset de la semaine', 'Minerais, paiements et commandes remis à zéro', 'Admin');
end;
$$;
