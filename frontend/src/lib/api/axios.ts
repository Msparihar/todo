import axios from "axios";
import { getCookie } from "./auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in cross-origin requests
});

// Request logging
console.log("Creating axios instance with baseURL:", api.defaults.baseURL);

// Add a request interceptor to include token if available
api.interceptors.request.use(
  (config) => {
    const token = getCookie("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`,
      config.params ? `Params: ${JSON.stringify(config.params)}` : ""
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${
        response.status
      } ${response.config.method?.toUpperCase()} ${response.config.url}`
    );
    return response;
  },
  async (error) => {
    console.error(
      "API Response Error:",
      error.response?.status,
      error.response?.data || error.message
    );
    // If 401 Unauthorized, redirect to login
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
