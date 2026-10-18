import { getSnippetFiles, readFile } from '@/lib/filesystem';
import { parseJsonc } from '@/lib/jsonc';
import { extensionSnippetFiles } from '@/vars';

export type SnippetEntry = {
    key: string
    name: string
    file: string
    prefix: string
    description: string
    scope: string
    isFileTemplate: boolean
    body: string[]
    languages: string[]
    raw: Record<string, unknown>
}

function removeExtension(filename: string): string {
    return filename.replace(new RegExp(`${extensionSnippetFiles}$`, 'i'), '');
}

export function snippetLanguages(scope: string, file: string): string[] {
    if (scope.trim().length > 0) {
        return Array.from(new Set(
            scope.split(',').map((language) => language.trim().toLowerCase()).filter(Boolean)
        ));
    }
    return [removeExtension(file).trim().toLowerCase()].filter(Boolean);
}

function uniqueKey(map: Record<string, SnippetEntry>, name: string, file: string): string {
    if (!(name in map)) return name;

    // Si el nombre ya existe (snippets repetidos en varios archivos), se
    // desambigua añadiendo el nombre del archivo. Si aun así colisiona, se
    // añade un contador al final.
    const base = removeExtension(file);
    const withFile = `${name} (${base})`;
    if (!(withFile in map)) return withFile;

    let counter = 2;
    let candidate = `${name} (${base}-${counter})`;
    while (candidate in map) {
        counter += 1;
        candidate = `${name} (${base}-${counter})`;
    }
    return candidate;
}

export async function loadAllSnippets(folder: string): Promise<{ path: string, snippets: Record<string, SnippetEntry> }> {
    const { path, files } = await getSnippetFiles(folder);
    const snippets: Record<string, SnippetEntry> = {};

    await Promise.all(files.map(async (file) => {
        let contents = '';
        try {
            contents = await readFile(path, file);
        } catch (error) {
            console.error(`No se pudo leer el archivo ${file}`, error);
            return;
        }

        let parsed: Record<string, unknown> = {};
        try {
            parsed = parseJsonc(contents || '{}');
        } catch (error) {
            console.error(`No se pudo parsear el archivo ${file}`, error);
            return;
        }

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;

        for (const [name, value] of Object.entries(parsed)) {
            if (!value || typeof value !== 'object' || Array.isArray(value)) continue;

            const data = value as Record<string, unknown>;
            const prefix = typeof data.prefix === 'string' ? data.prefix : name;
            const description = typeof data.description === 'string' ? data.description : '';
            const scope = typeof data.scope === 'string' ? data.scope : '';
            const isFileTemplate = Boolean(data.isFileTemplate);
            const body = Array.isArray(data.body)
                ? data.body.map((line) => String(line))
                : typeof data.body === 'string' ? [data.body] : [];

            const key = uniqueKey(snippets, name, file);
            snippets[key] = {
                key,
                name,
                file,
                prefix,
                description,
                scope,
                isFileTemplate,
                body,
                languages: snippetLanguages(scope, file),
                raw: data
            };
        }
    }));

    return { path, snippets };
}
