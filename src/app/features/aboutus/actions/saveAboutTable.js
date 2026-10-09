import axios from 'axios';

export const saveAboutTable = async (
  { data, content, title, type, _id, designation, photo },
  token
) => {
  const payload = {
    data,
    content,
    type,
    title,
    ...(designation !== undefined && { designation }),
    ...(photo !== undefined && { photo }),
    ...(!!_id && { _id }),
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


