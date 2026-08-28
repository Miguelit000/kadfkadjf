package com.hidrocel.api.controllers;

import com.hidrocel.api.models.Sede;
import com.hidrocel.api.models.Usuario;
import com.hidrocel.api.repositories.SedeRepository;
import com.hidrocel.api.repositories.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/sedes")
public class SedeController {

    private final SedeRepository sedeRepository;
    private final UsuarioRepository usuarioRepository; // <-- NUEVA INYECCIÓN

    public SedeController(SedeRepository sedeRepository, UsuarioRepository usuarioRepository) {
        this.sedeRepository = sedeRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping
    public ResponseEntity<List<Sede>> obtenerSedes() {
        return ResponseEntity.ok(sedeRepository.findAll());
    }

    // NUEVO ENDPOINT: Devuelve la sede del usuario que inició sesión
    @GetMapping("/mi-sede")
    public ResponseEntity<Sede> obtenerMiSede(Principal principal) {
        return usuarioRepository.findByEmail(principal.getName())
                .map(Usuario::getSede)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Sede> crearSede(@RequestBody Sede sede) {
        return ResponseEntity.ok(sedeRepository.save(sede));
    }
}