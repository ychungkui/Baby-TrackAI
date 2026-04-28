
-- 1. Create deleted_accounts table for anti-abuse tracking
CREATE TABLE public.deleted_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash text NOT NULL UNIQUE,
  deleted_at timestamptz NOT NULL DEFAULT now()
);

-- No RLS - only accessed by service_role in edge functions
ALTER TABLE public.deleted_accounts ENABLE ROW LEVEL SECURITY;
-- No policies = no public access, only service_role can operate

-- 2. Update handle_new_user trigger to check deleted_accounts
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _email_hash text;
  _was_deleted boolean;
BEGIN
  -- Compute SHA-256 hash of lowercase email
  _email_hash := encode(digest(lower(NEW.email), 'sha256'), 'hex');
  
  -- Check if this email was previously deleted
  SELECT EXISTS (
    SELECT 1 FROM public.deleted_accounts WHERE email_hash = _email_hash
  ) INTO _was_deleted;
  
  -- Insert profile with appropriate free usage
  IF _was_deleted THEN
    INSERT INTO public.profiles (user_id, email, free_bedtime_used, free_chat_used)
    VALUES (NEW.id, NEW.email, 3, 3);
  ELSE
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
  END IF;
  
  RETURN NEW;
END;
$$;
