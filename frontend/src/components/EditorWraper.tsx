import { useEffect, useRef } from 'react';
import { useAppContext } from '../AppSnippetsContext';
import DualEditorPage, { EditorActions } from './DualEditorPage';

export default function DualEditorWraper() {
    const editorRef = useRef<EditorActions>(null)
    const { currentSnippetKey, activeSnippet, setSnippetEditing, setsaved, iaSnippet } = useAppContext()

    const replaceSnippet = (activeSnippet) => {
        editorRef.current?.changeValues(activeSnippet)
    }

    useEffect(() => {
        console.log(iaSnippet)
        if (iaSnippet && Object.keys(iaSnippet).length == 0) return
        replaceSnippet(iaSnippet)
    }, [iaSnippet])

    useEffect(() => {
        if (!activeSnippet) return
        replaceSnippet({
            ...activeSnippet,
            body: activeSnippet.body.join('\n')
        })
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
