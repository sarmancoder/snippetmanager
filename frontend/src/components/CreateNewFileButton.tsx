import { Alert, Card, CardActions, CardContent, CardHeader, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import * as React from 'react';
import { filesExtension } from '../config';
import IAService from '../utils/IAUtils';
import IAModelSelector from './IAModelSelector';
import { SetApiKeyOpenRouter } from '../../wailsjs/go/ia/IAOpenRouter';
import promptUser from '../utils/PromptUser';
import { useAppContext } from '../AppSnippetsContext';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400
};

export default function CreateNewFileButton({ onCreateNewFile }) {
    const { lookForSave } = useAppContext()
    const [open, setOpen] = React.useState(false);
    const handleOpen = async () => {
        if (!(await lookForSave())) return
        setOpen(true);
    }
    const handleClose = () => {
        if (unable) return;
        setOpen(false)
    };

    const [modelSelected, setModelSelected] = React.useState('')
    const [iaPrefered, setIAPrefered] = React.useState('')

    const [message, setMessage] = React.useState('')
    const [unable, setUnable] = React.useState(false)

    const createFile = async ({ fname, desiredContent }) => {
        try {
            if (desiredContent.length > 0 && !modelSelected) {
                setMessage("No has seleccionado el modelo")
                return
            }
            console.log('creando contenido con el modelo:', modelSelected)
            const contentResult = desiredContent.length == 0
                ? ''
                : await new IAService(iaPrefered).ia.preguntarVarios(modelSelected, desiredContent)
            onCreateNewFile(fname, JSON.stringify(contentResult, null, 4))
            handleClose()
        } catch (error: any) {
            console.log('errooor', error)
            setMessage(error.message)
            if (error.includes('no_apikey') || error.includes('User not found')) {
                console.log('NO APIKEY')
                const apiKey = await promptUser({
                    message: "Es necesaria la apikey de Open Router"
                })
                await SetApiKeyOpenRouter(apiKey as any)
                await createFile({ fname, desiredContent })
            } else {
                console.log(error)
            }
        } finally {
            setUnable(false)
        }
    }

    return (
        <div>
            <Button variant="contained" color="primary" sx={{ width: '100%' }} disableElevation onClick={handleOpen}>
                Añadir archivo
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Card component={'form'} onSubmit={async (e) => {
                        e.preventDefault()
                        setMessage('')
                        setUnable(true)
                        await new Promise((r) => setTimeout(r, 200))
                        const fd = new FormData(e.target as any)
                        const data: any = Object.fromEntries(fd)
                        if (!data.fileName) {
                            setMessage("Es obligatorio el nombre del archivo")
                            return
                        }
                        const fname = data.fileName.endsWith('.' + filesExtension) ? data.fileName : data.fileName + `.${filesExtension}`
                        createFile({ fname, desiredContent: data.desiredContent })

                    }}>
                        <CardHeader title="Abrir carpeta" />
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {message && <Alert severity='error'>
                                    {message}
                                </Alert>}
                                <TextField label="Nombre del archivo" name='fileName' />
                                <TextField label="Pedir contenido a la ia" name='desiredContent' multiline rows={3} />
                                <IAModelSelector onChange={(e) => {
                                    setModelSelected(e.model)
                                    setIAPrefered(e.iaSelected)
                                }} />
                            </Box>
                        </CardContent>
                        <CardActions sx={{ display: 'flex', justifyContent: 'end' }}>
                            <Button disabled={unable} variant='text' onClick={handleClose}>Cerrar</Button>
                            <Button disabled={unable} variant='contained' disableElevation type='submit'>
                                {unable ? 'Procesando...' : 'Crear archivo'}
                            </Button>
                        </CardActions>
                    </Card>
                </Box>
            </Modal>
        </div>
    );
}
