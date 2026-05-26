import { SxProps } from "@mui/material";

export const drawerWidth = '200px'
export const filesExtension = "code-snippets"

export const languageScopes = [
    // Web Core
    { value: 'javascriptreact', label: 'React JS (JSX)' },
    { value: 'typescriptreact', label: 'React TS (TSX)' },
    { value: 'vue', label: 'Vue SFC' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'scss', label: 'SCSS' },

    // Backend
    { value: 'php', label: 'PHP' },
    { value: 'python', label: 'Python' },
    { value: 'go', label: 'Go' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'rust', label: 'Rust' },
    { value: 'ruby', label: 'Ruby' },

    // Config & Data
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' },
    { value: 'sql', label: 'SQL' },
    { value: 'shell', label: 'Shell / Bash' },
    { value: 'dockerfile', label: 'Dockerfile' },

    // Otros populares
    { value: 'xml', label: 'XML' },
    { value: 'lua', label: 'Lua' },
    { value: 'cpp', label: 'C++' }
] as const;

export type LanguageScopeValue = (typeof languageScopes)[number]['value'] | '';

export const drawerStyle: SxProps<any> = {
    backgroundColor: 'var(--drawer-color)',
    position: 'fixed',
    top: (theme) => (theme.mixins.toolbar.minHeight as number) + 6,
    bottom: 0,
    width: drawerWidth,
    display: 'flex',
    flexDirection: 'column'
}
