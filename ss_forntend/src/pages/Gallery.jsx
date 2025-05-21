import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Grid, Card, CardMedia, CardContent, MenuItem, Select, FormControl, InputLabel, Stack } from '@mui/material';
import {
  getAllImages,
  getGalleryDevices,
  getGalleryFilters,
  getGallerySortOptions
} from '../requests/gallery';
import {
  allImages as mockedAllImages,
  galleryDevices as mockedGalleryDevices,
  galleryFilters as mockedGalleryFilters,
  gallerySortOptions as mockedGallerySortOptions
} from '../mocked/gallery';
import ImageModal from '../components/ImageModal';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString();
}

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [devices, setDevices] = useState([]);
  const [filters, setFilters] = useState([]);
  const [sortOptions, setSortOptions] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('latest');
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [img, dev, fil, sort] = await Promise.all([
          getAllImages(),
          getGalleryDevices(),
          getGalleryFilters(),
          getGallerySortOptions()
        ]);
        setImages(img);
        setDevices(dev);
        // Ensure 'All Time' is always present
        const hasAllTime = fil.some(f => f.value === 'all');
        setFilters(hasAllTime ? fil : [{ value: 'all', label: 'All Time' }, ...fil]);
        setSortOptions(sort);
      } catch {
        setImages(mockedAllImages);
        setDevices(mockedGalleryDevices);
        // Ensure 'All Time' is always present in mocked data too
        const hasAllTime = mockedGalleryFilters.some(f => f.value === 'all');
        setFilters(hasAllTime ? mockedGalleryFilters : [{ value: 'all', label: 'All Time' }, ...mockedGalleryFilters]);
        setSortOptions(mockedGallerySortOptions);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Filtering
  let filteredImages = images;
  if (selectedDevice && selectedDevice !== 'all') {
    filteredImages = filteredImages.filter(img => img.deviceId === selectedDevice);
  }
  // Time filter (mocked, just for demo)
  if (selectedFilter) {
    const now = new Date();
    filteredImages = filteredImages.filter(img => {
      const imgDate = new Date(img.timestamp);
      if (selectedFilter === 'day') {
        return imgDate.toDateString() === now.toDateString();
      } else if (selectedFilter === 'week') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
        return imgDate >= weekAgo;
      } else if (selectedFilter === 'month') {
        return imgDate.getMonth() === now.getMonth() && imgDate.getFullYear() === now.getFullYear();
      } else if (selectedFilter === 'year') {
        return imgDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
  }
  // Sorting
  filteredImages = filteredImages.sort((a, b) => {
    if (selectedSort === 'latest') {
      return new Date(b.timestamp) - new Date(a.timestamp);
    } else {
      return new Date(a.timestamp) - new Date(b.timestamp);
    }
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center' }}>
        Gallery
      </Typography>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ 
          mb: 3,
          width: '100%',
          height: '80px',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel shrink={true}>Device</InputLabel>
          <Select
            value={selectedDevice}
            label="Device"
            onChange={e => setSelectedDevice(e.target.value)}
          >
            {devices.map(dev => (
              <MenuItem key={dev.id} value={dev.id}>{dev.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel shrink={true}>Time</InputLabel>
          <Select
            value={selectedFilter}
            label="Time"
            onChange={e => setSelectedFilter(e.target.value)}
          >
            {filters.map(fil => (
              <MenuItem key={fil.value} value={fil.value}>{fil.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }}>
          <InputLabel shrink={true}>Sort</InputLabel>
          <Select
            value={selectedSort}
            label="Sort"
            onChange={e => setSelectedSort(e.target.value)}
          >
            {sortOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {loading ? <CircularProgress /> : (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Grid 
            container 
            spacing={2} 
            sx={{ 
              minHeight: 'calc(100vh - 200px)',
              maxWidth: '1200px',
              justifyContent: 'flex-start'
            }}
          >
            {filteredImages.map((img, index) => {
              const isLastRow = index >= filteredImages.length - (filteredImages.length % 4);
              return (
                <Grid 
                  item 
                  key={img.id} 
                  xs={12} 
                  sm={6} 
                  md={4} 
                  lg={3}
                  sx={{ 
                    display: 'flex',
                    justifyContent: 'flex-start'
                  }}
                >
                  <Card 
                    sx={{ 
                      width: 240, 
                      height: 240, 
                      display: 'flex', 
                      flexDirection: 'column',
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 6
                      }
                    }}
                    onClick={() => setSelectedImage(img)}
                  >
                    <CardMedia
                      component="img"
                      height="160"
                      image={img.url}
                      alt={img.deviceName}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {img.deviceName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(img.timestamp)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
      <ImageModal
        open={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        image={selectedImage}
      />
    </Box>
  );
};

export default Gallery; 