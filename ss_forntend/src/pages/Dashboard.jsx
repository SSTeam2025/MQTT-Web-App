import React, { useEffect, useState } from 'react';
import { AppBar, Toolbar, Typography, Box, Grid, Chip, List, ListItem, ListItemText, Stack } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TotalImagesTodayWidget from '../components/TotalImagesTodayWidget';
import DeviceStatusWidget from '../components/DeviceStatusWidget';
import LatestImagesGrid from '../components/LatestImagesGrid';
import ActiveDevicesList from '../components/ActiveDevicesList';
import { getAllDevices } from '../requests/devices';
import { getAllImages } from '../requests/gallery';
import { latestImages, mockedDevices } from '../mocked/dashboard';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [devices, setDevices] = useState([]);
  const [realImages, setRealImages] = useState([]);

  useEffect(() => {
    let intervalId;
    const fetchDevices = () => {
      getAllDevices().then(devices => {
        setDevices(devices);
        console.log('Dashboard devices from /devices endpoint:', devices);
      }).catch(err => {
        setDevices([]);
        console.error('Error fetching devices for dashboard:', err);
      });
    };
    fetchDevices();
    intervalId = setInterval(fetchDevices, 5000); // Poll every 5 seconds
    getAllImages().then(setRealImages);

    // Listen for imageProcessed event to refresh images
    const handleImageProcessed = () => {
      getAllImages().then(setRealImages);
    };
    window.addEventListener('imageProcessed', handleImageProcessed);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('imageProcessed', handleImageProcessed);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === '/dashboard') {
      getAllImages().then(setRealImages);
      
    }
  }, [location.pathname]);

  // Compute today's date string (YYYY-MM-DD)
  const todayStr = new Date().toISOString().slice(0, 10);
  console.log('Today:', todayStr);
  console.log('Real images:', realImages);

  // Count images taken today from real images
  var totalImagesToday = realImages.filter(img =>
    img.timestamp && img.timestamp.startsWith(todayStr)
  ).length;
  var todaysImages = realImages.filter(img =>
    img.timestamp && img.timestamp.startsWith(todayStr)
  );
  console.log('Total images today:', totalImagesToday);
  // Count online/offline devices from fetched devices
  const onlineCount = devices.filter(d => d.status === 'online').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  console.log('Devices:', devices);
  console.log('Online count:', onlineCount);
  console.log('Offline count:', offlineCount);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSidebarClick = (path) => {
    console.log('Sidebar clicked, navigating to:', path);
  };

  // Get the first image in the gallery
  const firstImageUrl = realImages.length > 0 ? realImages[0].url : undefined;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Navbar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            CamViewer
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box>
            <Typography variant="body1" sx={{ mr: 2, display: 'inline' }}>
              {user?.username}
            </Typography>
            <button onClick={handleLogout} style={{
              background: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '6px 16px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}>
              Logout
            </button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Sidebar location={location} handleSidebarClick={handleSidebarClick} />

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        {location.pathname === '/dashboard' && (
          <>
            <Typography variant="h4" gutterBottom>
              Welcome to the Dashboard
            </Typography>
            <Typography>
              Select an item from the sidebar to manage your devices or view other sections
            </Typography>
            <Grid container spacing={2} sx={{ mt: 4 }}>
              <Grid item xs={12} md={4} lg={3}>
                <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Total Images Today</Typography>
                  <Typography variant="h4">{totalImagesToday}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <DeviceStatusWidget online={onlineCount} offline={offlineCount} />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }} />
            <Box sx={{ pb: 6 }}>
              <ActiveDevicesList title="Active Devices" devices={devices.filter(d => d.status === 'online')} firstImageUrl={firstImageUrl} />
            </Box>
            <LatestImagesGrid title="Today's Images" images={todaysImages} />
            <Box sx={{ mt: 6 }}></Box>
            <Box sx={{ pb: 6 }}></Box>
          </>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard; 