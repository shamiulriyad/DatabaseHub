export const axiosConfig = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5145/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
