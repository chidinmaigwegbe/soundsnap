// API URL - uses environment variable or falls back to localhost
const API_URL = import.meta.env.VITE_API_URL || 
                (import.meta.env.PROD ? 'https://soundsnap-api.railway.app/api' : 'http://localhost:3001/api');

console.log('API URL:', API_URL);

export const identifySongFromFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/identify`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to identify song');
  }

  return await response.json();
};

export const identifySongFromUrl = async (url) => {
  const response = await fetch(`${API_URL}/identify-from-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process URL');
  }

  return await response.json();
};

export const checkHealth = async () => {
  const response = await fetch(`${API_URL}/health`);
  return await response.json();
};
