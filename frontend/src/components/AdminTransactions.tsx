import React, { useState } from 'react';
import { useCoins } from '../contexts/CoinsContext';
import ImageModal from './ImageModal';

const AdminTransactions: React.FC = () => {
  const { 
    adminTransactions, 
    adminLoading, 
    approveTransaction, 
    rejectTransaction,
    fetchAdminTransactions 
  } = useCoins();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [rejectModal, setRejectModal] = useState<{ show: boolean; transactionId: number | null }>({
    show: false,
    transactionId: null
  });
  const [adminNotes, setAdminNotes] = useState('');
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

  const handleApprove = async (transactionId: number) => {
    if (window.confirm('¿Estás seguro de que quieres aprobar esta transacción?')) {
      try {
        await approveTransaction(transactionId);
        alert('Transacción aprobada exitosamente');
      } catch (error) {
        alert('Error al aprobar la transacción');
      }
    }
  };

  const handleReject = async () => {
    if (!rejectModal.transactionId) return;
    
    try {
      await rejectTransaction(rejectModal.transactionId, adminNotes);
      setRejectModal({ show: false, transactionId: null });
      setAdminNotes('');
      alert('Transacción rechazada');
    } catch (error) {
      alert('Error al rechazar la transacción');
    }
  };

  const handleImageClick = (imageUrl: string, userName: string) => {
    setImageModal({
      show: true,
      imageUrl,
      imageAlt: `Comprobante de pago de ${userName}`
    });
  };

  const closeImageModal = () => {
    setImageModal({ show: false, imageUrl: null, imageAlt: '' });
  };

  const filteredTransactions = statusFilter === 'all' 
    ? adminTransactions 
    : adminTransactions.filter(t => t.status === statusFilter);

  if (adminLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Panel de Administración</h2>
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Panel de Administración</h2>
        <button
          onClick={fetchAdminTransactions}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Actualizar
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por Estado
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-600">No hay transacciones que mostrar</p>
          <p className="text-sm text-gray-500">
            {statusFilter === 'all' 
              ? 'No hay transacciones en el sistema' 
              : `No hay transacciones ${getStatusText(statusFilter).toLowerCase()}`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {transaction.user_name || transaction.user_email}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {transaction.amount} coins - S/. {transaction.total_price}
                  </p>
                  <p className="text-xs text-gray-500">{transaction.user_email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                    transaction.status
                  )}`}
                >
                  {getStatusText(transaction.status)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600 space-y-1 mb-3">
                <p>Fecha: {formatDate(transaction.created_at)}</p>
                {transaction.updated_at !== transaction.created_at && (
                  <p>Actualizado: {formatDate(transaction.updated_at)}</p>
                )}
                {transaction.approved_by_email && (
                  <p>Procesado por: {transaction.approved_by_email}</p>
                )}
                {transaction.admin_notes && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-xs font-medium text-gray-700">Notas:</p>
                    <p className="text-xs text-gray-600">{transaction.admin_notes}</p>
                  </div>
                )}
              </div>
              
              {transaction.payment_image && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-1">Comprobante:</p>
                  <img
                    src={transaction.payment_image}
                    alt="Comprobante de pago"
                    className="w-32 h-32 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleImageClick(transaction.payment_image!, transaction.user_name || transaction.user_email)}
                  />
                </div>
              )}
              
              {transaction.status === 'pending' && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleApprove(transaction.id)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => setRejectModal({ show: true, transactionId: transaction.id })}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para rechazar transacción */}
      {rejectModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Rechazar Transacción</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas del Administrador (opcional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Explica por qué se rechaza la transacción..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setRejectModal({ show: false, transactionId: null });
                  setAdminNotes('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Rechazar
              </button>
            </div>
          </div>
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

export default AdminTransactions;
