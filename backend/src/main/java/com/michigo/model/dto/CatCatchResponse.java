package com.michigo.model.dto;

import com.michigo.model.entity.CatCatch;
import com.michigo.model.enums.Rarity;
import java.time.LocalDateTime;

public class CatCatchResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userAvatar;
    private String imageUrl;
    private Double latitude;
    private Double longitude;
    private LocalDateTime capturedAt;
    private String michiName;
    private String coatPattern;
    private String personality;
    private Rarity rarity;
    private String rarityDisplayName;
    private String rarityColor;
    private String specialPower;
    private int xpEarned;

    public CatCatchResponse() {
    }

    public static CatCatchResponse fromEntity(CatCatch entity) {
        CatCatchResponse res = new CatCatchResponse();
        res.setId(entity.getId());
        if (entity.getUser() != null) {
            res.setUserId(entity.getUser().getId());
            res.setUserName(entity.getUser().getDisplayName());
            res.setUserAvatar(entity.getUser().getAvatarUrl());
        }
        res.setImageUrl(entity.getImageUrl());
        res.setLatitude(entity.getLatitude());
        res.setLongitude(entity.getLongitude());
        res.setCapturedAt(entity.getCapturedAt());
        res.setMichiName(entity.getMichiName());
        res.setCoatPattern(entity.getCoatPattern());
        res.setPersonality(entity.getPersonality());
        res.setRarity(entity.getRarity());
        res.setRarityDisplayName(entity.getRarity() != null ? entity.getRarity().getDisplayName() : "Común");
        res.setRarityColor(entity.getRarity() != null ? entity.getRarity().getColorHex() : "#10B981");
        res.setSpecialPower(entity.getSpecialPower());
        res.setXpEarned(entity.getRarity() != null ? entity.getRarity().getExperiencePoints() : 100);
        return res;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserAvatar() { return userAvatar; }
    public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public LocalDateTime getCapturedAt() { return capturedAt; }
    public void setCapturedAt(LocalDateTime capturedAt) { this.capturedAt = capturedAt; }

    public String getMichiName() { return michiName; }
    public void setMichiName(String michiName) { this.michiName = michiName; }

    public String getCoatPattern() { return coatPattern; }
    public void setCoatPattern(String coatPattern) { this.coatPattern = coatPattern; }

    public String getPersonality() { return personality; }
    public void setPersonality(String personality) { this.personality = personality; }

    public Rarity getRarity() { return rarity; }
    public void setRarity(Rarity rarity) { this.rarity = rarity; }

    public String getRarityDisplayName() { return rarityDisplayName; }
    public void setRarityDisplayName(String rarityDisplayName) { this.rarityDisplayName = rarityDisplayName; }

    public String getRarityColor() { return rarityColor; }
    public void setRarityColor(String rarityColor) { this.rarityColor = rarityColor; }

    public String getSpecialPower() { return specialPower; }
    public void setSpecialPower(String specialPower) { this.specialPower = specialPower; }

    public int getXpEarned() { return xpEarned; }
    public void setXpEarned(int xpEarned) { this.xpEarned = xpEarned; }
}
