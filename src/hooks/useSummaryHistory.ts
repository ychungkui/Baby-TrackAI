import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface BedtimeSummary {
  id: string;
  baby_id: string;
  summary_date: string;
  summary_text: string;
  created_at: string;
}

export function useSummaryHistory(babyId: string | undefined) {
  const [summaries, setSummaries] = useState<BedtimeSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSummaries = useCallback(async () => {
    if (!babyId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bedtime_summaries' as any)
        .select('*')
        .eq('baby_id', babyId)
        .order('summary_date', { ascending: false });

      if (error) throw error;
      setSummaries((data as any[]) || []);
    } catch (err) {
      console.error('Error fetching summaries:', err);
    } finally {
      setLoading(false);
    }
  }, [babyId]);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const getSummaryForDate = useCallback(
    (date: Date): BedtimeSummary | undefined => {
      const dateStr = format(date, 'yyyy-MM-dd');
      return summaries.find((s) => s.summary_date === dateStr);
    },
    [summaries]
  );

  const datesWithSummaries = summaries.map((s) => new Date(s.summary_date + 'T00:00:00'));

  return {
    summaries,
    loading,
    refetch: fetchSummaries,
    getSummaryForDate,
    datesWithSummaries,
  };
}
