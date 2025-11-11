import axios from "axios";
import { handleUnauthorized } from "../utils/errors";

//Configuración de la instancia de axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 segundos de timeout
});

//Interceptor de request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//Interceptor de response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 → limpieza y redirección centralizada
    if (error?.response?.status === 401) handleUnauthorized();
    return Promise.reject(error);
  }
);

export default api;
