import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { EscribirArchivo, LeerArchivo } from '../wailsjs/go/main/AdministradorArchivos';
import confirmAction from './utils/ConfirmAction';
import { SnippetCreationObject } from './utils/CreateSnippet';
import alertMessage from './utils/AlertMessage';
import { useLocalStorage } from '@uidotdev/usehooks';
import { PaletteMode } from '@mui/material';
import { useI18nProviderContext } from './I18nProvider';

const MyContext = createContext<any>(null);

export type SnippetType = { body: string[], scope: string, isFileTemplate: boolean, description: string, prefix: string }
type SnippetArrayElem = SnippetType & { key: string }

function useAppSnippetsContext() {
    const { $t } = useI18nProviderContext();

    const [iaSnippet, setIaSnippet] = useState({})
    const [currentPathFile, setCurrentPathFile] = useState('');
    const [currentPathContent, setCurrentPathContent] = useState('');
    const [snippetsList, setSnippetsList] = useState<SnippetArrayElem[]>([])
    const [currentSnippetKey, setCurrentSnippetKey] = useState('')
    const [saved, setsaved] = useState(true)
    const [wordWrapOn, setWordWrapOn] = useLocalStorage('word-wrap', false)
    const [paletteMode, setPaletteMode] = useLocalStorage<PaletteMode>('palette-mode-mui', 'light')
    const [snippetEditing, setSnippetEditing] = useState<SnippetType>({
        body: [],
        scope: '',
        description: '',
        prefix: '',
        isFileTemplate: false
    })

    const activeSnippet = useMemo(() => {
        const current = snippetsList.find(a => a.key == currentSnippetKey)
        if (!current) return null
        return {
            prefix: current.prefix,
            description: current.description,
            scope: current.scope,
            isFileTemplate: current.isFileTemplate ?? false,
            body: current.body
        }
    }, [currentSnippetKey])

    useEffect(() => {
        if (currentPathFile.length == 0) {
            setSnippetsList([])
        }
    }, [currentPathFile])

    useEffect(() => {
        LeerArchivo(currentPathFile).then(r => {
            try {
                const data: Record<string, SnippetType> = JSON.parse(r)
                const snippetsArray = Object.keys(data).reduce<SnippetArrayElem[]>((acc, key) => {
                    acc.push({ key, ...data[key] });
                    return acc;
                }, []);
                setCurrentPathContent(r)
                setSnippetsList(snippetsArray);
            } catch (error) {
                alertMessage({
                    message: $t('error-invalid-json-file')
                })
                setCurrentPathFile('')
            }
        })
    }, [currentPathFile])

    async function saveSnippet() {
        const newList = snippetsList.map(a => {
            if (a.key == currentSnippetKey) {
                return {
                    ...snippetEditing,
                    key: a.key
                }
            }
            return a
        })
        setSnippetsList(newList as any)
    }

    async function saveList() {
        if (currentPathFile === '') return

        const snippetObj = snippetsList.reduce((acc, { key, ...curr }) => {
            acc[key] = key == currentSnippetKey ? snippetEditing : curr;
            return acc;
        }, {});

        const jsonString = JSON.stringify(snippetObj, null, 4);
        await EscribirArchivo(currentPathFile, jsonString);
    }

    async function lookForSave() {
        if (saved) return true

        const change = await confirmAction({
            message: $t('confirm-save-changes'),
        })

        if (change == null) return false

        if (change == true) {
            await saveSnippet()
        }

        setsaved(true)
        return true
    }

    useEffect(() => void saveList(), [snippetsList])

    useEffect(() => {
        setCurrentSnippetKey('')
    }, [currentPathFile])

    return {
        iaSnippet, setIaSnippet,
        paletteMode, setPaletteMode,
        currentPathFile, setCurrentPathFile,
        currentPathContent, setCurrentPathContent,
        setSnippetsList, snippetsList, saved, setsaved, activeSnippet,
        setCurrentSnippetKey, currentSnippetKey,
        snippetEditing, setSnippetEditing,
        saveSnippet, lookForSave,
        wordWrapOn, setWordWrapOn,

        insertSnippet(snippet: SnippetCreationObject) {
            const newSnippet: SnippetArrayElem = {
                ...snippet,
                key: snippet.prefix + new Date().getTime(),
                body: [],
                scope: '',
                isFileTemplate: false
            }

            const newSnippetList: typeof snippetsList = [...snippetsList, newSnippet]

            setSnippetsList(newSnippetList)
            setCurrentSnippetKey(newSnippet.key)
        },

        deleteSnippet(key: string) {
            setSnippetsList([...snippetsList.filter(a => a.key != key)])

            if (key == currentSnippetKey) {
                setCurrentSnippetKey('')
            }
        }
    };
}

export default function AppContextProvider({ children }) {
    const data = useAppSnippetsContext();

    return (
        <MyContext.Provider value={data}>
            {children}
        </MyContext.Provider>
    )
};

export function useAppContext() {
    const data = useContext<ReturnType<typeof useAppSnippetsContext>>(MyContext);

    if (!data) {
        throw new Error('useMyContext must be used within a MyProvider');
    }

    return data;
}