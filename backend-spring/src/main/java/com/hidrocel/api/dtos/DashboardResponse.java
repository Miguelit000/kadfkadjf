package com.hidrocel.api.dtos;

import java.util.Map;

public record DashboardResponse(
        Double totalIngresos,
        Double totalGastos,
        Double gananciaNeta,
        Map<String, Long> metricasMarketing // Ej: {"Instagram": 12, "Recomendación": 5}
) {}