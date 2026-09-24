
import deepEqual from '@/lib/deepEqual';
import { VsCodeSnippet } from '@/lib/validations';
import { writeFile } from '@/lib/filesystem';
import { useLocalStorage } from '@uidotdev/usehooks';
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { parseJsonc } from '@/lib/jsonc';

const AppProviderContext = createContext<any>(null);

type AppProviderContextProviderProps = {
    pathFolder?: string
    activeFile?: string
}

function useAppProviderContextData() {
    const dualEditorRef = useRef<any>(null)
    const [adjust, setAdjust] = useLocalStorage('adjust', false)
    const [pathFolder, setPathFolder] = useState('')
    const [activeFile, setActiveFile] = useState('')
    const [jsonSnippets, setJsonSnippets] = useState('')
    const [selectedSnippet, setSelectedSnippet] = useState<Partial<VsCodeSnippet>>({})
    const [saved, setSaved] = useState(true)

    useEffect(() => {
        dualEditorRef.current!.setContent(JSON.stringify(selectedSnippet, null, 4))
    }, [selectedSnippet])

    async function writeInFile(datastr: string) {
        await writeFile(pathFolder, activeFile, datastr)
    }

    async function save() {
        toast('Guardando datos')
        const dataSnippets: Record<string, any> = parseJsonc(jsonSnippets)
        const dataCurrent = dualEditorRef.current.getCurrentContent()
        dataSnippets[selectedSnippet.key as any] = dataCurrent
        const datastr = JSON.stringify(dataSnippets, null, 4)
        setJsonSnippets(datastr)
        await writeInFile(datastr)
        setSelectedSnippet({
            ...dataSnippets[selectedSnippet.key as any],
            key: selectedSnippet.key
        })
        setSaved(true)
    }

    function areEqual() {
        if (!selectedSnippet.key) return true

        const currentSnippet = dualEditorRef.current?.getCurrentContent?.()
        if (!currentSnippet) return true

        const { key, ...snippet } = selectedSnippet
        const equal = deepEqual(currentSnippet, snippet)

        if (!equal) {
            console.log('are equal', { currentSnippet, snippet, equal })
        }

        return equal
    }

    return {
        dualEditorRef,
        save, areEqual, writeInFile,
        pathFolder, setPathFolder,
        adjust, setAdjust,
        activeFile, setActiveFile,
        jsonSnippets, setJsonSnippets,
        selectedSnippet, setSelectedSnippet,
        saved, setSaved: (e: boolean) => {
            if (!e) {
                console.log('saved false')
                console.trace()
            }
            setSaved(e)
        }
    };
}

export default function AppProviderContextProvider({ children }: PropsWithChildren<AppProviderContextProviderProps>) {
    const data = useAppProviderContextData();
    return (
        <AppProviderContext.Provider value={data}>
            {children}
        </AppProviderContext.Provider>
    )
};

export function useAppProviderContext() {
    const data = useContext<ReturnType<typeof useAppProviderContextData>>(AppProviderContext);
    if (!data) throw new Error('useMyContext must be used within a MyProvider');
    return data;
}
