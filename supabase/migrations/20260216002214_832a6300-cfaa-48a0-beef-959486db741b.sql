CREATE OR REPLACE FUNCTION public.increment_usage(column_name text, user_uid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF column_name = 'free_bedtime_used' THEN
    UPDATE profiles SET free_bedtime_used = free_bedtime_used + 1 WHERE user_id = user_uid;
  ELSIF column_name = 'free_chat_used' THEN
    UPDATE profiles SET free_chat_used = free_chat_used + 1 WHERE user_id = user_uid;
  END IF;
END;
$$;