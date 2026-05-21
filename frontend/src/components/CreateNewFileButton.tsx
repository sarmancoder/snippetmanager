import { Folder } from '@mui/icons-material';
import { Alert, Autocomplete, Card, CardActions, CardContent, CardHeader, IconButton, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import * as React from 'react';
import { filesExtension } from '../config';
import { ia } from '../../wailsjs/go/models';
import { ListarModelosOllama, PreguntarVariosOllama } from '../../wailsjs/go/ia/IAOllama';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400
};

export default function CreateNewFileButton({ onCreateNewFile }) {
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [modelSelected, setModelSelected] = React.useState('')

    const [message, setMessage] = React.useState('')
    const [unable, setUnable] = React.useState(false)

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
                        
                        try {
                            if (data.desiredContent.length > 0 && !modelSelected) {
                                setMessage("No has seleccionado el modelo")
                                return
                            }
                            console.log('creando contenido con el modelo:', modelSelected)
                            const contentResult = data.desiredContent.length == 0 ? '' : await PreguntarVariosOllama(modelSelected, data.desiredContent)
                            console.log('resultado', contentResult)
                            onCreateNewFile(fname, JSON.stringify(contentResult, null, 4))
                            handleClose()
                        } catch (error: any) {
                            console.log('errooor', error)
                            setMessage(error.message)
                        } finally {
                            setUnable(false)
                        }
                    }}>
                        <CardHeader title="Abrir carpeta" />
                        <CardContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {message && <Alert severity='error'>
                                    {message}
                                </Alert>}
                                <TextField label="Nombre del archivo" name='fileName' />
                                <TextField label="Pedir contenido a la ia" name='desiredContent' multiline rows={3} />
                                <TextField label="Modelo deseado" name='model' />
                                <OllamaModelSelector onChange={(e) => {
                                    console.log(e)
                                    setModelSelected(e)
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

function OllamaModelSelector({onChange}) {
    const [models, setModels] = React.useState<ia.OllamaModel[]>([])

    React.useEffect(() => {
        ListarModelosOllama().then((models) => {
            console.log(models)
            setModels(models)
        })
    }, [])

    return (
        <Autocomplete<ia.OllamaModel>
            options={models}
            getOptionLabel={(a) => a.name}
            getOptionKey={(a) => a.model}
            onInputChange={(a, x) => onChange(x)}
            renderInput={(params) => <TextField {...params} label="Modelo ollama" />}
        />
    )
}

