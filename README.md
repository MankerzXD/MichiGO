# 🐾 MichiGO — PWA de Descubrimiento de Gatos Callejeros con IA

<div align="center">
  <img src="./frontend/assets/icons/favicon.svg" alt="MichiGO Logo" width="100"/>
  <p><strong>Descubre, fotografía y cataloga michis callejeros en el mundo real al estilo Pokémon GO, impulsado por Google Gemini Vision AI.</strong></p>
</div>

---

## 🚀 Arquitectura General del Proyecto

MichiGO está diseñado con una arquitectura desacoplada y moderna, lista para producción y optimizada para dispositivos móviles (iOS / Safari y Android):

```
MichiGO/
├── backend/                              # Backend REST API con Spring Boot 3
│   ├── pom.xml                           # Dependencias Maven (Web, JPA, H2, Validation)
│   └── src/
│       └── main/
│           ├── java/com/michigo/
│           │   ├── MichiGoApplication.java
│           │   ├── config/               # CORS, DataInitializer (seeds)
│           │   ├── controller/           # CatController & UserController
│           │   ├── model/
│           │   │   ├── dto/              # DTOs de transferencia y respuesta Gemini
│           │   │   ├── entity/           # Entidades JPA (User, CatCatch)
│           │   │   └── enums/            # Rarity (COMUN, RARO, LEGENDARIO)
│           │   ├── repository/           # Spring Data JPA Repositories
│           │   └── service/              # GeminiService (Google AI) & CatCatchService
│           └── resources/
│               ├── application.yml       # Configuración H2, límites de subida y Gemini
│               └── static/               # Bundle sincronizado de la PWA
│
└── frontend/                             # PWA Móvil estilo Pokémon GO
    ├── index.html                        # Vista principal, Leaflet HUD y cámara trasera
    ├── manifest.json                     # Manifiesto PWA para instalación standalone (iOS/Android)
    ├── sw.js                             # Service Worker con caché offline
    ├── css/
    │   └── style.css                     # Diseño Cyber-Kawaii con Glassmorphism y temas oscuros
    ├── js/
    │   ├── api.js                        # Cliente REST y fallback inteligente
    │   ├── camera.js                     # Captura con cámara trasera y compresión
    │   ├── michidex.js                   # Pantalla de perfil, insignias y Michidex
    │   └── app.js                        # Control del ciclo de vida PWA, GPS y mapa Leaflet
    └── assets/                           # Iconos PWA y pines del mapa
```

---

## 🛠️ Tecnologías Utilizadas

- **Backend**: Java 17+, Spring Boot 3.3.4, Spring Data JPA, Spring RestClient.
- **Base de Datos**: H2 en memoria (configurada para desarrollo rápido sin dependencias externas) y compatible con PostgreSQL/MySQL.
- **Inteligencia Artificial**: Google Gemini API (`gemini-1.5-flash` con salida estructurada JSON).
- **Frontend / PWA**: HTML5 semántico, CSS3 Vanilla (Glassmorphism, animaciones fluidas, safe-areas de iOS), JavaScript ES6+.
- **Mapas & GPS**: Leaflet.js con CartoDB Voyager tiles y `navigator.geolocation` en tiempo real.

---

## ⚡ Guía de Inicio Rápido

### 1. Configurar la clave de Google Gemini API
Obtén tu clave gratuita en [Google AI Studio](https://aistudio.google.com/). Puedes pasarla como variable de entorno:

**En Windows (PowerShell):**
```powershell
$env:GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
```

*(Nota: Si no configuras la clave de inmediato, el sistema incluye un generador mock humorístico para que puedas probar la cámara, el mapa y las animaciones sin que la app falle).*

### 2. Ejecutar el Backend (Spring Boot)
Ubícate en la carpeta `backend`:
```bash
cd backend
mvn spring-boot:run
```
El servidor arrancará en `http://localhost:8080`.
- **Consola de Base de Datos H2**: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:michigodb`
  - Usuario: `sa`
  - Contraseña: *(vacía)*

### 3. Ejecutar o Previsualizar la PWA Frontend
El backend ya sirve la PWA directamente en `http://localhost:8080/`.

Si prefieres desarrollar el frontend por separado con recarga rápida:
```bash
# Con Python:
cd frontend
python -m http.server 3000

# O con Node/NPX:
npx serve frontend
```

---

## 📱 Instalación en iPhone (Safari) y Android
1. Abre la URL en el navegador de tu celular (por ejemplo conectando tu celular a la misma red WiFi e ingresando la IP local de tu PC `http://192.168.x.x:8080`).
2. En **iOS (Safari)**: Pulsa el botón **Compartir** (icono con flecha hacia arriba) y selecciona **"Añadir a pantalla de inicio"**.
3. En **Android (Chrome)**: Pulsa los 3 puntos y selecciona **"Instalar aplicación"**.

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| `POST` | `/api/cats/catch` | Registra captura enviando `{ userId, latitude, longitude, imageBase64 }`. Analiza con Gemini y guarda. |
| `POST` | `/api/cats/catch/upload` | Alternativa Multipart/form-data para subida directa de archivos binarios. |
| `GET` | `/api/cats` | Retorna todos los michis capturados para renderizar pines en el mapa. |
| `GET` | `/api/cats/user/{userId}` | Retorna los michis capturados por un usuario específico. |
| `GET` | `/api/users/{userId}/profile` | Retorna estadísticas del entrenador, nivel, XP, medallas y capturas recientes. |
| `GET` | `/api/users/current/profile` | Retorna el perfil del usuario activo (por defecto ID 1). |

---

## 🏆 Sistema de Medallas / Insignias
- 🐾 **Primer Ronroneo**: Fotografió a su primer michi callejero.
- 💎 **Cazador Exclusivo**: Descubrió al menos un michi de rareza Rara.
- 👑 **Bendición Mística**: Encontró un Michi Legendario en el mundo real.
- ⭐ **Maestro Michi**: Registró 5 o más michis en su Michidex.
