import axios from 'axios';

// Base URL comes from VITE_API_URL (set per environment). Defaults to the HTTPS
// production API — never plain HTTP — so credentials/cookies are sent securely.
// For local dev, set VITE_API_URL=http://localhost:5000/api in client/.env.local.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://expence-tracker-tltn.vercel.app/api",
  withCredentials: true, // Required for sending/receiving cookies
});

// Add response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      // This will be handled by the AuthContext usually
    }
    return Promise.reject(error);
  }
);

export default api;
