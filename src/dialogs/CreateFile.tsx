import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';
import I18nProviderContextProvider, { useI18nProviderContext } from '../I18nProvider';
import { invoke } from '@tauri-apps/api/core';
import { useState } from 'react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { generateGoogleSnippetList, type GoogleSnippetDraft } from '@/lib/ai/google';

interface AdditionalProps {}

type ResponseType = null | { filename: string, content: string }

type SnippetFileEntry = {
    prefix: string,
    body: string[],
    description: string,
    scope: string,
    isFileTemplate: boolean
}

function buildSnippetListPrompt(description: string, prefix: string): string {
    if (!prefix) return description;
    return `${description}\n\nUsa "${prefix}" como prefijo base para el campo "prefix" de cada snippet, añadiendo un sufijo corto y único a cada uno para que no se repitan.`;
}

function draftsToSnippetMap(drafts: GoogleSnippetDraft[]): Record<string, SnippetFileEntry> {
    const map: Record<string, SnippetFileEntry> = {};

    drafts.forEach((draft, index) => {
        const baseKey = draft.name?.trim() || draft.prefix?.trim() || `snippet-${index + 1}`;
        let key = baseKey;
        let suffix = 1;
        while (key in map) {
            key = `${baseKey}-${suffix}`;
            suffix += 1;
        }

        map[key] = {
            prefix: draft.prefix ?? '',
            body: Array.isArray(draft.body) ? draft.body : [],
            description: draft.description ?? '',
            scope: draft.scope ?? '',
            isFileTemplate: false,
        };
    });

    return map;
}

function CreateFileDialog(props: ConfirmDialogProps<AdditionalProps, ResponseType>) {
    return (
        <I18nProviderContextProvider>
            <CreateFileDialogInner {...props} />
        </I18nProviderContextProvider>
    )
}

const formId = 'create-file-form'

function CreateFileDialogInner({ show, proceed }: ConfirmDialogProps<AdditionalProps, ResponseType>) {
    const { $t } = useI18nProviderContext();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (isProcessing) return;

        const fd = new FormData(event.currentTarget);
        const filename = String(fd.get('filename') ?? '').trim();
        const prefix = String(fd.get('prefix') ?? '').trim();
        const description = String(fd.get('description') ?? '').trim();

        if (!filename) {
            setErrorMessage($t('error-file-name-required'));
            return;
        }

        if (!description) {
            proceed({ filename, content: '{}' });
            return;
        }

        try {
            setIsProcessing(true);
            setErrorMessage('');

            const apiKey = await invoke<string | null>('get_google_api_key');
            if (!apiKey) {
                toast.error($t('prompt-google-apikey'));
                setIsProcessing(false);
                return;
            }

            const model = localStorage.getItem('settings-google-model') || 'gemini-2.0-flash';
            console.log({model})
            const drafts = await generateGoogleSnippetList(buildSnippetListPrompt(description, prefix), model.replace(/^["']|["']$/g, ''), apiKey);
            const content = JSON.stringify(draftsToSnippetMap(drafts), null, 2);

            proceed({ filename, content });
        } catch (error) {
            console.log(error);
            setErrorMessage($t('error-ai-generation'));
            setIsProcessing(false);
        }
    }

    return (
        <Dialog
            open={show}
            onOpenChange={(open) => {
                if (!open) {
                    proceed(null)
                }
            }}
        >
            <form
                id={formId}
                onSubmit={handleSubmit}
            />

            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{$t('title-addfile')}</DialogTitle>
                    <p className='text-sm text-muted-foreground'>{$t('prompt-ask-filename')}</p>
                </DialogHeader>

                <div className='flex flex-col gap-2'>
                    <Field>
                        <FieldLabel htmlFor='filename-field'>{$t('inputlabel-namefile')}</FieldLabel>
                        <Input name='filename' id='filename-field' form={formId} disabled={isProcessing} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor='ai-prefix-field'>{$t('inputlabel-ai-prefix')}</FieldLabel>
                        <Input name='prefix' id='ai-prefix-field' form={formId} disabled={isProcessing} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor='ai-content-field'>{$t('inputlabel-ai-content')}</FieldLabel>
                        <textarea
                            name='description'
                            id='ai-content-field'
                            form={formId}
                            disabled={isProcessing}
                            className="min-h-[120px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50"
                        />
                    </Field>
                    {errorMessage ? <p className='text-sm text-destructive'>{errorMessage}</p> : null}
                </div>

                <DialogFooter>
                    <Button type='submit' form={formId} disabled={isProcessing}>
                        {isProcessing ? $t('status-processing') : $t('button-create-file')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const createFile = createConfirmation(confirmable(CreateFileDialog));
export default createFile;
