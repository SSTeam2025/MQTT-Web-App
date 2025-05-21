import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';
import axios from 'axios';
import DeviceCard from '../components/DeviceCard';

const mockedDevices = [
  {
    id: '1',
    name: 'Temperature Sensor A',
    status: 'online',
    lastImageUrl: 'https://placehold.co/300x180?text=Device+A',
    parameters: { temp: '22°C', battery: '80%' }
  },
  {
    id: '2',
    name: 'Camera B',
    status: 'offline',
    lastImageUrl: 'https://placehold.co/300x180?text=Camera+B',
    parameters: { lastSeen: '2024-05-14 10:22', battery: 'N/A' }
  },
  {
    id: '3',
    name: 'Door Lock C',
    status: 'online',
    lastImageUrl: 'https://placehold.co/300x180?text=Lock+C',
    parameters: { locked: 'yes', battery: '60%' }
  }
];

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await axios.get('http://localhost:8081/api/devices');
        setDevices(response.data);
      } catch (err) {
        setDevices(mockedDevices);
        setError(''); // Clear error, show mocked data instead
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="text.secondary">
        Connected Devices
      </Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3}>
        {devices.map(device => (
          <Grid item key={device.id} sx={{ width: 320, height: 320, display: 'flex' }}>
            <DeviceCard device={device} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Devices; 