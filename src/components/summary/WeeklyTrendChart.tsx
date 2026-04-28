import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DaySummary } from '@/hooks/useWeeklyRecords';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/i18n';

interface WeeklyTrendChartProps { data: DaySummary[]; loading?: boolean; }

export function WeeklyTrendChart({ data, loading }: WeeklyTrendChartProps) {
  const { t } = useLanguage();

  const chartConfig = {
    sleepHours: { label: `${t('records.sleep')}(${t('records.hours_short')})`, color: 'hsl(var(--sleep))' },
    feedingCount: { label: `${t('records.feeding')}(${t('common.times')})`, color: 'hsl(var(--feeding))' },
    diaperCount: { label: `${t('records.diaper')}(${t('common.times')})`, color: 'hsl(var(--diaper))' },
    nightWakeCount: { label: `${t('records.night_wake')}(${t('common.times')})`, color: 'hsl(var(--night-wake))' },
    bathCount: { label: `${t('records.bath')}(${t('common.times')})`, color: 'hsl(var(--bath))' },
    pottyCount: { label: `${t('records.potty')}(${t('common.times')})`, color: 'hsl(var(--potty))' },
    waterCount: { label: `${t('records.water')}(${t('common.times')})`, color: 'hsl(var(--water))' },
    solidFoodCount: { label: `${t('records.solid_food')}(${t('common.times')})`, color: 'hsl(var(--solid-food))' },
  };

  if (loading) return <Skeleton className="w-full h-[200px] rounded-lg" />;
  if (!data.length) return <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">{t('common.no_data')}</div>;

  const chartData = data.map(d => ({ ...d, sleepHours: Math.round((d.sleepMinutes / 60) * 10) / 10 }));

  return (
    <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
      <BarChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="sleepHours" fill="var(--color-sleepHours)" radius={[2,2,0,0]} barSize={6} />
        <Bar dataKey="feedingCount" fill="var(--color-feedingCount)" radius={[2,2,0,0]} barSize={6} />
        <Bar dataKey="diaperCount" fill="var(--color-diaperCount)" radius={[2,2,0,0]} barSize={6} />
        <Bar dataKey="nightWakeCount" fill="var(--color-nightWakeCount)" radius={[2,2,0,0]} barSize={6} />
        <Bar dataKey="bathCount" fill="var(--color-bathCount)" radius={[2,2,0,0]} barSize={6} />
        <Bar dataKey="pottyCount" fill="var(--color-pottyCount)" radius={[2,2,0,0]} barSize={6} />
        <Bar dataKey="waterCount" fill="var(--color-waterCount)" radius={[2,2,0,0]} barSize={6} />
        <Bar dataKey="solidFoodCount" fill="var(--color-solidFoodCount)" radius={[2,2,0,0]} barSize={6} />
      </BarChart>
    </ChartContainer>
  );
}
