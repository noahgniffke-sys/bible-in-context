-- Bible in Context — every account follows @noahgniffke
-- Run once in the Supabase SQL editor (project "The Brain/bible in context").
-- Safe to re-run.
--
-- Covers every profile that already exists, and every profile created later.
-- A follow needs a profile row, and the app creates that row on first sign-in,
-- so the trigger is the moment a new account can follow anyone.
-- @noahgniffke does not follow himself.
-- Follow counts stay on the existing follows trigger. Do not bump them here.
-- Unfollow still works. Running this script again puts those follows back.

create or replace function public.auto_follow_noahgniffke()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id uuid;
begin
  select id into target_id
  from public.profiles
  where username = 'noahgniffke';

  -- Missing account, or this insert is @noahgniffke: leave the new profile alone.
  -- A self-follow would fail the follows check and roll back signup.
  if target_id is null or target_id = new.id then
    return new;
  end if;

  insert into public.follows (follower_id, following_id)
  values (new.id, target_id)
  on conflict (follower_id, following_id) do nothing;

  return new;
end;
$$;

drop trigger if exists auto_follow_noahgniffke on public.profiles;

create trigger auto_follow_noahgniffke
  after insert on public.profiles
  for each row
  execute function public.auto_follow_noahgniffke();

do $$
declare
  target_id uuid;
  added integer;
begin
  select id into target_id
  from public.profiles
  where username = 'noahgniffke';

  if target_id is null then
    raise exception 'No profile with username noahgniffke';
  end if;

  insert into public.follows (follower_id, following_id)
  select p.id, target_id
  from public.profiles p
  where p.id <> target_id
  on conflict (follower_id, following_id) do nothing;

  get diagnostics added = row_count;
  raise notice 'New follows of @noahgniffke: %', added;
end;
$$;
