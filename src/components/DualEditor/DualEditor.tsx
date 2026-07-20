import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import CodeEditor from './CodeEditor';
import { toast } from 'sonner';
import { vsCodeSnippetSchema } from '@/lib/validations';
import {play} from 'cuelume'

type DualEditorProps = {
    ref: React.Ref<any>
    onChange?: (content: any) => void
    adjust?: boolean
};

type SnippetState = {
    prefix: string
    description: string
    isFileTemplate: boolean
    body: string[]
}

const normalizeSnippetState = (value: Partial<SnippetState> = {}): SnippetState => ({
    prefix: typeof value.prefix === 'string' ? value.prefix : '',
    description: typeof value.description === 'string' ? value.description : '',
    isFileTemplate: Boolean(value.isFileTemplate),
    body: Array.isArray(value.body) ? value.body : [],
})

export default function DualEditor({ ref, adjust = false, onChange }: DualEditorProps) {
    const [jsonSnippetResult, setJsonSnippetResult] = useState('{}')
    const [snippetState, setSnippetState] = useState<SnippetState>({
        prefix: '',
        description: '',
        isFileTemplate: false,
        body: [],
    })

    const { prefix, description, isFileTemplate } = snippetState

    const resultref = useRef<any>(null);
    const editorRef = useRef<any>(null)

    const updateSnippetState = (changes: Partial<SnippetState>) => {
        setSnippetState((current) => normalizeSnippetState({
            ...current,
            ...changes,
        }))
    }

    useImperativeHandle(ref, () => ({
        getCurrentContent() {
            return JSON.parse(jsonSnippetResult)
        },
        setContent(content: string) {
            try {
                if (content.length == 0) return
                const data = JSON.parse(content)
                if (Object.keys(data).length == 0) return

                const normalizedData = normalizeSnippetState(data)

                setSnippetState(normalizedData)
                resultref.current?.changeContent?.(JSON.stringify(normalizedData, null, 4))
                editorRef.current?.changeContent?.(normalizedData.body.join('\n'))
            } catch (error) {
                toast('Snippet no válido')
                console.log(content, error)
            }
        }
    }))

    useEffect(() => {
        const normalizedData = normalizeSnippetState(snippetState)
        const newData = JSON.stringify(normalizedData, null, 4)
        setJsonSnippetResult(newData)
        if (!resultref.current?.isFocused?.()) {
            resultref.current?.changeContent?.(newData)
        }
        onChange?.(newData)
    }, [snippetState, onChange])

    return (
        <div ref={ref} className="flex gap-2 h-[800px]">
            <div className='grow'>
                <div className="flex flex-col gap-2 h-full">
                    <Field>
                        <FieldLabel htmlFor='prefix-field'>Prefijo</FieldLabel>
                        <Input
                            id='prefix-field'
                            value={prefix}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                updateSnippetState({ prefix: newValue });
                            }}
                        />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor='desc-field'>Descripción</FieldLabel>
                        <Input
                            id='desc-field'
                            value={description}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                updateSnippetState({ description: newValue });
                            }}
                        />
                    </Field>

                    <Field orientation="horizontal">
                        <Checkbox
                            id="template-field"
                            checked={isFileTemplate}
                            onCheckedChange={(checked) => {
                                updateSnippetState({ isFileTemplate: Boolean(checked) });
                            }}
                        />
                        <Label htmlFor="template-field">Es una plantilla</Label>
                    </Field>
                    <Card className='w-full h-full'>
                        <CardHeader>
                            <CardTitle>Editor</CardTitle>
                        </CardHeader>
                        <CardContent ref={editorRef} className='h-full'>
                            <CodeEditor adjust={adjust} id="snippeteditor" ref={editorRef} defaultLanguage='javascript' onChange={(content) => {
                                const body = content.split('\n').map((e) => e.replace('\r', ''))
                                updateSnippetState({ body })
                            }} onMounted={(_, monaco) => {
                                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                                    noSemanticValidation: true,
                                    noSyntaxValidation: true,
                                })
                                monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                                    noSemanticValidation: true,
                                    noSyntaxValidation: true,
                                })
                            }} />
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className='grow'>
                <Card className='w-full h-full'>
                    <CardHeader>
                        <CardTitle>Resultado</CardTitle>
                    </CardHeader>
                    <CardContent ref={resultref} className='h-full'>
                        <CodeEditor adjust={adjust} id="resultsnippet" ref={resultref} defaultLanguage='json' value={jsonSnippetResult} onChange={(c) => {
                            try {
                                if (!resultref.current?.isFocused?.()) return
                                const snippetData = normalizeSnippetState(JSON.parse(c))
                                setSnippetState(snippetData)
                                editorRef.current?.changeContent?.(snippetData.body.join('\n'))
                            } catch (error) {
                                console.log('No es valido el input', error)
                            }
                        }} onMounted={(e) => {
                            e.onDidPaste((_event: any) => {
                                const todo = e.getValue()
                                try {
                                    const data = JSON.parse(todo)
                                    const resultado = vsCodeSnippetSchema.safeParse(data);
                                    if (!resultado.success) {
                                        throw new Error('No válido')
                                    }
                                    const newData = JSON.stringify(data, null, 4)
                                    e.setValue(newData)
                                } catch (error) {
                                    play('bloom')
                                    toast.error('Error de validación', {
                                        description: 'El formato del snippet de VS Code no es válido'
                                    });
                                    e.trigger('source', 'undo', null);
                                    if (e.getValue().length == 0) {
                                        const fallbackData = normalizeSnippetState(snippetState)
                                        const newData = JSON.stringify(fallbackData, null, 4)
                                        e.setValue(newData)
                                    }
                                }
                            });
                        }} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
