package com.hidrocel.api.security;

import com.hidrocel.api.models.Role;
import com.hidrocel.api.models.Sede;
import com.hidrocel.api.models.Usuario;
import com.hidrocel.api.repositories.SedeRepository;
import com.hidrocel.api.repositories.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final SedeRepository sedeRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UsuarioRepository usuarioRepository, SedeRepository sedeRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.sedeRepository = sedeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Crear la Sede Principal si no existe
        Sede sedePrincipal;
        if (sedeRepository.count() == 0) {
            Sede nuevaSede = new Sede();
            nuevaSede.setNombre("Sede Principal Hidrocel");
            nuevaSede.setCiudad("Medellín");
            nuevaSede.setDireccion("Zona Centro");
            sedePrincipal = sedeRepository.save(nuevaSede);
            System.out.println("✅ Sede principal creada con éxito.");
        } else {
            sedePrincipal = sedeRepository.findAll().get(0);
        }

        // 2. Crear el ADMINISTRADOR supremo si no existe
        if (usuarioRepository.findByEmail("admin@hidrocel.com").isEmpty()) {
            Usuario admin = new Usuario();
            admin.setEmail("admin@hidrocel.com");
            admin.setPassword(passwordEncoder.encode("admin123")); // Contraseña encriptada
            admin.setRole(Role.ADMIN);
            admin.setSede(sedePrincipal);
            usuarioRepository.save(admin);
            System.out.println("✅ Usuario ADMIN creado (admin@hidrocel.com / admin123)");
        }

        // 3. Crear un ENCARGADO de prueba si no existe
        if (usuarioRepository.findByEmail("encargado@hidrocel.com").isEmpty()) {
            Usuario encargado = new Usuario();
            encargado.setEmail("encargado@hidrocel.com");
            encargado.setPassword(passwordEncoder.encode("123456")); 
            encargado.setRole(Role.ENCARGADO);
            encargado.setSede(sedePrincipal);
            usuarioRepository.save(encargado);
            System.out.println("✅ Usuario ENCARGADO creado (encargado@hidrocel.com / 123456)");
        }
        
        // 4. Crear un OPERARIO de prueba si no existe
        if (usuarioRepository.findByEmail("operario@hidrocel.com").isEmpty()) {
            Usuario operario = new Usuario();
            operario.setEmail("operario@hidrocel.com");
            operario.setPassword(passwordEncoder.encode("123456")); 
            operario.setRole(Role.OPERARIO);
            operario.setSede(sedePrincipal);
            usuarioRepository.save(operario);
            System.out.println("✅ Usuario OPERARIO creado (operario@hidrocel.com / 123456)");
        }
    }
}