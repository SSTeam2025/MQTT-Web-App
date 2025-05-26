import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, Typography, Chip, Stack, Box, Modal, Switch, Button } from '@mui/material';
// import mqtt from 'mqtt';
import LiveViewer from '../mqtt/LiveViewer';

// Use phone.png from the public directory as the background
const phoneBgUrl = '/phone.png';

const DeviceCard = ({ device, firstImageUrl }) => {
  const [modalOpen, setModalOpen] = useState(false);
  // false = Timed, true = Live
  const [isLive, setIsLive] = useState(false);
  const [loadingCapture, setLoadingCapture] = useState(false);
  const [latestImageUrl, setLatestImageUrl] = useState(null);
  const pollingRef = useRef(null);
  // const mqttClientRef = useRef(null);

  const isOnline = device.status === 'online';

  const handleOpen = () => {
    if (isOnline) {
      setIsLive(false); // Timed is default when opening
      setModalOpen(true);
    }
  };
  const handleClose = () => setModalOpen(false);

  const handleToggleMode = async () => {
    const newIsLive = !isLive;
    const action = newIsLive ? 'start_live' : 'stop_live';
    try {
      const response = await fetch('http://localhost:8081/live', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          deviceId: device.deviceId || device.id,
          action: action
        })
      });
      if (!response.ok) {
        throw new Error('Failed to send live control request');
      }
      setIsLive(newIsLive);
    } catch (error) {
      console.error('Error sending live control request:', error);
    }
  };

  const handleCapture = async () => {
    setLoadingCapture(true);
    try {
      // POST to /capture with deviceId as query param
      const postResp = await fetch(`http://localhost:8081/capture?deviceId=${encodeURIComponent(device.deviceId || device.id)}`, {
        method: 'POST'
      });
      if (!postResp.ok) {
        alert('Failed to trigger capture');
        setLoadingCapture(false);
        return;
      }
      // Wait 2 seconds
      await new Promise(res => setTimeout(res, 2000));
      // GET latest image for this device (as a file)
      const resp = await fetch(`http://localhost:8081/images/${device.deviceId || device.id}/latest`);
      if (resp.ok) {
        const blob = await resp.blob();
        const imageUrl = URL.createObjectURL(blob);
        setLatestImageUrl(imageUrl);
      } else {
        alert('Failed to fetch latest image');
      }
    } catch (err) {
      alert('Error during capture: ' + err.message);
    } finally {
      setLoadingCapture(false);
    }
  };

  const fetchLatestImage = async () => {
    try {
      console.log('Polling: Checking for latest image for device', device.deviceId || device.id);
      const resp = await fetch(`http://localhost:8081/images/${device.deviceId || device.id}/latest`);
      if (resp.ok) {
        const blob = await resp.blob();
        const imageUrl = URL.createObjectURL(blob);
        setLatestImageUrl(prev => {
          // Only update if the image is different
          if (prev !== imageUrl) return imageUrl;
          return prev;
        });
      }
    } catch {}
  };

  // Poll for latest image every 30s if Timed is selected and modal is open
  useEffect(() => {
    if (modalOpen && !isLive) {
      fetchLatestImage(); // Fetch immediately
      pollingRef.current = setInterval(fetchLatestImage, 30000);
    } else {
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [modalOpen, isLive, device.deviceId, device.id]);

  return (
    <>
      <Card
        sx={{
          width: 300,
          height: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 2,
          position: 'relative',
          backgroundImage: `url(${phoneBgUrl})`,
          backgroundSize: '140%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center -20px',
          color: 'white',
          boxShadow: 6,
          overflow: 'hidden',
          justifyContent: 'flex-end', // To help with bottom alignment
          opacity: isOnline ? 1 : 0.5,
          transition: 'box-shadow 0.2s',
          '&:hover': isOnline ? { boxShadow: 12, cursor: 'pointer' } : { boxShadow: 6, cursor: 'default' },
        }}
        onClick={handleOpen}
      >
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            width: '100%',
            zIndex: 2,
            background: 'rgba(0,0,0,0.0)', // No overlay for the logo
            borderRadius: 2,
            p: 0,
            m: 0,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            sx={{ mb: 1, flexWrap: 'wrap', gap: 1, maxHeight: 60, overflowY: 'auto' }}
          >
            {device.parameters && Object.entries(device.parameters).map(([key, value]) => (
              <Chip key={key} label={`${key}: ${value}`} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.8)' }} />
            ))}
          </Stack>
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mb: 0.5, gap: 0.3 }}>
            <Chip
              label={device.status === 'online' ? 'Online' : 'Offline'}
              color={device.status === 'online' ? 'success' : 'default'}
              size="small"
              sx={{ bgcolor: device.status === 'online' ? 'success.main' : 'grey.700', color: 'white', mb: -2.5 }}
            />
            <Typography variant="h6" sx={{ color: 'black', textShadow: '1px 1px 4px #fff', px: 2, py: 0, borderRadius: 2, mt: 1.5 }}>
              {device.name || device.deviceId}
            </Typography>
          </Box>
        </CardContent>
        {/* Optional: dark overlay for better contrast, but set to 0 for logo clarity */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.0)',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        />
      </Card>
      <Modal open={modalOpen} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: 400,
          outline: 'none',
        }}>
          <Typography variant="h6" gutterBottom>
            {device.name || device.deviceId}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Status: {device.status === 'online' ? 'Online' : 'Offline'}
          </Typography>
          <Box sx={{ mb: 2, mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Image</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, minWidth: 400, mb: 0 }}>
              {isLive ? (
                <LiveViewer 
                  deviceId={device.deviceId || device.id}
                  topic={`devices/${device.deviceId || device.id}`}
                  style={{ maxWidth: 400, maxHeight: 400, borderRadius: 8, display: 'block', margin: '0 auto' }}
                />
              ) : (latestImageUrl || firstImageUrl) ? (
                <img 
                  src={latestImageUrl || firstImageUrl} 
                  alt="Device" 
                  style={{ maxWidth: 400, maxHeight: 400, borderRadius: 8, display: 'block', margin: '0 auto' }} 
                />
              ) : (
                <Typography>No image available</Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2, justifyContent: 'flex-start' }}>
            <Typography variant="body1" sx={{ mr: 1, fontWeight: isLive ? 'bold' : 'normal', color: isLive ? 'primary.main' : 'text.secondary' }}>Live</Typography>
            <Switch
              checked={isLive}
              onChange={handleToggleMode}
              color="primary"
              inputProps={{ 'aria-label': 'Live/Timed toggle' }}
              sx={{
                '& .MuiSwitch-thumb': {
                  bgcolor: 'primary.main',
                },
                '& .Mui-checked .MuiSwitch-thumb': {
                  bgcolor: 'primary.main',
                },
                '& .MuiSwitch-track': {
                  bgcolor: 'primary.light',
                },
                '&.Mui-checked .MuiSwitch-track': {
                  bgcolor: 'primary.light',
                },
              }}
            />
            <Typography variant="body1" sx={{ ml: 1, fontWeight: !isLive ? 'bold' : 'normal', color: !isLive ? 'primary.main' : 'text.secondary' }}>Timed</Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleCapture} 
              disabled={loadingCapture || isLive}
              sx={{ minWidth: 140, height: 40, justifyContent: 'center' }}
            >
              {loadingCapture ? 'Capturing...' : 'Capture'}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default DeviceCard; 