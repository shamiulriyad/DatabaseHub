export const environment = {
  production: process.env.NODE_ENV === 'production',
  development: process.env.NODE_ENV === 'development',
  apiUrl: process.env.REACT_APP_API_URL || 'https://localhost:5001/api'
};
