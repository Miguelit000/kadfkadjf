import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

export default function HistorialOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        // Llamamos al nuevo endpoint que acabamos de crear en Java
        const data = await fetchAPI('/ordenes');
        // Invertimos el arreglo para que las órdenes más nuevas salgan arriba
        setOrdenes(data.reverse());
      } catch (err) {
        setError('Error al cargar el historial: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    cargarOrdenes();
  }, []);

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(monto);
  };

  const formatearFecha = (fechaISO) => {
    return new Date(fechaISO).toLocaleDateString('es-CO', { 
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-xl font-black text-gray-900">Historial de Servicios</h2>
          <p className="text-gray-500 text-sm mt-1">Registro completo de operaciones y comprobantes.</p>
        </div>
        <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold">
          {ordenes.length} Registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 font-bold">Fecha</th>
              <th className="p-4 font-bold">Placa</th>
              <th className="p-4 font-bold">Cliente</th>
              <th className="p-4 font-bold">Servicio</th>
              <th className="p-4 font-bold">Cobro</th>
              <th className="p-4 font-bold text-center">Comprobante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {ordenes.map((orden) => (
              <tr key={orden.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-600 whitespace-nowrap">{formatearFecha(orden.fechaHora)}</td>
                <td className="p-4 font-bold text-gray-900">{orden.vehiculo.placa}</td>
                <td className="p-4 text-gray-700">
                  <div className="font-semibold">{orden.cliente.nombreCompleto}</div>
                  <div className="text-xs text-gray-500">{orden.cliente.documentoIdentidad}</div>
                </td>
                <td className="p-4 text-gray-600">{orden.servicioNombre}</td>
                <td className="p-4 font-bold text-emerald-600">{formatearDinero(orden.valorFinalPagado)}</td>
                <td className="p-4 text-center">
                  {orden.urlFotoMedidor ? (
                    <a 
                      href={orden.urlFotoMedidor} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zm2.25 8.5a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5zm0 3a.75.75 0 000 1.5h6.5a.75.75 0 000-1.5h-6.5z" clipRule="evenodd" />
                      </svg>
                      Ver PDF
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">Sin adjunto</span>
                  )}
                </td>
              </tr>
            ))}
            {ordenes.length === 0 && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500 italic">No hay órdenes registradas aún.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}