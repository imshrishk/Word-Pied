import axios from 'axios';

const api = axios.create({
  baseURL: '/', // Since we're using Next.js API routes, baseURL is '/'
});

export default api;