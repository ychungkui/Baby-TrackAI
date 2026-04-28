import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { RecordIcon } from '@/components/icons/RecordIcon';
import { BabyRecord, RecordType, FeedingNotes, DiaperNotes, SleepNotes, NightWakeNotes, BathNotes, PottyNotes, WaterNotes, SolidFoodNotes } from '@/types';
import { cn } from '@/lib/utils';
import { calcDayDurationMinutes } from '@/lib/sleep-utils';
import { useLanguage } from '@/i18n';
import penIcon from '@/assets/icons/pen.png';
import trashIcon from '@/assets/icons/trash.png';

interface RecordTimelineProps {
  records: BabyRecord[];
  onDelete?: (id: string) => void;
  onEdit?: (record: BabyRecord) => void;
  isDeleting?: boolean;
  selectedDate?: Date;
}

export function RecordTimeline({ records, onDelete, onEdit, isDeleting, selectedDate }: RecordTimelineProps) {
  const { t } = useLanguage();

  const recordConfig: { [key in RecordType]: { label: string; colorClass: string; bgClass: string } } = {
    sleep: { label: t('records.sleep'), colorClass: 'text-sleep', bgClass: 'bg-sleep/10' },
    feeding: { label: t('records.feeding'), colorClass: 'text-feeding', bgClass: 'bg-feeding/10' },
    night_wake: { label: t('records.night_wake'), colorClass: 'text-night-wake', bgClass: 'bg-night-wake/10' },
    diaper: { label: t('records.diaper'), colorClass: 'text-diaper', bgClass: 'bg-diaper/10' },
    bath: { label: t('records.bath'), colorClass: 'text-bath', bgClass: 'bg-bath/10' },
    potty: { label: t('records.potty'), colorClass: 'text-potty', bgClass: 'bg-potty/10' },
    water: { label: t('records.water'), colorClass: 'text-water', bgClass: 'bg-water/10' },
    solid_food: { label: t('records.solid_food'), colorClass: 'text-solid-food', bgClass: 'bg-solid-food/10' },
  };

  function getRecordDescription(record: BabyRecord): string {
    const notes = record.notes;
    switch (record.type) {
      case 'feeding': {
        const fn = notes as FeedingNotes;
        const type = fn.feeding_type === 'breast' ? t('records.breast_short') : t('records.bottle_short');
        const amount = fn.amount_ml ? ` ${fn.amount_ml}ml` : '';
        return `${type}${amount}`;
      }
      case 'diaper': { const dn = notes as DiaperNotes; const m: Record<string, string> = { wet: t('records.wet_short'), dirty: t('records.dirty_short'), both: t('records.both_short') }; return m[dn.diaper_type || 'wet']; }
      case 'potty': { const pn = notes as PottyNotes; const m: Record<string, string> = { wet: t('records.wet_short'), dirty: t('records.dirty_short'), both: t('records.both_short') }; return m[pn.diaper_type || 'wet']; }
      case 'sleep': case 'night_wake': {
        const dn = notes as SleepNotes;
        if (!dn.duration_minutes) return '';
        const mins = selectedDate ? calcDayDurationMinutes(record.start_time, dn.duration_minutes, selectedDate) : dn.duration_minutes;
        return mins > 0 ? `${mins} ${t('common.minutes')}` : '';
      }
      case 'bath': { const dn = notes as SleepNotes; return dn.duration_minutes ? `${dn.duration_minutes} ${t('common.minutes')}` : ''; }
      case 'water': { const wn = notes as WaterNotes; return wn.amount_ml ? `${wn.amount_ml}ml` : ''; }
      case 'solid_food': { const fn = notes as SolidFoodNotes; return fn.amount_grams ? `${fn.amount_grams}g` : ''; }
      default: return '';
    }
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('records.no_records')}</p>
        <p className="text-sm mt-1">{t('records.click_to_start')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const config = recordConfig[record.type];
        const description = getRecordDescription(record);
        const time = format(new Date(record.start_time), 'HH:mm');
        return (
          <div key={record.id} className={cn('flex items-center gap-3 p-3 rounded-lg border border-border', config.bgClass)}>
            <div className={cn('p-2 rounded-full', config.bgClass)}>
              <RecordIcon type={record.type} className={cn('w-6 h-6', config.colorClass)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('font-medium', config.colorClass)}>{config.label}</span>
                {description && <span className="text-sm text-muted-foreground">{description}</span>}
              </div>
              <div className="text-sm text-muted-foreground">{time}</div>
            </div>
            <div className="flex items-center gap-1">
              {onEdit && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(record)}><img src={penIcon} alt="Edit" className="w-4 h-4" /></Button>}
              {onDelete && <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(record.id)} disabled={isDeleting}><img src={trashIcon} alt="Delete" className="w-4 h-4" /></Button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
