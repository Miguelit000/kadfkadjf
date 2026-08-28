package com.hidrocel.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "clientes")
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String documentoIdentidad;

    private String telefono;
    private String nombreCompleto;
    
    @Column(name = "fuente_adquisicion")
    private String fuenteAdquisicion; 

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDocumentoIdentidad() {
        return documentoIdentidad;
    }

    public void setDocumentoIdentidad(String documentoIdentidad) {
        this.documentoIdentidad = documentoIdentidad;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getFuenteAdquisicion() {
        return fuenteAdquisicion;
    }

    public void setFuenteAdquisicion(String fuenteAdquisicion) {
        this.fuenteAdquisicion = fuenteAdquisicion;
    }
}