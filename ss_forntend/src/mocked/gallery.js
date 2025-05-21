export const allImages = [
  { id: 1, url: 'https://placehold.co/300x180?text=Image+1', deviceId: '1', deviceName: 'Camera A', timestamp: '2024-05-15T10:00:00Z' },
  { id: 2, url: 'https://placehold.co/300x180?text=Image+2', deviceId: '2', deviceName: 'Camera B', timestamp: '2024-05-15T09:50:00Z' },
  { id: 3, url: 'https://placehold.co/300x180?text=Image+3', deviceId: '1', deviceName: 'Camera A', timestamp: '2024-05-14T08:30:00Z' },
  { id: 4, url: 'https://placehold.co/300x180?text=Image+4', deviceId: '3', deviceName: 'Sensor C', timestamp: '2024-05-10T12:00:00Z' },
  { id: 5, url: 'https://placehold.co/300x180?text=Image+5', deviceId: '2', deviceName: 'Camera B', timestamp: '2024-04-20T15:00:00Z' },
  { id: 6, url: 'https://placehold.co/300x180?text=Image+6', deviceId: '3', deviceName: 'Sensor C', timestamp: '2023-12-25T11:00:00Z' }
];

export const galleryDevices = [
  { id: 'all', name: 'All Devices' },
  { id: '1', name: 'Camera A' },
  { id: '2', name: 'Camera B' },
  { id: '3', name: 'Sensor C' }
];

export const galleryFilters = [
  { value: 'all', label: 'All Time' },
  { value: 'day', label: 'This Day' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

export const gallerySortOptions = [
  { value: 'latest', label: 'Latest' },
  { value: 'oldest', label: 'Oldest' }
]; 