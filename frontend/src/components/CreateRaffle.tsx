import React, { useState } from 'react';
import { useRaffles } from '../contexts/RafflesContext';
// import { useCoins } from '../contexts/CoinsContext';
import { Gift, Target, FileText, Coins } from 'lucide-react';

const CreateRaffle: React.FC = () => {
  const { createRaffle } = useRaffles();
  // const { coins } = useCoins(); // Commented out unused variable
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const targetAmount = parseInt(formData.target_amount);
      
      if (targetAmount <= 0) {
        throw new Error('El monto objetivo debe ser mayor a 0');
      }
      
      if (targetAmount > 100000) {
        throw new Error('El monto objetivo no puede ser mayor a 100,000 coins');
      }

      await createRaffle({
        title: formData.title,
        description: formData.description,
        target_amount: targetAmount,
      });

      setSuccess('Sorteo creado exitosamente');
      setFormData({
        title: '',
        description: '',
        target_amount: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el sorteo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Gift className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Crear Sorteo</h2>
            <p className="text-gray-600">Crea un nuevo sorteo para que los usuarios participen con sus coins</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Título del Sorteo
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Sorteo de 1000 coins"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe qué se sortea y las reglas del sorteo..."
            />
          </div>

          <div>
            <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 mb-2">
              Monto Objetivo (coins)
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="number"
                id="target_amount"
                name="target_amount"
                value={formData.target_amount}
                onChange={handleInputChange}
                required
                min="1"
                max="100000"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="1000"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Los usuarios participarán con sus coins. Mientras más coins pongan, más probabilidades de ganar tendrán.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Coins className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-medium text-blue-800">Información del Sorteo</h3>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Los usuarios solo pueden participar una vez por sorteo</li>
              <li>• Las probabilidades son proporcionales a la cantidad de coins apostados</li>
              <li>• El sorteo se completará automáticamente cuando se alcance el monto objetivo</li>
              <li>• El ganador recibirá todos los coins recaudados</li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando Sorteo...' : 'Crear Sorteo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRaffle;

