import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

export default function VehiculosManager() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  const [editandoPlaca, setEditandoPlaca] = useState(null);
  const [formEdit, setFormEdit] = useState({ marca: '', modelo: '' });

  const cargarVehiculos = async () => {
    try {
      const data = await fetchAPI('/vehiculos');
      setVehiculos(data.reverse()); 
    } catch (err) {
      console.error("Error al cargar vehículos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarVehiculos();
  }, []);

  const iniciarEdicion = (vehiculo) => {
    setEditandoPlaca(vehiculo.placa);
    setFormEdit({
      marca: vehiculo.marca === 'Sin especificar' ? '' : (vehiculo.marca || ''),
      modelo: vehiculo.modelo === 'Sin especificar' ? '' : (vehiculo.modelo || '')
    });
  };

  const guardarCambios = async (placa) => {
    try {
      await fetchAPI(`/vehiculos/${placa}`, {
        method: 'PUT',
        body: JSON.stringify(formEdit),
      });
      setEditandoPlaca(null);
      cargarVehiculos(); 
    } catch (err) {
      alert('Error al actualizar el vehículo: ' + err.message);
    }
  };

  const vehiculosFiltrados = vehiculos.filter(v => 
    (v.placa && v.placa.toLowerCase().includes(busqueda.toLowerCase())) ||
    (v.marca && v.marca.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-black text-gray-900">Directorio de Vehículos</h2>
          <p className="text-gray-500 text-sm mt-1">Registros técnicos del parque automotor atendido.</p>
        </div>
        <div className="relative w-full md:w-72">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por placa o marca..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm uppercase"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 font-bold">Placa</th>
              <th className="p-4 font-bold">Marca</th>
              <th className="p-4 font-bold">Modelo</th>
              <th className="p-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {vehiculosFiltrados.map((vehiculo) => {
              const enEdicion = editandoPlaca === vehiculo.placa;

              return (
                <tr key={vehiculo.placa} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-black text-gray-900 uppercase tracking-widest">{vehiculo.placa}</td>
                  
                  <td className="p-4">
                    {enEdicion ? (
                      <input 
                        type="text" 
                        value={formEdit.marca}
                        onChange={(e) => setFormEdit({...formEdit, marca: e.target.value})}
                        className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 uppercase text-sm"
                        placeholder="Ej: TOYOTA"
                      />
                    ) : (
                      <span className={`font-medium ${vehiculo.marca === 'Sin especificar' ? 'text-orange-500 italic' : 'text-gray-700'}`}>
                        {vehiculo.marca}
                      </span>
                    )}
                  </td>
                  
                  <td className="p-4">
                    {enEdicion ? (
                      <input 
                        type="text" 
                        value={formEdit.modelo}
                        onChange={(e) => setFormEdit({...formEdit, modelo: e.target.value})}
                        className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Ej: Corolla 2022"
                      />
                    ) : (
                      <span className={`font-medium ${vehiculo.modelo === 'Sin especificar' ? 'text-orange-500 italic' : 'text-gray-700'}`}>
                        {vehiculo.modelo}
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    {enEdicion ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => guardarCambios(vehiculo.placa)} className="text-green-600 hover:text-green-800 font-bold px-2 py-1 bg-green-50 rounded-lg transition-colors">
                          Guardar
                        </button>
                        <button onClick={() => setEditandoPlaca(null)} className="text-gray-500 hover:text-gray-700 font-bold px-2 py-1 bg-gray-200 rounded-lg transition-colors">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => iniciarEdicion(vehiculo)} className="text-blue-600 hover:text-blue-800 font-bold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {vehiculosFiltrados.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500 italic">No se encontraron vehículos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}