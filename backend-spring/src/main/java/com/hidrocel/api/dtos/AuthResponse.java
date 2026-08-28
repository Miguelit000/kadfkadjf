package com.hidrocel.api.dtos;

import com.hidrocel.api.models.Role;

public record AuthResponse(
        String token,
        Role role 
) {}