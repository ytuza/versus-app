import React, { useState, useEffect } from 'react';
import { useRaffles } from '../contexts/RafflesContext';
import { Gift, Trophy, Users, Target, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ProcessRaffles: React.FC = () => {
  const { raffles, loading, error, fetchRaffles, processRaffle } = useRaffles();
  const [processing, setProcessing] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchRaffles('completed');
  }, []);

  const handleProcessRaffle = async (raffleId: number) => {
    setProcessing(raffleId);
    setMessage(null);
    
    try {
      await processRaffle(raffleId);
      setMessage({ type: 'success', text: 'Sorteo procesado exitosamente' });
      await fetchRaffles('completed');
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Error al procesar el sorteo' 
      });
    } finally {
      setProcessing(null);
    }
  };

  const completedRaffles = raffles.filter(raffle => raffle.status === 'completed');
  const processedRaffles = raffles.filter(raffle => raffle.status === 'processed');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
        <button
          onClick={() => fetchRaffles('completed')}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Gift className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Procesar Sorteos</h2>
          <p className="text-gray-600">Procesa sorteos completados y selecciona ganadores</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
        }`}>
          <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sorteos Completados</p>
              <p className="text-2xl font-bold text-gray-900">{completedRaffles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Trophy className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Sorteos Procesados</p>
              <p className="text-2xl font-bold text-gray-900">{processedRaffles.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Coins en Sorteos</p>
              <p className="text-2xl font-bold text-gray-900">
                {raffles.reduce((total, raffle) => total + raffle.current_amount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Completed Raffles */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <CheckCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Sorteos Completados</h3>
        </div>

        {completedRaffles.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay sorteos completados para procesar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {completedRaffles.map((raffle) => (
              <div key={raffle.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{raffle.title}</h4>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Completado
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{raffle.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{raffle.current_amount} / {raffle.target_amount} coins</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{raffle.total_participations} participantes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Creado: {new Date(raffle.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <button
                      onClick={() => handleProcessRaffle(raffle.id)}
                      disabled={processing === raffle.id}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {processing === raffle.id ? 'Procesando...' : 'Procesar Sorteo'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Processed Raffles */}
      {processedRaffles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="text-lg font-semibold text-gray-900">Sorteos Procesados</h3>
          </div>

          <div className="space-y-4">
            {processedRaffles.map((raffle) => (
              <div key={raffle.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{raffle.title}</h4>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                        Procesado
                      </span>
                    </div>
                    
                    {raffle.winner_name && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">
                            Ganador: {raffle.winner_name}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Target className="w-4 h-4" />
                        <span>{raffle.current_amount} coins otorgados</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{raffle.total_participations} participantes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>Procesado: {raffle.processed_at ? new Date(raffle.processed_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">Información sobre el procesamiento</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Solo se pueden procesar sorteos que hayan alcanzado su monto objetivo</li>
              <li>• El ganador se selecciona aleatoriamente con probabilidades proporcionales a los coins apostados</li>
              <li>• El ganador recibirá automáticamente todos los coins recaudados en el sorteo</li>
              <li>• Una vez procesado, el sorteo no se puede modificar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessRaffles;
