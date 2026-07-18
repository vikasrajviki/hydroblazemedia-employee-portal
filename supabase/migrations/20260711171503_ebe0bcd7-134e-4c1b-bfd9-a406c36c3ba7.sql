GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO anon;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invite_by_token(text) TO service_role;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  invited_role public.app_role;
  no_admin_exists BOOLEAN;
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();

  SELECT NOT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  ) INTO no_admin_exists;

  SELECT role INTO invited_role
  FROM public.invites
  WHERE lower(email) = lower(NEW.email) AND accepted_at IS NULL
  ORDER BY created_at DESC LIMIT 1;

  IF invited_role IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, invited_role)
    ON CONFLICT DO NOTHING;
    UPDATE public.invites SET accepted_at = now(), accepted_by = NEW.id
    WHERE lower(email) = lower(NEW.email) AND accepted_at IS NULL;
  ELSIF no_admin_exists THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$function$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = lower('vikasvicky3104@gmail.com')
ON CONFLICT DO NOTHING;

UPDATE public.profiles
SET full_name = COALESCE(NULLIF(full_name, ''), 'Vikas K S'),
    job_title = 'Founder',
    department = COALESCE(department, 'Operations'),
    updated_at = now()
WHERE lower(email) = lower('vikasvicky3104@gmail.com');