package com.hidrocel.api.dtos;

// Un 'record' es una clase moderna de Java que crea los getters automáticamente. ¡Súper limpio!
public record LoginRequest(
        String email,
        String password
) {}