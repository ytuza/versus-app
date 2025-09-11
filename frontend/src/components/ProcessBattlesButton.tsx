import React, { useState } from 'react';
import axios from 'axios';
import { Play, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProcessBattlesResponse {
  success: boolean;
  message: string;
  output?: string;
  processed_count?: number;
  error?: string;
}

const ProcessBattlesButton: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ProcessBattlesResponse | null>(null);

  const handleProcessBattles = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      const response = await axios.post('/api/admin/battles/process/');
      setResult(response.data);
    } catch (error: any) {
      setResult({
        success: false,
        message: 'Error ejecutando el proceso',
        error: error.response?.data?.error || error.message
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Procesar Batallas Terminadas
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Ejecuta el proceso automático para determinar ganadores y realizar sorteos
          </p>
        </div>
        <button
          onClick={handleProcessBattles}
          disabled={isProcessing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            isProcessing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Ejecutar Proceso</span>
            </>
          )}
        </button>
      </div>

      {result && (
        <div className={`p-4 rounded-lg border ${
          result.success 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${
                result.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {result.message}
              </p>
              
              {result.success && result.processed_count !== undefined && (
                <p className="text-sm text-green-700 mt-1">
                  Batallas procesadas: {result.processed_count}
                </p>
              )}

              {result.output && (
                <details className="mt-3">
                  <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                    Ver detalles del proceso
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                    {result.output}
                  </pre>
                </details>
              )}

              {result.error && (
                <p className="text-sm text-red-700 mt-1">
                  Error: {result.error}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          ¿Qué hace este proceso?
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Busca batallas activas que ya terminaron</li>
          <li>• Determina el ganador basado en coins apostados</li>
          <li>• Calcula distribución de ganancias (25/25/25/25)</li>
          <li>• Realiza sorteo automático entre apostadores del ganador</li>
          <li>• Crea registros de resultados</li>
        </ul>
      </div>
    </div>
  );
};

export default ProcessBattlesButton;
