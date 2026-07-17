import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogDescription
} from "@/components/ui/dialog";
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';
import I18nProviderContextProvider, { useI18nProviderContext } from '../I18nProvider';

// 1. Definimos qué datos EXTRAS le pasaremos nosotros (solo el mensaje)
interface AdditionalProps {
    question: string
}

export type PromptResponseObject = {response: string}

type ResponseType = null | PromptResponseObject

function PromptDialog(props: ConfirmDialogProps<AdditionalProps, ResponseType>) {
    return (
        <I18nProviderContextProvider>
            <PromptDialogInner {...props} />
        </I18nProviderContextProvider>
    )
}

const formId = 'snippet-form'

// 2. El componente que recibe las props de react-confirm + las nuestras
// Usamos ConfirmDialogProps<Props_Que_Pasamos, Tipo_De_Respuesta>
function PromptDialogInner({ show, question, proceed }: ConfirmDialogProps<AdditionalProps, ResponseType>) {
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
                    <DialogDescription>{question}</DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <Field>
                        <FieldLabel htmlFor='response-field'>{$t('inputlabel-response')}</FieldLabel>
                        {/* 3. Vinculamos cada input al formulario usando el atributo 'form' */}
                        <Input name="response" id="response-field" form={formId} />
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
export const promptDialog = createConfirmation(confirmable(PromptDialog));

export default promptDialog;