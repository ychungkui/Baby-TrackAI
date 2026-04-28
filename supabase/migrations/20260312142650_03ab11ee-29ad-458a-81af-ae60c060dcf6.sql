
-- Fix storage policies for growth-photos bucket

-- DROP existing policies
DROP POLICY IF EXISTS "Users can delete their own growth photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload growth photos" ON storage.objects;

-- Recreate with owner check (files stored as {babyId}/filename)
CREATE POLICY "Users can delete their own growth photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'growth-photos'
    AND EXISTS (
      SELECT 1 FROM public.babies
      WHERE babies.id::text = (storage.foldername(name))[1]
      AND babies.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can upload growth photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'growth-photos'
    AND EXISTS (
      SELECT 1 FROM public.babies
      WHERE babies.id::text = (storage.foldername(name))[1]
      AND babies.user_id = auth.uid()
    )
  );

-- Fix storage policies for baby-avatars bucket

DROP POLICY IF EXISTS "Users can delete baby avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update baby avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload baby avatars" ON storage.objects;

CREATE POLICY "Users can delete baby avatars"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'baby-avatars'
    AND EXISTS (
      SELECT 1 FROM public.babies
      WHERE babies.id::text = (storage.foldername(name))[1]
      AND babies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update baby avatars"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'baby-avatars'
    AND EXISTS (
      SELECT 1 FROM public.babies
      WHERE babies.id::text = (storage.foldername(name))[1]
      AND babies.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can upload baby avatars"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'baby-avatars'
    AND EXISTS (
      SELECT 1 FROM public.babies
      WHERE babies.id::text = (storage.foldername(name))[1]
      AND babies.user_id = auth.uid()
    )
  );
