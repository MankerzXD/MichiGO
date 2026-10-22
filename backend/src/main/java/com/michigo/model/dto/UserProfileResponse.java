package com.michigo.model.dto;

import java.util.ArrayList;
import java.util.List;

public class UserProfileResponse {

    private Long id;
    private String username;
    private String displayName;
    private String avatarUrl;
    private String bio;
    private int level;
    private int experience;
    private int experienceToNextLevel;
    private int totalCatches;
    private int commonCatches;
    private int rareCatches;
    private int legendaryCatches;
    private List<BadgeDTO> badges = new ArrayList<>();
    private List<CatCatchResponse> recentCatches = new ArrayList<>();

    public static class BadgeDTO {
        private String id;
        private String name;
        private String description;
        private String icon;
        private boolean unlocked;

        public BadgeDTO() {}

        public BadgeDTO(String id, String name, String description, String icon, boolean unlocked) {
            this.id = id;
            this.name = name;
            this.description = description;
            this.icon = icon;
            this.unlocked = unlocked;
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getIcon() { return icon; }
        public void setIcon(String icon) { this.icon = icon; }
        public boolean isUnlocked() { return unlocked; }
        public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }
    }

    public UserProfileResponse() {
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getExperience() { return experience; }
    public void setExperience(int experience) { this.experience = experience; }

    public int getExperienceToNextLevel() { return experienceToNextLevel; }
    public void setExperienceToNextLevel(int experienceToNextLevel) { this.experienceToNextLevel = experienceToNextLevel; }

    public int getTotalCatches() { return totalCatches; }
    public void setTotalCatches(int totalCatches) { this.totalCatches = totalCatches; }

    public int getCommonCatches() { return commonCatches; }
    public void setCommonCatches(int commonCatches) { this.commonCatches = commonCatches; }

    public int getRareCatches() { return rareCatches; }
    public void setRareCatches(int rareCatches) { this.rareCatches = rareCatches; }

    public int getLegendaryCatches() { return legendaryCatches; }
    public void setLegendaryCatches(int legendaryCatches) { this.legendaryCatches = legendaryCatches; }

    public List<BadgeDTO> getBadges() { return badges; }
    public void setBadges(List<BadgeDTO> badges) { this.badges = badges; }

    public List<CatCatchResponse> getRecentCatches() { return recentCatches; }
    public void setRecentCatches(List<CatCatchResponse> recentCatches) { this.recentCatches = recentCatches; }
}
