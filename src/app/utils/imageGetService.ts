// services/imageService.ts
const imageGetService = async ( referenceId: string) => {
  try {
    console.log("referenceId",referenceId)
    const response = await fetch('/api/upload/final/getbyreference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ referenceId }),
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

export default imageGetService;
