package com.hidrocel.api.services;

import com.hidrocel.api.dtos.DashboardResponse;
import com.hidrocel.api.models.OrdenServicio;
import com.hidrocel.api.models.Role;
import com.hidrocel.api.models.Usuario;
import com.hidrocel.api.repositories.OrdenServicioRepository;
import com.hidrocel.api.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final OrdenServicioRepository ordenRepository;
    private final UsuarioRepository usuarioRepository;

    public DashboardService(OrdenServicioRepository ordenRepository, UsuarioRepository usuarioRepository) {
        this.ordenRepository = ordenRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public DashboardResponse obtenerEstadisticas(String emailUsuario, Long sedeIdFiltro) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (usuario.getRole() == Role.OPERARIO) {
            throw new RuntimeException("Acceso denegado: Nivel de privilegios insuficiente.");
        }

        List<OrdenServicio> ordenes;
        
        if (usuario.getRole() == Role.ADMIN) {
            if (sedeIdFiltro != null && sedeIdFiltro > 0) {
                
                ordenes = ordenRepository.findBySedeId(sedeIdFiltro);
            } else {
                
                ordenes = ordenRepository.findAll();
            }
        } else {

            ordenes = ordenRepository.findBySedeId(usuario.getSede().getId());
        }

        double totalIngresos = 0.0;
        double totalGastos = 0.0;

        for (OrdenServicio orden : ordenes) {
            if (orden.getValorFinalPagado() != null) totalIngresos += orden.getValorFinalPagado();
            if (orden.getGastosAsociados() != null) totalGastos += orden.getGastosAsociados();
        }
        
        double gananciaNeta = totalIngresos - totalGastos;

        Map<String, Long> metricasMarketing = ordenes.stream()
                .filter(o -> o.getOrigenVisita() != null)
                .collect(Collectors.groupingBy(OrdenServicio::getOrigenVisita, Collectors.counting()));

        return new DashboardResponse(totalIngresos, totalGastos, gananciaNeta, metricasMarketing);
    }
}