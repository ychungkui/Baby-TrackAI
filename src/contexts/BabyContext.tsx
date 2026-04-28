import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Baby } from '@/types'
import { useBabies } from '@/hooks/useBabies'

interface BabyContextType {
  babies: Baby[]
  currentBaby: Baby | null
  setCurrentBaby: (baby: Baby | null) => void
  loading: boolean
  refetch: () => void
}

const BabyContext = createContext<BabyContextType | undefined>(undefined)

export function BabyProvider({ children }: { children: ReactNode }) {
  const { babies, loading, refetch } = useBabies()
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null)

  // ✅ 初始選擇 baby（只在第一次）
  useEffect(() => {
    if (!loading && babies.length > 0 && !currentBaby) {
      const savedBabyId = localStorage.getItem('currentBabyId')
      const savedBaby = babies.find(b => b.id === savedBabyId)
      setCurrentBaby(savedBaby || babies[0])
    }
  }, [babies, loading, currentBaby])

  // 🔥🔥🔥 關鍵修復：同步最新 baby（解決 avatar 不更新）
  useEffect(() => {
    if (!currentBaby) return

    const updated = babies.find(b => b.id === currentBaby.id)

    // 👉 只有當資料真的變了才更新（避免無限 loop）
    if (
      updated &&
      (
        updated.avatar_url !== currentBaby.avatar_url ||
        updated.name !== currentBaby.name ||
        updated.birth_date !== currentBaby.birth_date
      )
    ) {
      setCurrentBaby(updated)
    }
  }, [babies, currentBaby])

  // ✅ 設定 currentBaby 並存 localStorage
  const handleSetCurrentBaby = (baby: Baby | null) => {
    setCurrentBaby(baby)

    if (baby) {
      localStorage.setItem('currentBabyId', baby.id)
    } else {
      localStorage.removeItem('currentBabyId')
    }
  }

  return (
    <BabyContext.Provider
      value={{
        babies,
        currentBaby,
        setCurrentBaby: handleSetCurrentBaby,
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

  if (context === undefined) {
    throw new Error('useBabyContext must be used within a BabyProvider')
  }

  return context
}