package com.michigo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.util.List;

@SpringBootApplication
public class MichiGoApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(MichiGoApplication.class, args);
        System.out.println("==================================================");
        System.out.println("🐾 MichiGO Backend iniciado con éxito en http://localhost:8080");
        System.out.println("🐾 Consola H2 disponible en http://localhost:8080/h2-console");
        System.out.println("==================================================");
    }

    /**
     * Carga automáticamente variables de entorno desde el archivo .env si existe
     */
    private static void loadDotEnv() {
        List<String> possiblePaths = List.of(".env", "../.env", "backend/.env");
        for (String path : possiblePaths) {
            File envFile = new File(path);
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }
                        }
                    }
                    System.out.println("🌱 Archivo .env cargado con éxito desde: " + envFile.getAbsolutePath());
                    return;
                } catch (Exception e) {
                    System.err.println("No se pudo leer archivo .env: " + e.getMessage());
                }
            }
        }
    }
}
