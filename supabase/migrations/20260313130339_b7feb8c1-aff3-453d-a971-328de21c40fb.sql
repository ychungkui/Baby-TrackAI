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
  _email_hash := encode(extensions.digest(lower(NEW.email), 'sha256'), 'hex');
  
  SELECT EXISTS (
    SELECT 1 FROM public.deleted_accounts WHERE email_hash = _email_hash
  ) INTO _was_deleted;
  
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