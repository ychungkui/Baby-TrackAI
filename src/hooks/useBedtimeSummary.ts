import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BedtimeSummaryResult {
  summary: string;
  hasRecords: boolean;
  recordCount?: number;
  error?: string;
}

export function useBedtimeSummary() {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSummary = useCallback(async (babyId: string, babyName: string, dayStart?: string, dayEnd?: string, localDate?: string, timezoneOffset?: number, language?: string) => {
    setLoading(true);
    setSummary(null);

    try {
      const { data, error } = await supabase.functions.invoke<BedtimeSummaryResult>(
        'bedtime-summary',
        {
          body: { babyId, babyName, dayStart, dayEnd, localDate, timezoneOffset, language },
        }
      );

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setSummary(data?.summary || '');
      return data;
    } catch (error) {
      console.error('Error generating bedtime summary:', error);
      const message = error instanceof Error ? error.message : 'Error';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const clearSummary = useCallback(() => {
    setSummary(null);
  }, []);

  return {
    loading,
    summary,
    generateSummary,
    clearSummary,
  };
}
