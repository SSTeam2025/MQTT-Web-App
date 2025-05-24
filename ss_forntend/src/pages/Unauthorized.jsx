import { useNavigate } from 'react-router-dom';
import { Paper, Typography, Button } from '@mui/material';
import '../styles/forms.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="page-container">
      <Paper className="form-container">
        <Typography variant="h4" component="h1" className="form-title" color="error">
          Unauthorized Access
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}>
          You do not have permission to access this page.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={goBack}
          className="form-button"
        >
          Go Back
        </Button>
      </Paper>
    </div>
  );
};

export default Unauthorized; 