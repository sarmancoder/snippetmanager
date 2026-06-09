import { Box, List, ListItem, ListItemText, MenuItem, Select } from '@mui/material'
import { useLocalStorage } from '@uidotdev/usehooks'
import { langLocalStorageKey } from '../../../config'

export default function GeneralConfigTab() {
    const [lang, setLang] = useLocalStorage(langLocalStorageKey, 'es')
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <List sx={{width: '100%'}}>
                <ListItem>
                    <ListItemText primary={'Idioma'} secondary={(
                        <Select fullWidth size='small' value={lang} onChange={(e) => setLang(e.target.value)}>
                            <MenuItem value={'es-ES'}>Español</MenuItem>
                            <MenuItem value={'en-UK'}>Ingles</MenuItem>
                        </Select>
                    )} />
                </ListItem>
            </List>
        </Box>
    )
}
