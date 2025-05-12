const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:3001/" // URL en desarrollo
    : "https://backendmantenimiento.onrender.com"; // URL en producción

export default API_BASE_URL;
