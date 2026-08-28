package com.hidrocel.api.controllers;

import com.hidrocel.api.models.Vehiculo;
import com.hidrocel.api.repositories.VehiculoRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
public class VehiculoController {

    private final VehiculoRepository vehiculoRepository;

    public VehiculoController(VehiculoRepository vehiculoRepository) {
        this.vehiculoRepository = vehiculoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Vehiculo>> obtenerVehiculos() {
        return ResponseEntity.ok(vehiculoRepository.findAll());
    }

    @GetMapping("/buscar")
    public ResponseEntity<Vehiculo> buscarPorPlaca(@RequestParam String placa) {
        return vehiculoRepository.findById(placa)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Vehiculo> crearVehiculo(@RequestBody Vehiculo vehiculo) {
        return ResponseEntity.ok(vehiculoRepository.save(vehiculo));
    }

    // NUEVO ENDPOINT: Permite actualizar marca y modelo usando la placa
    @PutMapping("/{placa}")
    public ResponseEntity<Vehiculo> actualizarVehiculo(@PathVariable String placa, @RequestBody Vehiculo datosActualizados) {
        return vehiculoRepository.findById(placa)
                .map(vehiculo -> {
                    vehiculo.setMarca(datosActualizados.getMarca());
                    vehiculo.setModelo(datosActualizados.getModelo());
                    return ResponseEntity.ok(vehiculoRepository.save(vehiculo));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}