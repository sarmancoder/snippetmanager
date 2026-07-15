import { invoke } from "@tauri-apps/api/core";
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useAppProviderContext } from '../providers/AppProvider';
import { FaFolder } from 'react-icons/fa'
import { extensionSnippetFiles, localstoragekeys } from "@/vars";

type FilesDrawerProps = {
};

export default function FilesDrawer({ }: FilesDrawerProps) {
    const { pathFolder, setPathFolder, setSelectedSnippet } = useAppProviderContext()
    const [files, setFiles] = useState<string[]>([])

    const openFolder = (folder: string) => invoke<any>('get_snippet_files', { folder }).then((r) => {
        setPathFolder(r.path)
        setFiles(r.files)
    })

    useEffect(() => {
        const lastOpened = localStorage.getItem(localstoragekeys.last_opened) ?? ''
        openFolder(lastOpened)
    }, [])

    return (
        <aside className={cn('py-2',
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
            <div>
                {files.map((item) => <FileItem item={item} />)}
            </div>
        </aside>
    );
}

function FileItem({ item }: { item: string }) {
    const {pathFolder, activeFile, setJsonSnippets, setSelectedSnippet, setActiveFile} = useAppProviderContext()
    return (
        <div key={item} className={cn(
            "py-1 hover:bg-primary px-2 text-xl hover:text-white transition-colors cursor-pointer",
            {'text-white bg-primary': activeFile == item}
        )} onClick={async () => {
            setActiveFile(item)
            const contents = await invoke<string>('read_file', {path: pathFolder, filename: item})
            setJsonSnippets(contents)
            setSelectedSnippet({})
        }}>
            <span>
                {item.replace(extensionSnippetFiles, '')}
            </span>
        </div>
    )
}
