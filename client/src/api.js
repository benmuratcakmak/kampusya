// src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://localhost:5000', // API URL'inizi buraya ekleyin
});

// Global interceptor ile her istek için Authorization başlığı ekliyoruz
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken'); // Token'ı localStorage'dan alıyoruz
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Token'ı Authorization başlığına ekliyoruz
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
