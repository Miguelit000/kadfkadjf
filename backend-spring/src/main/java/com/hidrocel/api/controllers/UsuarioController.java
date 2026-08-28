package com.hidrocel.api.controllers;

import com.hidrocel.api.dtos.UsuarioRequest;
import com.hidrocel.api.models.Role;
import com.hidrocel.api.models.Sede;
import com.hidrocel.api.models.Usuario;
import com.hidrocel.api.repositories.SedeRepository;
import com.hidrocel.api.repositories.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/equipo")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final SedeRepository sedeRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, SedeRepository sedeRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.sedeRepository = sedeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // 1. LISTAR EL EQUIPO (Con filtro de visión estricto)
    @GetMapping
    public ResponseEntity<List<Usuario>> listarEquipo(Principal principal) {
        Usuario jefe = usuarioRepository.findByEmail(principal.getName()).orElseThrow();
        
        List<Usuario> equipo;
        if (jefe.getRole() == Role.ADMIN) {
            equipo = usuarioRepository.findAll(); // El Admin ve a todos
        } else {
            // El encargado SOLO se ve a sí mismo y a los OPERARIOS de su propia sede
            equipo = usuarioRepository.findAll().stream()
                    .filter(u -> u.getId().equals(jefe.getId()) || 
                                (u.getSede() != null && 
                                 u.getSede().getId().equals(jefe.getSede().getId()) && 
                                 u.getRole() == Role.OPERARIO))
                    .collect(Collectors.toList());
        }
        
        equipo.forEach(u -> u.setPassword("*****"));
        return ResponseEntity.ok(equipo);
    }

    // 2. CONTRATAR EMPLEADO
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody UsuarioRequest request, Principal principal) {
        Usuario jefe = usuarioRepository.findByEmail(principal.getName()).orElseThrow();
        
        // Verificamos si el correo ya existe
        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().body("El correo ya está registrado.");
        }

        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setEmail(request.email());
        nuevoUsuario.setPassword(passwordEncoder.encode(request.password()));
        
        if (jefe.getRole() == Role.ADMIN) {
            nuevoUsuario.setRole(request.role());
            Sede sede = sedeRepository.findById(request.sedeId())
                    .orElseThrow(() -> new RuntimeException("Sede no encontrada"));
            nuevoUsuario.setSede(sede);
        } 
        else if (jefe.getRole() == Role.ENCARGADO) {
            nuevoUsuario.setRole(Role.OPERARIO);
            nuevoUsuario.setSede(jefe.getSede());
        } 
        else {
            return ResponseEntity.status(403).body("No tienes permisos para crear usuarios.");
        }

        usuarioRepository.save(nuevoUsuario);
        nuevoUsuario.setPassword("*****");
        return ResponseEntity.ok(nuevoUsuario);
    }

    // 3. NUEVO: ELIMINAR EMPLEADO
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id, Principal principal) {
        Usuario jefe = usuarioRepository.findByEmail(principal.getName()).orElseThrow();
        Usuario objetivo = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Regla de oro: Nadie puede auto-eliminarse
        if (jefe.getId().equals(objetivo.getId())) {
            return ResponseEntity.badRequest().body("No puedes eliminar tu propia cuenta.");
        }

        if (jefe.getRole() == Role.ADMIN) {
            // El admin puede despedir a quien sea
            usuarioRepository.delete(objetivo);
            return ResponseEntity.ok().build();
        } else if (jefe.getRole() == Role.ENCARGADO) {
            // El encargado solo puede despedir a OPERARIOS de su propia sede
            if (objetivo.getSede() != null && 
                objetivo.getSede().getId().equals(jefe.getSede().getId()) && 
                objetivo.getRole() == Role.OPERARIO) {
                
                usuarioRepository.delete(objetivo);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(403).body("No tienes permisos para eliminar este usuario.");
            }
        }
        
        return ResponseEntity.status(403).build();
    }
}