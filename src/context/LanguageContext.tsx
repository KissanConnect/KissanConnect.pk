import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../translations/en';
import { ur } from '../translations/ur';

type Language = 'en' | 'ur';

interface LanguageContextType {
  lang: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: typeof en;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('kissan_connect_lang');
    return saved === 'ur' ? 'ur' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('kissan_connect_lang', lang);
    const html = document.documentElement;
    if (lang === 'ur') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ur');
      document.body.classList.add('font-urdu');
      document.body.classList.remove('font-english');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
      document.body.classList.add('font-english');
      document.body.classList.remove('font-urdu');
    }
  }, [lang]);

  const toggleLanguage = () => {
    setLangState((prev) => (prev === 'en' ? 'ur' : 'en'));
  };

  const setLanguage = (newLang: Language) => {
    setLangState(newLang);
  };

  const t = lang === 'ur' ? ur : en;
  const isRTL = lang === 'ur';

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
