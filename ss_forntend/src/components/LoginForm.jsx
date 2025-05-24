import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Grid,
  CircularProgress
} from '@mui/material';
import { validateEmail } from '../utils/validators';
import '../styles/forms.css';

const LoginForm = ({ onSubmit, isLoading, error, successMessage }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  const [showValidation, setShowValidation] = useState(false);

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
      password: ''
    };

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailValidation = validateEmail(formData.email);
      if (!emailValidation.isValid) {
        newErrors.email = emailValidation.message;
      }
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setValidationErrors(newErrors);
    setShowValidation(true);
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} className="form">
      {error && (
        <Alert severity="error" className="alert">
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert severity="success" className="alert">
          {successMessage}
        </Alert>
      )}
      <TextField
        className="form-field"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        autoFocus
        value={formData.email}
        onChange={handleChange}
        error={showValidation && !!validationErrors.email}
        helperText={showValidation ? validationErrors.email : ''}
        disabled={isLoading}
      />
      <TextField
        className="form-field"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={formData.password}
        onChange={handleChange}
        error={showValidation && !!validationErrors.password}
        helperText={showValidation ? validationErrors.password : ''}
        disabled={isLoading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        className="form-button"
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
      </Button>
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Link to="/register" className="form-link">
            <Typography variant="body2" color="primary">
              Don't have an account? Sign up
            </Typography>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginForm; 