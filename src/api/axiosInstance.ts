import axios from 'axios';

// 1. OBTENER LA URL DE LA API DESDE VARIABLES DE ENTORNO
// Esto es crucial para el despliegue. En desarrollo usará localhost,
// y en producción (Vercel) usará la URL de tu backend en Render.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// 2. CREAR LA INSTANCIA DE AXIOS
const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  // withCredentials se usa si tu backend necesita manejar cookies de sesión.
  // Es seguro mantenerlo, pero si solo usas tokens JWT, no es estrictamente necesario.
  withCredentials: true, 
});

// 3. INTERCEPTOR DE PETICIÓN (REQUEST)
// Se ejecuta antes de enviar cada petición. Su trabajo es añadir el token.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Adjunta el token al encabezado para autenticar la petición
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Maneja errores que ocurren ANTES de que la petición se envíe (ej. sin red)
    return Promise.reject(error);
  }
);

// 4. INTERCEPTOR DE RESPUESTA (RESPONSE)
// Se ejecuta después de recibir una respuesta. Su trabajo es manejar errores globales.
axiosInstance.interceptors.response.use(
  // Si la respuesta es exitosa (código 2xx), simplemente la devuelve.
  (response) => response,
  // Si la respuesta tiene un error...
  (error) => {
    // Manejo específico para el error 401 (No Autorizado / Token Expirado)
    if (error.response && error.response.status === 401) {
      console.warn('Sesión expirada o token inválido. Redirigiendo al login...');
      // Limpia el token antiguo del almacenamiento local
      localStorage.removeItem('token');
      // Redirige al usuario a la página de login para que inicie sesión de nuevo.
      // Usamos window.location.href porque esto es un módulo de JS, no un componente de React.
      window.location.href = '/login';
    }
    // Para cualquier otro error, simplemente lo rechaza para que pueda ser
    // manejado por el bloque catch en el componente que hizo la llamada.
    return Promise.reject(error);
  }
);

export default axiosInstance;
