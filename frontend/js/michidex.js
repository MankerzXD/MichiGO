// MichiGO Michidex & Profile Module
const MichiDex = (() => {
  const profileAvatar = document.getElementById('profile-avatar');
  const profileLevelTag = document.getElementById('profile-level-tag');
  const profileName = document.getElementById('profile-name');
  const profileUsername = document.getElementById('profile-username');
  const profileBio = document.getElementById('profile-bio');
  const xpText = document.getElementById('xp-text');
  const xpFill = document.getElementById('xp-fill');

  const statTotal = document.getElementById('stat-total');
  const statCommon = document.getElementById('stat-common');
  const statRare = document.getElementById('stat-rare');
  const statLegendary = document.getElementById('stat-legendary');

  const badgesContainer = document.getElementById('badges-container');
  const badgesUnlockedCount = document.getElementById('badges-unlocked-count');

  const michidexContainer = document.getElementById('michidex-container');
  const filterPills = document.querySelectorAll('.filter-btn, .filter-pill');

  let activeFilter = 'ALL';
  let cachedCatches = [];

  function init() {
    filterPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        filterPills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        activeFilter = e.target.dataset.filter;
        renderCatGrid(cachedCatches);
      });
    });
  }

  async function loadProfile() {
    const profile = await MichiAPI.getUserProfile(1);
    const catches = await MichiAPI.getAllCatches();
    cachedCatches = catches;

    // Actualizar Encabezado HUD
    const hudLvl = document.getElementById('hud-trainer-level');
    const hudAvatar = document.getElementById('hud-trainer-avatar');
    if (hudLvl) hudLvl.textContent = profile.level;
    if (hudAvatar && profile.avatarUrl) hudAvatar.src = profile.avatarUrl;

    // Actualizar Tarjeta de Perfil
    if (profileAvatar && profile.avatarUrl) profileAvatar.src = profile.avatarUrl;
    if (profileLevelTag) profileLevelTag.textContent = `Nvl ${profile.level}`;
    if (profileName) profileName.textContent = profile.displayName;
    if (profileUsername) profileUsername.textContent = `@${profile.username}`;
    if (profileBio) profileBio.textContent = profile.bio;

    // Barra de Experiencia (cada 500 XP un nivel)
    const currentLvlXp = profile.experience % 500;
    const progressPercent = Math.min(100, Math.round((currentLvlXp / 500) * 100));
    if (xpText) xpText.textContent = `${currentLvlXp} / 500 XP`;
    if (xpFill) xpFill.style.width = `${progressPercent}%`;

    // Contadores
    if (statTotal) statTotal.textContent = catches.length;
    if (statCommon) statCommon.textContent = catches.filter(c => c.rarity === 'COMUN').length;
    if (statRare) statRare.textContent = catches.filter(c => c.rarity === 'RARO').length;
    if (statLegendary) statLegendary.textContent = catches.filter(c => c.rarity === 'LEGENDARIO').length;

    // Renderizar Insignias
    renderBadges(profile.badges || []);

    // Renderizar Michidex
    renderCatGrid(catches);
  }

  function renderBadges(badges) {
    if (!badgesContainer) return;
    badgesContainer.innerHTML = '';

    let unlockedCount = 0;

    badges.forEach(badge => {
      if (badge.unlocked) unlockedCount++;

      const badgeEl = document.createElement('div');
      badgeEl.className = `badge-item ${badge.unlocked ? 'unlocked' : 'locked'}`;
      badgeEl.title = badge.description;
      badgeEl.innerHTML = `
        <div class="badge-icon-box">${badge.icon}</div>
        <span class="badge-name">${badge.name}</span>
      `;
      badgesContainer.appendChild(badgeEl);
    });

    if (badgesUnlockedCount) {
      badgesUnlockedCount.textContent = `${unlockedCount}/${badges.length}`;
    }
  }

  function renderCatGrid(catches) {
    if (!michidexContainer) return;
    michidexContainer.innerHTML = '';

    const filtered = catches.filter(c => {
      if (activeFilter === 'ALL') return true;
      return c.rarity === activeFilter;
    });

    if (filtered.length === 0) {
      michidexContainer.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px 10px; color: var(--text-muted); font-size: 0.85rem;">
          🐾 Aún no has capturado ningún michi en esta categoría.<br>¡Abre el radar y explora la ciudad!
        </div>
      `;
      return;
    }

    filtered.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'michi-dex-card glass-panel';
      
      const rarityColor = cat.rarityColor || 
        (cat.rarity === 'LEGENDARIO' ? '#F59E0B' : cat.rarity === 'RARO' ? '#6366F1' : '#10B981');
      const rarityLabel = cat.rarityDisplayName || cat.rarity || 'Común';

      card.innerHTML = `
        <div class="michi-card-img-wrap">
          <img src="${cat.imageUrl}" alt="${cat.michiName}" loading="lazy">
          <span class="michi-card-rarity" style="background-color: ${rarityColor}">${rarityLabel}</span>
        </div>
        <div class="michi-card-content">
          <div class="michi-card-name">${cat.michiName}</div>
          <div class="michi-card-pattern">${cat.coatPattern || 'Patrón misterioso'}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        MichiCamera.showCelebration(cat);
      });

      michidexContainer.appendChild(card);
    });
  }

  return {
    init,
    loadProfile
  };
})();
