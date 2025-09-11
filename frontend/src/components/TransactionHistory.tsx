import React, { useState } from 'react';
import { useCoins } from '../contexts/CoinsContext';
import ImageModal from './ImageModal';

const TransactionHistory: React.FC = () => {
  const { transactions, loading } = useCoins();
  const [imageModal, setImageModal] = useState<{ show: boolean; imageUrl: string | null; imageAlt: string }>({
    show: false,
    imageUrl: null,
    imageAlt: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageClick = (imageUrl: string) => {
    setImageModal({
      show: true,
      imageUrl,
      imageAlt: 'Comprobante de pago'
    });
  };

  const closeImageModal = () => {
    setImageModal({ show: false, imageUrl: null, imageAlt: '' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Transacciones</h2>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Transacciones</h2>
      
      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-600">No tienes transacciones aún</p>
          <p className="text-sm text-gray-500">Cuando hagas una compra de coins, aparecerá aquí</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {transaction.amount} coins
                  </h3>
                  <p className="text-sm text-gray-600">
                    S/. {transaction.total_price}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    transaction.status
                  )}`}
                >
                  {getStatusText(transaction.status)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                <p>Fecha: {formatDate(transaction.created_at)}</p>
                {transaction.updated_at !== transaction.created_at && (
                  <p>Actualizado: {formatDate(transaction.updated_at)}</p>
                )}
                {transaction.approved_by_email && (
                  <p>Procesado por: {transaction.approved_by_email}</p>
                )}
                {transaction.admin_notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-xs font-medium text-gray-700">Notas del administrador:</p>
                    <p className="text-xs text-gray-600">{transaction.admin_notes}</p>
                  </div>
                )}
              </div>
              
              {transaction.payment_image && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Comprobante:</p>
                  <img
                    src={transaction.payment_image}
                    alt="Comprobante de pago"
                    className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImageClick(transaction.payment_image!)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para mostrar imagen en grande */}
      <ImageModal
        isOpen={imageModal.show}
        imageUrl={imageModal.imageUrl}
        imageAlt={imageModal.imageAlt}
        onClose={closeImageModal}
      />
    </div>
  );
};

export default TransactionHistory;
