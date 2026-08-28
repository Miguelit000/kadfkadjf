package com.hidrocel.api.models;

import jakarta.persistence.*;

@Entity
@Table(name = "sedes")
public class Sede {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String nombre;
    private String ciudad;
    private String direccion;

    @Column(name = "url_calendario", length = 500)
    private String urlCalendario; // <-- NUEVO CAMPO

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getUrlCalendario() { return urlCalendario; }
    public void setUrlCalendario(String urlCalendario) { this.urlCalendario = urlCalendario; }
}