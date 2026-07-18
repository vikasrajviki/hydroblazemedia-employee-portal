
CREATE POLICY "docs read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'documents');
CREATE POLICY "docs admin insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "docs admin update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "docs admin delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND public.has_role(auth.uid(), 'admin'));
