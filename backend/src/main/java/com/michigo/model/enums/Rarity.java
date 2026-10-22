package com.michigo.model.enums;

public enum Rarity {
    COMUN("Común", "#10B981", 100),
    RARO("Raro", "#6366F1", 300),
    LEGENDARIO("Legendario", "#F59E0B", 1000);

    private final String displayName;
    private final String colorHex;
    private final int experiencePoints;

    Rarity(String displayName, String colorHex, int experiencePoints) {
        this.displayName = displayName;
        this.colorHex = colorHex;
        this.experiencePoints = experiencePoints;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getColorHex() {
        return colorHex;
    }

    public int getExperiencePoints() {
        return experiencePoints;
    }

    public static Rarity fromString(String text) {
        if (text == null) return COMUN;
        String clean = text.trim().toUpperCase();
        if (clean.contains("LEGEND") || clean.contains("LEGENDARIO")) {
            return LEGENDARIO;
        } else if (clean.contains("RARO") || clean.contains("RARE")) {
            return RARO;
        } else {
            return COMUN;
        }
    }
}
