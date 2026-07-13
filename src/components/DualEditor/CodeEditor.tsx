import Editor, { EditorProps } from '@monaco-editor/react';
import { useEffect, useRef, useState } from 'react';

type CodeEditorProps = {
    ref: React.RefObject<any>,
    defaultLanguage: EditorProps['language'],
    theme?: EditorProps['theme'],
    onChange?: (value: string) => void,
    value?: string
}

export default function CodeEditor({ ref, value, theme = 'vs-dark', onChange, ...other }: CodeEditorProps) {
    const editor = useRef<any>(null)
    const [heightInPixels, setHeightInPixels] = useState(400);

    function handleEditorDidMount(e: any) {
        editor.current = e;
        e.onDidChangeModelContent(() => {
            const currentCode = e.getValue();
            onChange?.(currentCode)
        });
    }

    useEffect(() => {
        if (!value) return
        if (editor.current === null) return
        if (editor.current.getValue() !== value) {
            editor.current.setValue(value);
        }
    }, [value])

    useEffect(() => {
        if (!ref.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                setHeightInPixels(entry.contentRect.height);
            }
        });
        observer.observe(ref.current);
        return () => observer.disconnect();
    }, []);

    return (
        <Editor {...other} theme='vs-dark' onMount={handleEditorDidMount}
            height={`${heightInPixels}px`} options={{ automaticLayout: true }} />
    )
}