import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.tsx'
import API_CONFIG from './config/api'

// Configurar axios para usar la URL base del backend
axios.defaults.baseURL = API_CONFIG.BASE_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
