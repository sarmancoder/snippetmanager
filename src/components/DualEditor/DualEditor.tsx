import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import CodeEditor from './CodeEditor';

type DualEditorProps = {
};

export default function DualEditor({ }: DualEditorProps) {
    const resultref = useRef(null);
    const editorRef = useRef(null)

    return (
        <div className="flex gap-2 h-[800px]">
            <div className='grow'>
                <div className="flex flex-col gap-2 h-full">
                    <Field>
                        <FieldLabel htmlFor='prefix-field'>Prefijo</FieldLabel>
                        <Input id='prefix-field' />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor='desc-field'>Descripción</FieldLabel>
                        <Input id='desc-field' />
                    </Field>
                    <Field orientation="horizontal">
                        <Checkbox id="template-field" />
                        <Label htmlFor="template-field">Es una plantilla</Label>
                    </Field>
                    <Card className='w-full h-full'>
                        <CardHeader>
                            <CardTitle>Editor</CardTitle>
                        </CardHeader>
                        <CardContent ref={editorRef} className='h-full'>
                            <CodeEditor ref={editorRef} />
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
                        <CodeEditor ref={resultref} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
