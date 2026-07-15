import { cn } from '@/lib/utils';
import { useEffect, useMemo } from 'react';
import { useAppProviderContext } from '../providers/AppProvider';
import { VsCodeSnippet } from '@/lib/validations';
import { Button } from '../ui/button';
import { useI18nProviderContext } from '@/I18nProvider';
import createSnippet from '@/dialogs/CreateSnippet';

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
            const dataSnippets = JSON.parse(jsonSnippets)
            return Object.keys(dataSnippets).map((a) => {
                return {
                    key: a,
                    ...dataSnippets[a]
                }
            })
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
                    />)}
                </div>
            </div>
            {activeFile.length > 0 && <div className='px-2 pt-2'>
                <Button className={'w-full'} onClick={async () => {
                    const snippet = await createSnippet({

                    })!
                    console.log(snippet)
                    const keySnippet = snippet!.prefix + new Date().getTime()
                    const newSnippet: VsCodeSnippet = {
                        description: snippet!.description,
                        prefix: snippet!.prefix,
                        key: keySnippet,
                        body: [],
                        scope: '',
                        isFileTemplate: false
                    }
                    const filestr = JSON.stringify({
                        ...JSON.parse(jsonSnippets),
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
}

function SnippetItem({ item, onSelect, selectedSnippet }: SnippetItemProps) {
    return (
        <div className={cn(
            'hover:bg-primary px-2 hover:text-white cursor-pointer',
            { 'bg-primary text-white': selectedSnippet == item.key }
        )} onClick={() => onSelect(item)}>
            <h3 className='font-bold text-lg'>{item.prefix}</h3>
            <p>{item.description}</p>
        </div>
    )
}
