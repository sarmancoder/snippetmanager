
import { createContext, PropsWithChildren, useContext, useState } from 'react';

const AppProviderContext = createContext<any>(null);

type AppProviderContextProviderProps = {
    pathFolder?: string
    activeFile?: string
}

function useAppProviderContextData() {
    const [pathFolder, setPathFolder] = useState('')
    const [activeFile, setActiveFile] = useState('')
    const [jsonSnippets, setJsonSnippets] = useState('')
    return {
        pathFolder, setPathFolder,
        activeFile, setActiveFile,
        jsonSnippets, setJsonSnippets
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
