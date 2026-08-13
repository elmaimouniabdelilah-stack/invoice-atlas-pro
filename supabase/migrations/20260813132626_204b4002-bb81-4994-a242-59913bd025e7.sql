
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.activation_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  max_devices integer NOT NULL DEFAULT 1,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.device_activations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id uuid NOT NULL REFERENCES public.activation_codes(id) ON DELETE CASCADE,
  device_fingerprint text NOT NULL,
  activated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.activation_codes TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.activation_codes TO authenticated;
GRANT ALL ON public.activation_codes TO service_role;

GRANT SELECT, INSERT ON public.device_activations TO anon, authenticated;
GRANT DELETE ON public.device_activations TO authenticated;
GRANT ALL ON public.device_activations TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.activation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

DROP POLICY IF EXISTS "codes readable" ON public.activation_codes;
CREATE POLICY "codes readable" ON public.activation_codes FOR SELECT USING (true);
DROP POLICY IF EXISTS "codes admin write" ON public.activation_codes;
CREATE POLICY "codes admin write" ON public.activation_codes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "activations readable" ON public.device_activations;
CREATE POLICY "activations readable" ON public.device_activations FOR SELECT USING (true);
DROP POLICY IF EXISTS "activations insert" ON public.device_activations;
CREATE POLICY "activations insert" ON public.device_activations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "activations admin delete" ON public.device_activations;
CREATE POLICY "activations admin delete" ON public.device_activations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

DROP POLICY IF EXISTS "own roles" ON public.user_roles;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
