package com.hidrocel.api.dtos;

public record OrdenServicioRequest(
        String vehiculoPlaca,
        String vehiculoTipo,
        String vehiculoMarca,
        String vehiculoLinea,
        Integer vehiculoAnio,
        String clienteDocumento,
        String clienteNombre,
        String clienteTelefono,
        String servicioNombre,
        Double valorFinalPagado,
        Double gastosAsociados,
        String tipoPago,
        String urlFotoMedidor,
        String origenVisita
) {}