import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sparkles, RefreshCw, X } from 'lucide-react';
import vipBadge from '@/assets/icons/vip-badge.png';
import { format, startOfDay, endOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBedtimeSummary } from '@/hooks/useBedtimeSummary';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import sleepButtonZh from '@/assets/icons/sleep-button.png';
import sleepButtonEn from '@/assets/icons/sleep-button-en.png';
import sleepButtonMs from '@/assets/icons/sleep-button-ms.png';
import { useLanguage } from '@/i18n';

const sleepButtonByLang: Record<string, string> = {
  zh: sleepButtonZh,
  en: sleepButtonEn,
  ms: sleepButtonMs,
};

interface BedtimeSummaryProps { babyId: string; babyName: string; }

export function BedtimeSummary({ babyId, babyName }: BedtimeSummaryProps) {
  const { loading, summary, generateSummary, clearSummary } = useBedtimeSummary();
  const { canUseBedtimeSummary, remainingBedtime, isPro, incrementBedtime } = useUsageLimit();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const sleepBtnImg = sleepButtonByLang[language] || sleepButtonZh;

  const handleGenerate = async () => {
    if (!canUseBedtimeSummary) { navigate('/subscription'); return; }
    setIsExpanded(true);
    incrementBedtime();
    const now = new Date();
    const dayStart = startOfDay(now).toISOString();
    const dayEnd = endOfDay(now).toISOString();
    const localDate = format(now, 'yyyy-MM-dd');
    const timezoneOffset = now.getTimezoneOffset();
    const result = await generateSummary(babyId, babyName, dayStart, dayEnd, localDate, timezoneOffset, language);
    if (result?.summary) {
      await (supabase.from('bedtime_summaries' as any) as any).upsert(
        { baby_id: babyId, summary_date: localDate, summary_text: result.summary },
        { onConflict: 'baby_id,summary_date' }
      );
    }
  };

  const handleClose = () => { setIsExpanded(false); clearSummary(); };

  if (!isExpanded) {
    return (
      <div className="space-y-1">
        {!canUseBedtimeSummary ? (
          <div className="space-y-2 text-center">
            <p className="text-sm text-muted-foreground">{t('bedtime.free_used_up')}</p>
            <Button onClick={handleGenerate} className="w-full gap-2 whitespace-normal text-center h-auto py-2" size="lg">
              <img src={vipBadge} alt="VIP" className="w-6 h-6 flex-shrink-0" />{t('bedtime.upgrade_pro')}
            </Button>
          </div>
        ) : (
          <button onClick={handleGenerate} disabled={loading} className="relative w-full disabled:opacity-50 transition-opacity">
            <img src={sleepBtnImg} alt={t('bedtime.generate')} className="w-full h-14 object-contain rounded-lg" />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
          </button>
        )}
        {!isPro && canUseBedtimeSummary && (
          <p className="text-[10px] text-muted-foreground text-center">{t('bedtime.remaining', { count: remainingBedtime })}</p>
        )}
      </div>
    );
  }

  return (
    <Card className={cn("relative overflow-hidden border-primary/20", "bg-gradient-to-br from-card to-card/80")}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2" />
      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            <span>{t('bedtime.title')}</span>
            <Sparkles className="w-4 h-4 text-warning" />
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleGenerate} disabled={loading || !canUseBedtimeSummary}>
              <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClose}><X className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative pt-0">
        {loading ? (
          <div className="space-y-2 py-4">
            <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
            <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-muted/50 rounded animate-pulse w-4/6" />
          </div>
        ) : summary ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="text-sm leading-relaxed whitespace-pre-wrap">{summary}</div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">{t('bedtime.regenerate')}</p>
        )}
      </CardContent>
    </Card>
  );
}
