import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'
import { useLanguage } from '@/i18n'
import uploadCute from '@/assets/icons/upload-cute.png'

interface AddPhotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (
    file: File,
    caption: string,
    takenAt: string
  ) => Promise<void>
  uploading: boolean
}

export function AddPhotoDialog({
  open,
  onOpenChange,
  onSubmit,
  uploading,
}: AddPhotoDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [takenAt, setTakenAt] = useState(
    format(new Date(), 'yyyy-MM-dd')
  )

  const inputRef = useRef<HTMLInputElement>(null)
  const { t } = useLanguage()

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setPreview(URL.createObjectURL(f))
    }
  }

  const handleSubmit = async () => {
    if (!file) return
    await onSubmit(file, caption, takenAt)
    reset()
    onOpenChange(false)
  }

  const reset = () => {
    setFile(null)
    setPreview(null)
    setCaption('')
    setTakenAt(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('growth.add_photo')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* 🖼 上傳區 */}
          <div
            className="border-2 border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer aspect-square overflow-hidden bg-muted/30 hover:border-blue-400 hover:bg-blue-50 transition"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center px-4">

                <img
                  src={uploadCute}
                  alt="upload"
                  className="w-24 md:w-32 mb-3 opacity-90 transition-transform hover:scale-105"
                />

                <p className="text-sm font-medium text-gray-700">
                  {t('growth.click_select')}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  PNG / JPG supported
                </p>

              </div>
            )}
          </div>

          {/* hidden input */}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* 💡 提示（已多語） */}
          <p className="text-xs text-gray-400 text-center">
            {t('growth.capture_moment')} 📸
          </p>

          {/* 📝 Caption */}
          <div className="space-y-2">
            <Label>{t('growth.caption')}</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('growth.caption_placeholder')}
              rows={2}
              className="focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* 📅 日期 */}
          <div className="space-y-2">
            <Label>{t('growth.date')}</Label>
            <Input
              type="date"
              value={takenAt}
              onChange={(e) => setTakenAt(e.target.value)}
              className="focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* 🔘 按鈕 */}
        <DialogFooter className="flex justify-between">

          <Button
            variant="destructive"
            className="text-white"
            onClick={() => onOpenChange(false)}
          >
            {t('common.cancel')}
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={!file || uploading}
            className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6"
          >
            {uploading
              ? t('growth.uploading')
              : t('common.save')}
          </Button>

        </DialogFooter>

      </DialogContent>
    </Dialog>
  )
}