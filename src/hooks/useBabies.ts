import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Baby, AddBabyFormData } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n';

export function useBabies() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  // ✅ 讀取 babies
  const { data: babies = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['babies', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Baby[];
    },
    enabled: !!user,
  });

  // ✅ 新增 baby
  const addBabyMutation = useMutation({
    mutationFn: async (formData: AddBabyFormData) => {
      if (!user) throw new Error(t('toast.not_logged_in'));

      const { data, error } = await supabase
        .from('babies')
        .insert({
          user_id: user.id,
          name: formData.name,
          birth_date: formData.birth_date,
          gender: formData.gender || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Baby;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies'] });
      toast({
        title: t('toast.success'),
        description: t('toast.baby_added'),
      });
    },
  });

  // ✅ 更新 baby
  const updateBabyMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Baby> & { id: string }) => {
      const { data, error } = await supabase
        .from('babies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Baby;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies'] });
    },
  });

  // ✅ 刪除 baby
  const deleteBabyMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('babies')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies'] });
    },
  });

  // 🔥 壓縮 avatar
  const compressAvatar = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const MAX_SIZE = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);

            const newFile = new File([blob], 'avatar.jpg', {
              type: 'image/jpeg',
            });

            resolve(newFile);
          },
          'image/jpeg',
          0.7
        );
      };

      reader.readAsDataURL(file);
    });
  };

  // 🔐 安全版 Avatar 上傳（已修正）
  const uploadAvatar = async (babyId: string, file: File) => {
    try {
      if (!user) throw new Error('Not logged in');

      const finalFile = await compressAvatar(file);

      // ✅ 关键：user.id + babyId
      const filePath = `${user.id}/${babyId}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('baby-avatars')
        .upload(filePath, finalFile, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) throw uploadError;

      // ✅ private bucket → 用 signed URL
      const { data } = await supabase.storage
        .from('baby-avatars')
        .createSignedUrl(filePath, 60 * 60);

      const avatarUrl = data?.signedUrl;

      await updateBabyMutation.mutateAsync({
        id: babyId,
        avatar_url: avatarUrl,
      } as any);

      return avatarUrl;

    } catch (err: any) {
      console.error('🔥 Avatar upload error:', err);

      toast({
        title: t('toast.upload_failed'),
        description: err.message,
        variant: 'destructive',
      });

      throw err;
    }
  };

  return {
    babies,
    loading,
    refetch,
    addBaby: addBabyMutation.mutateAsync,
    updateBaby: updateBabyMutation.mutateAsync,
    deleteBaby: deleteBabyMutation.mutateAsync,
    uploadAvatar,
    isAdding: addBabyMutation.isPending,
    isUpdating: updateBabyMutation.isPending,
    isDeleting: deleteBabyMutation.isPending,
  };
}