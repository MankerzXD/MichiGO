package com.michigo.controller;

import com.michigo.model.dto.CatCatchRequest;
import com.michigo.model.dto.CatCatchResponse;
import com.michigo.service.CatCatchService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/cats")
@CrossOrigin(origins = "*")
public class CatController {

    private final CatCatchService catCatchService;

    public CatController(CatCatchService catCatchService) {
        this.catCatchService = catCatchService;
    }

    /**
     * Endpoint para registrar un nuevo michi mediante JSON (con imagen en Base64)
     */
    @PostMapping(value = "/catch", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CatCatchResponse> catchCatJson(@Valid @RequestBody CatCatchRequest request) {
        CatCatchResponse response = catCatchService.registerCatCatch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Endpoint alternativo para registrar un nuevo michi mediante Multipart/form-data
     * (Ideal para clientes móviles y formularios tradicionales con cámara)
     */
    @PostMapping(value = "/catch/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CatCatchResponse> catchCatMultipart(
            @RequestParam("image") MultipartFile imageFile,
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "userId", defaultValue = "1") Long userId) throws IOException {

        String base64Image = "data:" + imageFile.getContentType() + ";base64," + 
                Base64.getEncoder().encodeToString(imageFile.getBytes());

        CatCatchRequest request = new CatCatchRequest(userId, latitude, longitude, base64Image);
        CatCatchResponse response = catCatchService.registerCatCatch(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Obtiene todos los michis capturados para renderizarlos en el mapa interactivo de Leaflet
     */
    @GetMapping
    public ResponseEntity<List<CatCatchResponse>> getAllCatches() {
        return ResponseEntity.ok(catCatchService.getAllCatches());
    }

    /**
     * Obtiene los michis capturados por un usuario específico para su Michidex
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CatCatchResponse>> getCatchesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(catCatchService.getCatchesByUserId(userId));
    }
}
