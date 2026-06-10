
import { useLocalStorage } from '@uidotdev/usehooks';
import { createContext, PropsWithChildren, useContext, useRef } from 'react';
import { messagesEsEs } from './messages/es-ES';
import { messagesEnUk } from './messages/en-UK';

function stpl(template, data = {}) {
  return template.replace(/\{([\w.]+)\}/g, (match, path) => {
    const keys = path.split('.');
    let value = Array.isArray(data) ? data[parseInt(keys[0])] : data;
    
    if (!Array.isArray(data)) {
      for (const key of keys) {
        value = value?.[key];
      }
    }
    
    return value !== undefined ? String(value) : match;
  });
}

const I18nProviderContext = createContext<any>(null);

type I18nProviderContextProviderProps = {}

const languagesAvailable = [
    { label: 'Español', value: 'es-ES' },
    { label: 'Ingles', value: 'en-UK' },
] as const

type langs = (typeof languagesAvailable)[number]['value']; // 'es-ES' | 'en-UK'

const dictionaries: Record<langs, Record<string, string>> = {
    'es-ES': messagesEsEs,
    'en-UK': messagesEnUk
}

function useI18nProviderContextData() {
    const langLocalStorageKey = useRef('lang')
    const [lang, setLang] = useLocalStorage(langLocalStorageKey.current, languagesAvailable[0].value)

    return {
        languagesAvailable,
        lang, setLang,
        $t(key: keyof typeof messagesEsEs, args = {}) {
            return stpl(dictionaries[lang][key], args)
        }
    };
}

export default function I18nProviderContextProvider({ children }: PropsWithChildren<I18nProviderContextProviderProps>) {
    const data = useI18nProviderContextData();
    return (
        <I18nProviderContext.Provider value={data}>
            {children}
        </I18nProviderContext.Provider>
    )
};

export function useI18nProviderContext() {
    const data = useContext<ReturnType<typeof useI18nProviderContextData>>(I18nProviderContext);
    if (!data) throw new Error('useMyContext must be used within a MyProvider');
    return data;
}
