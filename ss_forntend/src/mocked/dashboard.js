export const totalImagesToday = 42;

export const deviceStatus = {
  online: 3,
  offline: 2
};

export const latestImages = [
  { id: 1, url: 'https://placehold.co/300x180?text=Image+1', deviceName: 'Camera A', timestamp: '2024-05-15 10:00' },
  { id: 2, url: 'https://placehold.co/300x180?text=Image+2', deviceName: 'Camera B', timestamp: '2024-05-15 09:50' },
  { id: 3, url: 'https://placehold.co/300x180?text=Image+3', deviceName: 'Sensor C', timestamp: '2024-05-15 09:40' },
  { id: 4, url: 'https://placehold.co/300x180?text=Image+4', deviceName: 'Camera D', timestamp: '2024-05-15 09:30' },
  { id: 5, url: 'https://placehold.co/300x180?text=Image+5', deviceName: 'Camera E', timestamp: '2024-05-15 09:20' },
  { id: 6, url: 'https://placehold.co/300x180?text=Image+6', deviceName: 'Sensor F', timestamp: '2024-05-15 09:10' }
];

export const activeDevices = [
  {
    id: '1',
    name: 'Temperature Sensor A',
    status: 'online',
    lastImageUrl: 'https://placehold.co/300x180?text=Device+A',
    parameters: { temp: '22°C', battery: '80%' }
  },
  {
    id: '2',
    name: 'Camera B',
    status: 'online',
    lastImageUrl: 'https://placehold.co/300x180?text=Camera+B',
    parameters: { lastSeen: '2024-05-14 10:22', battery: 'N/A' }
  },
  {
    id: '3',
    name: 'Door Lock C',
    status: 'online',
    lastImageUrl: 'https://placehold.co/300x180?text=Lock+C',
    parameters: { locked: 'yes', battery: '60%' }
  }
];

export const lastUsedDevice = {
  id: 'last-used',
  name: 'Mocked Last Used Device',
  status: 'online',
  lastImageUrl: 'https://placehold.co/300x180?text=Last+Used',
  parameters: { temp: '24°C', battery: '90%' }
}; 