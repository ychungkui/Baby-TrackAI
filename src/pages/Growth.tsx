import { useState } from 'react';
import { optimizeImage } from '@/utils/imageOptimizer';
import { BottomNav } from '@/components/layout/BottomNav';
import { BabySelector } from '@/components/baby/BabySelector';
import { AddBabyDialog } from '@/components/baby/AddBabyDialog';
import { useBabyContext } from '@/contexts/BabyContext';
import { useGrowthPhotos } from '@/hooks/useGrowthPhotos';
import { PhotoCard } from '@/components/growth/PhotoCard';
import { AddPhotoDialog } from '@/components/growth/AddPhotoDialog';
import { EditPhotoDialog } from '@/components/growth/EditPhotoDialog';
import { Button } from '@/components/ui/button';
import { Plus, ImageOff, Footprints } from 'lucide-react';
import footprintBoy from '@/assets/icons/footprint-boy.png';
import footprintGirl from '@/assets/icons/footprint-girl.png';
import { HeaderBranding } from '@/components/layout/HeaderBranding';
import { GrowthPhoto } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { useLanguage } from '@/i18n';

export default function Growth() {
  const { currentBaby } = useBabyContext();
  const { photos, isLoading, uploading, uploadPhoto, updatePhoto, deletePhoto } = useGrowthPhotos(currentBaby?.id);
  const { t } = useLanguage();

  const [addOpen, setAddOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GrowthPhoto | null>(null);
  const [deletingPhoto, setDeletingPhoto] = useState<GrowthPhoto | null>(null);
  const [addBabyOpen, setAddBabyOpen] = useState(false);

  // ✅ 修正版上傳（已解決 Blob 問題）
  const handleUpload = async (file: File, caption: string, takenAt: string) => {
    console.log('📸 Step 1: 開始');

    if (!currentBaby) return;

    try {
      console.log('📸 Step 2: 壓縮圖片');

      const optimized = await optimizeImage(file, 'photo');

      console.log('📸 Step 3: 轉成 File');

      // 🔥 關鍵：Blob → File
      const newFile = new File([optimized], file.name, {
        type: 'image/jpeg',
      });

      console.log('📸 Step 4: 上傳');

      await uploadPhoto(newFile, currentBaby.id, caption, takenAt);

      console.log('📸 Step 5: 完成');

    } catch (err) {
      console.error('❌ Upload flow error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 to-background pb-20">
      
      <header className="sticky top-0 z-40 bg-blue-600 text-white">
        <div className="container flex flex-col gap-1 py-2 px-4">
          <div className="flex justify-center">
            <HeaderBranding className="text-white" />
          </div>

          <div className="flex items-center justify-between">
            <BabySelector onAddBaby={() => setAddBabyOpen(true)} showAddBaby={false} />

            <div className="flex items-center gap-1">
              {currentBaby?.gender === 'male' ? (
                <img src={footprintBoy} className="h-5 w-5" />
              ) : currentBaby?.gender === 'female' ? (
                <img src={footprintGirl} className="h-5 w-5" />
              ) : (
                <Footprints className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{t('growth.title')}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container px-4 py-4">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-12">
            {t('common.loading')}
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
            <ImageOff className="h-12 w-12" />
            <p>{t('growth.no_photos')}</p>
            <p className="text-sm">{t('growth.add_hint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onEdit={setEditingPhoto}
                onDelete={setDeletingPhoto}
              />
            ))}
          </div>
        )}
      </main>

      <Button
        size="icon"
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setAddOpen(true)}
      >
        <Plus className="h-6 w-6" />
      </Button>

      <AddPhotoDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleUpload}
        uploading={uploading}
      />

      <EditPhotoDialog
        photo={editingPhoto}
        open={!!editingPhoto}
        onOpenChange={(v) => {
          if (!v) setEditingPhoto(null);
        }}
        onSubmit={(id, caption, takenAt) =>
          updatePhoto.mutate({ id, caption, takenAt })
        }
      />

      <AlertDialog
        open={!!deletingPhoto}
        onOpenChange={(v) => {
          if (!v) setDeletingPhoto(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('growth.delete_photo_confirm')}</AlertDialogTitle>
            <AlertDialogDescription>{t('growth.cannot_undo')}</AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingPhoto) {
                  deletePhoto.mutate(deletingPhoto);
                  setDeletingPhoto(null);
                }
              }}
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AddBabyDialog open={addBabyOpen} onOpenChange={setAddBabyOpen} />

      <BottomNav />
    </div>
  );
}