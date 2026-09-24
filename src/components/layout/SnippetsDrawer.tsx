import { cn } from '@/lib/utils';
import { useEffect, useMemo } from 'react';
import { useAppProviderContext } from '../providers/AppProvider';
import { VsCodeSnippet } from '@/lib/validations';
import { Button } from '../ui/button';
import { useI18nProviderContext } from '@/I18nProvider';
import createSnippet from '@/dialogs/CreateSnippet';
import {FaTrash} from 'react-icons/fa'
import confirmDialog from '@/dialogs/Confirm';
import { parseJsonc } from '@/lib/jsonc';

type SnippetsDrawerProps = {
};

type SnippetItem = {
    key: string,
    description: string,
    isFileTemplate: boolean,
    body: string[],
    scope: string,
    prefix: string
}

export default function SnippetsDrawer({ }: SnippetsDrawerProps) {
    const { $t } = useI18nProviderContext()
    const { jsonSnippets, selectedSnippet, setJsonSnippets, writeInFile, setSaved, setSelectedSnippet, activeFile } = useAppProviderContext()

    const snippetsList = useMemo<SnippetItem[]>(() => {
        if (jsonSnippets.length == 0) return []
        try {
            const dataSnippets = parseJsonc(jsonSnippets)
            return Object.keys(dataSnippets).map((a) => ({
                key: a,
                ...dataSnippets[a]
            }))
        } catch (error) {
            console.log('Hubo un error:', error)
            console.log(jsonSnippets)
            return []
        }
    }, [jsonSnippets])

    useEffect(() => {
        console.log('valor de la variable snippetsList', snippetsList)
    }, [snippetsList])

    return (
        <aside className={cn('py-2 flex flex-col',
            'fixed bottom-0 top-(--height-appbar) w-(--drawer-width) right-0',
            'bg-gray-200 dark:bg-gray-800'
        )}>
            <div className='h-full overflow-auto'>
                <div>
                    {snippetsList.map((item) => <SnippetItem selectedSnippet={selectedSnippet.key!} item={item}
                        onSelect={(e) => {
                            setSelectedSnippet(e)
                            setSaved(true)
                        }}
                        onRemove={async (e) => {
                            try {
                                const response = await confirmDialog({
                                    title: 'Eliminar snippet',
                                    description: '¿Realmente quieres eliminar el snippet? Esta acción no se puede deshacer'
                                })
                                if (response !== true) return
                                const parsedSnippets = parseJsonc(jsonSnippets || '{}')
                                if (parsedSnippets && typeof parsedSnippets === 'object' && e.key! in parsedSnippets) {
                                    delete parsedSnippets[e.key!]
                                    const filestr = JSON.stringify(parsedSnippets)
                                    setJsonSnippets(filestr)
                                    writeInFile(filestr)
                                }
                                if (selectedSnippet.key == e.key) {
                                    setSelectedSnippet({})
                                }
                            } catch (error) {
                                console.error('Error removing snippet:', error)
                            }
                        }}
                    />)}
                </div>
            </div>
            {activeFile.length > 0 && <div className='px-2 pt-2'>
                <Button className={'w-full'} onClick={async () => {
                    const snippet = await createSnippet({})
                    if (!snippet) return
                    const keySnippet = snippet!.prefix + new Date().getTime()
                    const newSnippet: VsCodeSnippet = {
                        ...snippet,
                        key: keySnippet,
                        body: [],
                        scope: '',
                        isFileTemplate: false
                    }
                    const filestr = JSON.stringify({
                        ...parseJsonc(jsonSnippets),
                        [keySnippet]: newSnippet
                    })
                    setJsonSnippets(filestr)
                    writeInFile(filestr)
                }}>{$t('action-addsnippet')}</Button>
            </div>}
        </aside>
    );
}

type SnippetItemProps = {
    item: VsCodeSnippet,
    selectedSnippet: string,
    onSelect: (e: VsCodeSnippet) => void
    onRemove: (e: VsCodeSnippet) => void
}

function SnippetItem({ item, onSelect, onRemove, selectedSnippet }: SnippetItemProps) {
    const { activeFile } = useAppProviderContext()

    const handleDragStart = (event: React.DragEvent) => {
        try {
            console.log('arrastrando')
            const payload = JSON.stringify({ key: item.key, sourceFile: activeFile })
            event.dataTransfer.setData('application/x-snippet', payload)
            // Fallback for environments that only allow text/plain
            event.dataTransfer.setData('text/plain', payload)
            event.dataTransfer.effectAllowed = 'move'
        } catch (error) {
            console.error('Error preparing drag data', error)
        }
    }

    return (
        <div draggable={true} onDragStart={handleDragStart} onDragEnd={() => {}} className={cn(
            'hover:bg-primary px-2 hover:text-white cursor-pointer',
            { 'bg-primary text-white': selectedSnippet == item.key },
            'flex items-center item_list'
        )} onClick={() => onSelect(item)}>
            <div className="pointer-events-none select-none">
                <h3 className='font-bold text-lg'>{item.prefix}</h3>
                <p className='line-clamp-2'>{item.description}</p>
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
