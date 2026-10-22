// MichiGO API Client - Comunicación con Spring Boot y Fallback Offline
const MichiAPI = (() => {
  // Detecta automáticamente si el backend está en el mismo host o en localhost:8080
  const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8080/api'
    : '/api';

  // Colección local de michis para cuando el backend esté en modo standalone/offline
  let localCatches = [
    {
      id: 1,
      userId: 1,
      userName: "Ash Kétchup & Michis",
      imageUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
      latitude: -34.6037,
      longitude: -58.3816,
      michiName: "Don Bigotes de la Mancha",
      coatPattern: "Tuxedo Elegante con Pajarita",
      personality: "Juzga la impuntualidad de los transeúntes con su mirada seria.",
      rarity: "RARO",
      rarityDisplayName: "Raro",
      rarityColor: "#6366F1",
      specialPower: "Mirada de Desdén Aristocrático",
      xpEarned: 300,
      capturedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 2,
      userId: 1,
      userName: "Ash Kétchup & Michis",
      imageUrl: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=600&q=80",
      latitude: -34.6080,
      longitude: -58.3750,
      michiName: "Señor Naranjo el Caótico",
      coatPattern: "Atigrado Naranja Silvestre",
      personality: "Corre a toda velocidad sin destino aparente. Una sola neurona, pero feliz.",
      rarity: "COMUN",
      rarityDisplayName: "Común",
      rarityColor: "#10B981",
      specialPower: "Derrape Nocturno en Pasillos",
      xpEarned: 100,
      capturedAt: new Date(Date.now() - 3600000 * 24).toISOString()
    },
    {
      id: 3,
      userId: 1,
      userName: "Ash Kétchup & Michis",
      imageUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80",
      latitude: -34.5990,
      longitude: -58.3900,
      michiName: "Michi Cósmico Ojos de Jade",
      coatPattern: "Carey Místico Tricolor",
      personality: "Protege el portal dimensional del contenedor de reciclaje.",
      rarity: "LEGENDARIO",
      rarityDisplayName: "Legendario",
      rarityColor: "#F59E0B",
      specialPower: "Ronroneo Hipnótico Galáctico",
      xpEarned: 1000,
      capturedAt: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ];

  let localUser = {
    id: 1,
    username: "michimaster",
    displayName: "Ash Kétchup & Michis",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    bio: "Buscador de michis legendarios en techos y callejones.",
    level: 3,
    experience: 1400,
    experienceToNextLevel: 100,
    totalCatches: 3,
    commonCatches: 1,
    rareCatches: 1,
    legendaryCatches: 1,
    badges: [
      { id: "badge-first", name: "Primer Ronroneo", description: "Fotografió a su primer michi callejero.", icon: "🐾", unlocked: true },
      { id: "badge-rare", name: "Cazador Exclusivo", description: "Descubrió al menos un michi de rareza Rara.", icon: "💎", unlocked: true },
      { id: "badge-legendary", name: "Bendición Mística", description: "Encontró un Michi Legendario en el mundo real.", icon: "👑", unlocked: true },
      { id: "badge-collector", name: "Maestro Michi", description: "Registró 5 o más michis en su Michidex.", icon: "⭐", unlocked: false }
    ],
    recentCatches: []
  };

  /**
   * Envía la foto y coordenadas al backend Spring Boot
   */
  async function catchCat(imageBase64, latitude, longitude, userId = 1) {
    try {
      const response = await fetch(`${API_BASE}/cats/catch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          latitude,
          longitude,
          imageBase64
        })
      });

      if (!response.ok) {
        throw new Error(`Error en el servidor: ${response.status}`);
      }

      const savedCatch = await response.json();
      return savedCatch;
    } catch (err) {
      console.warn("⚠️ Servidor Spring Boot no alcanzable o sin conexión. Usando emulador de Gemini AI local:", err);
      // Fallback local enriquecido para pruebas instantáneas
      return mockLocalCatch(imageBase64, latitude, longitude);
    }
  }

  /**
   * Obtiene la lista de michis descubiertos para el mapa
   */
  async function getAllCatches() {
    try {
      const response = await fetch(`${API_BASE}/cats`);
      if (!response.ok) throw new Error("Error al obtener michis");
      return await response.json();
    } catch (err) {
      console.log("ℹ️ Cargando michis locales de demostración");
      return localCatches;
    }
  }

  /**
   * Obtiene el perfil del usuario activo
   */
  async function getUserProfile(userId = 1) {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/profile`);
      if (!response.ok) throw new Error("Error al obtener perfil");
      return await response.json();
    } catch (err) {
      localUser.recentCatches = localCatches;
      return localUser;
    }
  }

  // Generador de fallback local que simula a Gemini AI
  function mockLocalCatch(imageBase64, lat, lng) {
    const templates = [
      {
        name: "Capitán Patitas Blancas",
        coat: "Esmoquin Tuxedo con Guantes Blancos",
        personality: "Exige respeto inmediato y dos caricias exactamente en la nuca. Ni una más.",
        rarity: "RARO",
        rarityDisplayName: "Raro",
        rarityColor: "#6366F1",
        power: "Mirada Hipnótica de Desdén",
        xp: 300
      },
      {
        name: "Pelusa Tormenta",
        coat: "Gris Atigrado de Lluvia",
        personality: "Aparece misteriosamente cuando el clima se nubla y duerme sobre capós tibios.",
        rarity: "COMUN",
        rarityDisplayName: "Común",
        rarityColor: "#10B981",
        power: "Siesta Impermeable",
        xp: 100
      },
      {
        name: "Sol Cósmico de Barrio",
        coat: "Naranja Atigrado Llameante",
        personality: "Portador de la legendaria neurona compartida. Capaz de desafiar las leyes de la física.",
        rarity: "LEGENDARIO",
        rarityDisplayName: "Legendario",
        rarityColor: "#F59E0B",
        power: "Teletransportación a las 3 AM",
        xp: 1000
      }
    ];

    const pick = templates[Math.floor(Math.random() * templates.length)];
    const newCatch = {
      id: Date.now(),
      userId: 1,
      userName: localUser.displayName,
      imageUrl: imageBase64,
      latitude: lat,
      longitude: lng,
      michiName: pick.name,
      coatPattern: pick.coat,
      personality: pick.personality,
      rarity: pick.rarity,
      rarityDisplayName: pick.rarityDisplayName,
      rarityColor: pick.rarityColor,
      specialPower: pick.power,
      xpEarned: pick.xp,
      capturedAt: new Date().toISOString()
    };

    localCatches.unshift(newCatch);
    localUser.totalCatches++;
    if (pick.rarity === 'COMUN') localUser.commonCatches++;
    if (pick.rarity === 'RARO') localUser.rareCatches++;
    if (pick.rarity === 'LEGENDARIO') localUser.legendaryCatches++;
    localUser.experience += pick.xp;
    localUser.level = 1 + Math.floor(localUser.experience / 500);

    return newCatch;
  }

  return {
    catchCat,
    getAllCatches,
    getUserProfile,
    getLocalCatches: () => localCatches
  };
})();
