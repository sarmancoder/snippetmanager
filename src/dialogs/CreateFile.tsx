import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';
import I18nProviderContextProvider, { useI18nProviderContext } from '../I18nProvider';
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

interface AdditionalProps {}

type ResponseType = null | { filename: string }

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
                onSubmit={(event) => {
                    event.preventDefault();
                    const fd = new FormData(event.currentTarget);
                    const data = Object.fromEntries(fd) as ResponseType;
                    proceed(data);
                }}
            />

            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{$t('title-addfile')}</DialogTitle>
                    <p className='text-sm text-muted-foreground'>{$t('prompt-ask-filename')}</p>
                </DialogHeader>

                <div className='flex flex-col gap-2'>
                    <Field>
                        <FieldLabel htmlFor='filename-field'>{$t('inputlabel-namefile')}</FieldLabel>
                        <Input name='filename' id='filename-field' form={formId} />
                    </Field>
                </div>

                <DialogFooter>
                    <Button type='submit' form={formId}>{$t('button-create-file')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const createFile = createConfirmation(confirmable(CreateFileDialog));
export default createFile;
