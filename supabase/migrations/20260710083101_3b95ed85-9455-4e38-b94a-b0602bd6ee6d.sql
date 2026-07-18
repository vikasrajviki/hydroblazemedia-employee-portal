
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS job_title text,
  ADD COLUMN IF NOT EXISTS department text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'public.profiles'::regclass AND polname = 'profiles_self_update') THEN
    EXECUTE 'CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)';
  END IF;
END$$;

CREATE TABLE IF NOT EXISTS public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_name text,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  summary text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.activity_log TO authenticated;
GRANT ALL ON public.activity_log TO service_role;

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'public.activity_log'::regclass AND polname = 'activity_read') THEN
    EXECUTE 'CREATE POLICY activity_read ON public.activity_log FOR SELECT TO authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polrelid = 'public.activity_log'::regclass AND polname = 'activity_insert_self') THEN
    EXECUTE 'CREATE POLICY activity_insert_self ON public.activity_log FOR INSERT TO authenticated WITH CHECK (actor_id = auth.uid())';
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS activity_log_created_at_idx ON public.activity_log (created_at DESC);
