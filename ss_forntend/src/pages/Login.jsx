import { useState } from 'react';
import { Paper, Typography } from '@mui/material';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/forms.css';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await login(formData.email, formData.password);
      setSuccessMessage('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Paper className="form-container">
        <Typography variant="h4" component="h1" className="form-title">
          Sign In
        </Typography>
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          error={error}
          successMessage={successMessage}
        />
      </Paper>
    </div>
  );
};

export default Login; 