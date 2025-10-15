import { createContext } from 'react';
import type { LanguageCode } from './translations';

export type I18nContextType = {
  langCode: LanguageCode;
  langTitle: string;
  setLanguage: (codeOrTitle: LanguageCode | string) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export const I18nContext = createContext<I18nContextType | undefined>(undefined);
