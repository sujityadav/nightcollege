import axios from 'axios';

export const loginAction = async (data) => {
  try {
    const email = encodeURIComponent(data.username || '');
    const password = encodeURIComponent(data.password || '');
    const response = await axios.get(`/api/auth?email=${email}&password=${password}`);
    return response;
  } catch (error) {
    if (error.response) {
      return error.response;
    }
    throw error;
  }
};
