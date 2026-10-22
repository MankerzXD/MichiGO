// MichiGO Camera Manager - Captura, Compresión y Flujo de IA
const MichiCamera = (() => {
  const cameraInput = document.getElementById('cat-camera-input');
  const scanModal = document.getElementById('ai-scan-modal');
  const scanPreviewImg = document.getElementById('scan-preview-img');
  const scanStatusText = document.getElementById('scan-status-text');

  // Modal de Celebración
  const celebrationModal = document.getElementById('catch-celebration-modal');
  const btnCloseCelebration = document.getElementById('btn-close-celebration');
  const btnSaveToMichidex = document.getElementById('btn-save-to-michidex');
  const modalRarityBadge = document.getElementById('modal-rarity-badge');
  const modalXpGained = document.getElementById('modal-xp-gained');
  const modalCatImg = document.getElementById('modal-cat-img');
  const modalMichiName = document.getElementById('modal-michi-name');
  const modalCoatPattern = document.getElementById('modal-coat-pattern');
  const modalPersonality = document.getElementById('modal-personality');
  const modalSpecialPower = document.getElementById('modal-special-power');

  let currentCaughtCat = null;

  function init() {
    if (!cameraInput) return;

    cameraInput.addEventListener('change', handleImageSelection);

    if (btnCloseCelebration) {
      btnCloseCelebration.addEventListener('click', closeCelebration);
    }

    if (btnSaveToMichidex) {
      btnSaveToMichidex.addEventListener('click', () => {
        closeCelebration();
        // Cambiar automáticamente a la pestaña de Michidex
        const profileTab = document.getElementById('tab-profile');
        if (profileTab) profileTab.click();
      });
    }

    // Botón de cámara en el bottom nav
    const tabCamera = document.getElementById('tab-camera');
    if (tabCamera) {
      tabCamera.addEventListener('click', () => {
        cameraInput.click();
      });
    }
  }

  async function handleImageSelection(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // 1. Mostrar preview y modal de escaneo con IA
      scanModal.classList.remove('hidden');
      scanStatusText.textContent = "Leyendo imagen capturada...";

      const rawBase64 = await readFileAsBase64(file);
      scanPreviewImg.src = rawBase64;

      // 2. Comprimir para optimizar transferencia móvil
      scanStatusText.textContent = "Optimizando fotografía del michi...";
      const compressedBase64 = await compressImage(rawBase64, 1200, 0.82);

      // 3. Obtener coordenadas actuales
      scanStatusText.textContent = "Fijando coordenadas GPS...";
      const coords = MichiApp.getCurrentCoordinates();

      // 4. Enviar a Gemini AI a través del backend
      scanStatusText.textContent = "Consultando a Google Gemini AI...";
      const result = await MichiAPI.catchCat(compressedBase64, coords.latitude, coords.longitude);

      // 5. Ocultar escáner y mostrar celebración épica
      scanModal.classList.add('hidden');
      showCelebration(result);

      // 6. Notificar al mapa y a la Michidex
      MichiApp.onCatCaptured(result);

    } catch (err) {
      console.error("Error al procesar fotografía:", err);
      scanModal.classList.add('hidden');
      alert("Hubo un detalle al procesar la fotografía del michi. ¡Inténtalo de nuevo!");
    } finally {
      // Reset input para permitir capturar la misma foto si se desea
      cameraInput.value = '';
    }
  }

  function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  function compressImage(base64Str, maxDim, quality) {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => resolve(base64Str);
    });
  }

  function showCelebration(cat) {
    currentCaughtCat = cat;

    modalCatImg.src = cat.imageUrl;
    modalMichiName.textContent = cat.michiName;
    modalCoatPattern.textContent = cat.coatPattern;
    modalPersonality.textContent = cat.personality;
    modalSpecialPower.textContent = cat.specialPower;
    modalXpGained.textContent = `+${cat.xpEarned} XP`;

    const rarityName = cat.rarityDisplayName || cat.rarity || "Común";
    modalRarityBadge.textContent = rarityName;
    modalRarityBadge.style.backgroundColor = cat.rarityColor || "#10B981";

    celebrationModal.classList.remove('hidden');

    // Efecto de Confetti estilo Pokémon GO
    if (window.confetti) {
      confetti({
        particleCount: cat.rarity === 'LEGENDARIO' ? 120 : 60,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }

  function closeCelebration() {
    celebrationModal.classList.add('hidden');
    currentCaughtCat = null;
  }

  return {
    init,
    showCelebration
  };
})();
