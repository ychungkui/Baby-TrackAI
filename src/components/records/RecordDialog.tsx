import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { RecordIcon } from '@/components/icons/RecordIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRecords } from '@/hooks/useRecords';
import { RecordType, RecordNotes, FeedingNotes, DiaperNotes, BabyRecord, SleepNotes, NightWakeNotes, BathNotes, PottyNotes, WaterNotes, SolidFoodNotes } from '@/types';
import { useLanguage } from '@/i18n';

const baseSchema = z.object({
  start_time: z.string().min(1, 'Required'),
  end_time: z.string().optional(),
  amount_ml: z.string().optional(),
  duration_minutes: z.string().optional(),
  amount_grams: z.string().optional(),
});

interface RecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordType: RecordType | null;
  editRecord?: BabyRecord | null;
}

export function RecordDialog({ open, onOpenChange, recordType, editRecord }: RecordDialogProps) {
  const { addRecord, isAdding, updateRecord, isUpdating } = useRecords();
  const { t } = useLanguage();
  const [feedingType, setFeedingType] = useState<'breast' | 'bottle'>('bottle');
  const [diaperType, setDiaperType] = useState<'wet' | 'dirty' | 'both'>('wet');
  const [pottyType, setPottyType] = useState<'wet' | 'dirty' | 'both'>('wet');
  const isEditing = !!editRecord;

  const recordConfig: Record<RecordType, { label: string; color: string }> = {
    sleep: { label: t('records.sleep'), color: 'text-sleep' },
    feeding: { label: t('records.feeding'), color: 'text-feeding' },
    night_wake: { label: t('records.night_wake'), color: 'text-night-wake' },
    diaper: { label: t('records.diaper'), color: 'text-diaper' },
    bath: { label: t('records.bath'), color: 'text-bath' },
    potty: { label: t('records.potty'), color: 'text-potty' },
    water: { label: t('records.water'), color: 'text-water' },
    solid_food: { label: t('records.solid_food'), color: 'text-solid-food' },
  };

  const form = useForm({ resolver: zodResolver(baseSchema), defaultValues: { start_time: '', end_time: '', amount_ml: '', duration_minutes: '', amount_grams: '' } });

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      if (editRecord) {
        const notes = editRecord.notes;
        form.reset({
          start_time: format(new Date(editRecord.start_time), "yyyy-MM-dd'T'HH:mm"),
          end_time: editRecord.end_time ? format(new Date(editRecord.end_time), "yyyy-MM-dd'T'HH:mm") : '',
          amount_ml: ((notes as FeedingNotes)?.amount_ml || (notes as WaterNotes)?.amount_ml)?.toString() || '',
          duration_minutes: ((notes as SleepNotes)?.duration_minutes || (notes as NightWakeNotes)?.duration_minutes || (notes as BathNotes)?.duration_minutes)?.toString() || '',
          amount_grams: (notes as SolidFoodNotes)?.amount_grams?.toString() || '',
        });
        if (editRecord.type === 'feeding') setFeedingType((notes as FeedingNotes)?.feeding_type || 'bottle');
        if (editRecord.type === 'diaper') setDiaperType((notes as DiaperNotes)?.diaper_type || 'wet');
        if (editRecord.type === 'potty') setPottyType((notes as PottyNotes)?.diaper_type || 'wet');
      } else {
        form.reset({ start_time: format(new Date(), "yyyy-MM-dd'T'HH:mm"), end_time: '', amount_ml: '', duration_minutes: '', amount_grams: '' });
      }
    }
    onOpenChange(isOpen);
  };

  const onSubmit = async (values: any) => {
    if (!recordType) return;
    const selectedTime = new Date(values.start_time);
    if (selectedTime > new Date()) { form.setError('start_time', { message: t('records.no_future_time') }); return; }

    try {
      let notes: RecordNotes = {};
      switch (recordType) {
        case 'feeding': { const fn: FeedingNotes = { feeding_type: feedingType }; if (values.amount_ml) fn.amount_ml = parseInt(values.amount_ml, 10); notes = fn; break; }
        case 'diaper': notes = { diaper_type: diaperType } as DiaperNotes; break;
        case 'potty': notes = { diaper_type: pottyType } as PottyNotes; break;
        case 'sleep': case 'night_wake': case 'bath': if (values.duration_minutes) notes = { duration_minutes: parseInt(values.duration_minutes, 10) }; break;
        case 'water': if (values.amount_ml) notes = { amount_ml: parseInt(values.amount_ml, 10) } as WaterNotes; break;
        case 'solid_food': if (values.amount_grams) notes = { amount_grams: parseInt(values.amount_grams, 10) } as SolidFoodNotes; break;
      }

      if (isEditing && editRecord) {
        await updateRecord({ id: editRecord.id, type: recordType, start_time: new Date(values.start_time).toISOString(), end_time: values.end_time ? new Date(values.end_time).toISOString() : undefined, notes });
      } else {
        await addRecord({ type: recordType, start_time: new Date(values.start_time).toISOString(), end_time: values.end_time ? new Date(values.end_time).toISOString() : undefined, notes });
      }
      handleOpenChange(false);
    } catch {}
  };

  if (!recordType) return null;
  const config = recordConfig[recordType];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={`flex items-center gap-2 ${config.color}`}>
            <RecordIcon type={recordType} className="w-6 h-6" />
            {isEditing ? t('records.edit') : t('records.record')}{config.label}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="start_time" render={({ field }) => (
              <FormItem><FormLabel>{t('records.time')}</FormLabel><FormControl><Input type="datetime-local" max={format(new Date(), "yyyy-MM-dd'T'HH:mm")} className="h-12" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            {recordType === 'feeding' && (
              <>
                <FormItem>
                  <FormLabel>{t('records.feeding_type')}</FormLabel>
                  <Select value={feedingType} onValueChange={(v) => setFeedingType(v as any)}>
                    <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breast">{t('records.breast')}</SelectItem>
                      <SelectItem value="bottle">{t('records.bottle')}</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
                <FormField control={form.control} name="amount_ml" render={({ field }) => (
                  <FormItem><FormLabel>{t('records.amount_ml')}</FormLabel><FormControl><Input type="number" placeholder={t('records.amount_ml_example')} className="h-12" min="0" max="500" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </>
            )}

            {recordType === 'diaper' && (
              <FormItem>
                <FormLabel>{t('records.diaper_type')}</FormLabel>
                <Select value={diaperType} onValueChange={(v) => setDiaperType(v as any)}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wet">{t('records.wet')}</SelectItem>
                    <SelectItem value="dirty">{t('records.dirty')}</SelectItem>
                    <SelectItem value="both">{t('records.both')}</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}

            {recordType === 'potty' && (
              <FormItem>
                <FormLabel>{t('records.potty_type')}</FormLabel>
                <Select value={pottyType} onValueChange={(v) => setPottyType(v as any)}>
                  <SelectTrigger className="h-12"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wet">{t('records.wet')}</SelectItem>
                    <SelectItem value="dirty">{t('records.dirty')}</SelectItem>
                    <SelectItem value="both">{t('records.both')}</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}

            {(recordType === 'sleep' || recordType === 'night_wake' || recordType === 'bath') && (
              <FormField control={form.control} name="duration_minutes" render={({ field }) => (
                <FormItem><FormLabel>{t('records.duration_minutes')}</FormLabel><FormControl><Input type="number" placeholder={t('records.duration_example')} className="h-12" min="0" max="720" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            )}

            {recordType === 'water' && (
              <FormField control={form.control} name="amount_ml" render={({ field }) => (
                <FormItem><FormLabel>{t('records.water_amount')}</FormLabel><FormControl><Input type="number" placeholder={t('records.water_example')} className="h-12" min="0" max="500" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            )}

            {recordType === 'solid_food' && (
              <FormField control={form.control} name="amount_grams" render={({ field }) => (
                <FormItem><FormLabel>{t('records.food_amount')}</FormLabel><FormControl><Input type="number" placeholder={t('records.food_example')} className="h-12" min="0" max="500" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            )}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => handleOpenChange(false)}>{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1 h-12" disabled={isAdding || isUpdating}>
                {(isAdding || isUpdating) ? t('records.saving') : isEditing ? t('records.confirm_edit') : t('records.confirm_record')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
