import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getActiveDevices } from '../requests/dashboard';
import { activeDevices as mockedActiveDevices } from '../mocked/dashboard';
import DeviceCard from './DeviceCard';

const DEVICES_PER_PAGE = 2;

const ActiveDevicesList = ({ title = 'Active Devices', devices: propDevices, firstImageUrl }) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (propDevices) {
      setDevices(propDevices);
      setLoading(false);
    } else {
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
    }
  }, [propDevices]);

  const maxPage = Math.max(0, Math.ceil(devices.length / DEVICES_PER_PAGE) - 1);
  const startIdx = page * DEVICES_PER_PAGE;
  const endIdx = startIdx + DEVICES_PER_PAGE;
  const visibleDevices = devices.slice(startIdx, endIdx);

  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };
  const handleNext = () => {
    if (page < maxPage) setPage(page + 1);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" color="text.secondary" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
        {title}
      </Typography>
      {loading ? <CircularProgress /> : (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
          <IconButton onClick={handlePrev} disabled={page === 0} sx={{ mr: 2 }}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Grid container spacing={2} justifyContent="center" sx={{ flex: 1, width: 'auto' }}>
            {visibleDevices.map(device => (
              <Grid item key={device.id} sx={{ minWidth: 320, display: 'flex', justifyContent: 'center' }}>
                <DeviceCard device={device} firstImageUrl={firstImageUrl} />
              </Grid>
            ))}
          </Grid>
          <IconButton onClick={handleNext} disabled={page === maxPage} sx={{ ml: 2 }}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default ActiveDevicesList; 