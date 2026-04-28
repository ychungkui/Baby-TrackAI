import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BabyRecord, RecordType, RecordNotes } from '@/types';
import { useBabyContext } from '@/contexts/BabyContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n';
import { startOfDay, endOfDay, subDays } from 'date-fns';

interface CreateRecordData {
  type: RecordType;
  start_time: string;
  end_time?: string;
  notes?: RecordNotes;
}

export function useRecords(date?: Date) {
  const { currentBaby } = useBabyContext();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const targetDate = date || new Date();

  const { data: records = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['records', currentBaby?.id, targetDate.toDateString()],
    queryFn: async () => {
      if (!currentBaby) return [];
      
      const dayStart = startOfDay(targetDate).toISOString();
      const dayEnd = endOfDay(targetDate).toISOString();
      const prevDayStart = startOfDay(subDays(targetDate, 1)).toISOString();
      
      const { data, error } = await supabase
        .from('records')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('start_time', dayStart)
        .lte('start_time', dayEnd)
        .order('start_time', { ascending: false });
      
      if (error) throw error;

      const { data: carryOver, error: carryError } = await supabase
        .from('records')
        .select('*')
        .eq('baby_id', currentBaby.id)
        .gte('start_time', prevDayStart)
        .lt('start_time', dayStart)
        .in('type', ['sleep', 'night_wake'])
        .order('start_time', { ascending: false });

      if (carryError) throw carryError;

      const carryOverRecords = (carryOver || []).filter(r => {
        const notes = (r.notes || {}) as { duration_minutes?: number };
        if (!notes.duration_minutes) return false;
        const endTime = new Date(r.start_time).getTime() + notes.duration_minutes * 60000;
        return endTime > new Date(dayStart).getTime();
      });

      const allRecords = [...data, ...carryOverRecords];
      return allRecords.map(record => ({
        ...record,
        type: record.type as RecordType,
        notes: (record.notes || {}) as RecordNotes,
      })) as BabyRecord[];
    },
    enabled: !!currentBaby,
  });

  const addRecordMutation = useMutation({
    mutationFn: async (data: CreateRecordData) => {
      if (!currentBaby) throw new Error(t('records.select_baby_first'));

      const { data: record, error } = await supabase
        .from('records')
        .insert([{
          baby_id: currentBaby.id,
          type: data.type,
          start_time: data.start_time,
          end_time: data.end_time || null,
          notes: JSON.parse(JSON.stringify(data.notes || {})),
        }])
        .select()
        .single();

      if (error) throw error;
      return record as BabyRecord;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyRecords'] });
      toast({
        title: t('records.record_success'),
        description: `${t('records.' + variables.type)} ${t('records.record_added')}`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('records.record_failed'),
        description: error.message,
      });
    },
  });

  const updateRecordMutation = useMutation({
    mutationFn: async (data: { id: string; type: RecordType; start_time: string; end_time?: string; notes?: RecordNotes }) => {
      const { data: record, error } = await supabase
        .from('records')
        .update({
          type: data.type,
          start_time: data.start_time,
          end_time: data.end_time || null,
          notes: JSON.parse(JSON.stringify(data.notes || {})),
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return record as BabyRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyRecords'] });
      toast({ title: t('records.update_success'), description: t('records.updated') });
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: t('records.update_failed'), description: error.message });
    },
  });

  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyRecords'] });
      toast({
        title: t('records.delete_success'),
        description: t('records.deleted'),
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: t('records.delete_failed'),
        description: error.message,
      });
    },
  });

  return {
    records,
    loading,
    refetch,
    addRecord: addRecordMutation.mutateAsync,
    updateRecord: updateRecordMutation.mutateAsync,
    deleteRecord: deleteRecordMutation.mutateAsync,
    isAdding: addRecordMutation.isPending,
    isUpdating: updateRecordMutation.isPending,
    isDeleting: deleteRecordMutation.isPending,
  };
}
