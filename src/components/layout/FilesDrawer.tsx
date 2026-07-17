import { invoke } from "@tauri-apps/api/core";
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useAppProviderContext } from '../providers/AppProvider';
import { useI18nProviderContext } from '@/I18nProvider';
import { FaFolder, FaTrash } from 'react-icons/fa'
import { extensionSnippetFiles, localstoragekeys } from "@/vars";
import { Button } from '../ui/button';
import createFile from '@/dialogs/CreateFile';
import confirmDialog from '@/dialogs/Confirm';
import promptDialog from "@/dialogs/PromptDialog";

type FilesDrawerProps = {
};

export default function FilesDrawer({ }: FilesDrawerProps) {
    const { $t } = useI18nProviderContext()
    const { pathFolder, setPathFolder, setSelectedSnippet, setJsonSnippets, selectedSnippet, setActiveFile, activeFile } = useAppProviderContext()
    const [files, setFiles] = useState<string[]>([])

    const openFolder = (folder: string) => invoke<any>('get_snippet_files', { folder }).then((r) => {
        setPathFolder(r.path)
        setFiles(r.files)
    })

    const handleDrop = async (event: React.DragEvent, item: string) => {
        // 1. CAPTURAR EL PAYLOAD INMEDIATAMENTE (Antes de cualquier await)
        let payload = event.dataTransfer.getData('application/x-snippet');
        if (!payload) payload = event.dataTransfer.getData('text/plain');

        // Evitamos propagación del drag de inmediato
        event.preventDefault();

        if (!payload) return;

        let newFile = false;
        try {
            // 2. AHORA SÍ podemos usar procesos asíncronos con seguridad
            if (!item) {
                const dialogResult = await promptDialog({
                    question: 'Nombre del archivo nuevo'
                });
                item = (dialogResult ?? { response: '' }).response;
                newFile = true;
            }

            // Si cancela el prompt o no pone nombre, salimos en silencio
            if (!item || item.trim() === '') return;

            // Normalizar la extensión
            if (!item.endsWith(extensionSnippetFiles)) {
                item = item + extensionSnippetFiles;
            }

            const data = JSON.parse(payload);
            const { key, sourceFile } = data as { key: string, sourceFile: string };

            // Si se suelta sobre el mismo archivo de origen, cancelamos la acción
            if (item === sourceFile) return;

            if (!pathFolder || !sourceFile) return;

            // Leer contenido del origen
            const sourceContents = await invoke<string>('read_file', { path: pathFolder, filename: sourceFile });
            const sourceObj = sourceContents ? JSON.parse(sourceContents) : {};

            if (!(key in sourceObj)) return;

            // Intentar leer el destino (si es nuevo, controlamos que empiece vacío)
            let targetObj: Record<string, any> = {};
            if (!newFile) {
                try {
                    const targetContents = await invoke<string>('read_file', { path: pathFolder, filename: item });
                    targetObj = targetContents ? JSON.parse(targetContents) : {};
                } catch (e) {
                    // Si da error al leer porque no existía físicamente, empieza como objeto vacío
                    targetObj = {};
                }
            }

            // Mover el snippet
            const moved = sourceObj[key];
            delete sourceObj[key];
            targetObj[key] = moved;

            // Guardar ambos archivos en el disco duro mediante Tauri
            await invoke('write_file', { folder: pathFolder, filename: sourceFile, content: JSON.stringify(sourceObj, null, 2) });
            await invoke('write_file', { folder: pathFolder, filename: item, content: JSON.stringify(targetObj, null, 2) });

            // Actualizar la interfaz si el origen era el archivo visualizado actualmente
            if (sourceFile === activeFile) {
                setJsonSnippets(JSON.stringify(sourceObj, null, 2));
                if (selectedSnippet?.key === key) setSelectedSnippet({});
            }

            // Si creamos un archivo nuevo con éxito, actualizamos la lista lateral de archivos
            if (newFile) {
                setFiles((prevFiles) => [...prevFiles, item]);
                // Tip extra: Podrías abrir el archivo nuevo automáticamente si quieres
                // setActiveFile(item);
            }

        } catch (error) {
            // En lugar de alert, lo registramos en consola para debuggear
            console.error('Error handling drop:', error);
        }
    }

    const removeFile = async (filename: string) => {
        if (!pathFolder) return
        const response = await confirmDialog({
            title: $t('confirm-delete-file'),
            description: $t('confirm-delete-file')
        })
        if (response !== true) return
        await invoke('delete_file', { folder: pathFolder, filename })
        setFiles((prev) => prev.filter((item) => item !== filename))
        if (filename === activeFile) {
            setActiveFile('')
            setJsonSnippets('')
            setSelectedSnippet({})
        }
    }

    useEffect(() => {
        const lastOpened = localStorage.getItem(localstoragekeys.last_opened) ?? ''
        openFolder(lastOpened)
    }, [])

    return (
        <aside className={cn('py-2 flex flex-col',
            'fixed bottom-0 top-(--height-appbar) w-(--drawer-width) left-0',
            'bg-gray-200 dark:bg-gray-800'
        )}>
            <div className="flex gap-2 items-center px-2">
                <div className="text-2xl dark:text-white">
                    <FaFolder onClick={async () => {
                        const folder = await invoke<string>('select_directory')
                        localStorage.setItem(localstoragekeys.last_opened, folder)
                        openFolder(folder)
                    }} />
                </div>
                <span className="cursor-pointer dark:text-white overflow-hidden text-wrap wrap-break-word" onClick={() => {
                    invoke('open_folder', { path: pathFolder })
                }}>
                    {pathFolder}
                </span>
            </div>
            <hr className="mb-4" />
            <div className="overflow-auto px-2">
                {files.map((item) => <FileItem onDrop={(e, i) => void handleDrop(e, i)} key={item} item={item} onRemove={removeFile} />)}
            </div>
            <DropEmptyZone onDrop={handleDrop} />
            <div className='px-2 pt-2'>
                <Button className='w-full' onClick={async () => {
                    if (!pathFolder) return
                    const result = await createFile({})
                    if (!result?.filename) return
                    const filename = result.filename.endsWith(extensionSnippetFiles)
                        ? result.filename
                        : `${result.filename}${extensionSnippetFiles}`
                    await invoke('write_file', { folder: pathFolder, filename, content: '{}' })
                    setActiveFile(filename)
                    setJsonSnippets('{}')
                    setSelectedSnippet({})
                    setFiles((prev) => [...prev, filename])
                }}>{$t('action-addfile')}</Button>
            </div>
        </aside>
    );
}

