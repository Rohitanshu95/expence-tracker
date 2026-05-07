import axios from 'axios';

const api = axios.create({
  baseURL: "https://expence-tracker-tltn.vercel.app/api",
  // baseURL: "http://localhost:5000/api",
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
