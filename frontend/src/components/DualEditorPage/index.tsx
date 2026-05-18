import { Editor, OnMount } from '@monaco-editor/react';
import { Box, Card, CardContent, CardHeader, TextField } from '@mui/material';
import { useEffect, useMemo, useReducer, useRef } from 'react';
import Select from "react-select";
import { useAppContext } from '../../AppSnippetsContext';
import { languageScopes, LanguageScopeValue } from '../../config';
import { SnippetsReplacements } from './SnippetsReplacements';
import CardActions from '@mui/material/CardActions';

type SnippetState = {
    prefix: string
    description: string
    scope: string
    body: string
}

type SnippetAction =
    | { type: 'SET_FIELD'; field: keyof SnippetState; value: string }
    | { type: 'RESET'; payload: SnippetState }

function snippetReducer(state: SnippetState, action: SnippetAction): SnippetState {
    switch (action.type) {
        case 'SET_FIELD':
            return { ...state, [action.field]: action.value }
        case 'RESET':
            return action.payload
        default:
            return state
    }
}

const initialState: SnippetState = {
    prefix: '',
    description: '',
    scope: '',
    body: '',
}

export default function DualEditorPage() {
    const { snippetsList, currentSnippetKey, setSnippetEditing, setsaved } = useAppContext()

    const bodyEditor = useRef<any>(null)
    const jsonResultRef = useRef<any>(null)
    const isUpdatingFromJSON = useRef(false) // 1️⃣ Se declara aquí, junto a los otros refs

    const [state, dispatch] = useReducer(snippetReducer, initialState)
    const { prefix, description, scope, body } = state

    useEffect(() => {
        const newSnippet = {
            key: currentSnippetKey, prefix, description, scope,
            body: body.split('\n')
        }

        if (jsonResultRef.current) {
            const { key, ...jsondata } = newSnippet

            // Leer el JSON actual y mergear, preservando propiedades extra
            let currentJSON: Record<string, any> = {}
            try {
                currentJSON = JSON.parse(jsonResultRef.current.getValue())
            } catch {
                // Si el JSON está roto, se parte de cero
            }

            const merged = {
                ...currentJSON,  // ← preserva propiedades extra
                ...jsondata,     // ← sobreescribe solo las conocidas
            }

            const jsonString = JSON.stringify(merged, null, 2)
            jsonResultRef.current.setValue(jsonString)
        }

        const snippetEditingFromList = snippetsList.find(a => a.key == currentSnippetKey)
        if (!currentSnippetKey) return

        const equal = JSON.stringify(snippetEditingFromList) == JSON.stringify(newSnippet)
        if (equal) return

        setsaved(false)
        setSnippetEditing({ prefix, description, scope, body: body.split('\n') })
    }, [prefix, description, scope, body])

    useEffect(() => {
        const snippet = snippetsList.find(a => a.key == currentSnippetKey)
        if (!snippet) return

        const resolvedScope = snippet.scope.split(',').map(a => {
            return languageScopes.find(x => x.value == a)?.value
        }).join(',')

        dispatch({
            type: 'RESET',
            payload: {
                prefix: snippet.prefix,
                description: snippet.description,
                scope: resolvedScope,
                body: snippet.body.join('\n'),
            }
        })

        if (bodyEditor.current) {
            bodyEditor.current.setValue(snippet.body.join('\n'))
        }
    }, [currentSnippetKey])

    const handleLeftEditorDidMount: OnMount = (editor, monaco: any) => {
        bodyEditor.current = editor
        monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        })
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        })
    }

    const handleEditorDidMount: OnMount = (editor, monaco) => {
        jsonResultRef.current = editor

        editor.onDidBlurEditorWidget(() => {
            try {
                const content = editor.getValue()
                const infoJSON = JSON.parse(content)

                dispatch({
                    type: 'RESET',
                    payload: {
                        prefix: infoJSON.prefix ?? '',
                        description: infoJSON.description ?? '',
                        scope: (infoJSON.scope ?? infoJSON.scopes ?? []).join?.(',') ?? infoJSON.scope ?? '',
                        body: (infoJSON.body ?? []).join('\n'),
                    }
                })

                bodyEditor.current?.setValue((infoJSON.body ?? []).join('\n'))
            } catch {
                // JSON inválido al salir, se ignora
            }
        })
    }

    const currentScope = useMemo<LanguageScopeValue>(() => {
        const _scope = scope.split(',')[0] as LanguageScopeValue
        if (_scope === 'javascriptreact') return 'javascript'
        if (_scope === 'typescriptreact') return 'typescript'
        if (_scope.length === 0) return 'plaintext' as any
        return _scope
    }, [scope])

    const handleReplaceSelection = (textToInsert: string) => {
        const editor = bodyEditor.current
        if (!editor) return
        const selections = editor.getSelections()

        if (selections?.length > 0) {
            editor.executeEdits('my-source', selections.map(sel => ({
                range: sel,
                text: textToInsert,
                forceMoveMarkers: true,
            })))
            editor.focus()
        }
    }

    return (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 5,
            p: 4
        }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    fullWidth
                    label="Prefijo"
                    value={prefix}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'prefix', value: e.target.value })}
                />
                <TextField
                    fullWidth
                    label="Descripción"
                    value={description}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
                />
                <Card variant="outlined">
                    <CardHeader
                        title="Contenido"
                        action={(
                            <Box>
                                <Select
                                    options={languageScopes}
                                    isMulti
                                    menuPortalTarget={document.body}
                                    styles={{
                                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                                        container: (base) => ({ ...base, width: '340px' })
                                    }}
                                    value={languageScopes.filter(a => scope.split(',').includes(a.value))}
                                    onChange={(c) => dispatch({
                                        type: 'SET_FIELD',
                                        field: 'scope',
                                        value: c.map((a: any) => a.value).join(',')
                                    })}
                                />
                            </Box>
                        )}
                    />
                    <CardContent>
                        <Editor
                            language={currentScope}
                            theme="vs-dark"
                            height="350px"
                            onChange={(value) => dispatch({ type: 'SET_FIELD', field: 'body', value: value || '' })}
                            onMount={handleLeftEditorDidMount}
                        />
                    </CardContent>
                    <CardActions sx={{ display: 'flex', justifyContent: 'end', p: 2, bgcolor: '#f5f5f5' }}>
                        <SnippetsReplacements onReplace={handleReplaceSelection} />
                    </CardActions>
                </Card>
            </Box>
            <Box>
                <Editor
                    language="json"
                    theme="vs-dark"
                    height="100%"
                    options={{ minimap: { enabled: false } }}
                    onMount={handleEditorDidMount}
                />
            </Box>
        </Box>
    )
}