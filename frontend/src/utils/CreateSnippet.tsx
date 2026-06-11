import { Box, Button, Card, CardActions, CardContent, CardHeader, Modal, SxProps, TextField } from '@mui/material';
import { confirmable, createConfirmation, type ConfirmDialogProps } from 'react-confirm';
import { SnippetType } from '../AppSnippetsContext';
import I18nProviderContextProvider, { useI18nProviderContext } from '../I18nProvider';

const style: SxProps = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 3,
    borderRadius: '10px'
};

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

// 2. El componente que recibe las props de react-confirm + las nuestras
// Usamos ConfirmDialogProps<Props_Que_Pasamos, Tipo_De_Respuesta>
function CreateSnippetDialogInner({ show, proceed }: ConfirmDialogProps<AdditionalProps, ResponseType>) {
    const { $t } = useI18nProviderContext();

    return (
        <Modal
            open={show}
            onClose={() => proceed(null)}
        >
            <Box sx={style}>
                <Card elevation={0} component={'form'} onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.target as HTMLFormElement);
                    const snippet: ResponseType = {
                        description: fd.get('description') as string,
                        prefix: fd.get('prefix') as string,
                    };
                    proceed(snippet);
                }}>
                    <CardHeader title={$t('title-new-snippet')} />

                    <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            autoFocus
                            label={$t('inputlabel-snippet-prefix')}
                            name="prefix" />

                        <TextField
                            label={$t('inputlabel-snippet-description')}
                            name="description" />
                    </CardContent>

                    <CardActions sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 4 }}>
                        <Button
                            variant="text"
                            disableElevation
                            color="primary"
                            onClick={() => proceed(null)}
                        >
                            {$t('button-cancel')}
                        </Button>

                        <Button
                            variant="contained"
                            type='submit'
                            disableElevation
                            color="primary"
                        >
                            {$t('button-create')}
                        </Button>
                    </CardActions>
                </Card>
            </Box>
        </Modal>
    );
}

// 3. LA CLAVE: confirmable(MyDialog) devuelve un componente que TS ya entiende
// que no necesita recibir 'show' o 'proceed' externamente.
export const createSnippet = createConfirmation(confirmable(CreateSnippetDialog));

export default createSnippet;