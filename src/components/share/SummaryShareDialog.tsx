import { useRef, useState, useCallback } from 'react';
import { Download, Share2 } from 'lucide-react';
import { format } from 'date-fns';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { SummaryShareCard } from './SummaryShareCard';
import { useSubscription } from '@/hooks/useSubscription';
import { useLanguage } from '@/i18n';

interface SummaryShareDialogProps { open: boolean; onOpenChange: (open: boolean) => void; babyName: string; date: Date; summaryText: string; }

export function SummaryShareDialog({ open, onOpenChange, babyName, date, summaryText }: SummaryShareDialogProps) {
  const { isPro } = useSubscription();
  const { t, language } = useLanguage();
  const cardRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!cardRef.current) return null;
    setGenerating(true);
    try { const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true }); const res = await fetch(dataUrl); return await res.blob(); }
    catch (err) { console.error('Failed to generate image:', err); return null; }
    finally { setGenerating(false); }
  }, []);

  const download = useCallback(async () => {
    const blob = await generateImage(); if (!blob) return;
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${babyName}-summary-${format(date, 'yyyy-MM-dd')}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  }, [generateImage, babyName, date]);

  const share = useCallback(async () => {
    const blob = await generateImage(); if (!blob) return;
    const file = new File([blob], `${babyName}-summary-${format(date, 'yyyy-MM-dd')}.png`, { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) { try { await navigator.share({ title: `${babyName}`, text: `${babyName}`, files: [file] }); return; } catch (err) { if ((err as Error).name === 'AbortError') return; } }
    await download();
  }, [generateImage, babyName, date, download]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-4 sm:p-6">
        <DialogHeader><DialogTitle>{t('share.preview_title')}</DialogTitle><DialogDescription>{t('share.share_summary')}</DialogDescription></DialogHeader>
        <div className="flex justify-center overflow-hidden rounded-lg" style={{ maxHeight: 400 }}><div className="origin-top" style={{ transform: 'scale(0.5)' }}><SummaryShareCard ref={cardRef} babyName={babyName} date={date} summaryText={summaryText} isPro={isPro} language={language} /></div></div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={download} disabled={generating}><Download className="w-4 h-4" />{generating ? t('common.generating') : t('common.download_image')}</Button>
          <Button className="flex-1 gap-2" onClick={share} disabled={generating}><Share2 className="w-4 h-4" />{generating ? t('common.generating') : t('common.share')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
