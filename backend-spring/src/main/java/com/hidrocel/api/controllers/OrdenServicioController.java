package com.hidrocel.api.controllers;

import com.hidrocel.api.dtos.OrdenServicioRequest;
import com.hidrocel.api.models.OrdenServicio;
import com.hidrocel.api.services.OrdenServicioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/ordenes")
public class OrdenServicioController {

    private final OrdenServicioService ordenServicioService;
    private final com.hidrocel.api.repositories.OrdenServicioRepository ordenRepository;

    public OrdenServicioController(OrdenServicioService ordenServicioService, com.hidrocel.api.repositories.OrdenServicioRepository ordenRepository) {
        this.ordenServicioService = ordenServicioService;
        this.ordenRepository = ordenRepository;
    }

    @PostMapping
    public ResponseEntity<OrdenServicio> crearOrden(@RequestBody OrdenServicioRequest request, Principal principal) {
        OrdenServicio nuevaOrden = ordenServicioService.registrarOrden(request, principal.getName());
        return ResponseEntity.ok(nuevaOrden);
    }

    @GetMapping
    public ResponseEntity<List<OrdenServicio>> obtenerOrdenes(Principal principal) {
        return ResponseEntity.ok(ordenServicioService.obtenerOrdenes(principal.getName()));
    }

    @GetMapping("/consultar")
    public ResponseEntity<List<OrdenServicio>> consultarPublico(@RequestParam String dato) {
        return ResponseEntity.ok(ordenRepository.findByVehiculoPlacaOrClienteDocumentoIdentidad(dato, dato));
    }
}