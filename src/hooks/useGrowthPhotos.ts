import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GrowthPhoto } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n';
import { compressImage } from '@/utils/image';

export function useGrowthPhotos(babyId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);

  // ✅ 讀取照片（修正版）
  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['growth-photos', babyId],
    queryFn: async () => {
      if (!babyId) return [];

      const { data, error } = await supabase
        .from('growth_photos')
        .select('*')
        .eq('baby_id', babyId)
        .order('taken_at', { ascending: false });

      if (error) throw error;

      // 🔐 转 signed URL + 保留 path
      const photosWithSignedUrl = await Promise.all(
        data.map(async (photo) => {
          const path = photo.image_url; // 原始 path

          const { data: signed, error } = await supabase.storage
            .from('growth-photos')
            .createSignedUrl(path, 3600);

          if (error) {
            console.error('Signed URL error:', error);
            return {
              ...photo,
              storage_path: path,
            };
          }

          return {
            ...photo,
            image_url: signed?.signedUrl || '',
            storage_path: path, // 🔥 关键
          };
        })
      );

      return photosWithSignedUrl as any;
    },
    enabled: !!babyId,
  });

  // ✅ 上傳
  const uploadPhoto = async (
    file: File,
    babyId: string,
    caption: string,
    takenAt: string
  ) => {
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not logged in');

      const compressedFile = await compressImage(file);

      if (compressedFile.size > 2 * 1024 * 1024) {
        throw new Error('Image too large (max 2MB)');
      }

      const filePath = `${user.id}/${babyId}/${crypto.randomUUID()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('growth-photos')
        .upload(filePath, compressedFile, {
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      const { error: insertError } = await supabase
        .from('growth_photos')
        .insert({
          baby_id: babyId,
          image_url: filePath,
          caption: caption || null,
          taken_at: takenAt,
        });

      if (insertError) throw insertError;

      queryClient.invalidateQueries({ queryKey: ['growth-photos', babyId] });

      toast({ title: t('toast.photo_uploaded') });

    } catch (err: any) {
      console.error('🔥 UPLOAD ERROR:', err);

      toast({
        title: t('toast.upload_failed'),
        description: err.message,
        variant: 'destructive',
      });

      throw err;
    } finally {
      setUploading(false);
    }
  };

  // ✅ 刪除（修正版）
  const deletePhoto = useMutation({
    mutationFn: async (photo: any) => {
      const path = photo.storage_path; // 🔥 用这个才对

      const { error: storageError } = await supabase.storage
        .from('growth-photos')
        .remove([path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from('growth_photos')
        .delete()
        .eq('id', photo.id);

      if (dbError) throw dbError;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growth-photos', babyId] });
      toast({ title: t('toast.photo_deleted') });
    },

    onError: (err: any) => {
      toast({
        title: t('toast.delete_failed'),
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  return {
    photos,
    isLoading,
    uploading,
    uploadPhoto,
    deletePhoto,
  };
}