import { useState, useEffect } from 'react';
import { fetchAPI } from '../services/api';

export default function EquipoManager() {
  const [equipo, setEquipo] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'ENCARGADO', sedeId: '' });
  const [status, setStatus] = useState({ loading: false, error: '', success: false });

  const userRole = typeof window !== 'undefined' ? localStorage.getItem('user_role') : '';

  const cargarDatos = async () => {
    try {
      const dataEquipo = await fetchAPI('/equipo');
      setEquipo(dataEquipo.reverse());

      if (userRole === 'ADMIN') {
        const dataSedes = await fetchAPI('/sedes');
        setSedes(dataSedes);
        if (dataSedes.length > 0) {
          setFormData(prev => ({ ...prev, sedeId: dataSedes[0].id }));
        }
      }
    } catch (err) {
      console.error("Error al cargar equipo:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: '', success: false });

    const payload = {
      email: formData.email,
      password: formData.password,
      role: userRole === 'ADMIN' ? formData.role : 'OPERARIO',
      sedeId: userRole === 'ADMIN' ? parseInt(formData.sedeId) : null
    };

    try {
      await fetchAPI('/equipo', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      setStatus({ loading: false, error: '', success: true });
      setFormData({ ...formData, email: '', password: '' });
      cargarDatos(); 
      
      setTimeout(() => {
        setMostrarFormulario(false);
        setStatus({ loading: false, error: '', success: false });
      }, 2000);
      
    } catch (err) {
      setStatus({ loading: false, error: 'Error al crear usuario. Verifica que el correo no exista ya.', success: false });
    }
  };

  // NUEVA FUNCIÓN: Eliminar usuario
  const eliminarUsuario = async (id, email) => {
    const confirmar = window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el acceso de ${email}?`);
    
    if (confirmar) {
      try {
        await fetchAPI(`/equipo/${id}`, {
          method: 'DELETE',
        });
        // Refrescamos la tabla automáticamente
        cargarDatos();
      } catch (err) {
        alert('Error al eliminar usuario: ' + err.message);
      }
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Gestión de Equipo</h1>
          <p className="text-gray-500 text-sm mt-1">Administra los accesos y roles del personal.</p>
        </div>
        <button 
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
        >
          {mostrarFormulario ? 'Cerrar Formulario' : '+ Nuevo Empleado'}
        </button>
      </div>

      {mostrarFormulario && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Crear Nuevo Usuario</h3>
          
          {status.error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{status.error}</div>}
          {status.success && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">¡Usuario creado exitosamente!</div>}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico</label>
              <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="empleado@hidrocel.com" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña de acceso</label>
              <input type="password" required minLength="6" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
            </div>

            {userRole === 'ADMIN' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Rol en el sistema</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="ENCARGADO">Encargado de Sede</option>
                    <option value="OPERARIO">Operario</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Asignar a Sede</label>
                  <select value={formData.sedeId} onChange={(e) => setFormData({...formData, sedeId: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    {sedes.map(sede => (
                      <option key={sede.id} value={sede.id}>{sede.nombre}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="col-span-1 md:col-span-2 pt-2">
              <button type="submit" disabled={status.loading} className="px-6 py-2 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70">
                {status.loading ? 'Creando...' : 'Guardar Usuario'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 font-bold">Email (Usuario)</th>
                <th className="p-4 font-bold">Rol</th>
                <th className="p-4 font-bold">Sede Asignada</th>
                <th className="p-4 font-bold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {equipo.map((empleado) => (
                <tr key={empleado.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{empleado.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      empleado.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                      empleado.role === 'ENCARGADO' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {empleado.role}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-600">
                    {empleado.sede ? empleado.sede.nombre : 'Sin sede'}
                  </td>
                  <td className="p-4 text-center">
                    {/* Evitamos que el usuario se elimine a sí mismo ocultando el botón */}
                    {empleado.email !== (typeof window !== 'undefined' ? localStorage.getItem('user_email') : '') && (
                      <button 
                        onClick={() => eliminarUsuario(empleado.id, empleado.email)}
                        className="text-red-500 hover:text-red-700 font-bold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {equipo.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500 italic">No hay empleados registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}