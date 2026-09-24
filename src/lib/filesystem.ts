import { mkdir, readDir, readTextFile, remove, writeTextFile } from '@tauri-apps/plugin-fs'
import { open } from '@tauri-apps/plugin-dialog'
import { appDataDir, homeDir, join } from '@tauri-apps/api/path'
import { platform } from '@tauri-apps/plugin-os'
import { openPath } from '@tauri-apps/plugin-opener'

export async function getSnippetsFolder(): Promise<string> {
    const currentPlatform = await platform()
    const baseFolder = currentPlatform === 'linux' ? await homeDir() : await appDataDir()
    return join(baseFolder, ...(currentPlatform === 'linux'
        ? ['.config', 'Code', 'User', 'snippets']
        : ['Code', 'User', 'snippets']))
}

export async function getSnippetFiles(folder = ''): Promise<{ path: string, files: string[] }> {
    const path = folder || await getSnippetsFolder()
    if (!path) return { path: '', files: [] }

    try {
        const entries = await readDir(path)
        return {
            path,
            files: entries
                .filter((entry) => entry.isFile && entry.name.endsWith('.code-snippets'))
                .map((entry) => entry.name),
        }
    } catch {
        return { path, files: [] }
    }
}

export async function selectDirectory(): Promise<string | null> {
    const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select a directory',
    })
    return typeof selected === 'string' ? selected : null
}

export async function openFolder(path: string): Promise<void> {
    if (!path) throw new Error('empty path')
    await openPath(path)
}

export async function readFile(folder: string, filename: string): Promise<string> {
    if (!folder || !filename) throw new Error('empty folder or filename')
    return readTextFile(await join(folder, filename))
}

export async function writeFile(folder: string, filename: string, content: string): Promise<void> {
    if (!folder || !filename) throw new Error('empty folder or filename')
    const path = await join(folder, filename)
    await mkdir(folder, { recursive: true })
    await writeTextFile(path, content)
}

export async function deleteFile(folder: string, filename: string): Promise<void> {
    if (!folder || !filename) throw new Error('empty folder or filename')
    await remove(await join(folder, filename))
}
