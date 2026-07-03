-- Extend employee profiles with the RP business fields (discord identity, ore quota, pay tracking).
alter table public.employees
  add column discord text unique,
  add column total_minerais numeric(10, 2) not null default 0,
  add column total_paid numeric(10, 2) not null default 0;

-- Allow discord/role to be seeded from auth user metadata on creation.
create or replace function public.handle_new_employee()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.employees (id, full_name, discord, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.raw_user_meta_data ->> 'discord',
    coalesce(new.raw_user_meta_data ->> 'role', 'employe')
  );
  return new;
end;
$$;

-- Security-definer helper so RLS policies can check role without recursive lookups.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.employees where id = auth.uid() and role = 'admin'
  );
$$;

create policy "admins can read all employee profiles"
  on public.employees for select
  to authenticated
  using (public.is_admin());

-- Price catalogue (mineral payout rate + legal/black market products). Publicly readable.
create table public.prices (
  key text primary key,
  type text not null check (type in ('mineral', 'legal', 'black')),
  label text not null,
  price numeric(10, 2) not null
);

alter table public.prices enable row level security;

create policy "anyone can read prices"
  on public.prices for select
  using (true);

insert into public.prices (key, type, label, price) values
  ('mineral', 'mineral', 'Minerai raffiné', 60),
  ('lingot', 'legal', 'Lingot de fer', 130),
  ('plaque_fer', 'black', 'Plaque de fer', 2500),
  ('plaque_ceram', 'black', 'Plaque en céramique', 750),
  ('ressort', 'black', 'Ressort', 250);

-- Replace the placeholder demo orders table with the full order lifecycle model.
drop table if exists public.orders cascade;

