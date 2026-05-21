import { Folder } from '@mui/icons-material';
import { Alert, Autocomplete, ButtonGroup, Card, CardActions, CardContent, CardHeader, Divider, IconButton, Paper, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import * as React from 'react';
import { filesExtension } from '../config';
import { ia } from '../../wailsjs/go/models';
import { ListarModelosOllama, PreguntarVariosOllama } from '../../wailsjs/go/ia/IAOllama';
import { useClickAway, useLocalStorage } from '@uidotdev/usehooks';

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
                                <OllamaModelSelector onChange={(e) => {
                                    setModelSelected(e.model)
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

type IAEnum = 'ollama' | 'openRouter'

type OllamaModelSelectorProps = {
    onChange: (value: {model: string, iaSelected: IAEnum}) => void
}
function OllamaModelSelector({ onChange }: OllamaModelSelectorProps) {
    const [models, setModels] = React.useState<ia.OllamaModel[]>([])
    const [iaPrefered, setIaPrefered] = useLocalStorage<IAEnum>('ia-prefered', 'ollama')
    const [modelPrefered, setModelPrefered] = useLocalStorage<string>('model-prefered', '')
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false)

    const ref = useClickAway((e) => {
        setTimeout(() => {
            setOpen(false);
        }, (e.target as HTMLElement).tagName == 'LI' ? 500 : 70);
    });

    React.useEffect(() => void loadModels(), [])

    const loadModels = async () => {
        const models = await ListarModelosOllama()
        setModels(models)
    }

    const setPreferedIa = async (e, value: IAEnum) => {
        e.stopPropagation()
        setIaPrefered(value)
        setLoading(true)
        await new Promise((r) => setTimeout(r, 500))
        setLoading(false)
    }

    React.useEffect(() => onChange({model: modelPrefered, iaSelected: iaPrefered}) , [modelPrefered])

    const loadingBox = (
        <Box sx={{height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
            <Typography variant="body1" color="initial">loading</Typography>
        </Box>
    )

    // Buscamos el objeto seleccionado actual dentro de la lista que vino de la API
    const currentValue = models.find(a => a.model === modelPrefered) || null;

    return (
        <Autocomplete<ia.OllamaModel> 
            ref={ref}
            options={models}
            open={open}
            onOpen={() => setOpen(true)}
            onClose={(event, reason) => {
                if ((event.target as HTMLElement).tagName == 'LI') {
                    setOpen(false)
                }
            }}
            
            // Pasamos el objeto encontrado o null si aún no cargan los modelos
            value={currentValue}
            
            // Obligatorio para comparar objetos por su propiedad única
            isOptionEqualToValue={(option, value) => option.model === value.model}
            
            getOptionLabel={(a) => a.name || ''}
            getOptionKey={(a) => a.model}
            
            // CAMBIO CLAVE: Usamos onChange para capturar el objeto seleccionado, NO el texto escrito
            onChange={(event, newValue) => {
                if (newValue) {
                    setModelPrefered(newValue.model); // Guardamos el ID técnico (ej: 'llama3')
                } else {
                    setModelPrefered(''); // Limpiamos si el usuario borra la selección
                }
            }}
            
            renderInput={(params) => <TextField {...params} label="Modelo ollama" />}
            slots={{
                paper: ({ children, ...other }) => {
                    return (
                        <Paper {...other}>
                            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', padding: 1 }}>
                                <ButtonGroup size='small' disableElevation variant="contained" aria-label="Basic button group">
                                    <Button className='ia-button-setter' onMouseDown={(e) => setPreferedIa(e, 'ollama')} variant={iaPrefered == 'ollama' ? 'contained' : 'text'}>Ollama</Button>
                                    <Button className='ia-button-setter' onMouseDown={(e) => setPreferedIa(e, 'openRouter')} variant={iaPrefered == 'openRouter' ? 'contained' : 'text'}>OpenRouter</Button>
                                </ButtonGroup>
                            </Box>
                            <Divider />
                            {loading ? loadingBox : children}
                        </Paper>
                    );
                }
            }}
        />
    )
}