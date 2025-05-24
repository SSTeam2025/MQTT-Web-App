import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
  Box,
  Button,
  Slider,
  Stack,
  Tabs,
  Tab,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import ContrastIcon from '@mui/icons-material/Contrast';
import BrightnessIcon from '@mui/icons-material/Brightness6';
import FilterBAndWIcon from '@mui/icons-material/FilterBAndW';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

function ImageModal({ open, onClose, image, onImageProcessed }) {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [contrast, setContrast] = useState(0);
  const [brightness, setBrightness] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [activeTab, setActiveTab] = useState(0);
  const [edgeDetectionUrl, setEdgeDetectionUrl] = useState(null);
  const [histogram, setHistogram] = useState(null);
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Reset all values when modal closes
  useEffect(() => {
    if (!open) {
      setRotation(0);
      setScale(1);
      setContrast(0);
      setBrightness(0);
      setGrayscale(0);
      setImageLoaded(false);
      setEdgeDetectionUrl(null);
      setHistogram(null);
    } else if (open && image) {
      setActiveTab(0); // Set default tab to Filters
      
      // Load edge detection preview
      fetch(`http://localhost:8081/images/analyze/preview?filename=${image.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'image/jpeg'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to get edge detection preview');
        }
        return response.blob();
      })
      .then(blob => {
        const url = URL.createObjectURL(blob);
        setEdgeDetectionUrl(url);
      })
      .catch(error => {
        console.error('Error getting edge detection preview:', error);
      });

      // Load histogram data
      fetch(`http://localhost:8081/images/analyze/histogram?filename=${image.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to get histogram data');
        }
        return response.json();
      })
      .then(data => {
        setHistogram(data);
      })
      .catch(error => {
        console.error('Error getting histogram data:', error);
      });
    }
  }, [open, image]);

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomChange = (event, newValue) => {
    setScale(newValue);
  };

  const handleContrastChange = (event, newValue) => {
    setContrast(newValue);
  };

  const handleBrightnessChange = (event, newValue) => {
    setBrightness(newValue);
  };

  const handleGrayscaleChange = (event, newValue) => {
    setGrayscale(newValue);
  };

  const handleMouseDown = (e) => {
    if (e.target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeStart({ x: e.clientX, y: e.clientY });
      setResizeStartSize({
        width: imageRef.current.offsetWidth,
        height: imageRef.current.offsetHeight
      });
    }
  };

  const handleMouseMove = (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    const newWidth = Math.max(100, resizeStartSize.width + deltaX);
    const newHeight = Math.max(100, resizeStartSize.height + deltaY);
    
    // Maintain aspect ratio
    const aspectRatio = resizeStartSize.width / resizeStartSize.height;
    const finalWidth = newWidth;
    const finalHeight = finalWidth / aspectRatio;

    imageRef.current.style.width = `${finalWidth}px`;
    imageRef.current.style.height = `${finalHeight}px`;
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleDownload = async () => {
    try {
      console.log('Selected Image:', image);
      console.log('Image Filename:', image.id);
      console.log('All Image Fields:', Object.keys(image));

      const response = await fetch('http://localhost:8081/images/apply-filters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: image.id,
          contrast: contrast,
          brightness: brightness,
          grayscale: grayscale
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Fetch the image using the URL from the response
      const imageResponse = await fetch(data.url);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch processed image');
      }

      const blob = await imageResponse.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Notify parent component that a new image was processed
      if (onImageProcessed) {
        onImageProcessed(data);
      }
      // Dispatch custom event for global listeners (e.g., Dashboard)
      window.dispatchEvent(new Event('imageProcessed'));
      // If currently in gallery, navigate to dashboard and reload. Do not reload gallery page itself.
    
    } catch (error) {
      console.error('Error downloading processed image:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleEdgeDetectionDownload = async () => {
    try {
      const response = await fetch(`http://localhost:8081/images/analyze?filename=${image.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download edge detection');
      }

      const data = await response.json();
      console.log('Response data:', data);

      // Fetch the image using the edgesUrl from the response
      const imageResponse = await fetch(data.edgesUrl);
      if (!imageResponse.ok) {
        throw new Error('Failed to fetch processed image');
      }

      const blob = await imageResponse.blob();
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edge_${image.id}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Notify parent component that a new image was processed
      if (onImageProcessed) {
        onImageProcessed({
          filename: `edge_${image.id}`,
          url: data.edgesUrl,
          deviceId: 'website',
          deviceName: 'Website',
          timestamp: new Date().toISOString(),
          histogram: data.histogram
        });
      }
    } catch (error) {
      console.error('Error downloading edge detection:', error);
    }
  };

  const getImageStyle = () => {
    // Convert contrast to match backend's factor calculation
    const contrastFactor = Math.pow((100 + contrast) / 100, 2);
    const contrastValue = contrastFactor * 100;

    // Brightness is already in the correct range (-100 to 100)
    const brightnessValue = brightness + 100;

    // Grayscale is already in the correct range (0 to 100)
    const grayscaleValue = grayscale;

    return {
      maxWidth: '100%',
      maxHeight: '70vh',
      transform: `rotate(${rotation}deg) scale(${scale})`,
      transition: 'transform 0.3s ease-in-out',
      opacity: imageLoaded ? 1 : 0,
      position: 'relative',
      filter: `contrast(${contrastValue}%) brightness(${brightnessValue}%) grayscale(${grayscaleValue}%)`
    };
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const renderImagePreview = () => {
    if (activeTab === 0) {
      return (
        <img
          ref={imageRef}
          id="modal-image"
          src={image?.url}
          alt={image?.deviceName}
          style={getImageStyle()}
          onLoad={() => setImageLoaded(true)}
        />
      );
    } else {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>Edge Detection Preview</Typography>
          {edgeDetectionUrl ? (
            <>
              <img
                src={edgeDetectionUrl}
                alt="Edge Detection"
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  transform: `rotate(${rotation}deg) scale(${scale})`,
                  transition: 'transform 0.3s ease-in-out',
                  opacity: imageLoaded ? 1 : 0,
                  position: 'relative'
                }}
              />
            </>
          ) : (
            <CircularProgress />
          )}
        </Box>
      );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: 'background.paper',
          minHeight: '80vh'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Image Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} centered>
            <Tab label="Filters" />
            <Tab label="Edge Detection" />
          </Tabs>

          <Box
            ref={containerRef}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px',
              bgcolor: 'black',
              position: 'relative',
              overflow: 'hidden',
              cursor: isResizing ? 'nwse-resize' : 'default'
            }}
            onMouseDown={handleMouseDown}
          >
            {renderImagePreview()}
            <Box
              className="resize-handle"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '20px',
                height: '20px',
                cursor: 'nwse-resize',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  right: '4px',
                  bottom: '4px',
                  width: '8px',
                  height: '8px',
                  borderRight: '2px solid white',
                  borderBottom: '2px solid white'
                }
              }}
            />
          </Box>

          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Device: {image?.deviceName}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Taken: {new Date(image?.timestamp).toLocaleString()}
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ px: 2 }}>
            <IconButton onClick={handleRotateLeft}>
              <RotateLeftIcon />
            </IconButton>
            <IconButton onClick={handleRotateRight}>
              <RotateRightIcon />
            </IconButton>
            <Box sx={{ flexGrow: 1, px: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <ZoomOutIcon />
                <Slider
                  value={scale}
                  onChange={handleZoomChange}
                  min={0.5}
                  max={2}
                  step={0.1}
                  sx={{ width: '200px' }}
                />
                <ZoomInIcon />
              </Stack>
            </Box>
            {activeTab === 1 && edgeDetectionUrl && (
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleEdgeDetectionDownload}
              >
                Download Edge Detection
              </Button>
            )}
          </Stack>

          {activeTab === 0 && (
            <>
              {/* Image Effects Controls */}
              <Box sx={{ px: 2, py: 1 }}>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <ContrastIcon sx={{ width: 24, height: 24 }} />
                      <Typography variant="body2" sx={{ width: 80 }}>Contrast</Typography>
                      <Slider
                        value={contrast}
                        onChange={handleContrastChange}
                        min={-100}
                        max={100}
                        sx={{ width: '200px' }}
                      />
                      <Typography variant="body2" sx={{ width: 40, textAlign: 'right' }}>{contrast}</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <BrightnessIcon sx={{ width: 24, height: 24 }} />
                      <Typography variant="body2" sx={{ width: 80 }}>Brightness</Typography>
                      <Slider
                        value={brightness}
                        onChange={handleBrightnessChange}
                        min={-100}
                        max={100}
                        sx={{ width: '200px' }}
                      />
                      <Typography variant="body2" sx={{ width: 40, textAlign: 'right' }}>{brightness}</Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FilterBAndWIcon sx={{ width: 24, height: 24 }} />
                      <Typography variant="body2" sx={{ width: 80 }}>Grayscale</Typography>
                      <Slider
                        value={grayscale}
                        onChange={handleGrayscaleChange}
                        min={0}
                        max={100}
                        sx={{ width: '200px' }}
                      />
                      <Typography variant="body2" sx={{ width: 40, textAlign: 'right' }}>{grayscale}%</Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              {/* Download Button */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2, py: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownload}
                >
                  Download
                </Button>
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ImageModal; 