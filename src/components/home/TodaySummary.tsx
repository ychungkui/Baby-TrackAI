import { RecordIcon } from '@/components/icons/RecordIcon';
import { BabyRecord, RecordType, FeedingNotes, WaterNotes, SolidFoodNotes } from '@/types';
import { cn } from '@/lib/utils';
import { calcDayDurationMinutes } from '@/lib/sleep-utils';
import { useLanguage } from '@/i18n';

interface TodaySummaryProps { records: BabyRecord[]; loading?: boolean; }

export function TodaySummary({ records, loading }: TodaySummaryProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4,5,6,7,8].map((i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-16 mb-2" /><div className="h-6 bg-muted rounded w-12" />
          </div>
        ))}
      </div>
    );
  }

  const sleepRecords = records.filter(r => r.type === 'sleep');
  const feedingRecords = records.filter(r => r.type === 'feeding');
  const nightWakeRecords = records.filter(r => r.type === 'night_wake');
  const diaperRecords = records.filter(r => r.type === 'diaper');
  const bathRecords = records.filter(r => r.type === 'bath');
  const pottyRecords = records.filter(r => r.type === 'potty');
  const waterRecords = records.filter(r => r.type === 'water');
  const solidFoodRecords = records.filter(r => r.type === 'solid_food');

  const today = new Date();
  const totalSleepMinutes = sleepRecords.reduce((sum, r) => sum + calcDayDurationMinutes(r.start_time, (r.notes as any)?.duration_minutes || 0, today), 0);
  const sleepHours = Math.floor(totalSleepMinutes / 60);
  const sleepMins = totalSleepMinutes % 60;
  const totalMl = feedingRecords.reduce((sum, r) => sum + ((r.notes as FeedingNotes).amount_ml || 0), 0);
  const totalWaterMl = waterRecords.reduce((sum, r) => sum + ((r.notes as WaterNotes).amount_ml || 0), 0);
  const totalFoodGrams = solidFoodRecords.reduce((sum, r) => sum + ((r.notes as SolidFoodNotes).amount_grams || 0), 0);

  const h = t('records.hours_short');
  const m = t('records.mins_short');
  const times = t('common.times');

  const summaryItems: { label: string; value: string; type: RecordType; colorClass: string; bgClass: string }[] = [
    { label: t('records.sleep'), value: totalSleepMinutes > 0 ? `${sleepHours}${h}${sleepMins}${m}` : `${sleepRecords.length} ${times}`, type: 'sleep', colorClass: 'text-sleep', bgClass: 'bg-sleep/10' },
    { label: t('records.feeding'), value: totalMl > 0 ? `${feedingRecords.length} ${times} / ${totalMl}ml` : `${feedingRecords.length} ${times}`, type: 'feeding', colorClass: 'text-feeding', bgClass: 'bg-feeding/10' },
    { label: t('records.night_wake'), value: `${nightWakeRecords.length} ${times}`, type: 'night_wake', colorClass: 'text-night-wake', bgClass: 'bg-night-wake/10' },
    { label: t('records.diaper'), value: `${diaperRecords.length} ${times}`, type: 'diaper', colorClass: 'text-diaper', bgClass: 'bg-diaper/10' },
    { label: t('records.bath'), value: `${bathRecords.length} ${times}`, type: 'bath', colorClass: 'text-bath', bgClass: 'bg-bath/10' },
    { label: t('records.potty'), value: `${pottyRecords.length} ${times}`, type: 'potty', colorClass: 'text-potty', bgClass: 'bg-potty/10' },
    { label: t('records.water'), value: totalWaterMl > 0 ? `${waterRecords.length} ${times} / ${totalWaterMl}ml` : `${waterRecords.length} ${times}`, type: 'water', colorClass: 'text-water', bgClass: 'bg-water/10' },
    { label: t('records.solid_food'), value: totalFoodGrams > 0 ? `${solidFoodRecords.length} ${times} / ${totalFoodGrams}g` : `${solidFoodRecords.length} ${times}`, type: 'solid_food', colorClass: 'text-solid-food', bgClass: 'bg-solid-food/10' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {summaryItems.map(({ label, value, type, colorClass, bgClass }) => (
        <div key={label} className={cn('rounded-lg border border-border p-4', bgClass)}>
          <div className="flex items-center gap-2 mb-1">
            <RecordIcon type={type} className={cn('w-10 h-10', colorClass)} />
            <span className="text-sm text-muted-foreground">{label}</span>
          </div>
          <div className={cn('text-lg font-semibold', colorClass)}>{value}</div>
        </div>
      ))}
    </div>
  );
}
