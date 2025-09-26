import React, { useState } from 'react';
import { useCoins } from '../contexts/CoinsContext';

const CoinPurchase: React.FC = () => {
  const { createTransaction, loading, error } = useCoins();
  const [amount, setAmount] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [paymentImage, setPaymentImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setAmount(Number(e.target.value));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentImage) {
      alert('Por favor selecciona una imagen de comprobante');
      return;
    }

    try {
      await createTransaction(amount, paymentImage, referralCode);
      setShowModal(false);
      setPaymentImage(null);
      setImagePreview(null);
      setReferralCode('');
      alert('Transacción creada exitosamente. Espera la aprobación del administrador.');
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const totalPrice = amount * 2;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Comprar Coins</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cantidad de Coins
        </label>
        <select
          value={amount}
          onChange={handleAmountChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {[1, 5, 10, 20, 50, 100, 200, 500, 1000].map(num => (
            <option key={num} value={num}>
              {num} coins - S/. {(num * 2).toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">Total a pagar:</span>
          <span className="text-2xl font-bold text-blue-600">S/. {totalPrice.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Precio: S/. 2.00 por coin
        </p>
      </div>

      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : 'Continuar con el Pago'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Modal de Pago */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Completar Pago</h3>
            
            <div className="mb-6">
              <div className="bg-gray-100 rounded-lg p-4 text-center mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Deposita a Yape</h4>
                <p className="text-2xl font-bold text-green-600">S/. {totalPrice.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-1">{amount} coins</p>
              </div>
              
              {/* QR Fake */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-4 text-center mb-4">
                <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-2">📱</div>
                    <p className="text-sm text-gray-600">QR Code</p>
                    <p className="text-xs text-gray-500">(Simulado)</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Referido (opcional)
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123"
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">Ingresa el código de 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante de Pago
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setPaymentImage(null);
                    setImagePreview(null);
                    setReferralCode('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !paymentImage}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Enviando...' : 'Enviar Transacción'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinPurchase;
