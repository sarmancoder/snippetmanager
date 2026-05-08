import { Box, colors, Toolbar, IconButton } from '@mui/material'
import { drawerWidth } from '../config'
import { Folder } from '@mui/icons-material'
import {SeleccionarYLeerCarpeta} from '../../wailsjs/go/main/AdministradorArchivos'

export default function DrawerFiles() {
    return (
        <Box sx={{
            bgcolor: colors.grey[300],
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: drawerWidth
        }}>
            <Toolbar />
            <IconButton aria-label="" onClick={async () => {
                const r = await SeleccionarYLeerCarpeta()
                console.log(r)
            }}>
                <Folder />
            </IconButton>
        </Box>
    )
}
