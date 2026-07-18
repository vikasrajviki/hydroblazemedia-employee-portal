ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS checklist_total integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS checklist_done integer NOT NULL DEFAULT 0;

ALTER TABLE public.documents
  ALTER COLUMN storage_path DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS client text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS google_drive_file_id text,
  ADD COLUMN IF NOT EXISTS google_drive_url text,
  ADD COLUMN IF NOT EXISTS google_drive_download_url text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'General';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
    CREATE TYPE public.notification_type AS ENUM (
      'task_assigned',
      'task_updated',
      'review_requested',
      'comment_added',
      'document_uploaded',
      'announcement_posted',
      'deadline_tomorrow'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.task_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_checklist_items TO authenticated;
GRANT ALL ON public.task_checklist_items TO service_role;
ALTER TABLE public.task_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type public.notification_type NOT NULL,
  title text NOT NULL,
  body text,
  entity_type text,
  entity_id uuid,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.announcement_read_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (announcement_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcement_read_receipts TO authenticated;
GRANT ALL ON public.announcement_read_receipts TO service_role;
ALTER TABLE public.announcement_read_receipts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.integration_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_settings TO authenticated;
GRANT ALL ON public.integration_settings TO service_role;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS task_checklist_items_updated ON public.task_checklist_items;
CREATE TRIGGER task_checklist_items_updated
BEFORE UPDATE ON public.task_checklist_items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS documents_updated ON public.documents;
CREATE TRIGGER documents_updated
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS integration_settings_updated ON public.integration_settings;
CREATE TRIGGER integration_settings_updated
BEFORE UPDATE ON public.integration_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP POLICY IF EXISTS "checklist select" ON public.task_checklist_items;
CREATE POLICY "checklist select" ON public.task_checklist_items FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_checklist_items.task_id
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR t.assignee_id = auth.uid() OR t.created_by = auth.uid())
));
DROP POLICY IF EXISTS "checklist insert" ON public.task_checklist_items;
CREATE POLICY "checklist insert" ON public.task_checklist_items FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_checklist_items.task_id
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR t.assignee_id = auth.uid() OR t.created_by = auth.uid())
));
DROP POLICY IF EXISTS "checklist update" ON public.task_checklist_items;
CREATE POLICY "checklist update" ON public.task_checklist_items FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_checklist_items.task_id
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR t.assignee_id = auth.uid() OR t.created_by = auth.uid())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_checklist_items.task_id
    AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR t.assignee_id = auth.uid() OR t.created_by = auth.uid())
));
DROP POLICY IF EXISTS "checklist delete" ON public.task_checklist_items;
CREATE POLICY "checklist delete" ON public.task_checklist_items FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR created_by = auth.uid());

DROP POLICY IF EXISTS "notifications own select" ON public.notifications;
CREATE POLICY "notifications own select" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications own update" ON public.notifications;
CREATE POLICY "notifications own update" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications manager insert" ON public.notifications;
CREATE POLICY "notifications manager insert" ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager') OR user_id = auth.uid());
DROP POLICY IF EXISTS "notifications admin delete" ON public.notifications;
CREATE POLICY "notifications admin delete" ON public.notifications FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "announcement receipts select" ON public.announcement_read_receipts;
CREATE POLICY "announcement receipts select" ON public.announcement_read_receipts FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
DROP POLICY IF EXISTS "announcement receipts insert" ON public.announcement_read_receipts;
CREATE POLICY "announcement receipts insert" ON public.announcement_read_receipts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "announcement receipts update" ON public.announcement_read_receipts;
CREATE POLICY "announcement receipts update" ON public.announcement_read_receipts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "integration settings admin read" ON public.integration_settings;
CREATE POLICY "integration settings admin read" ON public.integration_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "integration settings admin write" ON public.integration_settings;
CREATE POLICY "integration settings admin write" ON public.integration_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.invites (email, role, invited_by)
SELECT 'vikasvicky3104@gmail.com', 'admin'::public.app_role, id
FROM auth.users
WHERE lower(email)=lower('vikasvicky3104@gmail.com');