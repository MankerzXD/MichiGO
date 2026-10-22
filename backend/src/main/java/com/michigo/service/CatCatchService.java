package com.michigo.service;

import com.michigo.model.dto.CatCatchRequest;
import com.michigo.model.dto.CatCatchResponse;
import com.michigo.model.dto.GeminiCatAnalysisResponse;
import com.michigo.model.dto.UserProfileResponse;
import com.michigo.model.entity.CatCatch;
import com.michigo.model.entity.User;
import com.michigo.model.enums.Rarity;
import com.michigo.repository.CatCatchRepository;
import com.michigo.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CatCatchService {

    private final CatCatchRepository catCatchRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    public CatCatchService(CatCatchRepository catCatchRepository,
                           UserRepository userRepository,
                           GeminiService geminiService) {
        this.catCatchRepository = catCatchRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
    }

    @Transactional
    public CatCatchResponse registerCatCatch(CatCatchRequest request) {
        // Buscar el usuario o asociar al usuario predeterminado de MichiGO
        User user = userRepository.findById(request.getUserId())
                .orElseGet(() -> {
                    // Si el usuario no existe, creamos el Entrenador Michi inicial
                    User newUser = new User("michimaster", "Entrenador Michi",
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
                            "Explorador de callejones y amigo de todos los felinos.");
                    return userRepository.save(newUser);
                });

        // 1. Análisis con Inteligencia Artificial Gemini
        GeminiCatAnalysisResponse analysis = geminiService.analyzeCatImage(request.getImageBase64());

        Rarity rarity = Rarity.fromString(analysis.getRarity());

        // 2. Persistencia del Michi capturado
        CatCatch catCatch = new CatCatch(
                user,
                request.getImageBase64(),
                request.getLatitude(),
                request.getLongitude(),
                analysis.getMichiName(),
                analysis.getCoatPattern(),
                analysis.getPersonality(),
                rarity,
                analysis.getSpecialPower()
        );

        CatCatch savedCatch = catCatchRepository.save(catCatch);

        // 3. Subir experiencia al usuario
        user.addExperience(rarity.getExperiencePoints());
        userRepository.save(user);

        return CatCatchResponse.fromEntity(savedCatch);
    }

    public List<CatCatchResponse> getAllCatches() {
        return catCatchRepository.findAllByOrderByCapturedAtDesc()
                .stream()
                .map(CatCatchResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<CatCatchResponse> getCatchesByUserId(Long userId) {
        return catCatchRepository.findByUserIdOrderByCapturedAtDesc(userId)
                .stream()
                .map(CatCatchResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public UserProfileResponse getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + userId));

        List<CatCatch> userCatches = catCatchRepository.findByUserIdOrderByCapturedAtDesc(userId);

        long commonCount = userCatches.stream().filter(c -> c.getRarity() == Rarity.COMUN).count();
        long rareCount = userCatches.stream().filter(c -> c.getRarity() == Rarity.RARO).count();
        long legendaryCount = userCatches.stream().filter(c -> c.getRarity() == Rarity.LEGENDARIO).count();

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setDisplayName(user.getDisplayName());
        response.setAvatarUrl(user.getAvatarUrl());
        response.setBio(user.getBio());
        response.setLevel(user.getLevel());
        response.setExperience(user.getExperience());
        
        int xpInCurrentLevel = user.getExperience() % 500;
        response.setExperienceToNextLevel(500 - xpInCurrentLevel);
        
        response.setTotalCatches(userCatches.size());
        response.setCommonCatches((int) commonCount);
        response.setRareCatches((int) rareCount);
        response.setLegendaryCatches((int) legendaryCount);

        // Calcular Insignias
        List<UserProfileResponse.BadgeDTO> badges = new ArrayList<>();
        badges.add(new UserProfileResponse.BadgeDTO(
                "badge-first",
                "Primer Ronroneo",
                "Fotografió a su primer michi callejero.",
                "🐾",
                !userCatches.isEmpty()
        ));
        badges.add(new UserProfileResponse.BadgeDTO(
                "badge-rare",
                "Cazador Exclusivo",
                "Descubrió al menos un michi de rareza Rara.",
                "💎",
                rareCount > 0
        ));
        badges.add(new UserProfileResponse.BadgeDTO(
                "badge-legendary",
                "Bendición Mística",
                "Encontró un Michi Legendario en el mundo real.",
                "👑",
                legendaryCount > 0
        ));
        badges.add(new UserProfileResponse.BadgeDTO(
                "badge-collector",
                "Maestro Michi",
                "Registró 5 o más michis en su Michidex.",
                "⭐",
                userCatches.size() >= 5
        ));

        response.setBadges(badges);
        response.setRecentCatches(userCatches.stream().map(CatCatchResponse::fromEntity).collect(Collectors.toList()));

        return response;
    }
}
