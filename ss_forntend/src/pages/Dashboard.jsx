import React from 'react';
import { AppBar, Toolbar, Typography, Box, Grid } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import LastUsedDevice from '../components/LastUsedDevice';
import TotalImagesTodayWidget from '../components/TotalImagesTodayWidget';
import DeviceStatusWidget from '../components/DeviceStatusWidget';
import LatestImagesGrid from '../components/LatestImagesGrid';
import ActiveDevicesList from '../components/ActiveDevicesList';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSidebarClick = (path) => {
    console.log('Sidebar clicked, navigating to:', path);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Navbar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            CamViewer
          </Typography>
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
                <TotalImagesTodayWidget />
              </Grid>
              <Grid item xs={12} md={4} lg={3}>
                <DeviceStatusWidget />
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <LastUsedDevice />
            </Box>
            <LatestImagesGrid title="Latest Images" />
            <Box sx={{ pb: 6 }}>
              <ActiveDevicesList title="Active Devices" />
            </Box>
          </>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Dashboard; 