import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

export default function AgendaSede() {
  const [sedeActiva, setSedeActiva] = useState(null);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : '';

  useEffect(() => {
    const cargarAgenda = async () => {
      try {
        if (userRole === 'ADMIN') {
          const listaSedes = await fetchAPI('/sedes');
          setSedes(listaSedes);
          if (listaSedes.length > 0) setSedeActiva(listaSedes[0]);
        } else {
          // Si es encargado u operario, carga automáticamente su sede
          const miSede = await fetchAPI('/sedes/mi-sede');
          setSedeActiva(miSede);
        }
      } catch (err) {
        setError('Error al cargar la información de la sede.');
      } finally {
        setLoading(false);
      }
    };
    cargarAgenda();
  }, [userRole]);

  const handleCambioSede = (e) => {
    const sedeSeleccionada = sedes.find(s => s.id === parseInt(e.target.value));
    setSedeActiva(sedeSeleccionada);
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded-xl">{error}</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col">
      
      {/* Cabecera Inteligente */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Agenda de Citas</h1>
          <p className="text-gray-500 text-sm mt-1">Citas sincronizadas automáticamente por WhatsApp.</p>
        </div>

        {userRole === 'ADMIN' ? (
          <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
            <select 
              value={sedeActiva?.id || ''} 
              onChange={handleCambioSede}
              className="bg-transparent font-bold text-gray-700 focus:outline-none cursor-pointer"
            >
              {sedes.map(sede => (
                <option key={sede.id} value={sede.id}>🏢 {sede.nombre}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="px-4 py-2 bg-blue-50 text-blue-800 font-bold rounded-lg border border-blue-100">
            🏢 {sedeActiva?.nombre}
          </div>
        )}
      </div>

      {/* Visor de Google Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 overflow-hidden min-h-[600px] p-2">
        {sedeActiva?.urlCalendario ? (
          <iframe 
            src={`https://calendar.google.com/calendar/embed?src=${encodeURIComponent(sedeActiva.urlCalendario)}&ctz=America/Bogota&showTitle=0&showPrint=0`} 
            style={{ border: 0 }} 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            scrolling="no"
            className="rounded-xl"
            title="Google Calendar"
          ></iframe>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <span className="text-5xl mb-4">📅</span>
            <h3 className="text-xl font-bold text-gray-800">Calendario no configurado</h3>
            <p className="text-gray-500 mt-2">El administrador aún no ha enlazado el ID de Google Calendar para esta sucursal.</p>
          </div>
        )}
      </div>
    </div>
  );
}
