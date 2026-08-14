ALTER TABLE public.activation_codes
  ADD COLUMN IF NOT EXISTS owner_user_id uuid,
  ADD COLUMN IF NOT EXISTS owner_email text;

CREATE UNIQUE INDEX IF NOT EXISTS activation_codes_one_trial_per_user
  ON public.activation_codes (owner_user_id)
  WHERE plan = 'trial' AND owner_user_id IS NOT NULL;