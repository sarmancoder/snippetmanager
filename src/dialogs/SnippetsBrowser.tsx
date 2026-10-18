import languageScopes from '@/components/DualEditor/languages';
import { useAppProviderContext } from '@/components/providers/AppProvider';
import { Chip } from '@/components/ui/chip';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useI18nProviderContext } from '@/I18nProvider';
import { readFile } from '@/lib/filesystem';
import { loadAllSnippets, SnippetEntry } from '@/lib/snippets';
import { cn } from '@/lib/utils';
import { extensionSnippetFiles } from '@/vars';
import { useEffect, useMemo, useState } from 'react';
import { FiSearch } from 'react-icons/fi';

type SnippetsBrowserProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const allLanguagesKey = '__all__';

function languageLabel(value: string): string {
    const found = languageScopes.find((language) => language.value === value);
    if (found) return found.label;
    return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function SnippetsBrowser({ open, onOpenChange }: SnippetsBrowserProps) {
    const { $t } = useI18nProviderContext();
    const { pathFolder, setActiveFile, setJsonSnippets, setSelectedSnippet, setSaved } = useAppProviderContext();

    const [snippetsFolder, setSnippetsFolder] = useState('');
    const [snippets, setSnippets] = useState<Record<string, SnippetEntry>>({});
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState(allLanguagesKey);

    useEffect(() => {
        if (!open) return;

        setSearch('');
        setSelectedLanguage(allLanguagesKey);
        setSnippets({});

        let cancelled = false;
        setLoading(true);
        loadAllSnippets(pathFolder ?? '')
            .then(({ path, snippets }) => {
                if (cancelled) return;
                setSnippetsFolder(path);
                setSnippets(snippets);
            })
            .catch((error) => {
                console.error('Error loading snippets', error);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [open, pathFolder]);

    const searchResults = useMemo(() => {
        const items = Object.values(snippets);
        const query = search.trim().toLowerCase();
        if (!query) return items;

        return items.filter((item) =>
            item.key.toLowerCase().includes(query)
            || item.name.toLowerCase().includes(query)
            || item.prefix.toLowerCase().includes(query)
            || item.description.toLowerCase().includes(query)
            || item.file.toLowerCase().includes(query)
            || item.body.some((line) => line.toLowerCase().includes(query))
        );
    }, [snippets, search]);

    const languages = useMemo(() => {
        const counts = new Map<string, number>();
        for (const item of searchResults) {
            for (const language of item.languages) {
                counts.set(language, (counts.get(language) ?? 0) + 1);
            }
        }
        return Array.from(counts.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([value, count]) => ({ value, count, label: languageLabel(value) }));
    }, [searchResults]);

    

    useEffect(() => {
        if (selectedLanguage === allLanguagesKey) return;
        if (!languages.some((language) => language.value === selectedLanguage)) {
            setSelectedLanguage(allLanguagesKey);
        }
    }, [languages, selectedLanguage]);

    const visibleSnippets = useMemo(() => {
        const items = searchResults.filter((item) =>
            selectedLanguage === allLanguagesKey || item.languages.includes(selectedLanguage)
        );
        return items.sort((a, b) =>
            a.prefix.localeCompare(b.prefix) || a.key.localeCompare(b.key)
        );
    }, [searchResults, selectedLanguage]);

    const openSnippet = async (item: SnippetEntry) => {
        try {
            const contents = await readFile(snippetsFolder, item.file);
            setActiveFile(item.file);
            setJsonSnippets(contents);
            setSelectedSnippet({ ...item.raw, key: item.name });
            setSaved(true);
            onOpenChange(false);
        } catch (error) {
            console.error('Error opening snippet', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex flex-col gap-3 sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{$t('title-snippets-browser')}</DialogTitle>
                    <DialogDescription>{$t('description-snippets-browser')}</DialogDescription>
                </DialogHeader>
                <div className="relative">
                    <FiSearch className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={$t('search-snippets-placeholder')}
                        className="pl-8"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Chip
                        selected={selectedLanguage === allLanguagesKey}
                        onClick={() => setSelectedLanguage(allLanguagesKey)}
                    >
                        {$t('chip-all-languages')} ({Object.keys(snippets).length})
                    </Chip>
                    {languages.map((language) => (
                        <Chip
                            key={language.value}
                            selected={selectedLanguage === language.value}
                            onClick={() => setSelectedLanguage(language.value)}
                        >
                            {language.label} ({language.count})
                        </Chip>
                    ))}
                </div>
                <div className="max-h-[55vh] min-h-24 overflow-y-auto rounded-lg border">
                    {loading && (
                        <p className="p-4 text-center text-sm text-muted-foreground">
                            {$t('status-loading-snippets')}
                        </p>
                    )}
                    {!loading && visibleSnippets.length === 0 && (
                        <p className="p-4 text-center text-sm text-muted-foreground">
                            {$t('message-no-snippets-found')}
                        </p>
                    )}
                    {!loading && visibleSnippets.map((item) => (
                        <SnippetBrowserItem key={item.key} item={item} onOpen={openSnippet} />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}

type SnippetBrowserItemProps = {
    item: SnippetEntry
    onOpen: (item: SnippetEntry) => Promise<void>
}

function SnippetBrowserItem({ item, onOpen }: SnippetBrowserItemProps) {
    return (
        <div
            className={cn(
                'hover:bg-primary hover:text-white cursor-pointer border-b px-3 py-2 transition-colors last:border-b-0'
            )}
            onClick={() => void onOpen(item)}
        >
            <div className="flex items-center gap-2">
                <h3 className="font-bold">{item.prefix}</h3>
                {item.key !== item.prefix && (
                    <span className="text-xs opacity-70">{item.key}</span>
                )}
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">
                    {item.file.replace(extensionSnippetFiles, '')}
                </span>
            </div>
            {item.description && (
                <p className="line-clamp-2 text-sm">{item.description}</p>
            )}
            {item.body.length > 0 && (
                <pre className="mt-1 max-w-full overflow-hidden text-xs whitespace-pre-wrap opacity-70 line-clamp-2">
                    {item.body.join('\n')}
                </pre>
            )}
        </div>
    );
}
