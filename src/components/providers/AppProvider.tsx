
import deepEqual from '@/lib/deepEqual';
import { VsCodeSnippet } from '@/lib/validations';
import { createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

const AppProviderContext = createContext<any>(null);

type AppProviderContextProviderProps = {
    pathFolder?: string
    activeFile?: string
}

function useAppProviderContextData() {
    const dualEditorRef = useRef<any>(null)

    const [pathFolder, setPathFolder] = useState('')
    const [activeFile, setActiveFile] = useState('')
    const [jsonSnippets, setJsonSnippets] = useState('')
    const [selectedSnippet, setSelectedSnippet] = useState<Partial<VsCodeSnippet>>({})
    const [saved, setSaved] = useState(true)

    useEffect(() => {
        dualEditorRef.current!.setContent(JSON.stringify(selectedSnippet, null, 4))
    }, [selectedSnippet])

    function save() {
        toast('Guardando datos')
        setSaved(true)
    }

    function areEqual() {
        if (!selectedSnippet.key) return true
        const currentSnippet = dualEditorRef.current.getCurrentContent()
        const {key, scope, ...snippet} = selectedSnippet
        const equal = deepEqual(currentSnippet, snippet)
        if (!equal) {
            console.log('are equal', {currentSnippet, snippet, equal})
        }
        return deepEqual(currentSnippet, snippet)
    }

    return {
        dualEditorRef,
        save, areEqual,
        pathFolder, setPathFolder,
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
