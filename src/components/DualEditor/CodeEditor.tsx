import Editor from '@monaco-editor/react';
import { useEffect, useState } from 'react';

type CodeEditorProps = {
    ref: React.RefObject<any>
}

export default function CodeEditor ({ref}: CodeEditorProps) {
    const [heightInPixels, setHeightInPixels] = useState(400); // Un alto por defecto

    useEffect(() => {
        if (!ref.current) return;

        // Creamos un observador que mide el contenedor en tiempo real
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // Guardamos la altura real en píxeles
                setHeightInPixels(entry.contentRect.height);
            }
        });

        observer.observe(ref.current);

        // Limpiamos el observador cuando el componente se desmonte
        return () => observer.disconnect();
    }, []);
    return (
        <Editor height={`${heightInPixels}px`} theme='vs-dark' defaultLanguage="javascript" options={{ automaticLayout: true }} />
    )
}