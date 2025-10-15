import React, { useEffect, useMemo, useState } from 'react';
import { translations, codeToTitle, titleToCode, getByPath, LanguageCode } from './translations';
import { I18nContext, type I18nContextType } from './context';

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [langCode, setLangCode] = useState<LanguageCode>('en');

  // Initialize from localStorage if present: 'community_lang' can be a code or a title
  useEffect(() => {
    try {
      const stored = localStorage.getItem('community_lang');
      if (stored) {
        const normalized = (['en','af','zu','xh','st','tn','ts','ss','ve','nr'] as string[]).includes(stored)
          ? (stored as LanguageCode)
          : titleToCode(stored);
        setLangCode(normalized);
      }
    } catch (_e) { void 0; }
  }, []);

  const setLanguage = (codeOrTitle: LanguageCode | string) => {
    const code: LanguageCode = (['en','af','zu','xh','st','tn','ts','ss','ve','nr'] as string[]).includes(codeOrTitle as string)
      ? (codeOrTitle as LanguageCode)
      : titleToCode(String(codeOrTitle));
    setLangCode(code);
  try { localStorage.setItem('community_lang', code); } catch (_e) { void 0; }
  };

  const langTitle = useMemo(() => codeToTitle(langCode), [langCode]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const dict = translations[langTitle] || translations['English'];
    const raw = getByPath(dict, key) || getByPath(translations['English'], key) || key;
    if (!params) return raw;
    return Object.keys(params).reduce((acc, k) => {
      const val = String(params[k]);
      return acc.replace(new RegExp(`\\{${k}\\}`, 'g'), val);
    }, raw);
  };

  const value: I18nContextType = { langCode, langTitle, setLanguage, t };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

