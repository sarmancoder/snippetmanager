import { Box, Typography } from '@mui/material';
import { useAppContext } from './AppSnippetsContext';
import { useMemo } from 'react';
import IAButton from './components/IAButton';
import EditorWraper from './components/EditorWraper';

function App() {
    const {currentSnippetKey} = useAppContext()
    const isSnippetSelected = useMemo(() => {
        return currentSnippetKey.length == 0
    }, [currentSnippetKey])
    return (
        <Box sx={{height: '100%', bgcolor: 'background.default'}}>
            <Box sx={{
                display: isSnippetSelected ? 'none' : 'block',
                padding: 1,
                paddingTop: 3
            }}>
                <EditorWraper />
                <IAButton />
            </Box>
            <Box sx={{
                display: !isSnippetSelected ? 'none' : 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
            }}>
                <Typography variant="h3" sx={{textAlign: 'center'}} color="initial">
                    Seleccione un snippet para empezar
                </Typography>
            </Box>
        </Box>
    )
}

export default App
