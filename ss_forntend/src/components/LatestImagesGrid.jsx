import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Card, CardMedia, CardContent, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getLatestImages } from '../requests/dashboard';
import { latestImages as mockedLatestImages } from '../mocked/dashboard';

const IMAGES_PER_PAGE = 4;
const ANIMATION_DURATION = 350; // ms

const LatestImagesGrid = ({ title = 'Last Images Received' }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLatestImages();
        setImages(data);
      } catch {
        setImages(mockedLatestImages);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const maxPage = Math.max(0, Math.ceil(images.length / IMAGES_PER_PAGE) - 1);
  const startIdx = page * IMAGES_PER_PAGE;
  const endIdx = startIdx + IMAGES_PER_PAGE;
  const visibleImages = images.slice(startIdx, endIdx);

  const handlePrev = () => {
    if (page > 0 && !animating) {
      setDirection('left');
      setAnimating(true);
      setTimeout(() => {
        setPage((p) => Math.max(0, p - 1));
        setAnimating(false);
      }, ANIMATION_DURATION);
    }
  };
  const handleNext = () => {
    if (page < maxPage && !animating) {
      setDirection('right');
      setAnimating(true);
      setTimeout(() => {
        setPage((p) => Math.min(maxPage, p + 1));
        setAnimating(false);
      }, ANIMATION_DURATION);
    }
  };

  // Animation style
  const getTranslate = () => {
    if (!animating) return 'translateX(0)';
    if (direction === 'left') return 'translateX(100%)';
    if (direction === 'right') return 'translateX(-100%)';
    return 'translateX(0)';
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      {loading ? <CircularProgress /> : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 2, justifyContent: 'center' }}>
          <IconButton onClick={handlePrev} disabled={page === 0 || animating}>
            <ArrowBackIosNewIcon />
          </IconButton>
          <Box sx={{ width: 4 * 190, overflow: 'hidden', position: 'relative' }}>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                transition: animating ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.4,0,0.2,1)` : 'none',
                transform: getTranslate(),
              }}
            >
              {visibleImages.map(img => (
                <Box key={img.id} sx={{ minWidth: 180, maxWidth: 180, flex: '0 0 auto' }}>
                  <Card sx={{ width: 180, height: 180, display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={img.url}
                      alt={img.deviceName}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        {img.deviceName} <br /> {img.timestamp}
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          </Box>
          <IconButton onClick={handleNext} disabled={page === maxPage || animating}>
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default LatestImagesGrid; 