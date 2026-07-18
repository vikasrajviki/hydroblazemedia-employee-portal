
-- Add 'manager' role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';

-- Announcements: pinned + scheduled
ALTER TABLE public.announcements
  ADD COLUMN IF NOT EXISTS pinned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ;

-- Only show announcements whose scheduled_for is null or past
DROP POLICY IF EXISTS "announcements select" ON public.announcements;
CREATE POLICY "announcements select" ON public.announcements
  FOR SELECT TO authenticated
  USING (scheduled_for IS NULL OR scheduled_for <= now() OR public.has_role(auth.uid(), 'admin'));

-- Documents: folder + version chain
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS folder TEXT NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS documents_parent_idx ON public.documents(parent_id);
CREATE INDEX IF NOT EXISTS documents_folder_idx ON public.documents(folder);

-- Task attachments
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_attachments TO authenticated;
GRANT ALL ON public.task_attachments TO service_role;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attachments select" ON public.task_attachments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND
    (public.has_role(auth.uid(),'admin') OR t.assignee_id = auth.uid() OR t.created_by = auth.uid())));
CREATE POLICY "attachments insert" ON public.task_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND
    (public.has_role(auth.uid(),'admin') OR t.assignee_id = auth.uid() OR t.created_by = auth.uid())));
CREATE POLICY "attachments delete" ON public.task_attachments FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Task comments
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.task_comments TO authenticated;
GRANT ALL ON public.task_comments TO service_role;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments select" ON public.task_comments FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND
    (public.has_role(auth.uid(),'admin') OR t.assignee_id = auth.uid() OR t.created_by = auth.uid())));
CREATE POLICY "comments insert" ON public.task_comments FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM public.tasks t WHERE t.id = task_id AND
    (public.has_role(auth.uid(),'admin') OR t.assignee_id = auth.uid() OR t.created_by = auth.uid())));
CREATE POLICY "comments delete" ON public.task_comments FOR DELETE TO authenticated
  USING (author_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Storage policy so task-owners can read/write attachments in the documents bucket under task-attachments/
-- (uses existing 'documents' bucket)
DO $$ BEGIN
  CREATE POLICY "task attachments read" ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'task-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "task attachments write" ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'task-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "task attachments delete" ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = 'task-attachments');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Bootstrap admin invite for the requested email
INSERT INTO public.invites (email, role) VALUES ('vikasvicky3105@gmail.com', 'admin')
ON CONFLICT DO NOTHING;
