import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ReferralRow {
  referrer_id: number;
  referrer_email: string;
  referral_code: string;
  total_coins: number;
  purchases_count: number;
  total_soles: string;
}

const AdminReferrals: React.FC = () => {
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const qp = new URLSearchParams();
      if (from) qp.set('from', from);
      if (to) qp.set('to', to);
      const url = `/api/admin/referrals/summary/${qp.toString() ? `?${qp.toString()}` : ''}`;
      const { data } = await axios.get(url);
      setRows(data.results || []);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Error al cargar el resumen de referidos');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const qp = new URLSearchParams();
    if (from) qp.set('from', from);
    if (to) qp.set('to', to);
    const url = `/api/admin/referrals/summary.csv${qp.toString() ? `?${qp.toString()}` : ''}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Resumen de Referidos</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchSummary}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Filtrar
            </button>
            <button
              onClick={downloadCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">{error}</div>
      )}

      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 text-gray-600">Sin datos</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="px-4 py-2 font-semibold text-gray-700">Código</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Referidor</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Compras</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Coins</th>
                <th className="px-4 py-2 font-semibold text-gray-700">Total S/.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.referrer_id} className="border-b">
                  <td className="px-4 py-2 font-mono font-bold tracking-widest">{row.referral_code}</td>
                  <td className="px-4 py-2">{row.referrer_email}</td>
                  <td className="px-4 py-2">{row.purchases_count}</td>
                  <td className="px-4 py-2">{row.total_coins}</td>
                  <td className="px-4 py-2">{row.total_soles}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReferrals;

