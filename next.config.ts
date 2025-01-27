import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Activa el modo estricto de React
  images: {
    domains: ["backendmantenimiento.onrender.com"], // Permite cargar imágenes desde el backend
  },
  env: {
    API_BASE_URL: process.env.NODE_ENV === "development"
      ? "https://backendmantenimiento.onrender.com" // URL en desarrollo
      : "https://backendmantenimiento.onrender.com", // URL en producción
  },
};

export default nextConfig;
