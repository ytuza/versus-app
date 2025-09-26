import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import { processTransactionImages } from '../utils/imageUtils';

interface Transaction {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  amount: number;
  total_price: string;
  status: 'pending' | 'approved' | 'rejected';
  payment_image?: string;
  created_at: string;
  updated_at: string;
  approved_by?: number;
  approved_by_email?: string;
  admin_notes?: string;
  referral_code_used?: string;
  referrer?: number;
  referrer_email?: string;
}

interface CoinsContextType {
  coins: number;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  fetchCoins: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  createTransaction: (amount: number, paymentImage: File, referralCode?: string) => Promise<void>;
  adminTransactions: Transaction[];
  adminLoading: boolean;
  fetchAdminTransactions: () => Promise<void>;
  approveTransaction: (transactionId: number) => Promise<void>;
  rejectTransaction: (transactionId: number, adminNotes?: string) => Promise<void>;
}

const CoinsContext = createContext<CoinsContextType | undefined>(undefined);

export const useCoins = () => {
  const context = useContext(CoinsContext);
  if (context === undefined) {
    throw new Error('useCoins must be used within a CoinsProvider');
  }
  return context;
};

interface CoinsProviderProps {
  children: ReactNode;
}

export const CoinsProvider: React.FC<CoinsProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [coins, setCoins] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminTransactions, setAdminTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCoins = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/coins/');
      setCoins(response.data.coins);
    } catch (error: any) {
      console.error('Error fetching coins:', error);
      setError('Error al cargar los coins');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions/history/');
      setTransactions(processTransactionImages(response.data));
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      setError('Error al cargar las transacciones');
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (amount: number, paymentImage: File, referralCode?: string) => {
    if (!token) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('amount', amount.toString());
      formData.append('payment_image', paymentImage);
      if (referralCode && referralCode.trim()) {
        formData.append('referral_code', referralCode.trim().toUpperCase());
      }
      
      const response = await axios.post('/api/transactions/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Actualizar la lista de transacciones
      await fetchTransactions();
      
      return response.data;
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      const errorMessage = error.response?.data?.amount?.[0] || 
                          error.response?.data?.payment_image?.[0] || 
                          error.response?.data?.referral_code?.[0] ||
                          'Error al crear la transacción';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminTransactions = async () => {
    if (!token) return;
    
    try {
      setAdminLoading(true);
      const response = await axios.get('/api/admin/transactions/');
      setAdminTransactions(processTransactionImages(response.data));
    } catch (error: any) {
      console.error('Error fetching admin transactions:', error);
      setError('Error al cargar las transacciones de administrador');
    } finally {
      setAdminLoading(false);
    }
  };

  const approveTransaction = async (transactionId: number) => {
    if (!token) return;
    
    try {
      setAdminLoading(true);
      await axios.put(`/api/admin/transactions/${transactionId}/approve/`);
      
      // Actualizar las listas
      await Promise.all([
        fetchAdminTransactions(),
        fetchCoins(), // Actualizar coins si es el usuario actual
        fetchTransactions()
      ]);
    } catch (error: any) {
      console.error('Error approving transaction:', error);
      setError('Error al aprobar la transacción');
      throw error;
    } finally {
      setAdminLoading(false);
    }
  };

  const rejectTransaction = async (transactionId: number, adminNotes?: string) => {
    if (!token) return;
    
    try {
      setAdminLoading(true);
      await axios.put(`/api/admin/transactions/${transactionId}/reject/`, {
        admin_notes: adminNotes || ''
      });
      
      // Actualizar las listas
      await Promise.all([
        fetchAdminTransactions(),
        fetchTransactions()
      ]);
    } catch (error: any) {
      console.error('Error rejecting transaction:', error);
      setError('Error al rechazar la transacción');
      throw error;
    } finally {
      setAdminLoading(false);
    }
  };

  // Cargar datos cuando el usuario cambie
  useEffect(() => {
    if (user && token) {
      fetchCoins();
      fetchTransactions();
      
      // Si el usuario es admin, cargar también las transacciones de admin
      if (user.is_staff) {
        fetchAdminTransactions();
      }
    }
  }, [user, token]);

  const value = {
    coins,
    transactions,
    loading,
    error,
    fetchCoins,
    fetchTransactions,
    createTransaction,
    adminTransactions,
    adminLoading,
    fetchAdminTransactions,
    approveTransaction,
    rejectTransaction,
  };

  return (
    <CoinsContext.Provider value={value}>
      {children}
    </CoinsContext.Provider>
  );
};
