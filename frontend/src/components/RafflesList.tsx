import React, { useState } from 'react';
import { useRaffles, type Raffle } from '../contexts/RafflesContext';
import { useCoins } from '../contexts/CoinsContext';
import { Gift, Target, Users, Clock, CheckCircle, Trophy, Coins } from 'lucide-react';

const RafflesList: React.FC = () => {
  const { raffles, loading, error, fetchRaffles, participateInRaffle } = useRaffles();
  const { coins } = useCoins();
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [participationAmount, setParticipationAmount] = useState('');
  const [participating, setParticipating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('active');

  const handleParticipate = async (raffle: Raffle) => {
    if (!participationAmount || parseInt(participationAmount) <= 0) {
      alert('Por favor ingresa una cantidad válida de coins');
      return;
    }

    const amount = parseInt(participationAmount);
    if (amount > coins) {
      alert('No tienes suficientes coins');
      return;
    }

    setParticipating(true);
    try {
      await participateInRaffle(raffle.id, amount);
      setSelectedRaffle(null);
      setParticipationAmount('');
      alert('¡Participación exitosa!');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al participar');
    } finally {
      setParticipating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="w-5 h-5 text-green-600" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'processed':
        return <Trophy className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'completed':
        return 'Completado';
      case 'processed':
        return 'Procesado';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-secondary-100 text-secondary-800';
      case 'completed':
        return 'bg-primary-100 text-primary-800';
      case 'processed':
        return 'bg-accent-100 text-accent-800';
      default:
        return 'bg-accent-100 text-accent-800';
    }
  };

  const filteredRaffles = raffles.filter(raffle => raffle.status === statusFilter);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-6">
        <p className="text-primary-800">{error}</p>
        <button
          onClick={() => fetchRaffles()}
          className="mt-4 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-secondary-100 rounded-lg">
            <Gift className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sorteos</h2>
            <p className="text-gray-600">Participa en sorteos con tus coins</p>
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex space-x-2">
          {['active', 'completed', 'processed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-secondary-600 text-white'
                  : 'bg-accent-100 text-accent-700 hover:bg-accent-200'
              }`}
            >
              {getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Raffles Grid */}
      {filteredRaffles.length === 0 ? (
        <div className="text-center py-12">
          <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay sorteos {getStatusText(statusFilter).toLowerCase()}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRaffles.map((raffle) => (
            <div key={raffle.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(raffle.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(raffle.status)}`}>
                    {getStatusText(raffle.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Creado por</p>
                  <p className="text-sm font-medium text-gray-900">{raffle.created_by_name}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{raffle.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{raffle.description}</p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progreso</span>
                  <span className="text-sm text-gray-500">{raffle.progress_percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${raffle.progress_percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">{raffle.current_amount} coins</span>
                  <span className="text-xs text-gray-500">{raffle.target_amount} coins</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{raffle.total_participations} participantes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{raffle.target_amount} objetivo</span>
                </div>
              </div>

              {/* Winner Info */}
              {raffle.status === 'processed' && raffle.winner_name && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Ganador: {raffle.winner_name}</span>
                  </div>
                </div>
              )}

              {/* Action Button */}
              {raffle.status === 'active' && (
                <button
                  onClick={() => setSelectedRaffle(raffle)}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                >
                  Participar
                </button>
              )}

              {raffle.status === 'completed' && (
                <div className="w-full bg-blue-100 text-blue-800 py-2 px-4 rounded-lg font-medium text-center">
                  Esperando procesamiento
                </div>
              )}

              {raffle.status === 'processed' && (
                <div className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 rounded-lg font-medium text-center">
                  Sorteo terminado
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Participation Modal */}
      {selectedRaffle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Participar en Sorteo</h3>
              <button
                onClick={() => setSelectedRaffle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{selectedRaffle.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{selectedRaffle.description}</p>
              
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-purple-800">Progreso actual</span>
                  <span className="text-sm text-purple-600">{selectedRaffle.progress_percentage}%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${selectedRaffle.progress_percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-purple-600">{selectedRaffle.current_amount} / {selectedRaffle.target_amount} coins</span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="coins-amount" className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de coins a participar
              </label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  id="coins-amount"
                  value={participationAmount}
                  onChange={(e) => setParticipationAmount(e.target.value)}
                  min="1"
                  max={coins}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ingresa cantidad"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Coins disponibles: {coins}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Recuerda:</strong> Mientras más coins pongas, más probabilidades de ganar tendrás. 
                Solo puedes participar una vez por sorteo.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedRaffle(null)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleParticipate(selectedRaffle)}
                disabled={participating || !participationAmount}
                className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {participating ? 'Participando...' : 'Participar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RafflesList;
