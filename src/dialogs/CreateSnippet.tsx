import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { type VsCodeSnippet as SnippetType } from '@/lib/validations';
import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';
import I18nProviderContextProvider, { useI18nProviderContext } from '../I18nProvider';

// 1. Definimos qué datos EXTRAS le pasaremos nosotros (solo el mensaje)
interface AdditionalProps { }

export type SnippetCreationObject = Pick<SnippetType, 'prefix' | 'description'>

type ResponseType = null | SnippetCreationObject

function CreateSnippetDialog(props: ConfirmDialogProps<AdditionalProps, ResponseType>) {
    return (
        <I18nProviderContextProvider>
            <CreateSnippetDialogInner {...props} />
        </I18nProviderContextProvider>
    )
}

const formId = 'snippet-form'

// 2. El componente que recibe las props de react-confirm + las nuestras
// Usamos ConfirmDialogProps<Props_Que_Pasamos, Tipo_De_Respuesta>
function CreateSnippetDialogInner({ show, proceed }: ConfirmDialogProps<AdditionalProps, ResponseType>) {
    const { $t } = useI18nProviderContext();

    return (
        <Dialog
            open={show}
            onOpenChange={(a) => {
                if (!a) {
                    proceed(null)
                }
            }}
        >
            {/* 1. Definimos el formulario con un ID único */}
            <form
                id={formId}
                onSubmit={(e) => {
                    e.preventDefault()
                    const fd = new FormData(e.currentTarget)
                    const data = Object.fromEntries(fd) as ResponseType
                    proceed(data)
                }}
            />

            {/* 2. Tu DialogContent y su diseño se quedan EXACTAMENTE igual que al principio */}
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{$t('action-addsnippet')}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <Field>
                        <FieldLabel htmlFor='prefix-field'>{$t('inputlabel-snippet-prefix')}</FieldLabel>
                        {/* 3. Vinculamos cada input al formulario usando el atributo 'form' */}
                        <Input name="prefix" id="prefix-field" form={formId} />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor='description-field'>{$t('inputlabel-snippet-description')}</FieldLabel>
                        {/* 3. Vinculamos también este input */}
                        <Input name="description" id="description-field" form={formId} />
                    </Field>
                </div>

                <DialogFooter>
                    {/* 4. Vinculamos el botón de submit al ID del formulario */}
                    <Button type='submit' form={formId}>{$t('action-addsnippet')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// 3. LA CLAVE: confirmable(MyDialog) devuelve un componente que TS ya entiende
// que no necesita recibir 'show' o 'proceed' externamente.
export const createSnippet = createConfirmation(confirmable(CreateSnippetDialog));

export default createSnippet;