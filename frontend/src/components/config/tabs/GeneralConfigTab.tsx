import { Box, List, ListItem, ListItemText, MenuItem, Select } from '@mui/material'
import { useI18nProviderContext } from '../../../I18nProvider'

export default function GeneralConfigTab() {
    const { lang, setLang, languagesAvailable } = useI18nProviderContext()
    const {$t} = useI18nProviderContext()
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <List sx={{width: '100%'}}>
                <ListItem>
                    <ListItemText primary={$t('text-language')} secondary={(
                        <Select fullWidth size='small' value={lang} onChange={(e) => setLang(e.target.value)}>
                            {languagesAvailable.map((item) =>
                                <MenuItem value={item.value}>{item.label}</MenuItem>
                            )}
                        </Select>
                    )} />
                </ListItem>
            </List>
        </Box>
    )
}
