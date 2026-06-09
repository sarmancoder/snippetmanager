
import { createContext, PropsWithChildren, useContext, useState } from 'react';

const ConfigContextContext = createContext<any>(null);

type ConfigContextContextProviderProps = {}

function useConfigContextContextData() {
    const [open, setOpen] = useState(false);
    const [unabled, setUnabled] = useState(false)
    
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return {
        open, handleOpen, handleClose,
        unabled, setUnabled
    };
}

export default function ConfigContextContextProvider({ children }: PropsWithChildren<ConfigContextContextProviderProps>) {
    const data = useConfigContextContextData();
    return (
        <ConfigContextContext.Provider value={data}>
            {children}
        </ConfigContextContext.Provider>
    )
};

export function useConfigContextContext() {
    const data = useContext<ReturnType<typeof useConfigContextContextData>>(ConfigContextContext);
    if (!data) throw new Error('useMyContext must be used within a MyProvider');
    return data;
}
