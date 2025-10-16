// services/imageService.ts
const storeImage = async (tempFileName: string, referenceId: string) => {
  try {
    const response = await fetch('/api/upload/final', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tempFileName, referenceId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to store image info');
    }

    return data;
  } catch (err) {
    console.error('Error storing image info:', err);
    throw err;
  }
};

export default storeImage;
