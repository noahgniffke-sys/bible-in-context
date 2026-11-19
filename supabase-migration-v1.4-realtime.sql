-- Bible in Context 1.4 — live follow sync
-- Run once in the Supabase SQL editor.
-- Safe to re-run.

alter table public.follows replica identity full;
alter table public.profiles replica identity full;

do $$
begin
  begin
    alter publication supabase_realtime add table public.follows;
  exception
    when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.profiles;
  exception
    when duplicate_object then null;
  end;
end $$;
