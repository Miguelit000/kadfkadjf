package com.hidrocel.api.controllers;

import com.hidrocel.api.dtos.DashboardResponse;
import com.hidrocel.api.services.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> obtenerMetricas(
            Principal principal, 
            @RequestParam(required = false) Long sedeId // <-- Nuevo parámetro
    ) {
        return ResponseEntity.ok(dashboardService.obtenerEstadisticas(principal.getName(), sedeId));
    }
}