import { Box, Container, Typography, Paper, Button, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data for demonstration
  const users = [
    { id: 1, email: 'admin@example.com', role: 'admin' },
    { id: 2, email: 'operator@example.com', role: 'operator' },
    { id: 3, email: 'viewer@example.com', role: 'viewer' },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" component="h1">
              Admin Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" color="primary" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button variant="contained" color="error" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Management
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button size="small" color="primary" sx={{ mr: 1 }}>
                          Edit
                        </Button>
                        <Button size="small" color="error">
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Statistics
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography><strong>Total Users:</strong> {users.length}</Typography>
              <Typography><strong>Active Sessions:</strong> 5</Typography>
              <Typography><strong>System Status:</strong> Online</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" color="primary">
                Add New User
              </Button>
              <Button variant="contained" color="secondary">
                System Settings
              </Button>
              <Button variant="contained" color="info">
                View Logs
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 