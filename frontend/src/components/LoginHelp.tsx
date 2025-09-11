import React, { useState } from 'react';
import { HelpCircle, X, CheckCircle } from 'lucide-react';

interface LoginHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginHelp: React.FC<LoginHelpProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('common');

  const commonIssues = [
    {
      problem: 'Credenciales inválidas',
      solution: 'Verifica que tu correo electrónico y contraseña sean correctos. Asegúrate de que no haya espacios adicionales.',
      icon: '🔐'
    },
    {
      problem: 'No tengo cuenta',
      solution: 'Haz clic en "Crear nueva cuenta" para registrarte. El proceso es rápido y gratuito.',
      icon: '📝'
    },
    {
      problem: 'Olvidé mi contraseña',
      solution: 'Por el momento, contacta al administrador para restablecer tu contraseña.',
      icon: '🔑'
    },
    {
      problem: 'Error de conexión',
      solution: 'Verifica tu conexión a internet. Si el problema persiste, intenta más tarde.',
      icon: '🌐'
    }
  ];

  const tips = [
    'Asegúrate de escribir tu correo electrónico correctamente',
    'La contraseña distingue entre mayúsculas y minúsculas',
    'Si tienes problemas, puedes crear una nueva cuenta',
    'El sistema es seguro y tus datos están protegidos'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
            Ayuda para el Login
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('common')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'common'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Problemas Comunes
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'tips'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Consejos
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'common' && (
            <div className="space-y-4">
              {commonIssues.map((issue, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">{issue.icon}</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {issue.problem}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {issue.solution}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3">
              {tips.map((tip, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            ¿Necesitas más ayuda? Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginHelp;
