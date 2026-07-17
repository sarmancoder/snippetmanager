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

type FilesDrawerProps = {
};

export default function FilesDrawer({ }: FilesDrawerProps) {
    const { $t } = useI18nProviderContext()
    const { pathFolder, setPathFolder, setSelectedSnippet, setJsonSnippets, setActiveFile, activeFile } = useAppProviderContext()
    const [files, setFiles] = useState<string[]>([])

    const openFolder = (folder: string) => invoke<any>('get_snippet_files', { folder }).then((r) => {
        setPathFolder(r.path)
        setFiles(r.files)
    })

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
            <div className="flex-1 overflow-auto px-2">
                {files.map((item) => <FileItem key={item} item={item} onRemove={removeFile} />)}
            </div>
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

type FileItemProps = {
    item: string
    onRemove: (item: string) => void
}

function FileItem({ item, onRemove }: FileItemProps) {
    const { pathFolder, activeFile, setJsonSnippets, setSelectedSnippet, setActiveFile, selectedSnippet } = useAppProviderContext()

    const handleDragOver = (event: React.DragEvent) => {
        console.log('dragging over', item)
        event.preventDefault()
        event.dataTransfer.dropEffect = 'move'
    }

    // Pon esto justo dentro de tu componente FileItem para probar:
    useEffect(() => {
        const handleGlobalDragOver = (e: DragEvent) => {
            console.log("Drag global detectado en el documento");
        };
        document.addEventListener('dragover', handleGlobalDragOver);
        return () => document.removeEventListener('dragover', handleGlobalDragOver);
    }, []);

    const handleDragEnter = (event: React.DragEvent) => {
        console.log('drag enter', item)
        event.preventDefault()
    }

    const handleDragLeave = () => {
        console.log('drag leave', item)
    }

    const handleDrop = async (event: React.DragEvent) => {
        event.preventDefault()
        try {
            let payload = event.dataTransfer.getData('application/x-snippet')
            if (!payload) payload = event.dataTransfer.getData('text/plain')
            if (!payload) return
            const data = JSON.parse(payload)
            const { key, sourceFile } = data as { key: string, sourceFile: string }

            // If dropping onto the currently opened file, do nothing
            if (item === activeFile) return

            if (!pathFolder || !sourceFile) return

            // Read source and target files
            const sourceContents = await invoke<string>('read_file', { path: pathFolder, filename: sourceFile })
            const targetContents = await invoke<string>('read_file', { path: pathFolder, filename: item })

            const sourceObj = sourceContents ? JSON.parse(sourceContents) : {}
            const targetObj = targetContents ? JSON.parse(targetContents) : {}

            if (!(key in sourceObj)) return

            // Move snippet
            const moved = sourceObj[key]
            delete sourceObj[key]
            targetObj[key] = moved

            // Write back files
            await invoke('write_file', { folder: pathFolder, filename: sourceFile, content: JSON.stringify(sourceObj) })
            await invoke('write_file', { folder: pathFolder, filename: item, content: JSON.stringify(targetObj) })

            // Update UI if source was active
            if (sourceFile === activeFile) {
                setJsonSnippets(JSON.stringify(sourceObj))
                if (selectedSnippet?.key === key) setSelectedSnippet({})
            }

        } catch (error) {
            console.error('Error handling drop', error)
        }
    }

    return (
        <div onDragEnter={handleDragEnter} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} className={cn(
            'hover:bg-primary px-2 hover:text-white cursor-pointer',
            { 'bg-primary text-white': activeFile == item },
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
