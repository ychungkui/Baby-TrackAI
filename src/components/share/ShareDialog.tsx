import { Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShareCard } from './ShareCard';
import { useShareCard } from '@/hooks/useShareCard';
import { useSubscription } from '@/hooks/useSubscription';
import { BabyRecord } from '@/types';
import { useLanguage } from '@/i18n';

interface ShareDialogProps { open: boolean; onOpenChange: (open: boolean) => void; babyName: string; date: Date; records: BabyRecord[]; }

export function ShareDialog({ open, onOpenChange, babyName, date, records }: ShareDialogProps) {
  const { isPro } = useSubscription();
  const { cardRef, cardData, generating, download, share } = useShareCard({ babyName, date, records });
  const { t, language } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[420px] p-4 sm:p-6">
        <DialogHeader><DialogTitle>{t('share.preview_title')}</DialogTitle><DialogDescription>{t('share.share_to_family')}</DialogDescription></DialogHeader>
        <div className="flex justify-center overflow-hidden rounded-lg" style={{ height: 374 }}><div className="origin-top" style={{ transform: 'scale(0.55)' }}><ShareCard ref={cardRef} data={cardData} isPro={isPro} language={language} t={t} /></div></div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" onClick={download} disabled={generating}><Download className="w-4 h-4" />{generating ? t('common.generating') : t('common.download_image')}</Button>
          <Button className="flex-1 gap-2" onClick={share} disabled={generating}><Share2 className="w-4 h-4" />{generating ? t('common.generating') : t('common.share')}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
