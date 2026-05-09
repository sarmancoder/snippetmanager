import { Box, colors, Toolbar, IconButton, TextField, Typography, Button } from '@mui/material'
import { drawerWidth, filesExtension } from '../config'
import { Folder } from '@mui/icons-material'
import { AbrirCarpetaEnExplorador, LeerArchivo, SeleccionarYLeerCarpeta } from '../../wailsjs/go/main/AdministradorArchivos'
import { useState } from 'react'
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useAppContext } from '../AppSnippetsContext'

export default function DrawerFiles() {
    const [files, setfiles] = useState<string[]>([])
    const [pathFolder, setPathFolder] = useState('')

    const {setCurrentPathFile, currentPathFile} = useAppContext()
    
    return (
        <Box sx={{
            bgcolor: colors.grey[300],
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: drawerWidth,
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Toolbar />
            <Box sx={{ display: 'flex', pt: 2 }}>
                <IconButton aria-label="" onClick={async () => {
                    const r = await SeleccionarYLeerCarpeta()
                    setfiles(r.archivos)
                    setPathFolder(r.ruta)
                }}>
                    <Folder />
                </IconButton>
                <Typography title={pathFolder} variant="subtitle2" color="initial"
                onClick={() => AbrirCarpetaEnExplorador(pathFolder)}
                sx={{
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    WebkitLineClamp: 2,      // Aquí defines el máximo de líneas
                    overflow: 'hidden',      // Oculta el texto que sobrepasa las 2 líneas
                    wordBreak: "break-all",  // Útil para rutas largas sin espacios
                    cursor: 'pointer',
                    overflowWrap: "anywhere"
                }}>
                    {pathFolder}
                </Typography>
            </Box>
            <List dense
            >
                {files.map((item) =>
                    <ListItemButton key={item} selected={currentPathFile.endsWith(item)} onClick={async () => {
                        setCurrentPathFile(pathFolder + '/' + item)
                    }}>
                        <ListItemText primary={item.replace('.' + filesExtension, '')} />
                    </ListItemButton>

                )}
            </List>
            <Box sx={{ flexGrow: 1 }}></Box>
            <Button variant="contained" size='small' disabled={currentPathFile.length == 0} sx={{ margin: 1 }} color="primary">
                Añadir archivo
            </Button>
        </Box>
    )
}
