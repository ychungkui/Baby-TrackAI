import { useState } from 'react';
import { format } from 'date-fns';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { useSummaryHistory } from '@/hooks/useSummaryHistory';
import { SummaryShareDialog } from '@/components/share/SummaryShareDialog';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/i18n';

interface SummaryHistoryDialogProps { open: boolean; onOpenChange: (open: boolean) => void; babyId: string; babyName: string; }

export function SummaryHistoryDialog({ open, onOpenChange, babyId, babyName }: SummaryHistoryDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [shareOpen, setShareOpen] = useState(false);
  const { getSummaryForDate, datesWithSummaries, loading } = useSummaryHistory(open ? babyId : undefined);
  const { t } = useLanguage();
  const summary = selectedDate ? getSummaryForDate(selectedDate) : undefined;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
  onOpenAutoFocus={(e) => e.preventDefault()}
  className="max-w-[420px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
>
          <DialogHeader><DialogTitle>{t('summary.summary_history')}</DialogTitle></DialogHeader>
          <Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} className={cn("p-3 pointer-events-auto mx-auto")} modifiers={{ hasSummary: datesWithSummaries }} modifiersStyles={{ hasSummary: { fontWeight: 700, textDecoration: 'underline', textDecorationColor: 'hsl(var(--primary))', textUnderlineOffset: '4px' } }} disabled={(date) => date > new Date()} />
          <div className="mt-2">
            {selectedDate && <div className="text-sm text-muted-foreground mb-2">{format(selectedDate, 'yyyy-MM-dd')}</div>}
            {loading ? <div className="space-y-2 py-4"><div className="h-4 bg-muted/50 rounded animate-pulse w-full" /><div className="h-4 bg-muted/50 rounded animate-pulse w-5/6" /></div>
            : summary ? (
              <div className="rounded-lg border p-4 bg-card">
                <div className="text-sm leading-relaxed whitespace-pre-wrap mb-3">{summary.summary_text}</div>
                <Button variant="outline" size="sm" className="gap-2" onClick={() => setShareOpen(true)}><Share2 className="w-4 h-4" />{t('common.share')}</Button>
              </div>
            ) : <div className="text-center py-6 text-muted-foreground">{t('summary.no_record')}</div>}
          </div>
        </DialogContent>
      </Dialog>
      {summary && selectedDate && <SummaryShareDialog open={shareOpen} onOpenChange={setShareOpen} babyName={babyName} date={selectedDate} summaryText={summary.summary_text} />}
    </>
  );
}
