import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'
import { Baby } from '@/types'
import { useBabies } from '@/hooks/useBabies'

interface BabyContextType {
  babies: Baby[]
  currentBaby: Baby | null
  setCurrentBabyId: (id: string | null) => void
  loading: boolean
  refetch: () => void
}

const BabyContext = createContext<BabyContextType | undefined>(undefined)

export function BabyProvider({ children }: { children: ReactNode }) {
  const { babies, loading, refetch } = useBabies()

  const [currentBabyId, setCurrentBabyId] = useState<string | null>(null)

  // ✅ 初始化 currentBabyId（只做一次）
  useEffect(() => {
    if (!loading && babies.length > 0 && !currentBabyId) {
      const savedId = localStorage.getItem('currentBabyId')
      const valid = babies.find(b => b.id === savedId)

      const id = valid ? valid.id : babies[0].id

      setCurrentBabyId(id)
      localStorage.setItem('currentBabyId', id)
    }
  }, [babies, loading, currentBabyId])

  // 🔥 核心：永遠從 babies 推導 currentBaby
  const currentBaby = useMemo(() => {
    if (!currentBabyId) return null
    return babies.find(b => b.id === currentBabyId) || null
  }, [babies, currentBabyId])

  // ✅ setter（只改 id）
  const handleSetCurrentBabyId = (id: string | null) => {
    setCurrentBabyId(id)

    if (id) {
      localStorage.setItem('currentBabyId', id)
    } else {
      localStorage.removeItem('currentBabyId')
    }
  }

  return (
    <BabyContext.Provider
      value={{
        babies,
        currentBaby,
        setCurrentBabyId: handleSetCurrentBabyId,
        loading,
        refetch,
      }}
    >
      {children}
    </BabyContext.Provider>
  )
}

export function useBabyContext() {
  const context = useContext(BabyContext)

  if (!context) {
    throw new Error('useBabyContext must be used within BabyProvider')
  }

  return context
}