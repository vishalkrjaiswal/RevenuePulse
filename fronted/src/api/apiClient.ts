import axios from "axios";

// Always send cookies with cross-origin requests
axios.defaults.withCredentials = true;

// Base URL from env variable (no trailing slash)
const RAW_BASE = import.meta.env.VITE_API_URL;
const BASE = RAW_BASE.replace(/\/$/, "");

// Axios instance
const api = axios.create({
  baseURL: BASE,         // Do NOT add /api here if you include it in request path
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Utility to set/remove Authorization header dynamically
export const setAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
