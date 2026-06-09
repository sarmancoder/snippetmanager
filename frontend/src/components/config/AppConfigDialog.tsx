import { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material';
import ConfigContextContextProvider, { useConfigContextContext } from './ConfigContext';
import {Settings} from '@mui/icons-material'
import ConfigTabs from './ConfigTabs';

export default function AppConfigDialogWraper() {
    return (
        <ConfigContextContextProvider>
            <AppConfigDialog />
        </ConfigContextContextProvider>
    )
}


function AppConfigDialog() {
    const { handleClose, handleOpen, open, setUnabled, unabled } = useConfigContextContext()
    return (
        <>
            <IconButton onClick={handleOpen} sx={{color: 'white'}}>
                <Settings />
            </IconButton>
            <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth='md'>
                <DialogTitle>Configuaración<nav></nav></DialogTitle>
                <DialogContent>
                    <ConfigTabs />
                </DialogContent>
                <DialogActions>
                    <Button disabled={unabled} onClick={handleClose}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}