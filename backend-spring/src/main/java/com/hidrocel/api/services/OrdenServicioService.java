package com.hidrocel.api.services;

import com.hidrocel.api.dtos.OrdenServicioRequest;
import com.hidrocel.api.models.Cliente;
import com.hidrocel.api.models.OrdenServicio;
import com.hidrocel.api.models.Usuario;
import com.hidrocel.api.models.Vehiculo;
import com.hidrocel.api.repositories.ClienteRepository;
import com.hidrocel.api.repositories.OrdenServicioRepository;
import com.hidrocel.api.repositories.UsuarioRepository;
import com.hidrocel.api.repositories.VehiculoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class OrdenServicioService {

    private final OrdenServicioRepository ordenRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final VehiculoRepository vehiculoRepository;

    public OrdenServicioService(OrdenServicioRepository ordenRepository, UsuarioRepository usuarioRepository,
                                ClienteRepository clienteRepository, VehiculoRepository vehiculoRepository) {
        this.ordenRepository = ordenRepository;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.vehiculoRepository = vehiculoRepository;
    }

    public OrdenServicio registrarOrden(OrdenServicioRequest request, String emailUsuario) {
        Usuario operario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (operario.getSede() == null) {
            throw new RuntimeException("Error: El usuario no tiene una sede asignada para facturar.");
        }

        Cliente cliente = clienteRepository.findByDocumentoIdentidad(request.clienteDocumento())
                .map(c -> {
                    if (request.clienteNombre() != null && !request.clienteNombre().isEmpty()) c.setNombreCompleto(request.clienteNombre());
                    if (request.clienteTelefono() != null && !request.clienteTelefono().isEmpty()) c.setTelefono(request.clienteTelefono());
                    return clienteRepository.save(c);
                })
                .orElseGet(() -> {
                    Cliente nuevo = new Cliente();
                    nuevo.setDocumentoIdentidad(request.clienteDocumento());
                    nuevo.setNombreCompleto(request.clienteNombre());
                    nuevo.setTelefono(request.clienteTelefono());
                    nuevo.setFuenteAdquisicion(request.origenVisita());
                    return clienteRepository.save(nuevo);
                });
        
        Vehiculo vehiculo = vehiculoRepository.findById(request.vehiculoPlaca())
                .map(v -> {
                    if (request.vehiculoTipo() != null && !request.vehiculoTipo().isEmpty()) v.setTipo(request.vehiculoTipo());
                    if (request.vehiculoMarca() != null && !request.vehiculoMarca().isEmpty()) v.setMarca(request.vehiculoMarca());
                    if (request.vehiculoLinea() != null && !request.vehiculoLinea().isEmpty()) v.setModelo(request.vehiculoLinea());
                    if (request.vehiculoAnio() != null) v.setAnio(request.vehiculoAnio());
                    return vehiculoRepository.save(v);
                })
                .orElseGet(() -> {
                    Vehiculo nuevo = new Vehiculo();
                    nuevo.setPlaca(request.vehiculoPlaca());
                    nuevo.setTipo(request.vehiculoTipo());
                    nuevo.setMarca(request.vehiculoMarca());
                    nuevo.setModelo(request.vehiculoLinea());
                    nuevo.setAnio(request.vehiculoAnio());
                    return vehiculoRepository.save(nuevo);
                });

        OrdenServicio nuevaOrden = new OrdenServicio();
        nuevaOrden.setSede(operario.getSede()); 
        nuevaOrden.setCliente(cliente);
        nuevaOrden.setVehiculo(vehiculo);
        nuevaOrden.setServicioNombre(request.servicioNombre());
        nuevaOrden.setValorFinalPagado(request.valorFinalPagado());
        nuevaOrden.setGastosAsociados(request.gastosAsociados());
        nuevaOrden.setTipoPago(request.tipoPago());
        nuevaOrden.setUrlFotoMedidor(request.urlFotoMedidor()); 
        nuevaOrden.setFechaHora(LocalDateTime.now()); 
        nuevaOrden.setOrigenVisita(request.origenVisita());

        return ordenRepository.save(nuevaOrden);
    }

    public java.util.List<OrdenServicio> obtenerOrdenes(String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getRole() == com.hidrocel.api.models.Role.ADMIN) {
            return ordenRepository.findAll();
        } else {
            return ordenRepository.findBySedeId(usuario.getSede().getId());
        }
    }
}