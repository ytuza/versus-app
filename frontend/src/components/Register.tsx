import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Check } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.password, formData.firstName, formData.lastName);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const { password } = formData;
    if (password.length === 0) return { score: 0, color: 'gray', text: '' };
    if (password.length < 8) return { score: 1, color: 'red', text: 'Débil' };
    if (password.length < 12) return { score: 2, color: 'yellow', text: 'Media' };
    return { score: 3, color: 'green', text: 'Fuerte' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand */}
        <div className="text-center">
          <div className="mx-auto h-20 w-48 mb-4 flex items-center justify-center">
            <img src="/versus-app/raqi-logo.png" alt="Raqi" className="h-full w-full object-contain" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Únete a nosotros
          </h2>
          <p className="text-gray-600">
            Crea tu cuenta para comenzar
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-xl flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="form-label flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    Nombre
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="form-label flex items-center">
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                    Apellido
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    placeholder="Tu apellido"
                  />
                </div>
              </div>
              
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
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  placeholder="tu@email.com"
                />
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-12"
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
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            strength.color === 'red' ? 'bg-primary-500' :
                            strength.color === 'yellow' ? 'bg-accent-500' :
                            'bg-secondary-500'
                          }`}
                          style={{ width: `${(strength.score / 3) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        strength.color === 'red' ? 'text-primary-600' :
                        strength.color === 'yellow' ? 'text-accent-600' :
                        'text-secondary-600'
                      }`}>
                        {strength.text}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="form-label flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-gray-500" />
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="input-field bg-gray-50 border-gray-200 focus:bg-white transition-colors pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-2 flex items-center">
                    {formData.password === formData.confirmPassword ? (
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-red-300 rounded-full mr-2"></div>
                    )}
                    <span className={`text-xs ${
                      formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formData.password === formData.confirmPassword ? 'Contraseñas coinciden' : 'Las contraseñas no coinciden'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                Acepto los{' '}
                <button type="button" className="text-primary-600 hover:text-primary-500 font-medium">
                  términos y condiciones
                </button>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex justify-center py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="Creando cuenta..." />
              ) : (
                <div className="flex items-center">
                  Crear cuenta
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
                <span className="px-2 bg-white text-gray-500">¿Ya tienes una cuenta?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={onSwitchToLogin}
                className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
              >
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
