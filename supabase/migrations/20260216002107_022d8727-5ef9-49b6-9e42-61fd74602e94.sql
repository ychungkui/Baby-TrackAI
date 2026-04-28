ALTER TABLE public.profiles
ADD COLUMN free_bedtime_used integer NOT NULL DEFAULT 0,
ADD COLUMN free_chat_used integer NOT NULL DEFAULT 0;