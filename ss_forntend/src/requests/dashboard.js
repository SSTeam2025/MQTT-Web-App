export async function getTotalImagesToday() {
  const response = await fetch('http://localhost:8081/api/images/today');
  if (!response.ok) throw new Error('Failed to fetch total images today');
  return await response.json();
}

export async function getDeviceStatus() {
  const response = await fetch('http://localhost:8081/api/devices/status');
  if (!response.ok) throw new Error('Failed to fetch device status');
  return await response.json();
}

export async function getLatestImages() {
  const response = await fetch('http://localhost:8081/api/images/latest');
  if (!response.ok) throw new Error('Failed to fetch latest images');
  return await response.json();
}

export async function getActiveDevices() {
  const response = await fetch('http://localhost:8081/api/devices/active');
  if (!response.ok) throw new Error('Failed to fetch active devices');
  return await response.json();
}

export async function getLastUsedDevice() {
  const response = await fetch('http://localhost:8081/api/devices/last-used');
  if (!response.ok) throw new Error('Failed to fetch last used device');
  return await response.json();
} 