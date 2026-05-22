import { DarkMode, LightMode, Save } from '@mui/icons-material';
import { Box, colors, IconButton, useColorScheme, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';
import { useAppContext } from '../AppSnippetsContext';

export default function MyAppBar() {
    const { saved, setsaved, saveSnippet, paletteMode, setPaletteMode } = useAppContext();
    const saveRef = useRef({ saved, setsaved, saveSnippet });

    useEffect(() => {
        saveRef.current = { saved, setsaved, saveSnippet };
    }, [saved, setsaved, saveSnippet]);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                await saveRef.current.saveSnippet();
                await saveRef.current.setsaved(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <AppBar elevation={0} position="fixed">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    AiSnippets
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <IconButton
                        sx={{ color: saved ? 'white' : colors.red[700] }}
                        onClick={async () => {
                            await saveSnippet();
                            await setsaved(true);
                        }}
                    >
                        <Save />
                    </IconButton>
                    <IconButton
                        sx={{ color: saved ? 'white' : colors.red[700] }}
                        onClick={async () => {
                            console.log('alternando', paletteMode)
                            if (paletteMode === 'dark') {
                                console.log('cambiadno a light')
                                setPaletteMode('light')
                            } else {
                                console.log('cambiadnoa dark')
                                setPaletteMode('dark')
                            }
                        }}
                    >
                        {paletteMode == 'light' ? <DarkMode /> : <LightMode />}
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}