-- Admin: permanently delete an order, but only once it has been cancelled.
create or replace function public.delete_order(p_numero text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if not public.is_admin() then
    raise exception 'AUTH_ERROR: admin requis';
  end if;

  select * into v_order from public.orders where numero = p_numero;
  if not found then
    raise exception 'commande introuvable';
  end if;
  if v_order.statut <> 'annulee' then
    raise exception 'seules les commandes annulées peuvent être supprimées';
  end if;

  delete from public.orders where numero = p_numero;
end;
$$;

grant execute on function public.delete_order(text) to authenticated;
