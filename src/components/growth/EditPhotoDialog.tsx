import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { GrowthPhoto } from '@/types';
import { useLanguage } from '@/i18n';

interface EditPhotoDialogProps {
  photo: GrowthPhoto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, caption: string, takenAt: string) => void;
}

export function EditPhotoDialog({
  photo,
  open,
  onOpenChange,
  onSubmit
}: EditPhotoDialogProps) {
  const [caption, setCaption] = useState('');
  const [takenAt, setTakenAt] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    if (photo) {
      setCaption(photo.caption || '');
      setTakenAt(photo.taken_at);
    }
  }, [photo]);

  const handleSubmit = () => {
    if (!photo) return;
    onSubmit(photo.id, caption, takenAt);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()} // 🔥 防自动弹键盘
        className="sm:max-w-md max-h-[80vh] overflow-y-auto p-4"
      >
        <DialogHeader>
          <DialogTitle>{t('growth.edit_photo')}</DialogTitle>
        </DialogHeader>

        {photo && (
          <div className="space-y-4 pb-28">

            {/* 🖼 图片（优化高度） */}
            <div className="aspect-[4/3] sm:aspect-square overflow-hidden rounded-lg">
              <img
                src={photo.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* 📝 Caption */}
            <div className="space-y-2">
              <Label>{t('growth.caption')}</Label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t('growth.caption_placeholder')}
                rows={2}
              />
            </div>

            {/* 📅 日期 */}
            <div className="space-y-2">
              <Label>{t('growth.date')}</Label>
              <Input
                type="date"
                value={takenAt}
                onChange={(e) => setTakenAt(e.target.value)}
              />
            </div>

          </div>
        )}

        <DialogFooter className="flex justify-end">
          <Button onClick={handleSubmit}>
            {t('common.save')}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}