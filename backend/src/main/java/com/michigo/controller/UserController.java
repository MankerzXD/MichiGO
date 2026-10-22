package com.michigo.controller;

import com.michigo.model.dto.UserProfileResponse;
import com.michigo.service.CatCatchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final CatCatchService catCatchService;

    public UserController(CatCatchService catCatchService) {
        this.catCatchService = catCatchService;
    }

    /**
     * Obtiene el perfil completo del usuario, nivel, experiencia, insignias y capturas recientes
     */
    @GetMapping("/{userId}/profile")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(catCatchService.getUserProfile(userId));
    }

    /**
     * Endpoint por defecto para el usuario activo de la demo/PWA
     */
    @GetMapping("/current/profile")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
        return ResponseEntity.ok(catCatchService.getUserProfile(1L));
    }
}
