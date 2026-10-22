package com.michigo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.michigo.model.dto.GeminiCatAnalysisResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-1.5-flash}")
    private String modelName;

    @Value("${gemini.api.baseUrl:https://generativelanguage.googleapis.com/v1beta/models}")
    private String baseUrl;

    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    /**
     * Analiza una fotografía de gato utilizando Google Gemini API
     * @param imageBase64 Imagen en formato Base64 (con o sin encabezado data:image/...)
     * @return GeminiCatAnalysisResponse con el nombre gracioso, patrón de color, personalidad y rareza.
     */
    public GeminiCatAnalysisResponse analyzeCatImage(String imageBase64) {
        // Si no hay API Key configurada o es vacía, usamos el generador de simulación para desarrollo ágil
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("DEMO_KEY")) {
            logger.warn("⚠️ No se ha detectado GEMINI_API_KEY. Generando análisis de simulación de MichiGO...");
            return generateMockAnalysis();
        }

        try {
            // Extraer tipo MIME y limpiar base64 puro
            String mimeType = "image/jpeg";
            String cleanBase64 = imageBase64;

            if (imageBase64.contains(",")) {
                String[] parts = imageBase64.split(",", 2);
                cleanBase64 = parts[1];
                if (parts[0].contains("image/png")) {
                    mimeType = "image/png";
                } else if (parts[0].contains("image/webp")) {
                    mimeType = "image/webp";
                }
            }

            // Construcción del Payload para Gemini API 1.5/2.0
            String promptText = """
                Actúa como el sabio juez felino y Pokédex de gatos de MichiGO.
                Analiza con atención la foto de este gato callejero ("michi") y genera un análisis con humor en formato JSON.
                
                Debes responder con los siguientes campos exactos:
                - michiName: Nombre gracioso, cariñoso o épico basado en su aspecto (ej: "Don Bigotes de la Mancha", "Señor Naranjo el Caótico", "Michi Cósmico Ojos de Jade").
                - coatPattern: Patrón y color del pelaje (ej: "Atigrado Naranja de Barrio", "Tuxedo de Gala", "Carey Místico", "Pelusa Albina").
                - personality: Descripción cómica y certera de su personalidad según la expresión de su cara y actitud (máximo 2 oraciones).
                - rarity: Nivel de rareza entre: "Común", "Raro", "Legendario" (usa "Legendario" si tiene ojos heterocromáticos, expresión épica o pelaje único; "Raro" si es elegante o misterioso; "Común" si es un clásico michi de barrio).
                - specialPower: Nombre de un poder o habilidad cómica (ej: "Mirada de Desdén Absoluto", "Maullido a las 3:00 AM", "Paralización por Ronroneo").
                """;

            Map<String, Object> textPart = Map.of("text", promptText);
            Map<String, Object> inlineData = Map.of(
                    "mime_type", mimeType,
                    "data", cleanBase64
            );
            Map<String, Object> imagePart = Map.of("inline_data", inlineData);

            Map<String, Object> content = Map.of("parts", List.of(textPart, imagePart));
            Map<String, Object> generationConfig = Map.of(
                    "response_mime_type", "application/json",
                    "temperature", 0.7
            );

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(content),
                    "generationConfig", generationConfig
            );

            String url = String.format("%s/%s:generateContent?key=%s", baseUrl, modelName, apiKey);

            String responseString = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            return parseGeminiResponse(responseString);

        } catch (Exception e) {
            logger.error("Error al comunicarse con Google Gemini API: {}", e.getMessage(), e);
            // Retornamos fallback gracioso para no romper la experiencia del usuario
            return generateMockAnalysis();
        }
    }

    private GeminiCatAnalysisResponse parseGeminiResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode textNode = root.path("candidates")
                    .get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");

            String rawJsonText = textNode.asText();
            // Limpieza en caso de que Gemini añada delimitadores ```json
            if (rawJsonText.startsWith("```json")) {
                rawJsonText = rawJsonText.substring(7);
            } else if (rawJsonText.startsWith("```")) {
                rawJsonText = rawJsonText.substring(3);
            }
            if (rawJsonText.endsWith("```")) {
                rawJsonText = rawJsonText.substring(0, rawJsonText.length() - 3);
            }

            return objectMapper.readValue(rawJsonText.trim(), GeminiCatAnalysisResponse.class);
        } catch (Exception e) {
            logger.error("Error al parsear el JSON devuelto por Gemini: {}", e.getMessage());
            return generateMockAnalysis();
        }
    }

    /**
     * Fallback mock para pruebas locales sin consumir cuota de Gemini
     */
    public GeminiCatAnalysisResponse generateMockAnalysis() {
        List<GeminiCatAnalysisResponse> pool = List.of(
                new GeminiCatAnalysisResponse(
                        "Don Bigotes de la Mancha",
                        "Tuxedo Elegante con Pajarita",
                        "Juzga en silencio tus decisiones de vida mientras exige su sobrecito de comida gourmet.",
                        "Raro",
                        "Mirada de Desdén Aristocrático"
                ),
                new GeminiCatAnalysisResponse(
                        "Señor Naranjo el Caótico",
                        "Atigrado Naranja Intenso",
                        "Posee una sola neurona compartida con todos los gatos naranjas del planeta. Corre a 100 km/h sin motivo.",
                        "Común",
                        "Derrape Nocturno en Pasillos"
                ),
                new GeminiCatAnalysisResponse(
                        "Michi Cósmico Ojos de Jade",
                        "Carey Galáctico Tricolor",
                        "Guardián de secretos ancestrales y portales interdimensionales ocultos detrás del refrigerador.",
                        "Legendario",
                        "Ronroneo Hipnótico Dimensional"
                ),
                new GeminiCatAnalysisResponse(
                        "Panterita Sombría",
                        "Negro Ébano Mate",
                        "Se vuelve 100% invisible en la oscuridad, excepto por dos ojitos dorados que te observan con amor.",
                        "Raro",
                        "Sigilo Ninja Nocturno"
                ),
                new GeminiCatAnalysisResponse(
                        "Margarita Patitas Blancas",
                        "Calicó de la Suerte",
                        "Dormilona profesional nivel experto. Otorga +50 de buena suerte a quien le rasque la barbilla.",
                        "Legendario",
                        "Siesta Restauradora Infinita"
                )
        );

        int index = new Random().nextInt(pool.size());
        return pool.get(index);
    }
}
