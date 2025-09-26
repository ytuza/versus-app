import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_staff?: boolean;
  is_influencer?: boolean;
  referral_code?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile/');
      // Incluir información de is_staff del usuario
      const userData = {
        ...response.data,
        is_staff: response.data.is_staff || false
      };
      setUser(userData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login/', {
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;
    } catch (error: any) {
      if (error.response?.data) {
        const errors = error.response.data;
        
        // Manejar errores específicos del backend
        if (errors.non_field_errors) {
          // Error general del serializer (ej: "Credenciales inválidas")
          throw new Error(errors.non_field_errors[0]);
        }
        
        // Errores específicos por campo
        if (errors.email) {
          throw new Error(errors.email[0]);
        }
        
        if (errors.password) {
          throw new Error(errors.password[0]);
        }
        
        // Error genérico si no hay errores específicos
        throw new Error('Error en el inicio de sesión');
      }
      
      // Error de conexión
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
      
      // Error del servidor
      if (error.response?.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      }
      
      throw new Error('Error inesperado. Inténtalo de nuevo.');
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await axios.post('/api/auth/register/', {
        email,
        password,
        confirm_password: password,
        first_name: firstName,
        last_name: lastName
      });
      
      const { token: newToken, user: userData } = response.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Token ${newToken}`;
    } catch (error: any) {
      if (error.response?.data) {
        const errors = error.response.data;
        
        // Manejar errores específicos del backend
        if (errors.non_field_errors) {
          throw new Error(errors.non_field_errors[0]);
        }
        
        // Errores específicos por campo
        if (errors.email) {
          throw new Error(errors.email[0]);
        }
        
        if (errors.password) {
          throw new Error(errors.password[0]);
        }
        
        if (errors.confirm_password) {
          throw new Error(errors.confirm_password[0]);
        }
        
        if (errors.first_name) {
          throw new Error(errors.first_name[0]);
        }
        
        if (errors.last_name) {
          throw new Error(errors.last_name[0]);
        }
        
        // Error genérico si no hay errores específicos
        throw new Error('Error en el registro');
      }
      
      // Error de conexión
      if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Error de conexión. Verifica tu conexión a internet.');
      }
      
      // Error del servidor
      if (error.response?.status >= 500) {
        throw new Error('Error del servidor. Inténtalo más tarde.');
      }
      
      throw new Error('Error inesperado. Inténtalo de nuevo.');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
