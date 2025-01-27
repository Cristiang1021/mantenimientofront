const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "https://backendmantenimiento.onrender.com" // URL en desarrollo
    : "https://backendmantenimiento.onrender.com"; // URL en producción

export default API_BASE_URL;
