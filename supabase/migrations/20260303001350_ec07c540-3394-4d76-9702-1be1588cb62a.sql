CREATE TABLE public.bedtime_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  baby_id uuid NOT NULL REFERENCES public.babies(id) ON DELETE CASCADE,
  summary_date date NOT NULL,
  summary_text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_bedtime_summaries_baby_date ON public.bedtime_summaries (baby_id, summary_date);

ALTER TABLE public.bedtime_summaries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their baby summaries" ON public.bedtime_summaries
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = bedtime_summaries.baby_id AND babies.user_id = auth.uid()));

CREATE POLICY "Users can insert their baby summaries" ON public.bedtime_summaries
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = bedtime_summaries.baby_id AND babies.user_id = auth.uid()));

CREATE POLICY "Users can update their baby summaries" ON public.bedtime_summaries
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.babies WHERE babies.id = bedtime_summaries.baby_id AND babies.user_id = auth.uid()));