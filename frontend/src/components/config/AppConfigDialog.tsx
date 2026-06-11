import { Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from '@mui/material';
import ConfigContextContextProvider, { useConfigContextContext } from './ConfigContext';
import { Settings } from '@mui/icons-material';
import ConfigTabs from './ConfigTabs';
import { useI18nProviderContext } from '../../I18nProvider';

export default function AppConfigDialog() {
    return (
        <ConfigContextContextProvider>
            <AppConfigDialogInner />
        </ConfigContextContextProvider>
    )
}

function AppConfigDialogInner() {
    const { handleClose, handleOpen, open, unabled } = useConfigContextContext();
    const { $t } = useI18nProviderContext();

    return (
        <>
            <IconButton onClick={handleOpen} sx={{ color: 'white' }}>
                <Settings />
            </IconButton>

            <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth='md'>
                <DialogTitle>
                    {$t('title-config')}
                    <nav></nav>
                </DialogTitle>

                <DialogContent>
                    <ConfigTabs />
                </DialogContent>

                <DialogActions>
                    <Button disabled={unabled} onClick={handleClose}>
                        {$t('button-close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}