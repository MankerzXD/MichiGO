# 🐾 MichiGO — Guía Integral de Arquitectura, Código Java y Defensa para Examen Final

> **Documento de apoyo técnico y libreto de presentación académica**  
> **Proyecto:** MichiGO (PWA + Spring Boot + Google Gemini Vision AI + Leaflet.js)  
> **Autor:** Manuel J. Sanchez  

---

## 📑 Tabla de Contenidos
1. [Resumen Ejecutivo y Pitch del Proyecto](#1-resumen-ejecutivo-y-pitch-del-proyecto)
2. [Arquitectura General y Flujo de Datos](#2-arquitectura-general-y-flujo-de-datos)
3. [Desglose Archivo por Archivo: Todos los `.java`](#3-desglose-archivo-por-archivo-todos-los-java)
   - [3.1 Arranque y Configuración](#31-arranque-y-configuración)
   - [3.2 Capa de Controladores (REST API)](#32-capa-de-controladores-rest-api)
   - [3.3 Capa de Servicios y Lógica de Negocio](#33-capa-de-servicios-y-lógica-de-negocio)
   - [3.4 Capa de Modelo: Entidades, DTOs y Enums](#34-capa-de-modelo-entidades-dtos-y-enums)
   - [3.5 Capa de Persistencia: Repositorios JPA](#35-capa-de-persistencia-repositorios-jpa)
4. [Justificación de Decisiones Técnicas (Preguntas de Examen)](#4-justificación-de-decisiones-técnicas-preguntas-de-examen)
5. [Guión Sugerido para la Exposición Oral (Paso a Paso)](#5-guión-sugerido-para-la-exposición-oral-paso-a-paso)

---

## 1. Resumen Ejecutivo y Pitch del Proyecto

### ¿Qué es MichiGO?
**MichiGO** es una Progressive Web App (PWA) móvil inspirada en la dinámica de exploración geolocalizada de *Pokémon GO*, pero orientada al descubrimiento, fotografía, catalogación y gamificación de **gatos callejeros reales ("michis")**, utilizando **Inteligencia Artificial Multimodal (Google Gemini Vision AI)**.

### Propuesta de Valor y Funcionalidades Principales
1. **Detección y Clasificación con IA**: El usuario toma una foto con la cámara trasera de su celular. Google Gemini Vision analiza el pelaje, los ojos y la expresión facial del gato para clasificar su patrón de color, redactar una descripción cómica de su personalidad, asignar un nivel de rareza (*Común, Raro, Legendario*) y otorgar una habilidad cómica especial.
2. **Geolocalización en Tiempo Real**: Las coordenadas GPS exactas se registran automáticamente y se proyectan en un mapa interactivo con pines vivos que muestran la foto del michi y un aura resplandeciente según su rareza.
3. **Modo Día / Noche Automático**: El mapa detecta la hora local y cambia de forma dinámica y fluida entre un mapa diurno vivo y un mapa nocturno minimalista oscuro.
4. **Gamificación y Michidex**: El usuario acumula puntos de experiencia (XP), sube de nivel de entrenador y desbloquea insignias a medida que completa su registro felino.
5. **Arquitectura Serverless y Despliegue en Cloud Run**: Contenedor Docker multi-etapa listo para producción que empaqueta backend y frontend con HTTPS automático.

---

## 2. Arquitectura General y Flujo de Datos

El sistema sigue una **arquitectura en capas desacoplada** bajo el patrón Modelo-Vista-Controlador (MVC) adaptado a servicios RESTful:

```
[ Celular / PWA ] 
      │  (1) Envía Foto Base64 + Lat/Lng GPS vía HTTP POST
      ▼
[ CatController.java ]  ─── Capa REST (Presentación)
      │  (2) Valida datos y delega
      ▼
[ CatCatchService.java ] ── Capa de Servicio (Lógica de Negocio y Transacciones)
      │
      ├─────► [ GeminiService.java ] ───► [ Google Gemini Vision AI API ]
      │             (3) Prompt multimodal       (4) Devuelve JSON estructurado
      │
      ├─────► [ User.java ] ────────────► Calcula XP y Nivel de Entrenador
      │
      ├─────► [ CatCatchRepository ] ───► [ Base de Datos H2 / Relacional ]
      │             (5) Persiste la captura
      ▼
[ CatCatchResponse.java ] ── Capa DTO
      │  (6) Retorna respuesta JSON tipada
      ▼
[ Frontend PWA: Leaflet + Confetti ]
         (7) Dibuja el Pin con foto y aura + actualiza la Michidex
```

---

## 3. Desglose Archivo por Archivo: Todos los `.java`

### 3.1 Arranque y Configuración

#### 📄 `MichiGoApplication.java`
- **Ubicación:** `backend/src/main/java/com/michigo/MichiGoApplication.java`
- **Rol:** Clase principal de arranque de Spring Boot (`public static void main`).
- **Anotaciones:**
  - `@SpringBootApplication`: Meta-anotación que engloba `@Configuration`, `@EnableAutoConfiguration` y `@ComponentScan` para escanear componentes en el paquete `com.michigo`.
- **Lógica Destacada (`loadDotEnv`):**
  Implementa un cargador nativo de archivos `.env`. Antes de que el contenedor de Spring se inicialice, busca `.env` en la raíz o en `backend/` e inyecta las variables (como `GEMINI_API_KEY`) directamente en `System.setProperty()`. Esto permite ejecutar el proyecto en cualquier IDE sin necesidad de configurar variables de entorno en la consola del sistema operativo.
- **💡 Pregunta de Examen:** *¿Por qué cargan el `.env` antes del `SpringApplication.run()`?*  
  *Respuesta:* Porque Spring Boot necesita resolver los placeholders como `${GEMINI_API_KEY}` en `application.yml` durante la construcción inicial del contexto de beans.

---

#### 📄 `CorsConfig.java`
- **Ubicación:** `backend/src/main/java/com/michigo/config/CorsConfig.java`
- **Rol:** Configuración de CORS (Cross-Origin Resource Sharing).
- **Anotaciones:**
  - `@Configuration`: Marca la clase como fuente de definiciones de beans para el contexto de Spring.
  - `@Bean`: Expone un `WebMvcConfigurer` administrado por Spring.
- **Lógica Destacada:**
  Permite peticiones HTTP (`GET`, `POST`, `OPTIONS`, etc.) desde clientes externos, como el frontend de desarrollo corriendo en `http://localhost:3000` o celulares conectados en la red local WiFi.

---

#### 📄 `DataInitializer.java`
- **Ubicación:** `backend/src/main/java/com/michigo/config/DataInitializer.java`
- **Rol:** Semilla de datos (*Database Seeder*) para pruebas iniciales.
- **Anotaciones:**
  - `@Component`: Componente gestionado por Spring.
  - Implementa `CommandLineRunner`: Interfaz de Spring Boot cuyo método `run()` se ejecuta automáticamente una vez que el contexto de la aplicación ha levantado por completo.
- **Lógica Destacada:**
  Comprueba si la base de datos está vacía. Si no hay usuarios, crea automáticamente al usuario demo `michimaster` con Nivel 3 y 3 michis de prueba de diferentes rarezas (*Don Bigotes*, *Señor Naranjo*, *Michi Cósmico*) con coordenadas geográficas reales, garantizando que el mapa nunca se vea desierto al iniciar.

---

### 3.2 Capa de Controladores (REST API)

#### 📄 `CatController.java`
- **Ubicación:** `backend/src/main/java/com/michigo/controller/CatController.java`
- **Rol:** Expone la interfaz HTTP/REST para el registro y consulta de michis.
- **Anotaciones:**
  - `@RestController`: Combina `@Controller` y `@ResponseBody`. Hace que las respuestas se serialicen automáticamente a JSON.
  - `@RequestMapping("/api/cats")`: Enruta todas las peticiones con prefijo `/api/cats`.
  - `@CrossOrigin(origins = "*")`: Permite invocaciones desde navegadores móviles.
- **Endpoints Clave:**
  1. `POST /api/cats/catch` (`@RequestBody @Valid CatCatchRequest`): Recibe JSON con Base64 y coordenadas; invoca el servicio de análisis de Gemini.
  2. `POST /api/cats/catch/upload` (`@RequestParam MultipartFile`): Alternativa para subida multipart/form-data binaria estándar de formularios web.
  3. `GET /api/cats`: Devuelve la lista completa de michis para renderizar pines en el mapa de Leaflet.
  4. `GET /api/cats/user/{userId}`: Filtra y devuelve la colección personal de un usuario para su Michidex.
- **💡 Pregunta de Examen:** *¿Por qué proveer tanto un endpoint JSON como uno Multipart?*  
  *Respuesta:* Por versatilidad arquitectónica. Las PWAs en navegadores modernos procesan y comprimen imágenes en memoria (Canvas) transmitiéndolas fácilmente en Base64/JSON, mientras que clientes tradicionales o apps nativas de Android/iOS pueden preferir subidas binarias de tipo `MultipartFile`.

---

#### 📄 `UserController.java`
- **Ubicación:** `backend/src/main/java/com/michigo/controller/UserController.java`
- **Rol:** Controlador REST para la información del perfil del usuario, progreso e insignias.
- **Endpoints Clave:**
  1. `GET /api/users/{userId}/profile`: Devuelve el DTO con nombre, avatar, bio, nivel, XP, contadores por rareza e insignias calculadas.
  2. `GET /api/users/current/profile`: Endpoint de conveniencia para la PWA que devuelve el perfil del usuario activo (ID 1).

---

### 3.3 Capa de Servicios y Lógica de Negocio

#### 📄 `GeminiService.java`
- **Ubicación:** `backend/src/main/java/com/michigo/service/GeminiService.java`
- **Rol:** Cliente de integración con la API de Google Gemini Vision AI.
- **Anotaciones:**
  - `@Service`: Declara la clase como bean de servicio en la capa de negocio.
  - `@Value("${gemini.api.key:}")`: Inyección de propiedades desde `application.yml` o variables de entorno.
- **Lógica Destacada:**
  - Utiliza el cliente moderno `RestClient` de Spring Boot 3 para comunicación HTTP sincrónica sin necesidad de WebFlux reactivo pesado.
  - Envía la imagen en Base64 en el bloque `inline_data` junto con un **prompt de ingeniería estructurada** que le ordena al modelo actuar como juez felino de MichiGO.
  - Configura `response_mime_type: "application/json"` para forzar a Gemini a devolver JSON estricto sin bloques markdown que puedan romper el parser.
  - **Mecanismo de Resiliencia / Fallback:** Si la clave de Gemini no está configurada o se excede la cuota de la API, el método `generateMockAnalysis()` genera automáticamente un perfil humorístico alternativo para que la aplicación nunca lance un error 500 y la experiencia de usuario continúe impecable.

---

#### 📄 `CatCatchService.java`
- **Ubicación:** `backend/src/main/java/com/michigo/service/CatCatchService.java`
- **Rol:** Orquestador de la lógica del juego y reglas de negocio.
- **Anotaciones:**
  - `@Transactional`: Asegura que el registro de la captura, el guardado en base de datos y la acreditación de XP al usuario se ejecuten dentro de una misma transacción atómica (principio ACID).
- **Lógica Destacada:**
  - `registerCatCatch()`: Valida el usuario, invoca a `GeminiService` para analizar la imagen, instancia la entidad `CatCatch`, calcula la experiencia otorgada según la rareza (Común = 100 XP, Raro = 300 XP, Legendario = 1000 XP) y actualiza el nivel del usuario.
  - `getUserProfile()`: Calcula dinámicamente las insignias desbloqueadas según los michis capturados (ej. *Primer Ronroneo*, *Cazador Exclusivo*, *Bendición Mística*, *Maestro Michi*).

---

### 3.4 Capa de Modelo: Entidades, DTOs y Enums

#### 📄 `User.java` (Entidad JPA)
- **Ubicación:** `backend/src/main/java/com/michigo/model/entity/User.java`
- **Rol:** Representa la tabla `users` en la base de datos.
- **Anotaciones JPA:**
  - `@Entity` y `@Table(name = "users")`
  - `@Id` con `@GeneratedValue(strategy = GenerationType.IDENTITY)`: Clave primaria autonumérica.
  - `@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)`: Relación uno a muchos con `CatCatch`.
  - `@JsonIgnore`: Evita bucles de recursión infinita en la serialización JSON bidireccional.
- **Lógica de Dominio:**
  - Método `addExperience(int xp)`: Acumula XP y sube de nivel al jugador cada 500 puntos de manera encapsulada.

---

#### 📄 `CatCatch.java` (Entidad JPA)
- **Ubicación:** `backend/src/main/java/com/michigo/model/entity/CatCatch.java`
- **Rol:** Representa la tabla `cat_catches` con el registro histórico de cada michi fotografiado.
- **Campos y Anotaciones:**
  - `@ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "user_id")`: Relación muchos a uno con `User`.
  - `@Lob @Column(columnDefinition = "CLOB") private String imageUrl`: Almacena la fotografía del gato en Base64 o URL externa sin restricción de tamaño.
  - `latitude`, `longitude`: Coordenadas GPS del avistamiento.
  - `michiName`, `coatPattern`, `personality`, `specialPower`: Atributos deducidos por la IA.
  - `@Enumerated(EnumType.STRING)`: Persiste la rareza como texto (`COMUN`, `RARO`, `LEGENDARIO`) en lugar de índices numéricos para mayor legibilidad en la BD.

---

#### 📄 `Rarity.java` (Enum)
- **Ubicación:** `backend/src/main/java/com/michigo/model/enums/Rarity.java`
- **Valores:** `COMUN`, `RARO`, `LEGENDARIO`.
- **Propiedades Encapsuladas:**
  - `displayName`: Nombre formateado en español.
  - `colorHex`: Color distintivo para la interfaz (Verde `#10B981`, Púrpura `#6366F1`, Dorado `#F59E0B`).
  - `experiencePoints`: XP que otorga su captura (100, 300, 1000).
  - Método utilitario `fromString(String text)`: Sanitiza y mapea la respuesta de texto libre devuelta por Gemini al enum correspondiente.

---

#### 📄 DTOs (Data Transfer Objects)
Patrón arquitectónico que desacopla el modelo interno de la base de datos de los datos expuestos a la red:
- **`CatCatchRequest.java`**: Contrato de entrada con validaciones `@NotNull` (`userId`, `latitude`, `longitude`, `imageBase64`).
- **`CatCatchResponse.java`**: Contrato de salida con datos formateados y aplanados para consumo directo por Leaflet.js.
- **`GeminiCatAnalysisResponse.java`**: Mapeo del JSON crudo devuelto por la API de Google Gemini.
- **`UserProfileResponse.java`**: Modelo de respuesta para la pantalla de perfil, progreso de nivel y lista de insignias.

---

### 3.5 Capa de Persistencia: Repositorios JPA

#### 📄 `CatCatchRepository.java` y `UserRepository.java`
- **Ubicación:** `backend/src/main/java/com/michigo/repository/`
- **Rol:** Interfaces que extienden `JpaRepository<T, ID>`.
- **Ventaja de Spring Data JPA:** No se requiere escribir código SQL a mano para operaciones CRUD comunes. Spring genera dinámicamente en tiempo de ejecución las consultas basadas en los nombres de los métodos:
  - `findAllByOrderByCapturedAtDesc()`
  - `findByUserIdOrderByCapturedAtDesc(Long userId)`
  - `countByUserIdAndRarity(Long userId, Rarity rarity)`

---

## 4. Justificación de Decisiones Técnicas (Preguntas de Examen)

| Decisión Técnica | ¿Por qué se eligió? | Alternativa descartada |
| :--- | :--- | :--- |
| **PWA frente a App Nativa (Swift / Kotlin)** | Acceso instantáneo sin pasar por App Store, compatibilidad universal (iOS Safari y Android), acceso nativo a GPS y cámara mediante APIs de HTML5. | Apps nativas requerían dos desarrollos independientes y cuentas de desarrollador de pago. |
| **Leaflet.js + OSM HOT** | 100% de código abierto, gratuito, sin cuotas sorpresa, sin marcas de agua de "API Key Required", y compatible con estilos CSS de día y noche. | Google Maps JS SDK (requiere tarjeta y cobro por número de cargas de mapa). |
| **Spring RestClient** | Incluido de forma nativa en Spring Boot 3, código legible y sincrónico, sin dependencias externas pesadas. | WebClient reactivo de Spring WebFlux (añadía complejidad innecesaria para llamadas sincrónicas). |
| **Base de Datos H2 en memoria** | Despliegue ágil, arranque instantáneo, sin necesidad de instalar motores de BD locales para evaluar el proyecto. Fácilmente migrable a PostgreSQL con solo cambiar dos líneas en `application.yml`. | MySQL local (dificulta la portabilidad y evaluación en máquinas de los profesores). |
| **Google Cloud Run + Multi-stage Docker** | Plataforma serverless en contenedor que escala a cero cuando no hay tráfico, soporta variables dinámicas (`$PORT`) y provee HTTPS gratuito (indispensable para el GPS móvil). | VPS tradicional (requiere mantenimiento manual de certificados SSL y servidor Nginx). |

---

## 5. Guión Sugerido para la Exposición Oral (Paso a Paso)

### Minuto 0:00 - 1:30 | Introducción y Demostración en Vivo
> *"Buenos días profesores. Hoy les presentamos **MichiGO**, una plataforma que une la exploración del mundo real inspirada en Pokémon GO con la Inteligencia Artificial Multimodal para descubrir, fotografiar y catalogar gatos callejeros.*  
> *Les muestro la aplicación en vivo desde el navegador..."*
- Abrir `http://localhost:3000`.
- Mostrar el mapa con el radar pulsante y los pines que muestran las fotos de los gatos y su aura por rareza.
- Tocar el botón de alternancia **☀️ / 🌙** para demostrar el cambio instantáneo entre el Modo Día y el Modo Noche.

### Minuto 1:30 - 3:30 | Flujo de Captura con Gemini Vision AI
> *"Veamos qué sucede cuando un usuario encuentra un gato en la calle..."*
- Pulsar el botón central con forma de cámara con orejitas de gato.
- Seleccionar una foto de un gato.
- Mostrar la animación de escaneo y el resultado devuelto por Gemini:
  - Nombre gracioso asignado.
  - Patrón de pelaje identificado.
  - Personalidad deducida según la expresión facial.
  - Nivel de rareza y puntos de experiencia otorgados.
- Mostrar cómo el pin se agrega automáticamente al mapa y cómo impacta en la **Michidex** y en las insignias del entrenador.

### Minuto 3:30 - 6:00 | Arquitectura Backend y Código Java
> *"Detrás de esta interfaz hay un backend robusto desarrollado en Java 17 con Spring Boot 3..."*
- Explicar la división en capas:
  1. **`CatController`**: Expone los endpoints REST y recibe las coordenadas junto con la imagen.
  2. **`CatCatchService`**: Orquesta la transacción `@Transactional`, calculando el avance de nivel del usuario.
  3. **`GeminiService`**: Se comunica de forma segura mediante `RestClient` con la API de Google Gemini enviando la imagen en Base64 y validando la salida JSON estructurada.
  4. **JPA y Entidades**: Mostrar la persistencia en `CatCatch` y `User` usando Spring Data JPA.

### Minuto 6:00 - 8:00 | Producción y Conclusión
> *"Para garantizar que la aplicación esté lista para el mundo real, configuramos un **Dockerfile multi-stage** optimizado para **Google Cloud Run**. Cloud Run nos brinda certificados SSL/HTTPS automáticos, lo cual es un requisito estricto de iOS y Android para permitir el uso del GPS y la cámara en la calle.*  
> *Muchas gracias, quedamos a disposición para sus preguntas."*
