import { useEffect, useRef } from 'react';
import { useAppContext } from '../AppSnippetsContext';
import DualEditorPage, { EditorActions } from './DualEditorPage';

export default function DualEditorWraper() {
    const editorRef = useRef<EditorActions>(null)
    const { currentSnippetKey, activeSnippet, setSnippetEditing, setsaved } = useAppContext()

    // llamar a cuando se cambie el snippet, para actualizarlo en el componente
    useEffect(() => {
        if (activeSnippet) {
            editorRef.current?.changeValues({
                ...activeSnippet,
                body: activeSnippet.body.join('\n')
            })
        }
    }, [currentSnippetKey])

    return (
        <DualEditorPage ref={editorRef} onChange={(snippet) => {
            if (!activeSnippet) return

            const snippetEditing = {
                ...snippet,
                body: snippet.body.split('\n')
            }

            setSnippetEditing(snippetEditing)

            console.log(JSON.stringify(snippetEditing))
            console.log(JSON.stringify(activeSnippet))

            const equal = JSON.stringify(snippetEditing) == JSON.stringify(activeSnippet)
            if (!equal) {
                setsaved(false)
            } else {
                setsaved(true)
            }
        }} />
    )
}
