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
  CircularProgress
} from '@mui/material';
import { validateEmail, validatePassword } from '../utils/validators';
import '../styles/forms.css';

const RegisterForm = ({ onSubmit, isLoading, error, successMessage }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: [],
    confirmPassword: '',
    name: ''
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
      password: [],
      confirmPassword: '',
      name: ''
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
        <Alert severity="success" className="alert">
          {successMessage}
        </Alert>
      )}
      {error && (
        <Alert severity="error" className="alert">
          {error}
        </Alert>
      )}
      <TextField
        className="form-field"
        required
        fullWidth
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={formData.name}
        onChange={handleChange}
        error={showValidation && !!validationErrors.name}
        helperText={showValidation ? validationErrors.name : ''}
        disabled={isLoading}
      />
      <TextField
        className="form-field"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
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
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
        error={hasPasswordError}
        helperText={hasPasswordError ? 'Password requirements not met:' : ''}
        disabled={isLoading}
      />
      {hasPasswordError && (
        <List dense className="error-list password-errors">
          {validationErrors.password.map((message, index) => (
            <ListItem key={index} className="error-item">
              <ListItemText 
                primary={message} 
                className="error-text"
              />
            </ListItem>
          ))}
        </List>
      )}
      <TextField
        className="form-field"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        id="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={hasPasswordError || (showValidation && !!validationErrors.confirmPassword)}
        helperText={showValidation ? validationErrors.confirmPassword : ''}
        disabled={isLoading}
      />
      <Button
        type="submit"
        fullWidth
        variant="contained"
        className="form-button"
        disabled={isLoading}
      >
        {isLoading ? <CircularProgress size={24} /> : 'Register'}
      </Button>
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Link to="/login" className="form-link">
            <Typography variant="body2" color="primary">
              Already have an account? Sign in
            </Typography>
          </Link>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RegisterForm; 