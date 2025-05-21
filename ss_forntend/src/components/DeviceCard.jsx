import React from 'react';
import { Card, CardContent, CardMedia, Typography, Chip, Stack } from '@mui/material';

const DeviceCard = ({ device }) => (
  <Card sx={{ width: 320, height: 320, display: 'flex', flexDirection: 'column' }}>
    {device.lastImageUrl && (
      <CardMedia
        component="img"
        height="140"
        image={device.lastImageUrl}
        alt={device.name}
        sx={{ objectFit: 'cover' }}
      />
    )}
    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <Typography variant="h6" gutterBottom>{device.name}</Typography>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 1, flexWrap: 'wrap', gap: 1, maxHeight: 60, overflowY: 'auto' }}
        >
          <Chip
            label={device.status === 'online' ? 'Online' : 'Offline'}
            color={device.status === 'online' ? 'success' : 'default'}
            size="small"
          />
          {device.parameters && Object.entries(device.parameters).map(([key, value]) => (
            <Chip key={key} label={`${key}: ${value}`} size="small" />
          ))}
        </Stack>
      </div>
    </CardContent>
  </Card>
);

export default DeviceCard; 