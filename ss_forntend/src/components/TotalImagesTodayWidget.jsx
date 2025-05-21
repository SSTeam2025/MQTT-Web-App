import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { getTotalImagesToday } from '../requests/dashboard';
import { totalImagesToday as mockedTotalImagesToday } from '../mocked/dashboard';

const TotalImagesTodayWidget = () => {
  const [total, setTotal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTotalImagesToday();
        setTotal(data.total || data); // support both {total: x} and x
      } catch {
        setTotal(mockedTotalImagesToday);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Card sx={{ minWidth: 200, minHeight: 120, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Total Images Received (Today)
        </Typography>
        {loading ? <CircularProgress size={24} /> : (
          <Typography variant="h4" color="primary.main">{total}</Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TotalImagesTodayWidget; 