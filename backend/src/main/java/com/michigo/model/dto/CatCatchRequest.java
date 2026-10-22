package com.michigo.model.dto;

import jakarta.validation.constraints.NotNull;

public class CatCatchRequest {

    @NotNull(message = "El ID del usuario es obligatorio")
    private Long userId;

    @NotNull(message = "La latitud GPS es obligatoria")
    private Double latitude;

    @NotNull(message = "La longitud GPS es obligatoria")
    private Double longitude;

    private String imageBase64;

    public CatCatchRequest() {
    }

    public CatCatchRequest(Long userId, Double latitude, Double longitude, String imageBase64) {
        this.userId = userId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.imageBase64 = imageBase64;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }
}