type DropEmptyZoneProps = {
    onDrop: (event: React.DragEvent, item: string) => void
}

function DropEmptyZone({ onDrop }: DropEmptyZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const handleDragOver = (event: React.DragEvent) => {
        console.log('dragging over', '')
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }

    const handleDragEnter = (event: React.DragEvent) => {
        console.log('drag enter', '')
        event.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = () => {
        console.log('drag leave', '')
        setIsDragOver(false)
    }
    return (
        <div
            onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
            onDrop={(e) => {
                e.preventDefault()
                setIsDragOver(false)
                onDrop(e, '')
            }}
            className={cn(
                "min-h-20 flex-1",
                { 'bg-gray-400/70': isDragOver }
            )}></div>
    )
}

type FileItemProps = {
    item: string
    onRemove: (item: string) => void
    onDrop: (event: React.DragEvent, item: string) => void
}

function FileItem({ item, onRemove, onDrop }: FileItemProps) {
    const { pathFolder, activeFile, setJsonSnippets, setSelectedSnippet, setActiveFile } = useAppProviderContext()
    const [isDragOver, setIsDragOver] = useState(false)

    // Pon esto justo dentro de tu componente FileItem para probar:
    useEffect(() => {
        const handleGlobalDragOver = () => {
            console.log("Drag global detectado en el documento");
        };
        document.addEventListener('dragover', handleGlobalDragOver);
        return () => document.removeEventListener('dragover', handleGlobalDragOver);
    }, []);

    const handleDragOver = (event: React.DragEvent) => {
        console.log('dragging over', item)
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }

    const handleDragEnter = (event: React.DragEvent) => {
        console.log('drag enter', item)
        event.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = () => {
        console.log('drag leave', item)
        setIsDragOver(false)
    }
    return (
        <div onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            onDrop(e, item)
        }} className={cn(
            'hover:bg-primary px-2 hover:text-white cursor-pointer',
            { 'bg-primary text-white': activeFile == item, 'drag-over': isDragOver },
            'flex items-center item_list'
        )} onClick={async () => {
            setActiveFile(item)
            const contents = await invoke<string>('read_file', { path: pathFolder, filename: item })
            setJsonSnippets(contents)
            setSelectedSnippet({})
        }}>
            <div className="pointer-events-none">
                <h3 className='font-bold text-lg'>{item.replace(extensionSnippetFiles, '')}</h3>
            </div>
            <div className='ml-auto'>
                <FaTrash className='text-red-500 text-2xl item_list-remove' onClick={(event) => {
                    event.stopPropagation()
                    onRemove(item)
                }} />
            </div>
        </div>
    )
}
