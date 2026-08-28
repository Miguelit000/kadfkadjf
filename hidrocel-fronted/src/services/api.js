const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080/api';

export const fetchAPI = async (endpoint, options = {}) => {
  // Sacamos el token que guardaremos en el navegador al hacer login
  const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Si hay token, lo ponemos en la cabecera como el "Guarda de Seguridad" exige
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || 'Error en la petición');
  }

  // Si la respuesta está vacía (como al borrar algo), no intentamos parsear el JSON
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};