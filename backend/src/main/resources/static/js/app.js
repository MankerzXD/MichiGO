// MichiGO Main Application Controller
const MichiApp = (() => {
  let map = null;
  let userMarker = null;
  let catMarkersLayer = null;
  
  // Coordenadas iniciales (Obelisco/Centro de ciudad como fallback por defecto)
  let currentCoordinates = {
    latitude: -34.6037,
    longitude: -58.3816
  };

  let hasCustomUserLocation = false;

  function init() {
    registerServiceWorker();
    setupPwaInstallBanner();
    setupNavigation();
    initLeafletMap();
    initGeolocation();

    // Inicializar módulos secundarios
    MichiCamera.init();
    MichiDex.init();
    MichiDex.loadProfile();

    // Cargar pines iniciales de michis
    refreshCatMarkers();
  }

  // Registro del Service Worker para PWA
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('🐾 [MichiGO] Service Worker registrado:', reg.scope))
          .catch(err => console.warn('🐾 [MichiGO] Fallo al registrar Service Worker:', err));
      });
    }
  }

  // Detección para banner de instalación (Safari iOS y Android)
  function setupPwaInstallBanner() {
    const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    const isStandalone = window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches;
    const banner = document.getElementById('pwa-install-banner');
    const dismissBtn = document.getElementById('btn-dismiss-install');

    if (isIos && !isStandalone && banner) {
      banner.classList.remove('hidden');
    }

    if (dismissBtn && banner) {
      dismissBtn.addEventListener('click', () => {
        banner.classList.add('hidden');
      });
    }
  }

  // Navegación de Pestañas (Explorar / Michidex)
  function setupNavigation() {
    const tabMap = document.getElementById('tab-map');
    const tabProfile = document.getElementById('tab-profile');
    const hudProfile = document.getElementById('hud-trainer-badge');

    const viewMap = document.getElementById('view-map');
    const viewProfile = document.getElementById('view-profile');

    function switchTab(targetView, activeBtn) {
      [viewMap, viewProfile].forEach(v => v.classList.remove('active'));
      [tabMap, tabProfile].forEach(b => b.classList.remove('active'));

      targetView.classList.add('active');
      activeBtn.classList.add('active');

      if (targetView === viewMap && map) {
        setTimeout(() => map.invalidateSize(), 150);
      } else if (targetView === viewProfile) {
        MichiDex.loadProfile();
      }
    }

    if (tabMap) tabMap.addEventListener('click', () => switchTab(viewMap, tabMap));
    if (tabProfile) tabProfile.addEventListener('click', () => switchTab(viewProfile, tabProfile));
    if (hudProfile) hudProfile.addEventListener('click', () => switchTab(viewProfile, tabProfile));

    // Botón de re-centrar GPS
    const btnRecenter = document.getElementById('btn-recenter');
    if (btnRecenter) {
      btnRecenter.addEventListener('click', () => {
        if (map) {
          map.flyTo([currentCoordinates.latitude, currentCoordinates.longitude], 17, { duration: 1.2 });
        }
      });
    }
  }

  let currentTileLayer = null;
  let activeTheme = 'adventure';

  const TILE_PROVIDERS = {
    adventure: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      options: { maxZoom: 19, subdomains: 'abc', attribution: '&copy; OpenStreetMap contributors' },
      themeClass: 'map-theme-adventure'
    },
    cyber: {
      url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      options: { maxZoom: 19, subdomains: 'abc', attribution: '&copy; OpenStreetMap contributors' },
      themeClass: 'map-theme-cyber'
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      options: { maxZoom: 19, attribution: 'Esri, Maxar, Earthstar' },
      themeClass: 'map-theme-satellite'
    }
  };

  // Inicialización del Mapa Leaflet
  function initLeafletMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Crear mapa centrado en coordenadas iniciales
    map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([currentCoordinates.latitude, currentCoordinates.longitude], 16);

    // Aplicar tema inicial (Aventura estilo videojuego)
    setMapTheme('adventure');

    catMarkersLayer = L.layerGroup().addTo(map);

    // Marcador del Entrenador (usuario) con pulso radar de doble anillo
    const userIcon = L.divIcon({
      className: 'user-gps-container',
      html: `
        <div class="user-gps-marker">
          <div class="user-gps-radar-wave"></div>
          <div class="user-gps-radar-wave"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    userMarker = L.marker([currentCoordinates.latitude, currentCoordinates.longitude], {
      icon: userIcon,
      zIndexOffset: 1000
    }).addTo(map);

    setupMapThemeSwitcher();
  }

  // Cambio dinámico de estilo visual de mapa
  function setMapTheme(themeName) {
    if (!TILE_PROVIDERS[themeName]) return;
    activeTheme = themeName;
    const provider = TILE_PROVIDERS[themeName];

    if (currentTileLayer && map) {
      map.removeLayer(currentTileLayer);
    }

    currentTileLayer = L.tileLayer(provider.url, provider.options).addTo(map);

    // Aplicar clase CSS temática al contenedor del mapa
    const mapElement = document.getElementById('map');
    if (mapElement) {
      mapElement.className = provider.themeClass;
    }

    // Actualizar botones del menú de temas
    document.querySelectorAll('.theme-option').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
  }

  // Controlador del menú flotante de temas de mapa
  function setupMapThemeSwitcher() {
    const btnMapTheme = document.getElementById('btn-map-theme');
    const themeMenu = document.getElementById('map-theme-menu');

    if (btnMapTheme && themeMenu) {
      btnMapTheme.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('hidden');
      });

      document.querySelectorAll('.theme-option').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const theme = btn.dataset.theme;
          setMapTheme(theme);
          themeMenu.classList.add('hidden');
        });
      });

      // Cerrar menú al tocar cualquier otra parte del mapa
      document.addEventListener('click', () => {
        themeMenu.classList.add('hidden');
      });
    }
  }

  // Geolocalización automática en tiempo real
  function initGeolocation() {
    if (!navigator.geolocation) {
      console.warn("Geolocalización no soportada en este navegador.");
      return;
    }

    // Ubicación inicial
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updatePosition(position.coords.latitude, position.coords.longitude);
        if (map) {
          map.setView([position.coords.latitude, position.coords.longitude], 17);
        }
      },
      (error) => {
        console.log("Usando punto de referencia urbano:", error.message);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );

    // Rastreo continuo
    navigator.geolocation.watchPosition(
      (position) => {
        updatePosition(position.coords.latitude, position.coords.longitude);
      },
      null,
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
  }

  function updatePosition(lat, lng) {
    currentCoordinates.latitude = lat;
    currentCoordinates.longitude = lng;
    hasCustomUserLocation = true;

    if (userMarker) {
      userMarker.setLatLng([lat, lng]);
    }
  }

  // Renderizar pines estilo criatura interactiva en el mapa
  async function refreshCatMarkers() {
    if (!catMarkersLayer) return;
    catMarkersLayer.clearLayers();

    const catches = await MichiAPI.getAllCatches();
    const countBadge = document.getElementById('nearby-cats-count');

    if (countBadge) {
      countBadge.textContent = `🐾 ${catches.length} michis registrados cerca`;
    }

    catches.forEach(cat => {
      if (cat.latitude && cat.longitude) {
        const rarityKey = (cat.rarity || 'comun').toLowerCase();

        // Pin personalizado con la foto real del michi, orejitas y aura resplandeciente
        const creatureIcon = L.divIcon({
          className: 'creature-marker-wrapper',
          html: `
            <div class="creature-pin">
              <div class="creature-pin-ears">
                <div class="creature-ear ear-l"></div>
                <div class="creature-ear ear-r"></div>
              </div>
              <div class="creature-avatar-box rarity-aura-${rarityKey}">
                <img src="${cat.imageUrl}" alt="${cat.michiName}" loading="lazy">
              </div>
              <div class="creature-pin-tail"></div>
              <div class="creature-name-pill">${cat.michiName}</div>
            </div>
          `,
          iconSize: [58, 68],
          iconAnchor: [29, 64],
          popupAnchor: [0, -60]
        });

        const marker = L.marker([cat.latitude, cat.longitude], { icon: creatureIcon });
        
        // Al tocar el pin en el mapa, abre directamente su tarjeta Pokédex
        marker.on('click', () => {
          MichiCamera.showCelebration(cat);
        });

        catMarkersLayer.addLayer(marker);
      }
    });
  }

  // Callback ejecutado cuando se captura un nuevo michi
  function onCatCaptured(newCatch) {
    refreshCatMarkers();
    MichiDex.loadProfile();

    if (map && newCatch.latitude && newCatch.longitude) {
      map.flyTo([newCatch.latitude, newCatch.longitude], 17, { duration: 1.0 });
    }
  }

  return {
    init,
    getCurrentCoordinates: () => currentCoordinates,
    onCatCaptured,
    refreshCatMarkers
  };
})();

// Arranque de la aplicación
document.addEventListener('DOMContentLoaded', () => {
  MichiApp.init();
});
