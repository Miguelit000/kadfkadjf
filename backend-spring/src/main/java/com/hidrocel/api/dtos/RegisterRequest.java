package com.hidrocel.api.dtos;

import com.hidrocel.api.models.Role;

public record RegisterRequest(
        String email,
        String password,
        Role role
) {}