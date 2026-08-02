import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';
import I18nProviderContextProvider, { useI18nProviderContext } from '../I18nProvider';

// 1. Definimos qué datos EXTRAS le pasaremos nosotros (solo el mensaje)
interface AdditionalProps {
    title: string,
    description: string
}

type ResponseType = null | boolean

function ConfirmDialog(props: ConfirmDialogProps<AdditionalProps, ResponseType>) {
    return (
        <I18nProviderContextProvider>
            <ConfirmDialogInner {...props} />
        </I18nProviderContextProvider>
    )
}

const formId = 'snippet-form'

// 2. El componente que recibe las props de react-confirm + las nuestras
// Usamos ConfirmDialogProps<Props_Que_Pasamos, Tipo_De_Respuesta>
function ConfirmDialogInner({ title, description, show, proceed }: ConfirmDialogProps<AdditionalProps, ResponseType>) {
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
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={() => proceed(false)} variant={'ghost'} form={formId}>{$t('response-no')}</Button>
                    <Button onClick={() => proceed(true)} variant={'default'} form={formId}>{$t('response-yes')}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// 3. LA CLAVE: confirmable(MyDialog) devuelve un componente que TS ya entiende
// que no necesita recibir 'show' o 'proceed' externamente.
export const confirmDialog = createConfirmation(confirmable(ConfirmDialog));

export default confirmDialog;