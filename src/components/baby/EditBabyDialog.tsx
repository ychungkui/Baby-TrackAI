import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBabies } from '@/hooks/useBabies';
import { Baby } from '@/types';
import { useLanguage } from '@/i18n';
import penIcon from '@/assets/icons/pen.png';

interface EditBabyDialogProps { baby: Baby | null; open: boolean; onOpenChange: (open: boolean) => void; }

export function EditBabyDialog({ baby, open, onOpenChange }: EditBabyDialogProps) {
  const { updateBaby, isUpdating } = useBabies();
  const { t } = useLanguage();
  const schema = z.object({ name: z.string().min(1, t('baby.nickname_required')), birth_date: z.string().min(1, t('baby.birth_required')), gender: z.string().optional() });
  type V = z.infer<typeof schema>;
  const form = useForm<V>({ resolver: zodResolver(schema), defaultValues: { name: '', birth_date: '', gender: undefined } });

  useEffect(() => { if (baby) form.reset({ name: baby.name, birth_date: baby.birth_date, gender: baby.gender || undefined }); }, [baby, form]);

  const onSubmit = async (values: V) => { if (!baby) return; try { await updateBaby({ id: baby.id, name: values.name, birth_date: values.birth_date, gender: values.gender || null }); onOpenChange(false); } catch {} };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><img src={penIcon} alt="Edit" className="w-5 h-5" />{t('baby.edit')}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>{t('baby.nickname')}</FormLabel><FormControl><Input placeholder={t('baby.nickname_placeholder')} className="h-12" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="birth_date" render={({ field }) => (<FormItem><FormLabel>{t('baby.birth_date')}</FormLabel><FormControl><Input type="date" className="h-12" max={new Date().toISOString().split('T')[0]} {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="gender" render={({ field }) => (<FormItem><FormLabel>{t('baby.gender')}</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="h-12"><SelectValue placeholder={t('baby.select_gender')} /></SelectTrigger></FormControl><SelectContent><SelectItem value="male">{t('baby.male')}</SelectItem><SelectItem value="female">{t('baby.female')}</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 h-12" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
              <Button type="submit" className="flex-1 h-12" disabled={isUpdating}>{isUpdating ? t('baby.updating') : t('baby.confirm_update')}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
