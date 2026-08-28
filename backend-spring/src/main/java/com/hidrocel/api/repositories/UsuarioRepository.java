package com.hidrocel.api.repositories;

import com.hidrocel.api.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Este método mágico le dice a Spring que busque en la base de datos por el email exacto
    Optional<Usuario> findByEmail(String email);
}