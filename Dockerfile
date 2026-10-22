# ==========================================================
# MichiGO - Dockerfile Optimizado para Google Cloud Run
# ==========================================================

# --- Etapa 1: Compilación del Backend y PWA ---
FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /workspace

# 1. Copiar configuración Maven y cachear dependencias
COPY backend/pom.xml backend/pom.xml
RUN cd backend && mvn dependency:go-offline -B

# 2. Copiar código fuente de Spring Boot
COPY backend/src backend/src

# 3. Sincronizar el frontend PWA en la carpeta static de Spring Boot
COPY frontend/ backend/src/main/resources/static/

# 4. Compilar el JAR final ejecutable (incluye la PWA y la API REST)
RUN cd backend && mvn clean package -DskipTests

# --- Etapa 2: Imagen Ligera de Producción (Runtime JRE) ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Buenas prácticas de seguridad para Cloud Run: usuario no root
RUN addgroup -S michigroup && adduser -S michiuser -G michigroup
USER michiuser

# Copiar el artefacto JAR optimizado
COPY --from=builder --chown=michiuser:michigroup /workspace/backend/target/*.jar /app/michigo.jar

# Google Cloud Run inyecta la variable de entorno PORT (por defecto 8080)
ENV PORT=8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

# Inicio de la aplicación escuchando en el puerto dinámico de Cloud Run
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Dserver.port=${PORT} -jar /app/michigo.jar"]
