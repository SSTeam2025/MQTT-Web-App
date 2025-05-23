import React from 'react';
import { Card, CardContent, Typography, Stack, Chip } from '@mui/material';

const DeviceStatusWidget = ({ online = 0, offline = 0 }) => {
  return (
    <Card sx={{ minWidth: 200, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Devices Online / Offline
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Chip label={`Online: ${online}`} color="success" />
          <Chip label={`Offline: ${offline}`} color="default" />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default DeviceStatusWidget; 