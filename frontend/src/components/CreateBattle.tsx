import React, { useState, useEffect } from 'react';
import { useBattles } from '../contexts/BattlesContext';
import { useAuth } from '../contexts/AuthContext';
import { useCoins } from '../contexts/CoinsContext';
import { Sword, Users, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_influencer: boolean;
}

const CreateBattle: React.FC = () => {
  const { createBattle } = useBattles();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [influencerA, setInfluencerA] = useState<number | null>(null);
  const [influencerB, setInfluencerB] = useState<number | null>(null);
  const [durationMinutes, setDurationMinutes] = useState(60);
  
  // Available influencers
  const [influencers, setInfluencers] = useState<User[]>([]);
  const [loadingInfluencers, setLoadingInfluencers] = useState(true);

  // Load influencers
  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        setLoadingInfluencers(true);
        const response = await axios.get('/api/admin/users/influencers/');
        setInfluencers(response.data);
      } catch (err: any) {
        setError('Error al cargar influencers: ' + (err.response?.data?.error || err.message));
      } finally {
        setLoadingInfluencers(false);
      }
    };

    fetchInfluencers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('El título es requerido');
      return;
    }

    if (!description.trim()) {
      setError('La descripción es requerida');
      return;
    }

    if (!influencerA || !influencerB) {
      setError('Debes seleccionar dos influencers');
      return;
    }

    if (influencerA === influencerB) {
      setError('Los influencers deben ser diferentes');
      return;
    }

    if (durationMinutes < 1) {
      setError('La duración debe ser al menos 1 minuto');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createBattle({
        influencer_a: influencerA,
        influencer_b: influencerB,
        title: title.trim(),
        description: description.trim(),
        duration_minutes: durationMinutes
      });
      
      setSuccess(true);
      
      // Reset form
      setTitle('');
      setDescription('');
      setInfluencerA(null);
      setInfluencerB(null);
      setDurationMinutes(60);
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al crear la batalla');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedInfluencerName = (id: number | null) => {
    const influencer = influencers.find(u => u.id === id);
    return influencer ? `${influencer.first_name} ${influencer.last_name}` : 'Seleccionar influencer';
  };

  if (!user?.is_staff) {
    return (
      <div className="text-center py-8">
        <Sword className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Restringido</h3>
        <p className="text-gray-500">Solo los administradores pueden crear batallas.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">¡Batalla Creada!</h3>
        <p className="text-gray-600">La batalla ha sido creada exitosamente.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <div className="flex items-center mb-6">
            <Sword className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">Crear Nueva Batalla</h2>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Batalla *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Batalla de Influencers 2024"
                maxLength={100}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe la batalla, reglas, premios, etc."
                maxLength={500}
              />
            </div>

            {/* Influencers Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Influencer A */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Influencer A *
                </label>
                <div className="relative">
                  <select
                    value={influencerA || ''}
                    onChange={(e) => setInfluencerA(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingInfluencers}
                  >
                    <option value="">Seleccionar influencer</option>
                    {influencers.map((influencer) => (
                      <option key={influencer.id} value={influencer.id}>
                        {influencer.first_name} {influencer.last_name} ({influencer.email})
                      </option>
                    ))}
                  </select>
                  {loadingInfluencers && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Influencer B */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Influencer B *
                </label>
                <div className="relative">
                  <select
                    value={influencerB || ''}
                    onChange={(e) => setInfluencerB(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingInfluencers}
                  >
                    <option value="">Seleccionar influencer</option>
                    {influencers.map((influencer) => (
                      <option key={influencer.id} value={influencer.id}>
                        {influencer.first_name} {influencer.last_name} ({influencer.email})
                      </option>
                    ))}
                  </select>
                  {loadingInfluencers && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración de la Batalla *
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Días</label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={Math.floor(durationMinutes / 1440)}
                    onChange={(e) => {
                      const days = parseInt(e.target.value) || 0;
                      const hours = Math.floor((durationMinutes % 1440) / 60);
                      const minutes = durationMinutes % 60;
                      setDurationMinutes(days * 1440 + hours * 60 + minutes);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Horas</label>
                  <input
                    type="number"
                    min="0"
                    max="23"
                    value={Math.floor((durationMinutes % 1440) / 60)}
                    onChange={(e) => {
                      const days = Math.floor(durationMinutes / 1440);
                      const hours = parseInt(e.target.value) || 0;
                      const minutes = durationMinutes % 60;
                      setDurationMinutes(days * 1440 + hours * 60 + minutes);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Minutos</label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={durationMinutes % 60}
                    onChange={(e) => {
                      const days = Math.floor(durationMinutes / 1440);
                      const hours = Math.floor((durationMinutes % 1440) / 60);
                      const minutes = parseInt(e.target.value) || 0;
                      setDurationMinutes(days * 1440 + hours * 60 + minutes);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Duración total: {Math.floor(durationMinutes / 1440)}d {Math.floor((durationMinutes % 1440) / 60)}h {durationMinutes % 60}m
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || loadingInfluencers}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando batalla...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sword className="h-4 w-4 mr-2" />
                  Crear Batalla
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBattle;
