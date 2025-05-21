import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress, Stack, Chip } from '@mui/material';
import { getDeviceStatus } from '../requests/dashboard';
import { deviceStatus as mockedDeviceStatus } from '../mocked/dashboard';

const DeviceStatusWidget = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDeviceStatus();
        setStatus(data);
      } catch {
        setStatus(mockedDeviceStatus);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Card sx={{ minWidth: 200, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Devices Online / Offline
        </Typography>
        {loading ? <CircularProgress size={24} /> : (
          <Stack direction="row" spacing={2} justifyContent="center">
            <Chip label={`Online: ${status.online}`} color="success" />
            <Chip label={`Offline: ${status.offline}`} color="default" />
          </Stack>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceStatusWidget; 