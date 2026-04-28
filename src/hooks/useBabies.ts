import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { Baby } from '@/types'
import { useState } from 'react'
import { toast } from '@/hooks/use-toast'

export function useBabies() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // 🔥 UX state
  const [uploading, setUploading] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

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

  // 🖼️ compress image（簡單版）
  const compressAvatar = async (file: File): Promise<File> => {
    return file // 先不壓縮（穩定優先）
  }

  // 🚀 upload avatar（最終版）
  const uploadAvatar = async (babyId: string, file: File) => {
    if (!user) throw new Error('No user')

    setUploading(babyId)
    setUploadProgress(0)

    try {
      const compressed = await compressAvatar(file)

      const prevBaby = babies.find(b => b.id === babyId)
      const prevUrl = prevBaby?.avatar_url || null

      const fileExt = compressed.name.split('.').pop()
      const filePath = `${user.id}/${babyId}/${crypto.randomUUID()}.${fileExt}`

      // fake progress
      const interval = setInterval(() => {
        setUploadProgress(p => (p < 90 ? p + 10 : p))
      }, 200)

      const { error: uploadError } = await supabase.storage
        .from('baby-avatars')
        .upload(filePath, compressed, { upsert: true })

      clearInterval(interval)

      if (uploadError) throw uploadError

      setUploadProgress(100)

      const { data } = supabase.storage
        .from('baby-avatars')
        .getPublicUrl(filePath)

      const newUrl = data.publicUrl

      // ⚡ optimistic update
      queryClient.setQueryData(['babies', user?.id], (old: Baby[] | undefined) => {
        if (!old) return old
        return old.map(b =>
          b.id === babyId ? { ...b, avatar_url: newUrl } : b
        )
      })

      const { error: updateError } = await supabase
        .from('babies')
        .update({ avatar_url: newUrl })
        .eq('id', babyId)
        .eq('user_id', user.id)

      if (updateError) {
        await queryClient.invalidateQueries({ queryKey: ['babies', user?.id] })
        throw updateError
      }

      // 🧹 delete old
      if (prevUrl && prevUrl.includes('/baby-avatars/')) {
        try {
          const path = prevUrl.split('/baby-avatars/')[1]
          if (path) {
            await supabase.storage.from('baby-avatars').remove([path])
          }
        } catch {}
      }

      return newUrl
    } finally {
      setTimeout(() => {
        setUploading(null)
        setUploadProgress(0)
      }, 500)
    }
  }

  return {
    babies,
    loading,
    refetch,
    addBaby: addBabyMutation.mutateAsync,
    updateBaby: updateBabyMutation.mutateAsync,
    deleteBaby: deleteBabyMutation.mutateAsync,
    uploadAvatar,
    uploading,
    uploadProgress,
  }
}