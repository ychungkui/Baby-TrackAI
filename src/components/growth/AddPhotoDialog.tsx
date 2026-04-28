import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImagePlus } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/i18n';

interface AddPhotoDialogProps { open: boolean; onOpenChange: (open: boolean) => void; onSubmit: (file: File, caption: string, takenAt: string) => Promise<void>; uploading: boolean; }

export function AddPhotoDialog({ open, onOpenChange, onSubmit, uploading }: AddPhotoDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [takenAt, setTakenAt] = useState(format(new Date(), 'yyyy-MM-dd'));
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } };
  const handleSubmit = async () => { if (!file) return; await onSubmit(file, caption, takenAt); reset(); onOpenChange(false); };
  const reset = () => { setFile(null); setPreview(null); setCaption(''); setTakenAt(format(new Date(), 'yyyy-MM-dd')); };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>{t('growth.add_photo')}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer aspect-square overflow-hidden bg-muted/30" onClick={() => inputRef.current?.click()}>
            {preview ? <img src={preview} alt="Preview" className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2 text-muted-foreground"><ImagePlus className="h-10 w-10" /><span className="text-sm">{t('growth.click_select')}</span></div>}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <div className="space-y-2"><Label>{t('growth.caption')}</Label><Textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={t('growth.caption_placeholder')} rows={2} /></div>
          <div className="space-y-2"><Label>{t('growth.date')}</Label><Input type="date" value={takenAt} onChange={(e) => setTakenAt(e.target.value)} /></div>
        </div>
        <DialogFooter><Button onClick={handleSubmit} disabled={!file || uploading}>{uploading ? t('growth.uploading') : t('common.save')}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
