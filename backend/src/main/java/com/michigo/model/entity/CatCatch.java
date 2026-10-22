package com.michigo.model.entity;

import com.michigo.model.enums.Rarity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cat_catches")
public class CatCatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Lob
    @Column(columnDefinition = "CLOB")
    private String imageUrl;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private LocalDateTime capturedAt = LocalDateTime.now();

    // Campos generados por Google Gemini AI
    @Column(nullable = false, length = 150)
    private String michiName;

    @Column(length = 150)
    private String coatPattern;

    @Column(length = 1000)
    private String personality;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rarity rarity = Rarity.COMUN;

    @Column(length = 150)
    private String specialPower;

    public CatCatch() {
    }

    public CatCatch(User user, String imageUrl, Double latitude, Double longitude,
                    String michiName, String coatPattern, String personality,
                    Rarity rarity, String specialPower) {
        this.user = user;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
        this.michiName = michiName;
        this.coatPattern = coatPattern;
        this.personality = personality;
        this.rarity = rarity != null ? rarity : Rarity.COMUN;
        this.specialPower = specialPower;
        this.capturedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public void setCapturedAt(LocalDateTime capturedAt) {
        this.capturedAt = capturedAt;
    }

    public String getMichiName() {
        return michiName;
    }

    public void setMichiName(String michiName) {
        this.michiName = michiName;
    }

    public String getCoatPattern() {
        return coatPattern;
    }

    public void setCoatPattern(String coatPattern) {
        this.coatPattern = coatPattern;
    }

    public String getPersonality() {
        return personality;
    }

    public void setPersonality(String personality) {
        this.personality = personality;
    }

    public Rarity getRarity() {
        return rarity;
    }

    public void setRarity(Rarity rarity) {
        this.rarity = rarity;
    }

    public String getSpecialPower() {
        return specialPower;
    }

    public void setSpecialPower(String specialPower) {
        this.specialPower = specialPower;
    }
}
