import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TRANSLATIONS, Language } from '../constants/translations';

const LANG_STORAGE_KEY = '@milk_hisab_language_pref';

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
  const [lang, setLangState] = useState<Language>('hi');

  // Load cached language preference on app startup
  useEffect(() => {
    const loadCachedLanguage = async () => {
      try {
        const cached = await AsyncStorage.getItem(LANG_STORAGE_KEY);
        if (cached === 'hi' || cached === 'en') {
          setLangState(cached);
        }
      } catch (err) {
        console.warn('Could not read cached language', err);
      }
    };
    loadCachedLanguage();
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    AsyncStorage.setItem(LANG_STORAGE_KEY, newLang).catch((err) => {
      console.warn('Could not cache language', err);
    });
  };

  const toggleLang = () => {
    const nextLang: Language = lang === 'hi' ? 'en' : 'hi';
    setLang(nextLang);
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
