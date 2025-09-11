import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, X, HelpCircle } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import LoginHelp from './LoginHelp';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showHelp, setShowHelp] = useState(false);
  const { login } = useAuth();

  // Limpiar errores cuando cambian los campos
  useEffect(() => {
    if (error) {
      setError('');
    }
    if (fieldErrors.email && email) {
      setFieldErrors(prev => ({ ...prev, email: undefined }));
    }
    if (fieldErrors.password && password) {
      setFieldErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      const errorMessage = err.message;
      
      // Determinar si es un error específico de campo o general
      if (errorMessage.includes('email') || errorMessage.includes('correo')) {
        setFieldErrors(prev => ({ ...prev, email: errorMessage }));
      } else if (errorMessage.includes('contraseña') || errorMessage.includes('password')) {
        setFieldErrors(prev => ({ ...prev, password: errorMessage }));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-white text-2xl font-bold">V</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenido de vuelta
          </h2>
          <p className="text-gray-600">
            Inicia sesión en tu cuenta para continuar
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-400 hover:text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-gray-500" />
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`input-field bg-gray-50 border-gray-200 focus:bg-white transition-colors ${
                    fieldErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                  placeholder="tu@email.com"
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="password" className="form-label flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`input-field bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-12 ${
                      fieldErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {fieldErrors.password}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowHelp(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
                >
                  <HelpCircle className="w-4 h-4 mr-1" />
                  Ayuda
                </button>
                <button type="button" className="text-sm text-primary-600 hover:text-primary-500 font-medium">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            {/* Mensaje de ayuda */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>¿No tienes cuenta?</strong> Haz clic en "Crear nueva cuenta" para registrarte.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="Iniciando sesión..." />
              ) : (
                <div className="flex items-center">
                  Iniciar sesión
                  <ArrowRight className="ml-2 w-5 h-5" />
                </div>
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">¿No tienes una cuenta?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={onSwitchToRegister}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                Crear nueva cuenta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ayuda */}
      <LoginHelp 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)} 
      />
    </div>
  );
};

export default Login;
