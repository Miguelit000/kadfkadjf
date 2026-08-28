import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

export default function ClientesManager() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  
  // Estados para manejar la edición
  const [editandoId, setEditandoId] = useState(null);
  const [formEdit, setFormEdit] = useState({ nombreCompleto: '', telefono: '' });

  const cargarClientes = async () => {
    try {
      const data = await fetchAPI('/clientes');
      setClientes(data.reverse()); // Los más recientes primero
    } catch (err) {
      console.error("Error al cargar clientes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // Activa el modo edición para una fila específica
  const iniciarEdicion = (cliente) => {
    setEditandoId(cliente.id);
    setFormEdit({
      nombreCompleto: cliente.nombreCompleto || '',
      telefono: cliente.telefono || ''
    });
  };

  // Envía los cambios al backend
  const guardarCambios = async (id) => {
    try {
      await fetchAPI(`/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(formEdit),
      });
      setEditandoId(null);
      cargarClientes(); // Recargamos la tabla para ver los cambios
    } catch (err) {
      alert('Error al actualizar el cliente: ' + err.message);
    }
  };

  // Filtro de búsqueda en tiempo real
  const clientesFiltrados = clientes.filter(c => 
    (c.documentoIdentidad && c.documentoIdentidad.includes(busqueda)) ||
    (c.nombreCompleto && c.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()))
  );

  if (loading) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
      
      {/* Cabecera y Buscador */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-gray-50/50">
        <div>
          <h2 className="text-xl font-black text-gray-900">Directorio de Clientes</h2>
          <p className="text-gray-500 text-sm mt-1">Gestiona la información de contacto de tus clientes.</p>
        </div>
        <div className="relative w-full md:w-72">
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            type="text" 
            placeholder="Buscar por cédula o nombre..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <th className="p-4 font-bold">Documento</th>
              <th className="p-4 font-bold">Nombre Completo</th>
              <th className="p-4 font-bold">Teléfono</th>
              <th className="p-4 font-bold">Origen (Mkt)</th>
              <th className="p-4 font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {clientesFiltrados.map((cliente) => {
              const enEdicion = editandoId === cliente.id;

              return (
                <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-semibold text-gray-900">{cliente.documentoIdentidad}</td>
                  
                  <td className="p-4">
                    {enEdicion ? (
                      <input 
                        type="text" 
                        value={formEdit.nombreCompleto}
                        onChange={(e) => setFormEdit({...formEdit, nombreCompleto: e.target.value})}
                        className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-700">{cliente.nombreCompleto || <span className="text-gray-400 italic">Sin registrar</span>}</span>
                    )}
                  </td>
                  
                  <td className="p-4">
                    {enEdicion ? (
                      <input 
                        type="text" 
                        value={formEdit.telefono}
                        onChange={(e) => setFormEdit({...formEdit, telefono: e.target.value})}
                        className="w-full px-2 py-1 border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-700">{cliente.telefono || <span className="text-gray-400 italic">Sin registrar</span>}</span>
                    )}
                  </td>

                  <td className="p-4 text-gray-500">
                    <span className="px-2.5 py-1 bg-gray-100 rounded-md text-xs font-medium">
                      {cliente.fuenteAdquisicion || 'N/A'}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {enEdicion ? (
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => guardarCambios(cliente.id)} className="text-green-600 hover:text-green-800 font-bold px-2 py-1 bg-green-50 rounded-lg transition-colors">
                          Guardar
                        </button>
                        <button onClick={() => setEditandoId(null)} className="text-gray-500 hover:text-gray-700 font-bold px-2 py-1 bg-gray-200 rounded-lg transition-colors">
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => iniciarEdicion(cliente)} className="text-blue-600 hover:text-blue-800 font-bold px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                        Editar
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {clientesFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500 italic">No se encontraron clientes.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}