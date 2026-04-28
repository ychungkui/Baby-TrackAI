import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GrowthPhoto } from '@/types';
import { useLanguage } from '@/i18n';

interface EditPhotoDialogProps { photo: GrowthPhoto | null; open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (id: string, caption: string, takenAt: string) => void; }

export function EditPhotoDialog({ photo, open, onOpenChange, onSubmit }: EditPhotoDialogProps) {
  const [caption, setCaption] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const { t } = useLanguage();

  useEffect(() => { if (photo) { setCaption(photo.caption || ''); setTakenAt(photo.taken_at); } }, [photo]);
  const handleSubmit = () => { if (!photo) return; onSubmit(photo.id, caption, takenAt); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{t('growth.edit_photo')}</DialogTitle></DialogHeader>
        {photo && (
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg"><img src={photo.image_url} alt="" className="w-full h-full object-cover" /></div>
            <div className="space-y-2"><Label>{t('growth.caption')}</Label><Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={t('growth.caption_placeholder')} rows={2} /></div>
            <div className="space-y-2"><Label>{t('growth.date')}</Label><Input type="date" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} /></div>
          </div>
        )}
        <DialogFooter><Button onClick={handleSubmit}>{t('common.save')}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
