import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Baby } from '@/types';
import { useBabies } from '@/hooks/useBabies';

interface BabyContextType {
  babies: Baby[];
  currentBaby: Baby | null;
  setCurrentBaby: (baby: Baby | null) => void;
  loading: boolean;
  refetch: () => void;
}

const BabyContext = createContext<BabyContextType | undefined>(undefined);

export function BabyProvider({ children }: { children: ReactNode }) {
  const { babies, loading, refetch } = useBabies();
  const [currentBaby, setCurrentBaby] = useState<Baby | null>(null);

  // 當寶寶列表載入後，自動選擇第一個寶寶
  useEffect(() => {
    if (!loading && babies.length > 0 && !currentBaby) {
      // 嘗試從 localStorage 恢復上次選擇的寶寶
      const savedBabyId = localStorage.getItem('currentBabyId');
      const savedBaby = babies.find(b => b.id === savedBabyId);
      setCurrentBaby(savedBaby || babies[0]);
    }
  }, [babies, loading, currentBaby]);

  // 當選擇寶寶時，保存到 localStorage
  const handleSetCurrentBaby = (baby: Baby | null) => {
    setCurrentBaby(baby);
    if (baby) {
      localStorage.setItem('currentBabyId', baby.id);
    } else {
      localStorage.removeItem('currentBabyId');
    }
  };

  return (
    <BabyContext.Provider value={{ 
      babies, 
      currentBaby, 
      setCurrentBaby: handleSetCurrentBaby, 
      loading,
      refetch 
    }}>
      {children}
    </BabyContext.Provider>
  );
}

export function useBabyContext() {
  const context = useContext(BabyContext);
  if (context === undefined) {
    throw new Error('useBabyContext must be used within a BabyProvider');
  }
  return context;
}
