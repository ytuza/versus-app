import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import type { Battle, BattleBet, BattleResult } from '../types/battles';

interface BattlesContextType {
  battles: Battle[];
  myBattles: Battle[];
  myBets: BattleBet[];
  battleResults: BattleResult[];
  loading: boolean;
  error: string | null;
  fetchBattles: () => Promise<void>;
  fetchMyBattles: () => Promise<void>;
  fetchMyBets: () => Promise<void>;
  fetchBattleResults: () => Promise<void>;
  createBattle: (battleData: {
    influencer_a: number;
    influencer_b: number;
    title: string;
    description: string;
    duration_minutes: number;
  }) => Promise<Battle>;
  placeBet: (betData: {
    battle: number;
    influencer_choice: 'a' | 'b';
    coins_amount: number;
  }) => Promise<BattleBet>;
  cancelBattle: (battleId: number) => Promise<void>;
  getBattleDetail: (battleId: number) => Promise<Battle>;
  getBattleBets: (battleId: number) => Promise<BattleBet[]>;
  getBattleResult: (battleId: number) => Promise<BattleResult>;
}

const BattlesContext = createContext<BattlesContextType | undefined>(undefined);

export const useBattles = () => {
  const context = useContext(BattlesContext);
  if (context === undefined) {
    throw new Error('useBattles must be used within a BattlesProvider');
  }
  return context;
};

interface BattlesProviderProps {
  children: ReactNode;
}

export const BattlesProvider: React.FC<BattlesProviderProps> = ({ children }) => {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [myBattles, setMyBattles] = useState<Battle[]>([]);
  const [myBets, setMyBets] = useState<BattleBet[]>([]);
  const [battleResults, setBattleResults] = useState<BattleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, token } = useAuth();

  // Configurar axios con el token
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchBattles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/battles/');
      setBattles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar las batallas');
      console.error('Error fetching battles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBattles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/battles/my/');
      setMyBattles(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar mis batallas');
      console.error('Error fetching my battles:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBets = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/bets/my/');
      setMyBets(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar mis apuestas');
      console.error('Error fetching my bets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBattleResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/admin/battles/results/');
      setBattleResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cargar resultados');
      console.error('Error fetching battle results:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBattle = async (battleData: {
    influencer_a: number;
    influencer_b: number;
    title: string;
    description: string;
    duration_minutes: number;
  }): Promise<Battle> => {
    try {
      setError(null);
      const response = await axios.post('/api/battles/create/', battleData);
      await fetchBattles(); // Recargar lista de batallas
      return response.data.battle;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al crear la batalla';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const placeBet = async (betData: {
    battle: number;
    influencer_choice: 'a' | 'b';
    coins_amount: number;
  }): Promise<BattleBet> => {
    try {
      setError(null);
      const response = await axios.post('/api/bets/', betData);
      await fetchMyBets(); // Recargar mis apuestas
      return response.data.bet;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al realizar la apuesta';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const cancelBattle = async (battleId: number): Promise<void> => {
    try {
      setError(null);
      await axios.put(`/api/battles/${battleId}/cancel/`);
      await fetchBattles(); // Recargar lista de batallas
      await fetchMyBattles(); // Recargar mis batallas
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al cancelar la batalla';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getBattleDetail = async (battleId: number): Promise<Battle> => {
    try {
      setError(null);
      const response = await axios.get(`/api/battles/${battleId}/`);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al obtener detalles de la batalla';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getBattleBets = async (battleId: number): Promise<BattleBet[]> => {
    try {
      setError(null);
      const response = await axios.get(`/api/battles/${battleId}/bets/`);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al obtener apuestas de la batalla';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const getBattleResult = async (battleId: number): Promise<BattleResult> => {
    try {
      setError(null);
      const response = await axios.get(`/api/battles/${battleId}/result/`);
      return response.data;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Error al obtener resultado de la batalla';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Cargar datos cuando el usuario cambie
  useEffect(() => {
    if (user && token) {
      fetchBattles();
      fetchMyBets();
      
      // Solo cargar mis batallas si es influencer
      if (user.is_influencer) {
        fetchMyBattles();
      }
      
      // Solo cargar resultados si es admin
      if (user.is_staff) {
        fetchBattleResults();
      }
    }
  }, [user, token]);

  const value: BattlesContextType = {
    battles,
    myBattles,
    myBets,
    battleResults,
    loading,
    error,
    fetchBattles,
    fetchMyBattles,
    fetchMyBets,
    fetchBattleResults,
    createBattle,
    placeBet,
    cancelBattle,
    getBattleDetail,
    getBattleBets,
    getBattleResult,
  };

  return (
    <BattlesContext.Provider value={value}>
      {children}
    </BattlesContext.Provider>
  );
};
