import React, { useState } from 'react';
import { useBattles } from '../contexts/BattlesContext';
import type { Battle } from '../types/battles';
import { useCoins } from '../contexts/CoinsContext';
// import { useAuth } from '../contexts/AuthContext';
import { Coins, AlertCircle, CheckCircle, X } from 'lucide-react';

interface BattleBetProps {
  battle: Battle;
  onClose: () => void;
  onSuccess?: () => void;
}

const BattleBet: React.FC<BattleBetProps> = ({ battle, onClose, onSuccess }) => {
  const { placeBet } = useBattles();
  const { coins } = useCoins();
  // const { user } = useAuth(); // Commented out unused variable
  
  const [influencerChoice, setInfluencerChoice] = useState<'a' | 'b' | null>(null);
  const [coinsAmount, setCoinsAmount] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const influencerA = {
    id: battle.influencer_a,
    name: battle.influencer_a_name,
    coins: battle.total_coins_a
  };

  const influencerB = {
    id: battle.influencer_b,
    name: battle.influencer_b_name,
    coins: battle.total_coins_b
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!influencerChoice) {
      setError('Debes seleccionar un influencer');
      return;
    }

    if (coinsAmount <= 0) {
      setError('La cantidad de coins debe ser mayor a 0');
      return;
    }

    if (coinsAmount > coins) {
      setError('No tienes suficientes coins');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await placeBet({
        battle: battle.id,
        influencer_choice: influencerChoice,
        coins_amount: coinsAmount
      });
      
      setSuccess(true);
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Error al realizar la apuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleCoinsChange = (value: number) => {
    const newValue = Math.max(1, Math.min(value, coins));
    setCoinsAmount(newValue);
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">¡Apuesta Realizada!</h3>
          <p className="text-gray-600">
            Has apostado {coinsAmount} coins por {influencerChoice === 'a' ? influencerA.name : influencerB.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Hacer Apuesta</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Battle Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">{battle.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{battle.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium text-blue-600">{influencerA.coins}</div>
                <div className="text-gray-500">{influencerA.name}</div>
              </div>
              <div className="text-center">
                <div className="font-medium text-purple-600">{influencerB.coins}</div>
                <div className="text-gray-500">{influencerB.name}</div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Influencer Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecciona tu influencer
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setInfluencerChoice('a')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    influencerChoice === 'a'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{influencerA.name}</div>
                  <div className="text-sm text-gray-500">{influencerA.coins} coins</div>
                </button>
                <button
                  type="button"
                  onClick={() => setInfluencerChoice('b')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    influencerChoice === 'b'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{influencerB.name}</div>
                  <div className="text-sm text-gray-500">{influencerB.coins} coins</div>
                </button>
              </div>
            </div>

            {/* Coins Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad de coins
              </label>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => handleCoinsChange(coinsAmount - 1)}
                  disabled={coinsAmount <= 1}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                >
                  -
                </button>
                <div className="flex-1 text-center">
                  <input
                    type="number"
                    min="1"
                    max={coins}
                    value={coinsAmount}
                    onChange={(e) => handleCoinsChange(parseInt(e.target.value) || 1)}
                    className="w-full text-center text-lg font-medium border-0 focus:ring-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleCoinsChange(coinsAmount + 1)}
                  disabled={coinsAmount >= coins}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                >
                  +
                </button>
              </div>
              <div className="text-sm text-gray-500 mt-1 text-center">
                Disponible: {coins} coins
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !influencerChoice}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Coins className="h-4 w-4 mr-2" />
                  Apostar {coinsAmount} coins
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BattleBet;
