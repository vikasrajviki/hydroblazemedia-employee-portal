
-- Tasks: managers can insert
DROP POLICY IF EXISTS "tasks admin insert" ON public.tasks;
CREATE POLICY "tasks manager insert" ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- Announcements
DROP POLICY IF EXISTS "announcements admin write" ON public.announcements;
DROP POLICY IF EXISTS "announcements admin update" ON public.announcements;
CREATE POLICY "announcements manager write" ON public.announcements FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "announcements manager update" ON public.announcements FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));

-- Documents
DROP POLICY IF EXISTS "documents admin insert" ON public.documents;
DROP POLICY IF EXISTS "documents admin update" ON public.documents;
CREATE POLICY "documents manager insert" ON public.documents FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
CREATE POLICY "documents manager update" ON public.documents FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'manager'));
