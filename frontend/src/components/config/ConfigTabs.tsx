import { useState, SyntheticEvent } from 'react';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import GeneralConfigTab from './tabs/GeneralConfigTab';

export default function ConfigTabs() {
  const [value, setValue] = useState(0);

  const handleChange = (_e: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs variant='fullWidth' value={value} onChange={handleChange}>
          <Tab label="General" />
          <Tab label="Ollama" />
          <Tab label="Open Router" />
        </Tabs>
      </Box>
      <Box sx={{ p: 3 }}>
        {value === 0 && <GeneralConfigTab />}
        {value === 1 && <Typography>Ollama</Typography>}
        {value === 2 && <Typography>OpenRouter</Typography>}
      </Box>
    </Box>
  );
}