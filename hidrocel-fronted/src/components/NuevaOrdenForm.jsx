import { useState } from 'react';
import { fetchAPI } from '../services/api';
import { supabase } from '../services/supabase';
import { jsPDF } from 'jspdf'; 

export default function NuevaOrdenForm() {
  const [formData, setFormData] = useState({
    vehiculoPlaca: '',
    vehiculoTipo: 'Automovil',
    vehiculoMarca: '',
    vehiculoLinea: '',
    vehiculoAnio: '',
    clienteDocumento: '', 
    clienteNombre: '',    
    clienteTelefono: '',  
    servicioNombre: '',
    valorFinalPagado: '',
    gastosAsociados: '',
    tipoPago: 'Efectivo',
    origenVisita: 'Cliente Recurrente'
  });

  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoArchivo, setFotoArchivo] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: '', success: false, loadingText: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Magia 1: Buscar Vehículo por Placa
  const handleBuscarVehiculo = async () => {
    if (!formData.vehiculoPlaca || formData.vehiculoPlaca.length < 5) return;
    try {
      const vehiculo = await fetchAPI(`/vehiculos/buscar?placa=${formData.vehiculoPlaca.toUpperCase()}`);
      if (vehiculo && vehiculo.placa) {
        setFormData(prev => ({
          ...prev,
          vehiculoTipo: vehiculo.tipo || 'Automovil',
          vehiculoMarca: vehiculo.marca && vehiculo.marca !== 'Sin especificar' ? vehiculo.marca : '',
          vehiculoLinea: vehiculo.modelo && vehiculo.modelo !== 'Sin especificar' ? vehiculo.modelo : '',
          vehiculoAnio: vehiculo.anio || ''
        }));
      }
    } catch (err) {
      console.log('Vehículo nuevo, se registrará al guardar la orden.');
    }
  };

  // Magia 2: Buscar Cliente por Documento
  const handleBuscarCliente = async () => {
    if (!formData.clienteDocumento) return;
    try {
      const cliente = await fetchAPI(`/clientes/buscar?documento=${formData.clienteDocumento}`);
      if (cliente && cliente.id) {
        setFormData(prev => ({
          ...prev,
          clienteNombre: cliente.nombreCompleto || '',
          clienteTelefono: cliente.telefono || ''
        }));
      }
    } catch (err) {
      console.log('Cliente nuevo, se registrará al guardar la orden.');
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        setFotoArchivo(blob);
        setFotoPreview(URL.createObjectURL(blob)); 
        break;
      }
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

 const handleSubmit = async (e) => {
    e.preventDefault();

    // NUEVA VALIDACIÓN: Si no hay foto, frenamos todo y mostramos error
    if (!fotoArchivo) {
      setStatus({ 
        loading: false, 
        error: '⚠️ Es obligatorio pegar la gráfica del analizador de gases para generar el comprobante.', 
        success: false, 
        loadingText: '' 
      });
      return; // El "return" hace que el código se detenga y no envíe nada a la base de datos
    }

    // Iniciamos la carga visual del botón si pasó la validación
    setStatus({ loading: true, error: '', success: false, loadingText: 'Generando comprobante...' });

    try {
      let urlFinal = "";
      
      if (fotoArchivo) {
        const base64Img = await fileToBase64(fotoArchivo);
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.setFont(undefined, 'bold');
        doc.text("Orden de Servicio - Hidrocel", 20, 20);

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
        
        // Bloque Vehículo
        doc.setFont(undefined, 'bold'); doc.text("Vehículo:", 20, 42);
        doc.setFont(undefined, 'normal');
        doc.text(`${formData.vehiculoTipo} | Placa: ${formData.vehiculoPlaca.toUpperCase()} | ${formData.vehiculoMarca} ${formData.vehiculoLinea} (${formData.vehiculoAnio})`, 20, 48);
        
        // Bloque Cliente
        doc.setFont(undefined, 'bold'); doc.text("Cliente:", 20, 58);
        doc.setFont(undefined, 'normal');
        doc.text(`CC/NIT: ${formData.clienteDocumento} | Nombre: ${formData.clienteNombre} | Tel: ${formData.clienteTelefono}`, 20, 64);
        
        // Bloque Servicio
        doc.setFont(undefined, 'bold'); doc.text("Detalle del Servicio:", 20, 74);
        doc.setFont(undefined, 'normal');
        doc.text(`Servicio: ${formData.servicioNombre}`, 20, 80);
        doc.text(`Valor Pagado: $ ${formData.valorFinalPagado} COP (${formData.tipoPago})`, 20, 86);
        
        doc.setFont(undefined, 'bold');
        doc.text("Prueba Analizador de Gases:", 20, 102);
        doc.addImage(base64Img, 'JPEG', 20, 108, 160, 90);

        const pdfBlob = doc.output('blob');
        const fileName = `comprobante-${formData.vehiculoPlaca.toUpperCase()}-${Date.now()}.pdf`;

        setStatus(prev => ({ ...prev, loadingText: 'Subiendo PDF a la nube...' }));
        const { error: uploadError } = await supabase.storage
          .from('evidencias') 
          .upload(fileName, pdfBlob, { contentType: 'application/pdf' });

        if (uploadError) throw new Error('Error al subir PDF: ' + uploadError.message);

        const { data: publicUrlData } = supabase.storage.from('evidencias').getPublicUrl(fileName);
        urlFinal = publicUrlData.publicUrl;
        doc.save(fileName);
      }

      setStatus(prev => ({ ...prev, loadingText: 'Guardando datos...' }));

      const payload = {
        vehiculoPlaca: formData.vehiculoPlaca.toUpperCase(),
        vehiculoTipo: formData.vehiculoTipo,
        vehiculoMarca: formData.vehiculoMarca,
        vehiculoLinea: formData.vehiculoLinea,
        vehiculoAnio: formData.vehiculoAnio ? parseInt(formData.vehiculoAnio) : null,
        clienteDocumento: formData.clienteDocumento,
        clienteNombre: formData.clienteNombre,
        clienteTelefono: formData.clienteTelefono,
        servicioNombre: formData.servicioNombre,
        valorFinalPagado: parseFloat(formData.valorFinalPagado),
        gastosAsociados: parseFloat(formData.gastosAsociados),
        tipoPago: formData.tipoPago,
        origenVisita: formData.origenVisita,
        urlFotoMedidor: urlFinal 
      };

      await fetchAPI('/ordenes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setStatus({ loading: false, error: '', success: true, loadingText: '' });
      
      setTimeout(() => {
        if (fotoPreview) URL.revokeObjectURL(fotoPreview);
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err) {
      setStatus({ loading: false, error: 'Error: ' + err.message, success: false, loadingText: '' });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      <div className="mb-8 border-b border-gray-100 pb-5">
        <h2 className="text-2xl font-black text-gray-900">Registrar Nueva Orden</h2>
        <p className="text-gray-500 text-sm mt-1">Genera el comprobante y actualiza tu base de datos automáticamente.</p>
      </div>

      {status.error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">{status.error}</div>
      )}
      {status.success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-medium flex items-center gap-2">
          ¡Orden registrada exitosamente! Descargando PDF...
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Zona de Pegado */}
        <div className="w-full">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Prueba Analizador de Gases <span className="text-red-500">* (Requerido)</span>
          </label>
          <div 
            tabIndex="0" 
            onPaste={handlePaste}
            className={`w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all cursor-text min-h-[120px] ${
              fotoPreview ? 'border-emerald-400 bg-emerald-50/30' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {fotoPreview ? (
              <div className="relative group">
                <img src={fotoPreview} alt="Vista previa" className="max-h-40 rounded-lg shadow-sm" />
                <button type="button" onClick={() => { setFotoPreview(null); setFotoArchivo(null); }} className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1.5 shadow-lg">X</button>
              </div>
            ) : (
              <div className="text-center text-gray-500 font-medium">Haz clic aquí y presiona <kbd className="px-2 py-1 bg-white border border-gray-200 rounded">Ctrl + V</kbd></div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-100">
          
          {/* Columna 1: Vehículo y Cliente */}
          <div className="space-y-6">
            
            {/* Sección Vehículo */}
            <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4">
              <h3 className="font-bold text-blue-900 border-b border-blue-200 pb-2">Datos del Vehículo</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Placa</label>
                  <input 
                    type="text" name="vehiculoPlaca" required maxLength="6"
                    value={formData.vehiculoPlaca} onChange={handleChange} onBlur={handleBuscarVehiculo}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase font-bold"
                    placeholder="AAA123"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                  <select name="vehiculoTipo" value={formData.vehiculoTipo} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="Automovil">Automóvil</option>
                    <option value="Camioneta">Camioneta</option>
                    <option value="Moto">Moto</option>
                    <option value="Bus">Bus</option>
                    <option value="Camion">Camión</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Marca</label>
                  <input type="text" name="vehiculoMarca" value={formData.vehiculoMarca} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ej: Kia" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Línea</label>
                  <input type="text" name="vehiculoLinea" value={formData.vehiculoLinea} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Ej: Picanto" />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Año</label>
                  <input type="number" name="vehiculoAnio" value={formData.vehiculoAnio} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="2024" />
                </div>
              </div>
            </div>

            {/* Sección Cliente */}
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
              <h3 className="font-bold text-gray-800 border-b border-gray-200 pb-2">Datos del Cliente</h3>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Documento</label>
                <input type="text" name="clienteDocumento" required value={formData.clienteDocumento} onChange={handleChange} onBlur={handleBuscarCliente} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Cédula o NIT" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
                  <input type="text" name="clienteNombre" required value={formData.clienteNombre} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                  <input type="text" name="clienteTelefono" value={formData.clienteTelefono} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Columna 2: Finanzas y Servicio */}
          <div className="space-y-4 bg-emerald-50/50 p-5 rounded-xl border border-emerald-100">
            <h3 className="font-bold text-emerald-900 border-b border-emerald-200 pb-2 mb-4">Servicio y Finanzas</h3>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Servicio Realizado</label>
              <input type="text" name="servicioNombre" required value={formData.servicioNombre} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500" placeholder="Ej: Análisis de Gases" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Valor Cobrado</label>
              <input type="number" name="valorFinalPagado" required min="0" step="0.01" value={formData.valorFinalPagado} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700" placeholder="150000" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Gastos (Insumos/Op)</label>
              <input type="number" name="gastosAsociados" required min="0" step="0.01" value={formData.gastosAsociados} onChange={handleChange} className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 font-bold text-red-600" placeholder="50000" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Pago</label>
                <select name="tipoPago" value={formData.tipoPago} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="Efectivo">Efectivo</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Origen</label>
                <select name="origenVisita" value={formData.origenVisita} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="Cliente Recurrente">Recurrente</option>
                  <option value="Recomendación">Recomendado</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Volante/Valla">Volante</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-4 flex justify-end border-t border-gray-100">
          <button type="submit" disabled={status.loading} className="px-8 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-70 flex items-center gap-2 shadow-md">
            {status.loading ? status.loadingText : 'Registrar Orden y Generar PDF'}
          </button>
        </div>
      </form>
    </div>
  );
}