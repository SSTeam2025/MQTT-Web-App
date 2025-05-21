import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import DeviceCard from './DeviceCard';

const mockedDevice = {
  id: 'last-used',
  name: 'Mocked Last Used Device',
  status: 'online',
  lastImageUrl: 'https://placehold.co/300x180?text=Last+Used',
  parameters: { temp: '24°C', battery: '90%' }
};

const LastUsedDevice = () => {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLastUsedDevice = async () => {
      try {
        const response = await fetch('http://localhost:8081/api/devices/last-used');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setDevice(data);
      } catch (err) {
        setDevice(mockedDevice);
      } finally {
        setLoading(false);
      }
    };
    fetchLastUsedDevice();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom color="text.secondary" align='left'>
        Last Used Device
      </Typography>
      <DeviceCard device={device} />
    </Box>
  );
};

export default LastUsedDevice; 