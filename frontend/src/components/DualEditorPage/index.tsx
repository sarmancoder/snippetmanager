import { Editor, OnMount } from '@monaco-editor/react';
import { Box, Card, CardContent, CardHeader, FormControlLabel, IconButton, Switch, TextField, Tooltip } from '@mui/material';
import CardActions from '@mui/material/CardActions';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useReducer, useRef, useState } from 'react';
import Select from "react-select";
import { WrapText } from '@mui/icons-material';
import { SnippetType } from '../../AppSnippetsContext';
import { languageScopes, LanguageScopeValue } from '../../config';
import { SnippetsReplacements } from './SnippetsReplacements';

type SnippetState = {
    prefix: string
    description: string
    scope: string
    body: string
    isFileTemplate: boolean
}

type SnippetAction =
    | { type: 'SET_FIELD'; field: keyof SnippetState; value: SnippetState[keyof SnippetState] }
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
    isFileTemplate: false,
}

// 1. Defines la interfaz de los métodos que expones
export interface EditorActions {
    changeValues: (nuevoValor: SnippetState) => void;
}

// 2. Defines las props normales de tu componente
interface EditorProps {
    onChange: (nuevoValor: SnippetState) => void;
    wordWrap: boolean
}

export const DualEditorPage = forwardRef<EditorActions, EditorProps>(function DualEditorPage({ onChange, wordWrap }, ref) {
    const bodyEditor = useRef<any>(null)
    const jsonResultRef = useRef<any>(null)

    const [state, dispatch] = useReducer(snippetReducer, initialState)

    useImperativeHandle(ref, () => ({
        changeValues(snippet) {
            const resolvedScope = (snippet.scope ?? '').split(',').map(a => {
                return languageScopes.find(x => x.value == a)?.value
            }).join(',')

            const bodyContent = Array.isArray(snippet.body) ? snippet.body.join('\n') : snippet.body

            dispatch({
                type: 'RESET',
                payload: {
                    prefix: snippet.prefix ?? '',
                    description: snippet.description ?? '',
                    scope: resolvedScope,
                    body: bodyContent,
                    isFileTemplate: (snippet as any).isFileTemplate ?? false,
                }
            })

            bodyEditor.current.setValue(bodyContent)
        }
    }))

    useEffect(() => {
        const snippetEditing: SnippetType = {
            prefix: state.prefix,
            description: state.description,
            scope: state.scope,
            isFileTemplate: state.isFileTemplate ?? false,
            body: state.body.split('\n'),
        }

        if (jsonResultRef.current) {
            jsonResultRef.current.setValue(JSON.stringify(snippetEditing, null, 2))
        }

        onChange({
            ...snippetEditing,
            body: snippetEditing.body.join('\n')
        })
    }, [state])

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
                        isFileTemplate: infoJSON.isFileTemplate ?? false,
                    }
                })

                bodyEditor.current?.setValue((infoJSON.body ?? []).join('\n'))
            } catch { }
        })
    }

    const currentScope = useMemo<LanguageScopeValue>(() => {
        const _scope = state.scope.split(',')[0] as LanguageScopeValue
        if (_scope === 'javascriptreact') return 'javascript'
        if (_scope === 'typescriptreact') return 'typescript'
        if (_scope.length === 0) return 'plaintext' as any
        return _scope
    }, [state.scope])

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
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5, p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    autoFocus
                    fullWidth
                    label="Prefijo"
                    value={state.prefix}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'prefix', value: e.target.value })}
                />
                <TextField
                    fullWidth
                    label="Descripción"
                    value={state.description}
                    onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'description', value: e.target.value })}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <FormControlLabel
                        label="Es una plantilla"
                        control={
                            <Switch
                                checked={state.isFileTemplate}
                                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'isFileTemplate', value: e.target.checked })}
                            />
                        }
                    />
                </Box>
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
                                        container: (base) => ({ ...base, width: '400px' })
                                    }}
                                    value={languageScopes.filter(a => state.scope.split(',').includes(a.value))}
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
                            options={{ wordWrap: wordWrap ? 'on' : 'off' }}
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
                    options={{ minimap: { enabled: false }, wordWrap: wordWrap ? 'on' : 'off' }}
                    onMount={handleEditorDidMount}
                />
            </Box>
        </Box>
    )
})

export default DualEditorPage