export async function getAllImages() {
  const response = await fetch('http://localhost:8081/api/images/all');
  if (!response.ok) throw new Error('Failed to fetch all images');
  return await response.json();
}

export async function getGalleryDevices() {
  const response = await fetch('http://localhost:8081/api/devices/all');
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