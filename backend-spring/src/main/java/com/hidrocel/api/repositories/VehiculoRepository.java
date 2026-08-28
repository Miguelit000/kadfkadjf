package com.hidrocel.api.repositories;

import com.hidrocel.api.models.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;


public interface VehiculoRepository extends JpaRepository<Vehiculo, String> {
    // Nota: Aquí usamos String porque la llave primaria es la placa del vehículo
}