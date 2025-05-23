export async function getAllDevices() {
  const response = await fetch('http://localhost:8081/devices');
  if (!response.ok) throw new Error('Failed to fetch devices');
  return await response.json();
} 