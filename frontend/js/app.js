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

  // Inicialización del Mapa Leaflet
  function initLeafletMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Crear mapa centrado en coordenadas iniciales
    map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([currentCoordinates.latitude, currentCoordinates.longitude], 16);

    // Capa de mapa real sin marcas de agua ni API keys requeridas (OpenStreetMap / Esri)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    catMarkersLayer = L.layerGroup().addTo(map);

    // Crear marcador del Entrenador (usuario) con pulso radar
    const userIcon = L.divIcon({
      className: 'user-gps-container',
      html: `
        <div class="user-gps-marker">
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
        console.log("No se pudo obtener ubicación GPS precisa, usando punto de referencia urbano:", error.message);
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

  // Renderizar pines de michis capturados en el mapa
  async function refreshCatMarkers() {
    if (!catMarkersLayer) return;
    catMarkersLayer.clearLayers();

    const catches = await MichiAPI.getAllCatches();
    const countBadge = document.getElementById('nearby-cats-count');

    if (countBadge) {
      countBadge.textContent = `🐾 ${catches.length} michis registrados cerca`;
    }

    const catPinIcon = L.icon({
      iconUrl: './assets/icons/cat-pin.svg',
      iconSize: [44, 54],
      iconAnchor: [22, 54],
      popupAnchor: [0, -50]
    });

    catches.forEach(cat => {
      if (cat.latitude && cat.longitude) {
        const marker = L.marker([cat.latitude, cat.longitude], { icon: catPinIcon });
        
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
