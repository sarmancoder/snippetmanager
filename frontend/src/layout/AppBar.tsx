import { DarkMode, LightMode, Save, WrapText } from '@mui/icons-material';
import { Box, colors, IconButton, useColorScheme, useTheme } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';
import { useAppContext } from '../AppSnippetsContext';
import AppConfigDialogWraper from '../components/config/AppConfigDialog';

export default function MyAppBar() {
    const { mode, setMode } = useColorScheme()
    const { saved, setsaved, saveSnippet, wordWrapOn, setWordWrapOn } = useAppContext();
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
        <AppBar elevation={0} position="fixed" sx={{ backgroundColor: 'var(--primary-color)' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    AiSnippets
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <AppConfigDialogWraper />
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
                        sx={{ color: 'white' }}
                        onClick={async () => {
                            if (mode !== 'dark') {
                                setMode('dark')
                            } else {
                                setMode('light')
                            }
                        }}
                    >
                        {mode == 'light' ? <DarkMode /> : <LightMode />}
                    </IconButton>
                    <IconButton
                        onClick={() => setWordWrapOn(!wordWrapOn)}
                        sx={{ color: wordWrapOn ? 'color-mix(in srgb, var(--main-color) 80%, white)' : 'white' }}
                        size="medium"
                    >
                        <WrapText />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}