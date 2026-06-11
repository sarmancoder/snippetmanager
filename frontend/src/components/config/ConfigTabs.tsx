import { useState, SyntheticEvent } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import GeneralConfigTab from './tabs/GeneralConfigTab';
import { useI18nProviderContext } from '../../I18nProvider';

export default function ConfigTabs() {
  const [value, setValue] = useState(0);
  const { $t } = useI18nProviderContext();

  const handleChange = (_e: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant='fullWidth' value={value} onChange={handleChange}>
          <Tab label={$t('tab-general')} />
          <Tab label={$t('tab-ollama')} />
          <Tab label={$t('tab-openrouter')} />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {value === 0 && <GeneralConfigTab />}
        {value === 1 && <Typography>{$t('tab-ollama')}</Typography>}
        {value === 2 && <Typography>{$t('tab-openrouter')}</Typography>}
      </Box>
    </Box>
  );
}