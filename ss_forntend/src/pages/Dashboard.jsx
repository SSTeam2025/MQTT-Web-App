import { Box, Container, Typography, Paper, Button, Grid } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Dashboard
            </Typography>
            <Button variant="contained" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Email:</strong> {user?.email}</Typography>
              <Typography><strong>Role:</strong> {user?.role}</Typography>
              <Typography><strong>User ID:</strong> {user?.id}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary">
                View Profile
              </Button>
              {user?.role === 'admin' && (
                <Button 
                  variant="contained" 
                  color="secondary"
                  onClick={() => navigate('/admin')}
                >
                  Admin Panel
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 