import React, { useState } from 'react';
import { useBattles } from '../contexts/BattlesContext';
import type { Battle } from '../types/battles';
import { useAuth } from '../contexts/AuthContext';
import BattleBet from './BattleBet';
import BattleResults from './BattleResults';
import { Clock, Users, Coins, Trophy, AlertCircle, Eye } from 'lucide-react';

const BattlesList: React.FC = () => {
  const { battles, loading, error } = useBattles();
  const { user } = useAuth();
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [selectedBattleForBet, setSelectedBattleForBet] = useState<Battle | null>(null);
  const [showResults, setShowResults] = useState<number | null>(null);

  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Terminada';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'finished': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'finished': return 'Terminada';
      case 'cancelled': return 'Cancelada';
      default: return 'Desconocida';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (battles.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay batallas activas</h3>
        <p className="text-gray-500">No hay batallas disponibles en este momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Batallas Activas</h2>
        <div className="text-sm text-gray-500">
          {battles.length} batalla{battles.length !== 1 ? 's' : ''} disponible{battles.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {battles.map((battle) => (
          <div
            key={battle.id}
            className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedBattle(battle)}
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {battle.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(battle.status)}`}>
                  {getStatusText(battle.status)}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {battle.description}
              </p>

              {/* Influencers */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Influencer A:</span>
                  <span className="text-sm text-gray-900">{battle.influencer_a_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Influencer B:</span>
                  <span className="text-sm text-gray-900">{battle.influencer_b_name}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{battle.total_coins_a}</div>
                  <div className="text-xs text-gray-500">Coins A</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{battle.total_coins_b}</div>
                  <div className="text-xs text-gray-500">Coins B</div>
                </div>
              </div>

              {/* Time remaining */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{formatTimeRemaining(battle.time_remaining)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Coins className="h-4 w-4 mr-1" />
                  <span>{battle.total_coins} total</span>
                </div>
              </div>

              {/* Action buttons */}
              {battle.status === 'active' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedBattleForBet(battle);
                  }}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Participar
                </button>
              )}
              
              {battle.status === 'finished' && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowResults(battle.id);
                  }}
                  className="w-full mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-2 inline" />
                  Ver Resultados
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Battle Detail Modal */}
      {selectedBattle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedBattle.title}</h2>
                <button
                  onClick={() => setSelectedBattle(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <p className="text-gray-600 mb-4">{selectedBattle.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedBattle.total_coins_a}</div>
                  <div className="text-sm text-gray-600">{selectedBattle.influencer_a_name}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedBattle.total_coins_b}</div>
                  <div className="text-sm text-gray-600">{selectedBattle.influencer_b_name}</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-2">
                  Tiempo restante: {formatTimeRemaining(selectedBattle.time_remaining)}
                </div>
                <div className="text-sm text-gray-500">
                  Total de coins: {selectedBattle.total_coins}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Battle Bet Modal */}
      {selectedBattleForBet && (
        <BattleBet
          battle={selectedBattleForBet}
          onClose={() => setSelectedBattleForBet(null)}
          onSuccess={() => {
            // Refresh data after successful bet
          }}
        />
      )}

      {/* Battle Results Modal */}
      {showResults && (
        <BattleResults
          battleId={showResults}
          onClose={() => setShowResults(null)}
        />
      )}
    </div>
  );
};

export default BattlesList;
