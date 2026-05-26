import {Box, Paper} from '@mui/material';
import MyAppBar from './AppBar';
import DrawerFiles from './DrawerFiles';
import DrawerSnippets from './DrawerSnippets';
import MainContent from './MainContent';

export default function LayoutApp({children}) {
    return (
        <Paper id='App'>
            <Box sx={{ flexGrow: 1 }}>
                <MyAppBar />
            </Box>
            <DrawerFiles />
            <DrawerSnippets />
            <MainContent>
                {children}
            </MainContent>
        </Paper>
    )
}

