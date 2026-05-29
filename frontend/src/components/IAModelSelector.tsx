import { Autocomplete, ButtonGroup, Divider, Paper, TextField, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useClickAway, useLocalStorage } from '@uidotdev/usehooks';
import * as React from 'react';
import { SetApiKeyOpenRouter } from '../../wailsjs/go/ia/IAOpenRouter';
import { ia } from '../../wailsjs/go/models';
import IAService, { IAEnum } from '../utils/IAUtils';
import promptUser from '../utils/PromptUser';

type IAModelSelectorProps = {
    onChange: (value: { model: string, iaSelected: IAEnum }) => void
}
export default function IAModelSelector({ onChange }: IAModelSelectorProps) {
    const [models, setModels] = React.useState<ia.OllamaModel[]>([])
    const [iaPrefered, setIaPrefered] = useLocalStorage<IAEnum>('ia-prefered', 'ollama')
    const [modelPrefered, setModelPrefered] = useLocalStorage<Record<IAEnum, string>>('model-prefered', {})
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false)

    const ref = useClickAway((e) => {
        setTimeout(() => {
            setOpen(false);
        }, (e.target as HTMLElement).tagName == 'LI' ? 500 : 70);
    });

    React.useEffect(() => void loadModels(), [iaPrefered])

    const loadModels = async () => {
        try {
            setLoading(true)
            setModels([])
            setIaPrefered(iaPrefered)
            const models = await new IAService(iaPrefered).ia.listarModelos()
            setModels(models)
        } catch (error: any) {
            console.dir(error)
            if (error.includes('no_apikey') || error.includes('user_not_found')) {
                const apiKey = await promptUser({
                    message: "Es necesaria la apikey de Open Router"
                })
                await SetApiKeyOpenRouter(apiKey as any)
                await loadModels()
            }
        } finally {
            setLoading(false)
        }
    }

    const setPreferedIa = async (e, value: IAEnum) => {
        e.stopPropagation()
        setIaPrefered(value)
    }

    React.useEffect(() => {
        onChange({
            model: modelPrefered[iaPrefered] || '',
            iaSelected: iaPrefered
        });
    }, [iaPrefered, modelPrefered, onChange]);

    const currentModel = React.useMemo(() => {
        return models.find(a => modelPrefered[iaPrefered] == a.model)
    }, [iaPrefered, modelPrefered, models])



    const loadingBox = (
        <Box sx={{ height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography variant="body1" color="initial">loading</Typography>
        </Box>
    )

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
            value={currentModel || null}

            // Obligatorio para comparar objetos por su propiedad única
            isOptionEqualToValue={(option, value) => !value || option.model === value.model}

            getOptionLabel={(a) => a.name || ''}
            getOptionKey={(a) => a.model}

            // CAMBIO CLAVE: Usamos onChange para capturar el objeto seleccionado, NO el texto escrito
            onChange={(event, newValue) => {
                if (newValue) {
                    setModelPrefered({
                        ...modelPrefered,
                        [iaPrefered as any]: newValue.model
                    }); // Guardamos el ID técnico (ej: 'llama3')
                } else {
                    setModelPrefered({
                        ...modelPrefered,
                        [iaPrefered as any]: ''
                    });
                }
            }}

            renderInput={(params) => {
                return <TextField {...params} label="Modelo" placeholder={currentModel?.name ?? ''} />
            }}
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