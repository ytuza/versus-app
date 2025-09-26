import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Raffle {
  id: number;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  status: 'active' | 'completed' | 'processed';
  created_by: number;
  created_by_name: string;
  winner?: number;
  winner_name?: string;
  winner_email?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  progress_percentage: number;
  total_participations: number;
  is_completed: boolean;
}

interface RafflesContextType {
  raffles: Raffle[];
  loading: boolean;
  error: string | null;
  fetchRaffles: (status?: string) => Promise<void>;
  createRaffle: (data: { title: string; description: string; target_amount: number }) => Promise<Raffle>;
  participateInRaffle: (raffleId: number, coinsAmount: number) => Promise<void>;
  processRaffle: (raffleId: number) => Promise<void>;
}

const RafflesContext = createContext<RafflesContextType | undefined>(undefined);

export const useRaffles = () => {
  const context = useContext(RafflesContext);
  if (context === undefined) {
    throw new Error('useRaffles must be used within a RafflesProvider');
  }
  return context;
};

interface RafflesProviderProps {
  children: ReactNode;
}

export const RafflesProvider: React.FC<RafflesProviderProps> = ({ children }) => {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchRaffles = async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = status ? `/api/raffles/?status=${status}` : '/api/raffles/';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar los sorteos');
      }

      const data = await response.json();
      setRaffles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const createRaffle = async (data: { title: string; description: string; target_amount: number }) => {
    const response = await fetch('/api/raffles/create/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear el sorteo');
    }

    const result = await response.json();
    await fetchRaffles(); // Refresh the list
    return result.raffle;
  };

  const participateInRaffle = async (raffleId: number, coinsAmount: number) => {
    const response = await fetch('/api/raffles/participate/', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raffle: raffleId,
        coins_amount: coinsAmount,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // Handle Django REST Framework error format
      let errorMessage = 'Error al participar en el sorteo';
      if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
        errorMessage = errorData.non_field_errors[0];
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
      throw new Error(errorMessage);
    }

    await fetchRaffles(); // Refresh the list
  };

  const processRaffle = async (raffleId: number) => {
    const response = await fetch(`/api/admin/raffles/${raffleId}/process/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al procesar el sorteo');
    }

    await fetchRaffles(); // Refresh the list
  };

  useEffect(() => {
    if (token) {
      fetchRaffles();
    }
  }, [token]);

  const value: RafflesContextType = {
    raffles,
    loading,
    error,
    fetchRaffles,
    createRaffle,
    participateInRaffle,
    processRaffle,
  };

  return (
    <RafflesContext.Provider value={value}>
      {children}
    </RafflesContext.Provider>
  );
};
