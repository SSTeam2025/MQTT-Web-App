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
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import DownloadIcon from '@mui/icons-material/Download';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';

const ImageModal = ({ open, onClose, image }) => {
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  const handleRotateLeft = () => {
    setRotation((prev) => (prev - 90) % 360);
  };

  const handleRotateRight = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomChange = (event, newValue) => {
    setScale(newValue);
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

  const handleDownload = () => {
    const canvas = document.createElement('canvas');
    const img = imageRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to match the transformed image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    
    // Apply transformations
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    
    // Draw the image
    ctx.drawImage(img, 0, 0);
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `image-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
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
        <Typography variant="h6">Image Details</Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
            <img
              ref={imageRef}
              id="modal-image"
              src={image?.url}
              alt={image?.deviceName}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease-in-out',
                opacity: imageLoaded ? 1 : 0,
                position: 'relative'
              }}
              onLoad={() => setImageLoaded(true)}
            />
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
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
            >
              Download
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImageModal; 