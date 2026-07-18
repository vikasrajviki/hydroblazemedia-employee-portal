
CREATE OR REPLACE FUNCTION public.get_invite_by_token(_token TEXT)
RETURNS TABLE(email TEXT, role public.app_role, accepted_at TIMESTAMPTZ)
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT email, role, accepted_at FROM public.invites WHERE token = _token LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_invite_by_token(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(TEXT) TO anon, authenticated;
