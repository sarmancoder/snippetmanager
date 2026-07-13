import { useCallback, useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import CodeEditor from './CodeEditor';

type DualEditorProps = {
};

export default function DualEditor({ }: DualEditorProps) {
    const [jsonSnippetResult, setJsonSnippetResult] = useState('{}')

    const [prefix, setPrefix] = useState('')
    const [description, setDescription] = useState('')
    const [isTemplateFile, setIsTemplateFile] = useState(false)
    const [body, setBody] = useState<string[]>([])

    const resultref = useRef(null);
    const editorRef = useRef(null)

    useEffect(() => {
        const newData = JSON.stringify({
            prefix, description, isTemplateFile, body
        }, null, 4)
        setJsonSnippetResult(newData)
        console.log('valor de la variable jsonSnippetResult', newData)
    }, [prefix, description, isTemplateFile, body])

    return (
        <div className="flex gap-2 h-[800px]">
            <div className='grow'>
                <div className="flex flex-col gap-2 h-full">
                    <Field>
                        <FieldLabel htmlFor='prefix-field'>Prefijo</FieldLabel>
                        <Input
                            id='prefix-field'
                            value={prefix}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setPrefix(newValue);
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
                                setDescription(newValue);
                            }}
                        />
                    </Field>

                    <Field orientation="horizontal">
                        <Checkbox
                            id="template-field"
                            checked={isTemplateFile}
                            onCheckedChange={(checked) => {
                                setIsTemplateFile(checked);
                            }}
                        />
                        <Label htmlFor="template-field">Es una plantilla</Label>
                    </Field>
                    <Card className='w-full h-full'>
                        <CardHeader>
                            <CardTitle>Editor</CardTitle>
                        </CardHeader>
                        <CardContent ref={editorRef} className='h-full'>
                            <CodeEditor ref={editorRef} defaultLanguage='javascript' onChange={(content) => {
                                const body = content.split('\n').map((e) => e.replace('\r', ''))
                                setBody(body)
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
                        <CodeEditor ref={resultref} defaultLanguage='json' value={jsonSnippetResult} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
