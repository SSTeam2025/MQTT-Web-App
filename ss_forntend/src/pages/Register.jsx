import { useState } from 'react';
import { Paper, Typography } from '@mui/material';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/forms.css';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await register(formData);
      setSuccessMessage('Registration successful! Please log in.');
      const redirectToLogin = () => navigate('/login');
      setTimeout(redirectToLogin, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Paper className="form-container">
        <Typography variant="h4" component="h1" className="form-title">
          Create Account
        </Typography>
        <RegisterForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          successMessage={successMessage}
        />
      </Paper>
    </div>
  );
};

export default Register; 