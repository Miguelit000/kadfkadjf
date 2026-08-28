package com.hidrocel.api.controllers;

import com.hidrocel.api.models.Cliente;
import com.hidrocel.api.repositories.ClienteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    private final ClienteRepository clienteRepository;

    public ClienteController(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    @GetMapping
    public ResponseEntity<List<Cliente>> obtenerClientes() {
        return ResponseEntity.ok(clienteRepository.findAll());
    }

    @GetMapping("/buscar")
    public ResponseEntity<Cliente> buscarPorDocumento(@RequestParam String documento) {
        return clienteRepository.findByDocumentoIdentidad(documento)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cliente> crearCliente(@RequestBody Cliente cliente) {
        return ResponseEntity.ok(clienteRepository.save(cliente));
    }

    // NUEVO ENDPOINT: Permite actualizar los datos de un cliente existente
    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizarCliente(@PathVariable Long id, @RequestBody Cliente datosActualizados) {
        return clienteRepository.findById(id)
                .map(cliente -> {
                    cliente.setNombreCompleto(datosActualizados.getNombreCompleto());
                    cliente.setTelefono(datosActualizados.getTelefono());
                    // Guardamos los cambios en la base de datos
                    return ResponseEntity.ok(clienteRepository.save(cliente));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}