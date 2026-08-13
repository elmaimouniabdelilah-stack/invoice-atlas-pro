DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_plan') THEN
    CREATE TYPE public.subscription_plan AS ENUM ('trial', 'monthly', 'yearly', 'lifetime');
  END IF;
END $$;

ALTER TABLE public.activation_codes
  ADD COLUMN IF NOT EXISTS plan public.subscription_plan NOT NULL DEFAULT 'monthly';

UPDATE public.activation_codes
SET plan = 'trial'
WHERE expires_at IS NOT NULL
  AND expires_at < created_at + interval '15 days';