-- =============================================
-- Baby TrackAI 資料庫 Schema
-- Phase 1: 核心資料表
-- =============================================

-- 1. profiles 表（用戶資料）
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  language TEXT NOT NULL DEFAULT 'zh-TW',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. babies 表（寶寶資料）
CREATE TABLE public.babies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  gender TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. records 表（行為紀錄）
CREATE TABLE public.records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id UUID NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('sleep', 'feeding', 'night_wake', 'diaper')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  notes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- 啟用 RLS
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.babies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS 政策：profiles
-- =============================================
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS 政策：babies
-- =============================================
CREATE POLICY "Users can view their own babies"
  ON public.babies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own babies"
  ON public.babies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own babies"
  ON public.babies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own babies"
  ON public.babies FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS 政策：records（透過 baby_id 關聯到 user_id）
-- =============================================
CREATE POLICY "Users can view records of their babies"
  ON public.records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.babies
      WHERE babies.id = records.baby_id
      AND babies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create records for their babies"
  ON public.records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.babies
      WHERE babies.id = records.baby_id
      AND babies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update records of their babies"
  ON public.records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.babies
      WHERE babies.id = records.baby_id
      AND babies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete records of their babies"
  ON public.records FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.babies
      WHERE babies.id = records.baby_id
      AND babies.user_id = auth.uid()
    )
  );

-- =============================================
-- 自動更新 updated_at 欄位的函數和觸發器
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_babies_updated_at
  BEFORE UPDATE ON public.babies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_records_updated_at
  BEFORE UPDATE ON public.records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 索引（提升查詢效能）
-- =============================================
CREATE INDEX idx_babies_user_id ON public.babies(user_id);
CREATE INDEX idx_records_baby_id ON public.records(baby_id);
CREATE INDEX idx_records_type ON public.records(type);
CREATE INDEX idx_records_start_time ON public.records(start_time);

-- =============================================
-- 註冊時自動建立 profile 的觸發器
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();