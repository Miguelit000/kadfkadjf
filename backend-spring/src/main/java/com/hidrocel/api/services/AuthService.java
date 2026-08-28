package com.hidrocel.api.services;

import com.hidrocel.api.dtos.AuthResponse;
import com.hidrocel.api.dtos.LoginRequest;
import com.hidrocel.api.dtos.RegisterRequest;
import com.hidrocel.api.models.Usuario;
import com.hidrocel.api.repositories.UsuarioRepository;
import com.hidrocel.api.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UsuarioRepository repository, PasswordEncoder passwordEncoder, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse registrar(RegisterRequest request) {
        // 1. Creamos el usuario
        Usuario user = new Usuario();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password())); // ¡Encriptamos la contraseña!
        user.setRole(request.role());

        // 2. Lo guardamos en la base de datos
        repository.save(user);

        // 3. Generamos su token y lo devolvemos
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getRole());
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Spring Security verifica que el email y contraseña coincidan
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        // 2. Si pasa, buscamos al usuario
        Usuario user = repository.findByEmail(request.email())
                .orElseThrow();

        // 3. Generamos el token y lo devolvemos
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getRole());
    }
}