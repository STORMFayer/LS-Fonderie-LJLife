-- The employee dashboard leaderboard shows every employee's production and pay
-- (matches the original app's behaviour: full transparency within the team).
-- Replace the "own row only" policy with team-wide read access for authenticated users.
drop policy if exists "employees can read their own profile" on public.employees;
drop policy if exists "admins can read all employee profiles" on public.employees;

create policy "authenticated employees can read all profiles"
  on public.employees for select
  to authenticated
  using (true);
