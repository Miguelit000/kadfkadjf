import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

export default function SedesManager() {
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  // 1. Agregado el campo urlCalendario al estado
  const [formData, setFormData] = useState({ nombre: '', ciudad: '', direccion: '', urlCalendario: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: false });

  const cargarSedes = async () => {
    try {
      const data = await fetchAPI('/sedes');
      setSedes(data.reverse()); // Mostramos las más nuevas primero
    } catch (err) {
      console.error("Error al cargar sedes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSedes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: false });

    try {
      await fetchAPI('/sedes', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      setStatus({ loading: false, error: '', success: true });
      // 2. Limpiamos también el campo del calendario al guardar exitosamente
      setFormData({ nombre: '', ciudad: '', direccion: '', urlCalendario: '' });
      cargarSedes(); 
      
      setTimeout(() => {
        setMostrarFormulario(false);
        setStatus({ loading: false, error: '', success: false });
      }, 2000);
      
    } catch (err) {
      setStatus({ loading: false, error: 'Error al crear la sucursal: ' + err.message, success: false });
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Cabecera */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Sucursales</h1>
          <p className="text-gray-500 text-sm mt-1">Administra los puntos de atención y sedes de la empresa.</p>
        </div>
        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          {mostrarFormulario ? 'Cerrar Formulario' : '+ Nueva Sucursal'}
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Registrar Nueva Sucursal</h3>
          
          {status.error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{status.error}</div>}
          {status.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">¡Sucursal creada exitosamente!</div>}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nombre de la Sede</label>
              <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej: Sede Norte" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ciudad</label>
              <input type="text" required value={formData.ciudad} onChange={(e) => setFormData({...formData, ciudad: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej: Bogotá" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Dirección Exacta</label>
              <input type="text" required value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej: Av. Principal 123" />
            </div>
            {/* 3. Nuevo input para el Google Calendar */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ID de Google Calendar</label>
              <input type="text" value={formData.urlCalendario} onChange={(e) => setFormData({...formData, urlCalendario: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="ejemplo@group.calendar.google.com" />
            </div>

            <div className="col-span-1 md:col-span-2 pt-2">
              <button type="submit" disabled={status.loading} className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70">
                {status.loading ? 'Creando...' : 'Guardar Sucursal'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Sedes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Nombre de Sucursal</th>
                <th className="p-4 font-bold">Ciudad</th>
                <th className="p-4 font-bold">Dirección</th>
                <th className="p-4 font-bold">Calendario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {sedes.map((sede) => (
                <tr key={sede.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-500">#{sede.id}</td>
                  <td className="p-4 font-bold text-gray-900">{sede.nombre}</td>
                  <td className="p-4 text-gray-700">{sede.ciudad}</td>
                  <td className="p-4 text-gray-600">{sede.direccion}</td>
                  <td className="p-4">
                    {/* Indicador visual de si el calendario fue enlazado */}
                    {sede.urlCalendario ? (
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 font-bold text-xs rounded-md">Configurado</span>
                    ) : (
                      <span className="px-2.5 py-1 bg-gray-100 text-gray-500 font-bold text-xs rounded-md">Pendiente</span>
                    )}
                  </td>
                </tr>
              ))}
              {sedes.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 italic">No hay sucursales registradas.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}