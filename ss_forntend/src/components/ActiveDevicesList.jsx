import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid } from '@mui/material';
import { getActiveDevices } from '../requests/dashboard';
import { activeDevices as mockedActiveDevices } from '../mocked/dashboard';
import DeviceCard from './DeviceCard';

const ActiveDevicesList = ({ title = 'Active Devices' }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getActiveDevices();
        setDevices(data);
      } catch {
        setDevices(mockedActiveDevices);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {loading ? <CircularProgress /> : (
        <Grid container spacing={2} justifyContent="center">
          {devices.map(device => (
            <Grid item key={device.id} sx={{ minWidth: 320, display: 'flex', justifyContent: 'center' }}>
              <DeviceCard device={device} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ActiveDevicesList; 