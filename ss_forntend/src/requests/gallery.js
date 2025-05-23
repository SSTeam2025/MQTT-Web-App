import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

export async function getAllImages() {
  const response = await fetch('http://localhost:8081/images');
  if (!response.ok) throw new Error('Failed to fetch all images');
  const imagesList = await response.json();
  console.log('Fetched images list:', imagesList);

  // Create combined list with image data
  const allRealImages = await Promise.all(imagesList.map(async (img) => {
    try {
      const imageResponse = await fetch(img.url);
      if (!imageResponse.ok) throw new Error(`Failed to fetch image: ${img.filename}`);
      
      const imageBlob = await imageResponse.blob();
      return {
        id: img.filename,
        url: img.url,
        deviceId: img.deviceId,
        deviceName: img.deviceId, // Using deviceId as deviceName since it's not provided
        timestamp: img.uploadDate,
        imageData: imageBlob
      };
    } catch (error) {
      console.error(`Error fetching image ${img.filename}:`, error);
      return null;
    }
  }));

  // Filter out any failed image fetches
  const validImages = allRealImages.filter(img => img !== null);
  console.log('Combined real images:', validImages);
  return validImages;
}

export async function getGalleryDevices() {
  const response = await fetch('http://localhost:8081/api/devices');
  if (!response.ok) throw new Error('Failed to fetch gallery devices');
  return await response.json();
}

export async function getGalleryFilters() {
  const response = await fetch('http://localhost:8081/api/gallery/filters');
  if (!response.ok) throw new Error('Failed to fetch gallery filters');
  return await response.json();
}

export async function getGallerySortOptions() {
  const response = await fetch('http://localhost:8081/api/gallery/sort-options');
  if (!response.ok) throw new Error('Failed to fetch gallery sort options');
  return await response.json();
} 