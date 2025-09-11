import React, { useState, useEffect } from 'react';
import { useBattles } from '../contexts/BattlesContext';
import { useAuth } from '../contexts/AuthContext';
import type { BattleResult } from '../types/battles';
import { Trophy, DollarSign, Users, Building, Award, AlertCircle, Crown } from 'lucide-react';

interface BattleResultsProps {
  battleId: number;
  onClose: () => void;
}

const BattleResults: React.FC<BattleResultsProps> = ({ battleId, onClose }) => {
  const { getBattleResult } = useBattles();
  const { user } = useAuth();
  const [result, setResult] = useState<BattleResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);
        const battleResult = await getBattleResult(battleId);
        setResult(battleResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar resultados');
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [battleId, getBattleResult]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sin resultados</h3>
            <p className="text-gray-500 mb-4">Esta batalla aún no tiene resultados disponibles.</p>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isWinner = (influencerId: number) => {
    return result.winner === influencerId;
  };

  const isInfluencerA = result.battle.influencer_a === user?.id;
  const isInfluencerB = result.battle.influencer_b === user?.id;
  const isParticipatingInfluencer = isInfluencerA || isInfluencerB;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Resultados de Batalla</h2>
              <p className="text-gray-600">{result.battle.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Winner Section */}
          <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <div className="flex items-center justify-center">
              <Crown className="h-6 w-6 text-yellow-600 mr-2" />
              <span className="text-lg font-semibold text-yellow-800">
                Ganador: {result.winner_name}
              </span>
            </div>
          </div>

          {/* Admin View - All Details */}
          {user?.is_staff && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Detalles Administrativos</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Platform Profit */}
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Building className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Plataforma</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{result.platform_profit}</div>
                  <div className="text-sm text-blue-700">25% del total</div>
                </div>

                {/* Winner Profit */}
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Trophy className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Influencer Ganador</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{result.winner_profit}</div>
                  <div className="text-sm text-green-700">25% del total</div>
                </div>

                {/* Sorteo */}
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Users className="h-5 w-5 text-purple-600 mr-2" />
                    <span className="font-medium text-purple-900">Sorteo</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">{result.sorteo_profit}</div>
                  <div className="text-sm text-purple-700">25% del total</div>
                  {result.sorteo_winner_name && (
                    <div className="text-xs text-purple-600 mt-1">
                      Ganador: {result.sorteo_winner_name}
                    </div>
                  )}
                </div>

                {/* Commission */}
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-orange-600 mr-2" />
                    <span className="font-medium text-orange-900">Comisión</span>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">{result.commission_a + result.commission_b}</div>
                  <div className="text-sm text-orange-700">25% del total</div>
                </div>
              </div>

              {/* Commission Breakdown */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-3">Desglose de Comisiones</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-blue-600">{result.commission_a}</div>
                    <div className="text-sm text-gray-600">{result.battle.influencer_a_name}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-purple-600">{result.commission_b}</div>
                    <div className="text-sm text-gray-600">{result.battle.influencer_b_name}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Influencer View - Only Commission and Win Status */}
          {!user?.is_staff && isParticipatingInfluencer && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Tus Resultados</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Win Status */}
                <div className={`p-4 rounded-lg ${isWinner(user?.id) ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                  <div className="flex items-center mb-2">
                    <Award className={`h-5 w-5 mr-2 ${isWinner(user?.id) ? 'text-green-600' : 'text-gray-600'}`} />
                    <span className={`font-medium ${isWinner(user?.id) ? 'text-green-900' : 'text-gray-900'}`}>
                      {isWinner(user?.id) ? '¡Ganaste!' : 'No ganaste'}
                    </span>
                  </div>
                  <div className={`text-2xl font-bold ${isWinner(user?.id) ? 'text-green-600' : 'text-gray-600'}`}>
                    {isWinner(user?.id) ? 'Victoria' : 'Derrota'}
                  </div>
                </div>

                {/* Commission */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Tu Comisión</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {isInfluencerA ? result.commission_a : result.commission_b}
                  </div>
                  <div className="text-sm text-blue-700">25% proporcional</div>
                </div>
              </div>

              {/* Additional Info for Winner */}
              {isWinner(user?.id) && (
                <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center mb-2">
                    <Trophy className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-900">Coins por Victoria</span>
                  </div>
                  <div className="text-lg font-bold text-yellow-600">{result.winner_profit}</div>
                  <div className="text-sm text-yellow-700">25% adicional por ganar</div>
                </div>
              )}
            </div>
          )}

          {/* User Normal View - Only Winner */}
          {!user?.is_staff && !isParticipatingInfluencer && (
            <div className="text-center py-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-center mb-2">
                  <Trophy className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-medium text-green-900">Ganador de la Batalla</span>
                </div>
                <div className="text-lg font-bold text-green-600">{result.winner_name}</div>
              </div>
            </div>
          )}

          {/* Total Coins Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Total de coins en la batalla</div>
              <div className="text-xl font-bold text-gray-900">{result.battle.total_coins}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleResults;

