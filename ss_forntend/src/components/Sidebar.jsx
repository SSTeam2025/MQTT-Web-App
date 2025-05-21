import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar } from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import HomeIcon from '@mui/icons-material/Home';
import { NavLink } from 'react-router-dom';

const drawerWidth = 220;

const Sidebar = ({ location, handleSidebarClick }) => (
  <Drawer
    variant="permanent"
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
    }}
  >
    <Toolbar />
    <List>
      <ListItem
        button
        key="Home"
        component={NavLink}
        to="/dashboard"
        end
        onClick={() => handleSidebarClick('/dashboard')}
        sx={{
          '&.Mui-selected, &.Mui-selected:hover, &.active': {
            backgroundColor: '#e3f2fd',
            borderLeft: '4px solid #1976d2',
            color: (theme) => theme.palette.primary.main,
            '& .MuiListItemText-primary': {
              color: (theme) => theme.palette.primary.main,
              fontWeight: 600,
            },
            '& .MuiListItemIcon-root': {
              color: (theme) => theme.palette.primary.main,
            }
          }
        }}
      >
        <ListItemIcon>
          <HomeIcon sx={{ color: 'text.secondary' }} />
        </ListItemIcon>
        <ListItemText
          primary="Dashboard"
          primaryTypographyProps={{ color: 'text.secondary' }}
        />
      </ListItem>
      <ListItem
        button
        key="Devices"
        component={NavLink}
        to="/dashboard/devices"
        onClick={() => handleSidebarClick('/dashboard/devices')}
        sx={{
          '&.Mui-selected, &.Mui-selected:hover, &.active': {
            backgroundColor: '#e3f2fd',
            borderLeft: '4px solid #1976d2',
            color: (theme) => theme.palette.primary.main,
            '& .MuiListItemText-primary': {
              color: (theme) => theme.palette.primary.main,
              fontWeight: 600,
            },
            '& .MuiListItemIcon-root': {
              color: (theme) => theme.palette.primary.main,
            }
          }
        }}
      >
        <ListItemIcon>
          <DevicesIcon sx={{ color: 'text.secondary' }} />
        </ListItemIcon>
        <ListItemText
          primary="Devices"
          primaryTypographyProps={{ color: 'text.secondary' }}
        />
      </ListItem>
      {/* Add more sidebar items here */}
    </List>
  </Drawer>
);

export default Sidebar; 