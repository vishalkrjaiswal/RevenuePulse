import axios from "axios";

axios.defaults.withCredentials = true;

const RAW_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

const BASE = RAW_BASE ? RAW_BASE.replace(/\/$/, "") : "http://localhost:4000";

const api = axios.create({
  baseURL: BASE,         
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

export const setAuthToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export default api;
