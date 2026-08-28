import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

export default function Dashboard() {
  const [metricas, setMetricas] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [sedeActiva, setSedeActiva] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : '';

  const cargarMetricas = async (sedeId) => {
    setLoading(true);
    try {
      const url = sedeId ? `/dashboard?sedeId=${sedeId}` : '/dashboard';
      const data = await fetchAPI(url);
      setMetricas(data);
    } catch (err) {
      setError('Error al cargar métricas: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      try {
        if (userRole === 'ADMIN') {
          const listaSedes = await fetchAPI('/sedes');
          setSedes(listaSedes);
        }
        await cargarMetricas(''); 
      } catch (err) {
        if (err.message.includes('403') || err.message.includes('Token')) {
          localStorage.removeItem('jwt_token');
          window.location.href = '/login';
        }
      }
    };
    inicializar();
  }, [userRole]);

  const handleFiltroSede = (e) => {
    const nuevaSede = e.target.value;
    setSedeActiva(nuevaSede);
    cargarMetricas(nuevaSede);
  };

  if (loading && !metricas) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>;

  const formatearDinero = (monto) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(monto);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Cabecera y Filtro de Sedes */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Resumen Financiero</h1>
          <p className="text-gray-500 text-sm mt-1">
            {userRole === 'ADMIN' ? 'Visión corporativa y análisis de sucursales' : 'Monitorea el rendimiento de tu sucursal en tiempo real'}
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
            <select 
              value={sedeActiva} 
              onChange={handleFiltroSede}
              className="bg-transparent font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              <option value="">🌎 Todas las Sedes (Global)</option>
              {sedes.map(sede => (
                <option key={sede.id} value={sede.id}>🏢 {sede.nombre}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tarjetas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg text-white">
          <p className="text-emerald-100 font-semibold uppercase tracking-wider text-sm">Ingresos Totales</p>
          <p className="mt-2 text-4xl font-black">{formatearDinero(metricas.totalIngresos)}</p>
        </div>
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl shadow-lg text-white">
          <p className="text-rose-100 font-semibold uppercase tracking-wider text-sm">Gastos Asociados</p>
          <p className="mt-2 text-4xl font-black">{formatearDinero(metricas.totalGastos)}</p>
        </div>
        <div className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-lg text-white ring-4 ring-indigo-50 ring-offset-2">
          <p className="text-blue-100 font-semibold uppercase tracking-wider text-sm">Ganancia Neta</p>
          <p className="mt-2 text-4xl font-black">{formatearDinero(metricas.gananciaNeta)}</p>
        </div>
      </div>

      {/* Efectividad de Marketing (Restaurada) */}
      <div className="mt-8 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46" /></svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800">Efectividad de Campañas</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricas.metricasMarketing && Object.keys(metricas.metricasMarketing).length > 0 ? (
            Object.entries(metricas.metricasMarketing).map(([origen, cantidad]) => (
              <div key={origen} className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors rounded-xl border border-gray-200">
                <span className="font-semibold text-gray-700">{origen}</span>
                <span className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-bold shadow-sm">
                  {cantidad} {cantidad === 1 ? 'visita' : 'visitas'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic text-sm col-span-full">Aún no hay datos de marketing registrados en esta sede.</p>
          )}
        </div>
      </div>
    </div>
  );
}