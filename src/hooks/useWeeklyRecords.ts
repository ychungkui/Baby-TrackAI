import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BabyRecord, RecordType, RecordNotes, FeedingNotes } from '@/types';
import { useBabyContext } from '@/contexts/BabyContext';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { calcDayDurationMinutes } from '@/lib/sleep-utils';

export interface DaySummary {
  date: string;
  fullDate: string;
  sleepMinutes: number;
  feedingCount: number;
  feedingMl: number;
  diaperCount: number;
  nightWakeCount: number;
  bathCount: number;
  pottyCount: number;
  waterCount: number;
  waterMl: number;
  solidFoodCount: number;
  solidFoodGrams: number;
}

export function useWeeklyRecords(endDate: Date) {
  const { currentBaby } = useBabyContext();
  const startDate = subDays(endDate, 6); // 7 days including endDate

  return useQuery({
    queryKey: ['weeklyRecords', currentBaby?.id, endDate.toDateString()],
    queryFn: async (): Promise<DaySummary[]> => {
      if (!currentBaby) return [];

      // Fetch one extra day before the range to capture carryover sleep
      const rangeStart = startOfDay(subDays(startDate, 1)).toISOString();
      const rangeEnd = endOfDay(endDate).toISOString();

      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('start_time', rangeStart)
        .lte('start_time', rangeEnd)
        .order('start_time', { ascending: true });

      if (error) throw error;

      const records = data.map(record => ({
        ...record,
        type: record.type as RecordType,
        notes: (record.notes || {}) as RecordNotes,
      })) as BabyRecord[];

      // Group by day and calculate summaries
      const summaries: DaySummary[] = [];
      for (let i = 0; i < 7; i++) {
        const day = subDays(endDate, 6 - i);
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayRecords = records.filter(r =>
          format(new Date(r.start_time), 'yyyy-MM-dd') === dayStr
        );

        // For sleep, use all records (including from previous day) and calculate overlap with this day
        const allSleepRecords = records.filter(r => r.type === 'sleep');
        const sleepMinutes = allSleepRecords.reduce((sum, r) => {
          const notes = r.notes as { duration_minutes?: number };
          return sum + calcDayDurationMinutes(r.start_time, notes.duration_minutes || 0, day);
        }, 0);

        const feedingRecords = dayRecords.filter(r => r.type === 'feeding');
        const feedingMl = feedingRecords.reduce((sum, r) => {
          const notes = r.notes as FeedingNotes;
          return sum + (notes.amount_ml || 0);
        }, 0);

        const waterRecords = dayRecords.filter(r => r.type === 'water');
        const waterMl = waterRecords.reduce((sum, r) => {
          const notes = r.notes as { amount_ml?: number };
          return sum + (notes.amount_ml || 0);
        }, 0);

        const solidFoodRecords = dayRecords.filter(r => r.type === 'solid_food');
        const solidFoodGrams = solidFoodRecords.reduce((sum, r) => {
          const notes = r.notes as { amount_grams?: number };
          return sum + (notes.amount_grams || 0);
        }, 0);

        summaries.push({
          date: format(day, 'MM/dd'),
          fullDate: dayStr,
          sleepMinutes,
          feedingCount: feedingRecords.length,
          feedingMl,
          diaperCount: dayRecords.filter(r => r.type === 'diaper').length,
          nightWakeCount: dayRecords.filter(r => r.type === 'night_wake').length,
          bathCount: dayRecords.filter(r => r.type === 'bath').length,
          pottyCount: dayRecords.filter(r => r.type === 'potty').length,
          waterCount: waterRecords.length,
          waterMl,
          solidFoodCount: solidFoodRecords.length,
          solidFoodGrams,
        });
      }

      return summaries;
    },
    enabled: !!currentBaby,
  });
}
