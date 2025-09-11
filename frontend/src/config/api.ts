// Configuración de la API
const API_CONFIG = {
  // URL base del backend
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 
           (import.meta.env.MODE === 'production' 
             ? 'https://tu-app-backend.onrender.com'  // Cambiar por tu URL de Render
             : 'http://localhost:8001'),
             
  // Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/api/auth/login/',
      REGISTER: '/api/auth/register/',
      PROFILE: '/api/auth/profile/',
    },
    BATTLES: {
      LIST: '/api/battles/',
      MY: '/api/battles/my/',
      CREATE: '/api/battles/create/',
      BET: '/api/battles/bet/',
      PROCESS: '/api/battles/process/',
    },
    BETS: {
      MY: '/api/bets/my/',
    },
    RAFFLES: {
      LIST: '/api/raffles/',
      CREATE: '/api/raffles/create/',
      PARTICIPATE: '/api/raffles/participate/',
      PROCESS: '/api/raffles/process/',
    },
    COINS: {
      PURCHASE: '/api/coins/purchase/',
      TRANSACTIONS: '/api/transactions/',
    },
  },
};

export default API_CONFIG;
