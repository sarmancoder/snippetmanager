import { colors } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { drawerWidth } from '../config';
import DrawerFiles from './DrawerFiles';
import DrawerSnippets from './DrawerSnippets';


export default function LayoutApp({children}) {
    return (
        <div id='App'>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="fixed">
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            AiSnippets
                        </Typography>
                        <Button color="inherit">Login</Button>
                    </Toolbar>
                </AppBar>
            </Box>
            <DrawerFiles />
            <DrawerSnippets />
            <Box sx={{
                position: 'fixed',
                left: drawerWidth,
                right: drawerWidth,
                padding: 1,
                paddingTop: 3
            }}>
                <Toolbar />
                {children}
            </Box>
        </div>
    )
}