create table public.orders (
  id bigint generated always as identity primary key,
  numero text unique not null,
  nom text not null,
  contact text not null default '',
  items jsonb not null default '[]',
  total numeric(10, 2) not null default 0,
  type text not null check (type in ('legal', 'black')),
  statut text not null default 'en_attente' check (statut in ('en_attente', 'en_cours', 'livree', 'annulee')),
  message text not null default '',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "admins can read all orders"
  on public.orders for select
  to authenticated
  using (public.is_admin());

-- Ore submission log, feeds employees.total_minerais.
create table public.submissions (
  id bigint generated always as identity primary key,
  employee_id uuid not null references public.employees (id) on delete cascade,
  minerais numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "employees can read their own submissions"
  on public.submissions for select
  to authenticated
  using (employee_id = auth.uid());

create policy "admins can read all submissions"
  on public.submissions for select
  to authenticated
  using (public.is_admin());

-- Immutable activity log (orders, payments, avances, alertes, resets).
create table public.journal (
  id bigint generated always as identity primary key,
  category text not null check (category in ('commande', 'paiement', 'alerte', 'avance', 'reset')),
  action text not null,
  details text not null default '',
  utilisateur text not null default '',
  created_at timestamptz not null default now()
);

alter table public.journal enable row level security;

create policy "admins can read journal"
  on public.journal for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- RPC functions: every mutation goes through one of these (mirrors the old
-- Code.gs API surface). Tables stay locked down via RLS; these run as
-- SECURITY DEFINER and enforce their own auth/role checks.
-- ---------------------------------------------------------------------------

-- Public: place an order (legal or black market catalogue).
create or replace function public.place_order(
  p_nom text, p_contact text, p_items jsonb, p_type text, p_message text default ''
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_numero text;
  v_total numeric := 0;
  v_item jsonb;
begin
  if p_type not in ('legal', 'black') then
    raise exception 'type de commande invalide';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_total := v_total + (coalesce((v_item ->> 'price')::numeric, 0) * coalesce((v_item ->> 'qty')::numeric, 0));
  end loop;

  v_numero := 'CMD-' || to_char((extract(epoch from clock_timestamp())::bigint % 1000000), 'FM000000');

  insert into public.orders (numero, nom, contact, items, total, type, message)
  values (v_numero, p_nom, p_contact, p_items, v_total, p_type, coalesce(p_message, ''));

  insert into public.journal (category, action, details, utilisateur)
  values ('commande', 'Nouvelle commande', v_numero || ' — ' || p_nom || ' — ' || v_total || '$', p_nom);

  return v_numero;
end;
$$;

grant execute on function public.place_order(text, text, jsonb, text, text) to anon, authenticated;

-- Public: track an order by its number.
create or replace function public.get_order_status(p_numero text)
returns table (numero text, statut text, items jsonb, total numeric, type text)
language sql
security definer
stable
set search_path = public
as $$
  select numero, statut, items, total, type from public.orders where numero = p_numero;
$$;

grant execute on function public.get_order_status(text) to anon, authenticated;

-- Employee: submit refined ore.
create or replace function public.add_submission(p_minerais numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'AUTH_ERROR: non authentifié';
  end if;
  if p_minerais <= 0 then
    raise exception 'quantité invalide';
  end if;

  insert into public.submissions (employee_id, minerais) values (auth.uid(), p_minerais);

  update public.employees set total_minerais = total_minerais + p_minerais where id = auth.uid();
end;
$$;

grant execute on function public.add_submission(numeric) to authenticated;

-- Employee: request a salary advance (logged only, admin processes it manually).
create or replace function public.request_avance(p_montant numeric, p_message text default '')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_ERROR: non authentifié';
  end if;
  if p_montant <= 0 or p_montant > 20000 then
    raise exception 'montant invalide (max 20000$)';
  end if;

  select full_name into v_name from public.employees where id = auth.uid();

  insert into public.journal (category, action, details, utilisateur)
  values (
    'avance',
    'Demande d''avance sur salaire',
    v_name || ' — ' || p_montant || '$' || case when coalesce(p_message, '') <> '' then ' — "' || p_message || '"' else '' end,
    v_name
  );
end;
$$;

grant execute on function public.request_avance(numeric, text) to authenticated;

-- Employee: report a stock shortage.
create or replace function public.report_alerte(p_details text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  if auth.uid() is null then
    raise exception 'AUTH_ERROR: non authentifié';
  end if;

  select full_name into v_name from public.employees where id = auth.uid();

  insert into public.journal (category, action, details, utilisateur)
  values ('alerte', 'Alerte stock manquant', p_details, v_name);
end;
$$;

grant execute on function public.report_alerte(text) to authenticated;

-- Admin: edit an employee's discord handle / role.
create or replace function public.update_employee(p_id uuid, p_discord text, p_role text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'AUTH_ERROR: admin requis';
  end if;
  if p_role not in ('admin', 'employe') then
    raise exception 'role invalide';
  end if;

  update public.employees set discord = p_discord, role = p_role where id = p_id;
end;
$$;

grant execute on function public.update_employee(uuid, text, text) to authenticated;

-- Admin: change an order's status. Delivered orders are journaled then removed (matches legacy behaviour).
create or replace function public.update_order_status(p_numero text, p_statut text)
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
  if p_statut not in ('en_attente', 'en_cours', 'livree', 'annulee') then
    raise exception 'statut invalide';
  end if;

  select * into v_order from public.orders where numero = p_numero;
  if not found then
    raise exception 'commande introuvable';
  end if;

  if p_statut = 'livree' then
    insert into public.journal (category, action, details, utilisateur)
    values ('commande', 'Commande livrée', v_order.numero || ' — ' || v_order.nom || ' — ' || v_order.total || '$', 'Admin');
    delete from public.orders where numero = p_numero;
  else
    update public.orders set statut = p_statut where numero = p_numero;
  end if;
end;
$$;

grant execute on function public.update_order_status(text, text) to authenticated;

-- Admin: pay an employee (partial or full).
create or replace function public.add_payment(p_employee_id uuid, p_amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  if not public.is_admin() then
    raise exception 'AUTH_ERROR: admin requis';
  end if;
  if p_amount <= 0 then
    raise exception 'montant invalide';
  end if;

  update public.employees set total_paid = total_paid + p_amount where id = p_employee_id
  returning full_name into v_name;

  insert into public.journal (category, action, details, utilisateur)
  values ('paiement', 'Versement de salaire', coalesce(v_name, '') || ' — ' || p_amount || '$', 'Admin');
end;
$$;

grant execute on function public.add_payment(uuid, numeric) to authenticated;

-- Admin: reset what has been paid to an employee.
create or replace function public.reset_payment(p_employee_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  if not public.is_admin() then
    raise exception 'AUTH_ERROR: admin requis';
  end if;

  update public.employees set total_paid = 0 where id = p_employee_id
  returning full_name into v_name;

  insert into public.journal (category, action, details, utilisateur)
  values ('reset', 'Reset paiement employé', coalesce(v_name, ''), 'Admin');
end;
$$;

grant execute on function public.reset_payment(uuid) to authenticated;

-- Admin: edit the price catalogue.
create or replace function public.save_price(p_key text, p_type text, p_label text, p_price numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'AUTH_ERROR: admin requis';
  end if;

  insert into public.prices (key, type, label, price)
  values (p_key, p_type, p_label, p_price)
  on conflict (key) do update set type = excluded.type, label = excluded.label, price = excluded.price;
end;
$$;

grant execute on function public.save_price(text, text, text, numeric) to authenticated;

-- Admin: clear alertes or avances from the journal.
create or replace function public.clear_journal_category(p_category text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'AUTH_ERROR: admin requis';
  end if;
  if p_category not in ('alerte', 'avance') then
    raise exception 'categorie invalide';
  end if;

  delete from public.journal where category = p_category;
end;
$$;

grant execute on function public.clear_journal_category(text) to authenticated;

-- Admin: weekly reset (ore, pay, orders).
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

  delete from public.submissions;
  update public.employees set total_minerais = 0, total_paid = 0;
  delete from public.orders;

  insert into public.journal (category, action, details, utilisateur)
  values ('reset', 'Reset de la semaine', 'Minerais, paiements et commandes remis à zéro', 'Admin');
end;
$$;

grant execute on function public.reset_week() to authenticated;

-- Public: resolve a Discord handle to its login email (login form uses Discord ID, not email).
create or replace function public.get_login_email(p_discord text)
returns text
language sql
security definer
stable
set search_path = public, auth
as $$
  select u.email
  from public.employees e
  join auth.users u on u.id = e.id
  where lower(e.discord) = lower(p_discord)
  limit 1;
$$;

grant execute on function public.get_login_email(text) to anon;
