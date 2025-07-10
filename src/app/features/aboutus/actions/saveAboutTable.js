import axios from 'axios';

export const saveAboutTable = async ({ data, content,type, _id }, token) => {
  const payload = {
    data,
    content,
    type,
    ...(!!_id && { _id }), // send ID if updating
  };

  return axios.post('/api/about-us', payload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAboutTable = async (token,type) => {
  return axios.get('/api/about-us', {
    params:{type:type},
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
