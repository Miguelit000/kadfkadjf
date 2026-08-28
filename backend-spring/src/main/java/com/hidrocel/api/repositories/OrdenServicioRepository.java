package com.hidrocel.api.repositories;

import com.hidrocel.api.models.OrdenServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrdenServicioRepository extends JpaRepository<OrdenServicio, Long> {

    List<OrdenServicio> findBySedeId(Long sedeId);

    List<OrdenServicio> findByVehiculoPlacaOrClienteDocumentoIdentidad(String placa, String documento);
}