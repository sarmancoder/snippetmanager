import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Alert, Box, Card, CardActions, CardContent, CardHeader, IconButton, TextField } from '@mui/material';
import { drawerWidth } from '../config';
import { Help, SupportAgent } from '@mui/icons-material';
import { PreguntarOllama } from '../../wailsjs/go/ia/IAOllama'
import IAModelSelector from './IAModelSelector';
import IAService from '../utils/IAUtils';
import promptUser from '../utils/PromptUser';
import { SetApiKeyOpenRouter } from '../../wailsjs/go/ia/IAOpenRouter';
import { useAppContext } from '../AppSnippetsContext';

export default function IAButton() {
    const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (anchorEl == null) {
            setAnchorEl(event.currentTarget);
        } else {
            setAnchorEl(null)
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <Box sx={{ position: 'fixed', zIndex: 2000000, bottom: '20px', right: `calc(${drawerWidth} + 20px)` }}>
            <IconButton onClick={handleClick} color='primary'>
                <SupportAgent sx={{ fontSize: '48px' }} />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <IACardForm />
            </Popover>
        </Box>
    );
}

function IACardForm() {
    const {setIaSnippet} = useAppContext()
    const [unable, setUnable] = React.useState(false)
    const [message, setMessage] = React.useState('')
    const [modelSelected, setModelSelected] = React.useState('')
    const [iaPrefered, setIAPrefered] = React.useState('')

    const requestToIA = async (prompt, tries = 5) => {
        try {
            setUnable(true)
            const response = await new IAService(iaPrefered).ia.preguntar(modelSelected, prompt)
            if (response == null) {
                await requestToIA(prompt, tries - 1)
                return
            }
            setIaSnippet(Array.isArray(response) ? response[0] : response)
        } catch (error: any) {
            setMessage(error.message)
            if (error.includes('no_apikey') || error.includes('User not found')) {
                const apiKey = await promptUser({
                    message: "Es necesaria la apikey de Open Router"
                })
                await SetApiKeyOpenRouter(apiKey as any)
                await requestToIA(prompt)
            } else {
                if (tries > 0) {
                    await requestToIA(prompt, tries - 1)
                    return
                }
                setMessage('Intente mas tarde')
            }
        } finally {
            setUnable(false)
        }
    }

    return (
        <Card sx={{ width: '500px' }} elevation={0} component={'form'} onSubmit={async (e) => {
            e.preventDefault()
            const fd = new FormData(e.target as any)
            const txt = fd.get('requestText') as string
            if (txt.length == 0) return
            requestToIA(txt)
        }}>
            <CardHeader title="Ayuda de la IA" />
            <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {message && <Alert color='error'>
                        {message}
                    </Alert>}
                    <TextField name='requestText' multiline rows={5} fullWidth label="¿Que quieres que haga la IA?" />
                    <IAModelSelector onChange={(e) => {
                        setModelSelected(e.model)
                        setIAPrefered(e.iaSelected)
                    }} />
                </Box>
            </CardContent>
            <CardActions>
                <Button disableElevation type='submit' variant="contained" disabled={unable} color="primary">
                    {unable ? 'Procesando...' : 'Proceder'}
                </Button>
            </CardActions>
        </Card>
    )
}

