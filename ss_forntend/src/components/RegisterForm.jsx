import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { validateEmail, validatePassword } from '../utils/validators';
import '../styles/forms.css';

const RegisterForm = ({ onSubmit, isLoading, error, successMessage }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: [],
    confirmPassword: '',
    name: '',
    role: ''
  });
  const [showValidation, setShowValidation] = useState(false);

  const roles = [
    { value: 'ADMIN', label: 'Admin' },
    { value: 'OPERATOR', label: 'Operator' },
    { value: 'VIZUALIZATOR', label: 'Visualizer' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: [],
      confirmPassword: '',
      name: '',
      role: ''
    };

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email).isValid) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = ['Password is required'];
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.requirements
          .filter(req => !req.passed)
          .map(req => req.message);
      }
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Validate role
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setValidationErrors(newErrors);
    setShowValidation(true);
    
    return !Object.values(newErrors).some(error => 
      Array.isArray(error) ? error.length > 0 : error
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      onSubmit(formData);
    }
  };

  const hasPasswordError = showValidation && validationErrors.password.length > 0;

  return (
    <Box component="form" onSubmit={handleSubmit} className="form">
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={showValidation && !!validationErrors.name}
          helperText={showValidation && validationErrors.name}
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={showValidation && !!validationErrors.email}
          helperText={showValidation && validationErrors.email}
        />
        <FormControl 
          fullWidth 
          error={showValidation && !!validationErrors.role}
          sx={{ 
            '& .MuiSelect-select': {
              height: '56px',
              display: 'flex',
              alignItems: 'center'
            }
          }}
        >
          <InputLabel>Select Your Role</InputLabel>
          <Select
            name="role"
            value={formData.role}
            onChange={handleChange}
            label="Select Your Role"
          >
            {roles.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </Select>
          {showValidation && validationErrors.role && (
            <Typography color="error" variant="caption">
              {validationErrors.role}
            </Typography>
          )}
        </FormControl>
        <TextField
          fullWidth
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={hasPasswordError}
        />
        <TextField
          fullWidth
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={showValidation && !!validationErrors.confirmPassword}
          helperText={showValidation && validationErrors.confirmPassword}
        />
        {hasPasswordError && (
          <List dense>
            {validationErrors.password.map((error, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={error}
                  primaryTypographyProps={{ color: 'error' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isLoading}
        sx={{ mt: 3 }}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Register'}
      </Button>
      <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </Typography>
    </Box>
  );
};

export default RegisterForm; 