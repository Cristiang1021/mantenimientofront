const API_BASE_URL =
  process.env.NODE_ENV === "development"
    ? "https://backendmantenimiento-nxyz.onrender.com/" // URL en desarrollo
    : "https://backendmantenimiento-nxyz.onrender.com/"; // URL en producción

export default API_BASE_URL;
