package com.michigo.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiCatAnalysisResponse {

    @JsonProperty("michiName")
    private String michiName;

    @JsonProperty("coatPattern")
    private String coatPattern;

    @JsonProperty("personality")
    private String personality;

    @JsonProperty("rarity")
    private String rarity;

    @JsonProperty("specialPower")
    private String specialPower;

    public GeminiCatAnalysisResponse() {
    }

    public GeminiCatAnalysisResponse(String michiName, String coatPattern, String personality, String rarity, String specialPower) {
        this.michiName = michiName;
        this.coatPattern = coatPattern;
        this.personality = personality;
        this.rarity = rarity;
        this.specialPower = specialPower;
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

    public String getRarity() {
        return rarity;
    }

    public void setRarity(String rarity) {
        this.rarity = rarity;
    }

    public String getSpecialPower() {
        return specialPower;
    }

    public void setSpecialPower(String specialPower) {
        this.specialPower = specialPower;
    }
}
