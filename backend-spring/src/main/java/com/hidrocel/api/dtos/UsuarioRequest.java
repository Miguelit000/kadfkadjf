package com.hidrocel.api.dtos;
import com.hidrocel.api.models.Role;

public record UsuarioRequest(
        String email,
        String password,
        Role role,
        Long sedeId
) {}