import { useLocalStorage } from '@uidotdev/usehooks';
import { createContext, PropsWithChildren, useContext, useMemo, useRef } from 'react';
import { messagesEsEs } from './messages/es-ES';
import { messagesEnUk } from './messages/en-UK';

const langLocalStorageKey = 'lang';

function stpl(template: string, data: any = {}) {
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
type langs = 'es-ES' | 'en-UK';

const dictionaries: Record<langs, Record<string, string>> = {
    'es-ES': messagesEsEs,
    'en-UK': messagesEnUk
};

// Función auxiliar de rescate (para usar fuera de componentes React si fuera necesario)
export function getMessage(key: keyof typeof messagesEsEs, args = {}) {
    const lang: langs = localStorage.getItem(langLocalStorageKey) as langs || 'es-ES';

    if (!dictionaries[lang] || !dictionaries[lang][key]) {
        return key;
    }
    return stpl(dictionaries[lang][key], args);
}

function useI18nProviderContextData() {
    const langLocalStorageKeyRef = useRef(langLocalStorageKey);
    
    // 1. Inicializamos el estado de manera reactiva con useLocalStorage
    const [lang, setLang] = useLocalStorage<langs>(
        langLocalStorageKeyRef.current, 
        (localStorage.getItem(langLocalStorageKey) as langs) || 'es-ES'
    );

    // 2. Definimos la función de traducción principal ($t) ligada al estado actual
    const $t = (key: keyof typeof messagesEsEs, args = {}) => {
        if (!dictionaries[lang] || !dictionaries[lang][key]) {
            return key;
        }
        return stpl(dictionaries[lang][key], args);
    };

    // 3. Generamos la lista de idiomas de forma dinámica para que reaccione a los cambios de idioma
    const languagesAvailable = useMemo(() => ([
        { label: $t('lang-spanish'), value: 'es-ES' as langs },
        { label: $t('lang-english'), value: 'en-UK' as langs },
    ]), [lang]);

    return {
        languagesAvailable,
        lang, 
        setLang,
        $t
    };
}

export default function I18nProviderContextProvider({ children }: PropsWithChildren<I18nProviderContextProviderProps>) {
    const data = useI18nProviderContextData();
    return (
        <I18nProviderContext.Provider value={data}>
            {children}
        </I18nProviderContext.Provider>
    );
}

export function useI18nProviderContext() {
    const data = useContext<ReturnType<typeof useI18nProviderContextData>>(I18nProviderContext);
    if (!data) throw new Error('useI18nProviderContext must be used within a I18nProviderContextProvider');
    return data;
}