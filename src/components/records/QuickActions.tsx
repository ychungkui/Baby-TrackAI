import { Button } from '@/components/ui/button';
import { RecordIcon } from '@/components/icons/RecordIcon';
import { RecordType } from '@/types';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

interface QuickActionsProps {
  onRecord: (type: RecordType) => void;
  disabled?: boolean;
}

export function QuickActions({ onRecord, disabled }: QuickActionsProps) {
  const { t } = useLanguage();

  const recordTypes: { type: RecordType; label: string; colorClass: string }[] = [
    { type: 'sleep', label: t('records.sleep'), colorClass: 'bg-sleep/10 text-sleep hover:bg-sleep/20 border-sleep/30' },
    { type: 'feeding', label: t('records.feeding'), colorClass: 'bg-feeding/10 text-feeding hover:bg-feeding/20 border-feeding/30' },
    { type: 'night_wake', label: t('records.night_wake'), colorClass: 'bg-night-wake/10 text-night-wake hover:bg-night-wake/20 border-night-wake/30' },
    { type: 'diaper', label: t('records.diaper'), colorClass: 'bg-diaper/10 text-diaper hover:bg-diaper/20 border-diaper/30' },
    { type: 'bath', label: t('records.bath'), colorClass: 'bg-bath/10 text-bath hover:bg-bath/20 border-bath/30' },
    { type: 'potty', label: t('records.potty'), colorClass: 'bg-potty/10 text-potty hover:bg-potty/20 border-potty/30' },
    { type: 'water', label: t('records.water'), colorClass: 'bg-water/10 text-water hover:bg-water/20 border-water/30' },
    { type: 'solid_food', label: t('records.solid_food'), colorClass: 'bg-solid-food/10 text-solid-food hover:bg-solid-food/20 border-solid-food/30' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {recordTypes.map(({ type, label, colorClass }) => (
        <Button
          key={type}
          variant="outline"
          className={cn('flex flex-col items-center justify-center h-auto min-h-[80px] py-2 gap-2 border', colorClass)}
          onClick={() => onRecord(type)}
          disabled={disabled}
        >
          <RecordIcon type={type} className="w-6 h-6" />
          <span className="text-xs font-medium text-center leading-tight line-clamp-2 whitespace-pre-line">{label}</span>
        </Button>
      ))}
    </div>
  );
}
