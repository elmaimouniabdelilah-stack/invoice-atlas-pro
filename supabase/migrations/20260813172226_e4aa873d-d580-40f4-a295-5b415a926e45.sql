CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- activation_codes
DROP POLICY IF EXISTS "Admins can manage activation_codes" ON public.activation_codes;
DROP POLICY IF EXISTS "Anyone can read active codes" ON public.activation_codes;
DROP POLICY IF EXISTS "codes admin write" ON public.activation_codes;
DROP POLICY IF EXISTS "codes readable" ON public.activation_codes;

REVOKE ALL ON public.activation_codes FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.activation_codes TO authenticated;
GRANT ALL ON public.activation_codes TO service_role;
ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "codes admin manage" ON public.activation_codes
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "codes moderator read" ON public.activation_codes
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'moderator'));

-- device_activations
DROP POLICY IF EXISTS "Admins can manage device_activations" ON public.device_activations;
DROP POLICY IF EXISTS "Anyone can insert activations" ON public.device_activations;
DROP POLICY IF EXISTS "Anyone can read own activations" ON public.device_activations;
DROP POLICY IF EXISTS "activations admin delete" ON public.device_activations;
DROP POLICY IF EXISTS "activations insert" ON public.device_activations;
DROP POLICY IF EXISTS "activations readable" ON public.device_activations;

REVOKE ALL ON public.device_activations FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_activations TO authenticated;
GRANT ALL ON public.device_activations TO service_role;
ALTER TABLE public.device_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activations admin manage" ON public.device_activations
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "activations moderator read" ON public.device_activations
  FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'moderator'));

-- user_roles
DROP POLICY IF EXISTS "read roles" ON public.user_roles;
DROP POLICY IF EXISTS "super admin manage roles" ON public.user_roles;

CREATE POLICY "read roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin') OR private.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "super admin manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (private.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);