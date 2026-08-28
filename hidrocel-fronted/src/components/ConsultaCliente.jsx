import { useState } from 'react';

export default function ConsultaCliente() {
  const [dato, setDato] = useState('');
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [buscado, setBuscado] = useState(false);

  const handleBuscar = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setBuscado(false);

    try {
      // Llamada pura a la API (sin headers de seguridad ni tokens)
      const res = await fetch(`http://localhost:8080/api/ordenes/consultar?dato=${dato.toUpperCase()}`);
      if (!res.ok) throw new Error('Error de conexión');
      const data = await res.json();
      
      setOrdenes(data.reverse()); // Más recientes primero
      setBuscado(true);
    } catch (err) {
      setError('Ocurrió un error al buscar su comprobante. Intente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fecha) => new Date(fecha).toLocaleDateString('es-CO');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-2xl space-y-8 animate-in fade-in duration-500">
        
        {/* Cabecera Pública */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Portal de Clientes</h1>
          <p className="text-gray-500">Descargue los resultados de su analizador de gases.</p>
        </div>

        {/* Buscador */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleBuscar} className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              required
              value={dato}
              onChange={(e) => setDato(e.target.value)}
              placeholder="Ingrese su Placa o Cédula/NIT" 
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase font-semibold text-gray-800"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md flex justify-center"
            >
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl text-center">{error}</div>}
        
        {buscado && ordenes.length === 0 && (
          <div className="p-8 bg-white border border-gray-100 rounded-2xl text-center shadow-sm">
            <span className="text-4xl mb-3 block">🧐</span>
            <h3 className="text-lg font-bold text-gray-800">No encontramos registros</h3>
            <p className="text-gray-500 text-sm mt-1">Verifique que la placa o documento estén bien escritos.</p>
          </div>
        )}

        {ordenes.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 ml-2">Sus comprobantes recientes:</h3>
            {ordenes.map(orden => (
              <div key={orden.id} className="flex flex-col md:flex-row justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="bg-gray-900 text-white px-3 py-1 rounded-lg text-xs font-black tracking-widest">{orden.vehiculo.placa}</span>
                    <span className="text-sm font-bold text-gray-800">{formatearFecha(orden.fechaHora)}</span>
                  </div>
                  <p className="text-sm text-gray-500">{orden.servicioNombre}</p>
                </div>
                
                {orden.urlFotoMedidor ? (
                  <a 
                    href={orden.urlFotoMedidor} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full md:w-auto text-center px-6 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-xl transition-colors"
                  >
                    Descargar PDF
                  </a>
                ) : (
                  <span className="text-sm text-gray-400 italic">No disponible</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}