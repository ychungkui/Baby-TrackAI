
-- Add avatar_url column to babies table
ALTER TABLE public.babies ADD COLUMN avatar_url text DEFAULT NULL;

-- Create baby-avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('baby-avatars', 'baby-avatars', true);

-- RLS policies for baby-avatars bucket
CREATE POLICY "Users can upload baby avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'baby-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update baby avatars" ON storage.objects FOR UPDATE USING (bucket_id = 'baby-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Users can delete baby avatars" ON storage.objects FOR DELETE USING (bucket_id = 'baby-avatars' AND auth.role() = 'authenticated');
CREATE POLICY "Anyone can view baby avatars" ON storage.objects FOR SELECT USING (bucket_id = 'baby-avatars');
