import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { zh, TranslationDict } from './locales/zh';
import { en } from './locales/en';
import { ms } from './locales/ms';

export type Language = 'zh' | 'en' | 'ms';

const dictionaries: Record<Language, TranslationDict> = { zh, en, ms };

export const LANGUAGE_LABELS: Record<Language, string> = {
  zh: '中文',
  en: 'English',
  ms: 'Bahasa Melayu',
};

function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((acc, key) => acc?.[key], obj) ?? path;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  tArray: (key: string) => string[];
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem('app-language');
    if (saved && (saved === 'zh' || saved === 'en' || saved === 'ms')) return saved;
  } catch {}
  return 'zh';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getSavedLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem('app-language', lang); } catch {}
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = getNestedValue(dictionaries[language], key);
    if (typeof value !== 'string') return key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, String(v));
      });
    }
    return value;
  }, [language]);

  const tArray = useCallback((key: string): string[] => {
    const value = getNestedValue(dictionaries[language], key);
    return Array.isArray(value) ? value : [];
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tArray }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
