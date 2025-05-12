import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Activa el modo estricto de React
  images: {
    domains: ["backendmantenimiento.onrender.com"], // Permite cargar imágenes desde el backend
  },
  env: {
    API_BASE_URL: process.env.NODE_ENV === "development"
      ? "http://127.0.0.1:3001" // URL en desarrollo
      : "https://backendmantenimiento.onrender.com", // URL en producción
  },
};

export default nextConfig;
