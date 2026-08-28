package com.hidrocel.api.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ordenes_servicio")
public class OrdenServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sede_id", nullable = false)
    private Sede sede;

    @ManyToOne
    @JoinColumn(name = "vehiculo_placa", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    private String servicioNombre;
    private Double valorFinalPagado;
    private Double gastosAsociados;
    private String tipoPago; 

    @Column(name = "url_foto_medidor")
    private String urlFotoMedidor;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    @Column(name = "origen_visita")
    private String origenVisita; 

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Sede getSede() {
        return sede;
    }

    public void setSede(Sede sede) {
        this.sede = sede;
    }

    public Vehiculo getVehiculo() {
        return vehiculo;
    }

    public void setVehiculo(Vehiculo vehiculo) {
        this.vehiculo = vehiculo;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public String getServicioNombre() {
        return servicioNombre;
    }

    public void setServicioNombre(String servicioNombre) {
        this.servicioNombre = servicioNombre;
    }

    public Double getValorFinalPagado() {
        return valorFinalPagado;
    }

    public void setValorFinalPagado(Double valorFinalPagado) {
        this.valorFinalPagado = valorFinalPagado;
    }

    public Double getGastosAsociados() {
        return gastosAsociados;
    }

    public void setGastosAsociados(Double gastosAsociados) {
        this.gastosAsociados = gastosAsociados;
    }

    public String getTipoPago() {
        return tipoPago;
    }

    public void setTipoPago(String tipoPago) {
        this.tipoPago = tipoPago;
    }

    public String getUrlFotoMedidor() {
        return urlFotoMedidor;
    }

    public void setUrlFotoMedidor(String urlFotoMedidor) {
        this.urlFotoMedidor = urlFotoMedidor;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }

    public String getOrigenVisita() {
        return origenVisita;
    }

    public void setOrigenVisita(String origenVisita) {
        this.origenVisita = origenVisita;
    }
}