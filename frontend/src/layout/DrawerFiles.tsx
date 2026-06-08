import { Delete } from '@mui/icons-material'
import { Box, colors, IconButton, MenuItem, MenuList, SxProps, Typography, Button } from '@mui/material'
import clsx from 'clsx'
import { useRef, useState } from 'react'
import { AbrirCarpetaEnExplorador, AgregarSnippet, EliminarArchivo, EscribirArchivo, UnirRutas } from '../../wailsjs/go/main/AdministradorArchivos'
import { CambiarColorHex } from '../../wailsjs/go/main/GestorColor'
import { useAppContext } from '../AppSnippetsContext'
import CreateNewFileButton from '../components/CreateNewFileButton'
import OpenFolderButton from '../components/OpenFolderButton'
import { drawerStyle, filesExtension } from '../config'
import alertMessage from '../utils/AlertMessage'
import confirmAction from '../utils/ConfirmAction'
import promptUser from '../utils/PromptUser'

export default function DrawerFiles() {
    const { setCurrentPathFile, currentPathFile, lookForSave, currentSnippetKey, setCurrentSnippetKey, deleteSnippet } = useAppContext()

    const [files, setfiles] = useState<string[]>([])
    const [pathFolder, setPathFolder] = useState('')

    const [draggingNew, setDraggingNew] = useState(false)


    const createNewFile = async (fileName, content = '{}') => {
        if (fileName == null) return
        if (files.find(a => a === fileName)) {
            await alertMessage({ message: 'El fichero existe' })
            return
        }
        const fullPath = await UnirRutas([pathFolder, fileName])
        await EscribirArchivo(fullPath, content)
        setfiles([...files, fileName])
        return true
    }

    const handleDragOnEmpty = async (e) => {
        e.preventDefault()
        try {
            const response = await promptUser({
                message: 'Que nombre le quieres poner al archivo'
            })
            const fileName = response?.endsWith('.' + filesExtension) ? response : response + `.${filesExtension}`
            const data = e.dataTransfer.getData('text')
            if (!data) return
            const created = await createNewFile(fileName, data)
            if (created !== true) return
            const dataJSON = JSON.parse(data)
            const snippetKey = dataJSON[Object.keys(dataJSON)[0]].key
            if (currentSnippetKey == snippetKey)
                setCurrentSnippetKey('')
            deleteSnippet(snippetKey)
        } catch (error) {
            // Ignorado
        } finally {
            setDraggingNew(false)
        }
    }

    return (
        <Box className={'drawer'} sx={{
            ...drawerStyle,
            left: '0px'
        }}>
            <Box sx={{ overflow: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', py: 1, backgroundColor: 'var(--drawer-header-color)', color: 'white' }}>
                    <OpenFolderButton setfiles={setfiles} setPathFolder={setPathFolder} />
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
                <MenuList dense sx={{ pb: 0 }}>
                    {files.map((item) =>
                        <FileMenuItem key={item}
                            isSelected={currentPathFile.endsWith(item)} item={item}
                            onClick={async () => {
                                if (!(await lookForSave())) return
                                setCurrentPathFile(pathFolder + '/' + item)
                            }}
                            onDelete={async () => {
                                await EliminarArchivo(
                                    await UnirRutas([pathFolder, item])
                                )
                                setfiles([...files.filter(f => f !== item)])
                                setCurrentPathFile('')
                            }}
                            handleDropSnippet={async (data) => {
                                const dataJSON = JSON.parse(data)
                                const snippet = dataJSON[Object.keys(dataJSON)[0]]

                                await AgregarSnippet(await UnirRutas([pathFolder, item]), JSON.stringify(snippet))

                                const snippetKey = snippet.key
                                if (currentSnippetKey == snippetKey)
                                    setCurrentSnippetKey('')
                                deleteSnippet(snippetKey)
                            }}
                        />
                    )}
                </MenuList>
                <Box className={clsx('droppable-newfile', { 'active': draggingNew })} sx={{ minHeight: '200px', flexGrow: 2 }}
                    onDrop={handleDragOnEmpty}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setDraggingNew(true)}
                    onDragLeave={() => setDraggingNew(false)}
                />
            </Box>
            <Box sx={{ margin: 1 }}>
                <CreateNewFileButton onCreateNewFile={async (fileName, content) => {
                    createNewFile(fileName, content)
                }} />
            </Box>
        </Box>
    )
}

type FileMenuItemProps = {
    isSelected: boolean,
    item: string,
    onClick: () => void
    onDelete: () => void
    handleDropSnippet: (snippet: string) => void
}

function FileMenuItem({ item, isSelected, onClick, onDelete, handleDropSnippet }: FileMenuItemProps) {
    const fileName = item.replace('.' + filesExtension, '');
    const [droppingSnippet, setDroppingSnippet] = useState(false);
    const dragCounter = useRef(0);

    return (
        <MenuItem
            key={item}
            selected={isSelected}
            onClick={onClick}
            className={clsx('droppable-newfile list-item', { 'active': droppingSnippet })}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={(e) => {
                e.preventDefault();
                dragCounter.current++;
                if (dragCounter.current === 1) {
                    setDroppingSnippet(true);
                }
            }}
            onDragLeave={(e) => {
                e.preventDefault();
                dragCounter.current--;
                if (dragCounter.current === 0) {
                    setDroppingSnippet(false);
                }
            }}
            onDrop={(e) => {
                e.preventDefault();
                if (isSelected) return;
                dragCounter.current = 0; // Reseteamos el contador
                setDroppingSnippet(false);

                const data = e.dataTransfer.getData('text');
                handleDropSnippet(data);
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <Typography variant="subtitle1" color="initial">{fileName}</Typography>

                <IconButton
                    className='list-item__action'
                    size="small"
                    onClick={async (e) => {
                        e.stopPropagation();
                        const confirmed = await confirmAction({
                            message: '¿Seguro que quieres borrar el archivo?'
                        })
                        if (confirmed !== true) return
                        onDelete();
                    }}
                    sx={{ ml: 1 }}
                >
                    <Delete sx={{ color: 'red' }} />
                </IconButton>
            </Box>
        </MenuItem>
    );
}
