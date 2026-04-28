import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Baby } from '@/types'
import { toast } from '@/hooks/use-toast'

export function useBabies() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // 📦 fetch babies
  const { data: babies = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['babies', user?.id],
    queryFn: async (): Promise<Baby[]> => {
      if (!user) return []

      const { data, error } = await supabase
        .from('babies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    },
    enabled: !!user,
  })

  // ➕ add baby
  const addBabyMutation = useMutation({
    mutationFn: async (formData: Partial<Baby>) => {
      if (!user) throw new Error('Not logged in')

      const { data, error } = await supabase
        .from('babies')
        .insert({
          user_id: user.id,
          name: formData.name,
          birth_date: formData.birth_date,
          gender: formData.gender || null,
        })
        .select()
        .single()

      if (error) throw error
      return data as Baby
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies', user?.id] })
      toast({
        title: 'Success',
        description: 'Baby added',
      })
    },
  })

  // ✏️ update baby
  const updateBabyMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Baby> & { id: string }) => {
      if (!user) throw new Error('Not logged in')

      const { data, error } = await supabase
        .from('babies')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data as Baby
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies', user?.id] })
    },
  })

  // ❌ delete baby
  const deleteBabyMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('Not logged in')

      const { error } = await supabase
        .from('babies')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['babies', user?.id] })
    },
  })

  // 🚀 upload avatar（🔥最終完整版）
  const uploadAvatar = async (babyId: string, file: File) => {
    if (!user) throw new Error('No user')

    // ✅ 1. 先取得舊 avatar
    const { data: oldBaby } = await supabase
      .from('babies')
      .select('avatar_url')
      .eq('id', babyId)
      .single()

    // ✅ 2. 用新檔名（防 cache）
    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/${babyId}/${Date.now()}.${fileExt}`

    // ✅ 3. 上傳
    const { error: uploadError } = await supabase.storage
      .from('baby-avatars')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    // ✅ 4. 取得 public URL
    const { data } = supabase.storage
      .from('baby-avatars')
      .getPublicUrl(filePath)

    const publicUrl = data.publicUrl

    // ✅ 5. 更新 DB
    const { error: updateError } = await supabase
      .from('babies')
      .update({
  avatar_url: publicUrl,
  updated_at: new Date().toISOString(),
})
      .eq('id', babyId)
      .eq('user_id', user.id)

    if (updateError) throw updateError

    // ✅ 6. 刪舊圖（🔥關鍵）
    if (oldBaby?.avatar_url) {
      try {
        const url = new URL(oldBaby.avatar_url)

        const path = decodeURIComponent(
          url.pathname.split('/object/public/baby-avatars/')[1]
        )

        if (path) {
          await supabase.storage
            .from('baby-avatars')
            .remove([path])
        }
      } catch (err) {
        console.warn('⚠️ delete old avatar failed:', err)
      }
    }

    // ✅ 7. refresh
    await queryClient.invalidateQueries({ queryKey: ['babies', user?.id] })

    return publicUrl
  }

  return {
    babies,
    loading,
    refetch,
    addBaby: addBabyMutation.mutateAsync,
    updateBaby: updateBabyMutation.mutateAsync,
    deleteBaby: deleteBabyMutation.mutateAsync,
    uploadAvatar,
  }
}