import Editor, { EditorProps } from '@monaco-editor/react';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';

type CodeEditorProps = {
    ref: React.RefObject<any>,
    defaultLanguage: EditorProps['language'],
    language?: EditorProps['language'],
    theme?: EditorProps['theme'],
    onChange?: (value: string) => void,
    value?: string,
    id: string,
    onMounted?: (e: any, m: any) => void,
    adjust?: boolean
}

export default function CodeEditor({ ref, value, theme = 'vs-dark', onMounted, adjust = false, onChange, ...other }: CodeEditorProps) {
    const editor = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement | null>(null)
    const [heightInPixels, setHeightInPixels] = useState(400);

    useImperativeHandle(ref, () => ({
        changeContent(content: string) {
            editor.current?.setValue(content);
        },
        isFocused() {
            const estaEnFocus = editor.current?.hasWidgetFocus();
            return estaEnFocus
        },
        insertText(text: string) {
            if (!editor.current) return;

            const model = editor.current.getModel();
            if (!model) return;

            const selections = editor.current.getSelections() ?? [];
            const ranges = selections.length > 0
                ? selections
                : [{
                    startLineNumber: 1,
                    startColumn: 1,
                    endLineNumber: 1,
                    endColumn: 1,
                }];

            editor.current.executeEdits('', ranges.map((range: any) => ({
                range,
                text,
                forceMoveMarkers: true,
            })));

            const lastRange = ranges[ranges.length - 1];
            const endPosition = lastRange.endPosition ?? { lineNumber: 1, column: 1 };
            const offset = model.getOffsetAt(endPosition) + text.length;
            const newPosition = model.getPositionAt(offset);

            editor.current.setSelection({
                startLineNumber: newPosition.lineNumber,
                startColumn: newPosition.column,
                endLineNumber: newPosition.lineNumber,
                endColumn: newPosition.column,
            });
            editor.current.focus();
        }
    }))

    function handleEditorDidMount(e: any, m: any) {
        editor.current = e;
        e.onDidChangeModelContent(() => {
            const currentCode = e.getValue();
            onChange?.(currentCode)
        });
        
        onMounted?.(e, m)
    }

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setHeightInPixels(entry.contentRect.height);
            }
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className='h-full'>
            <Editor {...other} theme='vs-dark' onMount={handleEditorDidMount}
                height={`${heightInPixels}px`} options={{ automaticLayout: true, wordWrap: adjust ? 'on' : 'off' }} />
        </div>
    )
}