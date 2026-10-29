import React, { createContext, useContext, useState } from 'react';
import { TRANSLATIONS, Language } from '../constants/translations';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof TRANSLATIONS.en) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'hi',
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => TRANSLATIONS.hi[key] || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>('hi');

  const toggleLang = () => {
    setLang((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  const t = (key: keyof typeof TRANSLATIONS.en): string => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || (key as string);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
