import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { getAllDevices } from '../requests/devices';
import DeviceCard from '../components/DeviceCard';
import { getAllImages } from '../requests/gallery';

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const devicesFromApi = await getAllDevices();
        // Map to a consistent format if needed (like Gallery)
        const devicesList = devicesFromApi.map(d => ({
          id: d.deviceId || d.id,
          name: d.name || d.deviceId,
          status: d.status,
          parameters: d.parameters || {},
        }));
        setDevices(devicesList);
        setError('');
      } catch (err) {
        setDevices([]);
        setError('Failed to fetch devices.');
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
    // Fetch gallery images
    getAllImages().then(setGalleryImages);
  }, []);

  if (loading) return <CircularProgress />;

  // Filter devices based on dropdown
  let filteredDevices = devices.filter(device => {
    if (filter === 'all') return true;
    return device.status === filter;
  });

  // When 'all' is selected, show online devices first
  if (filter === 'all') {
    filteredDevices = [
      ...filteredDevices.filter(d => d.status === 'online'),
      ...filteredDevices.filter(d => d.status === 'offline')
    ];
  }

  // Get the first image in the gallery
  const firstImageUrl = galleryImages.length > 0 ? galleryImages[0].url : undefined;

  return (
    <Box>
      <Typography variant="h5" gutterBottom color="text.secondary">
        Connected Devices
      </Typography>
      <FormControl sx={{ minWidth: 200, mb: 3 }}>
        <InputLabel id="device-status-filter-label">Show</InputLabel>
        <Select
          labelId="device-status-filter-label"
          value={filter}
          label="Show"
          onChange={e => setFilter(e.target.value)}
        >
          <MenuItem value="all">All Devices</MenuItem>
          <MenuItem value="online">Online Only</MenuItem>
          <MenuItem value="offline">Offline Only</MenuItem>
        </Select>
      </FormControl>
      {error && <Typography color="error">{error}</Typography>}
      <Grid container spacing={3} sx={{ rowGap: 10 }}>
        {filteredDevices.map(device => (
          <Grid item key={device.id} sx={{ width: 320, height: 320, display: 'flex' }}>
            <DeviceCard device={device} firstImageUrl={firstImageUrl} />
          </Grid>
        ))}
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 10, mt:10 }}/>
    </Box>
  );
};

export default Devices; 