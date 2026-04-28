
-- Create growth_photos table
CREATE TABLE public.growth_photos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  baby_id uuid NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  taken_at date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.growth_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies (same pattern as records table)
CREATE POLICY "Users can view their baby growth photos"
ON public.growth_photos FOR SELECT
USING (EXISTS (SELECT 1 FROM babies WHERE babies.id = growth_photos.baby_id AND babies.user_id = auth.uid()));

CREATE POLICY "Users can insert growth photos for their babies"
ON public.growth_photos FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM babies WHERE babies.id = growth_photos.baby_id AND babies.user_id = auth.uid()));

CREATE POLICY "Users can update their baby growth photos"
ON public.growth_photos FOR UPDATE
USING (EXISTS (SELECT 1 FROM babies WHERE babies.id = growth_photos.baby_id AND babies.user_id = auth.uid()));

CREATE POLICY "Users can delete their baby growth photos"
ON public.growth_photos FOR DELETE
USING (EXISTS (SELECT 1 FROM babies WHERE babies.id = growth_photos.baby_id AND babies.user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_growth_photos_updated_at
BEFORE UPDATE ON public.growth_photos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('growth-photos', 'growth-photos', true);

-- Storage RLS policies
CREATE POLICY "Authenticated users can upload growth photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'growth-photos');

CREATE POLICY "Anyone can view growth photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'growth-photos');

CREATE POLICY "Users can delete their own growth photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'growth-photos');
