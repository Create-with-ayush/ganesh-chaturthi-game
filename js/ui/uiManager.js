/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * UI Manager - Handles Menus, Overlays, Dialogs, Modals, HUD & Responsive Controls
 */

class UIManager {
  constructor(game) {
    this.game = game;

    // Cache DOM Elements
    this.screens = {
      auth: document.getElementById("screen-auth"),
      menu: document.getElementById("screen-menu"),
      intro: document.getElementById("screen-intro"),
      map: document.getElementById("screen-map"),
      hud: document.getElementById("screen-hud"),
      results: document.getElementById("screen-results"),
      leaderboard: document.getElementById("screen-leaderboard"),
      howToPlay: document.getElementById("screen-how-to-play"),
      settings: document.getElementById("screen-settings"),
      credits: document.getElementById("screen-credits"),
      celebrationOverlay: document.getElementById("screen-celebration-overlay")
    };

    this.modals = {
      levelComplete: document.getElementById("modal-level-complete"),
      pause: document.getElementById("modal-pause"),
      dialogue: document.getElementById("modal-dialogue"),
      wardrobe: document.getElementById("modal-wardrobe"),
      greetingCard: document.getElementById("modal-greeting-card"),
      gameOver: document.getElementById("modal-game-over")
    };

    // HUD Elements
    this.hudLevelName = document.getElementById("hud-level-name");
    this.hudScore = document.getElementById("hud-score");
    this.hudTimer = document.getElementById("hud-timer");
    this.hudCombo = document.getElementById("hud-combo");
    this.mobileControls = document.getElementById("mobile-touch-controls");
    this.dholTouchPads = document.getElementById("dhol-touch-pads");

    this._setupEventListeners();
    this._setupAuthUI();
  }

  showScreen(screenKey) {
    // Hide all main screens
    Object.values(this.screens).forEach(screen => {
      if (screen) screen.classList.add("hidden");
    });

    // Hide modals
    Object.values(this.modals).forEach(modal => {
      if (modal) modal.classList.add("hidden");
    });

    if (this.screens[screenKey]) {
      this.screens[screenKey].classList.remove("hidden");
    }

    // Toggle HUD visibility
    if (screenKey === "gameplay") {
      if (this.screens.hud) this.screens.hud.classList.remove("hidden");
    }

    if (screenKey === "settings") {
      const musicTrackSelect = document.getElementById("select-music-track");
      if (musicTrackSelect) {
        musicTrackSelect.value = this.game.storage.getSelectedMusicTrack();
      }
    }

    // Show/hide player header bar
    const playerBar = document.getElementById("player-header-bar");
    if (playerBar) {
      const showPlayerBar = (screenKey === "menu" || screenKey === "map" || screenKey === "leaderboard" || screenKey === "howToPlay" || screenKey === "settings" || screenKey === "credits") && this.game.auth.hasSession();
      playerBar.classList.toggle("hidden", !showPlayerBar);
    }
  }

  showModal(modalKey) {
    if (this.modals[modalKey]) {
      this.modals[modalKey].classList.remove("hidden");
    }
  }

  hideModal(modalKey) {
    if (this.modals[modalKey]) {
      this.modals[modalKey].classList.add("hidden");
    }
  }

  updateHUD(levelName, score, timer, combo = 0) {
    if (this.hudLevelName) this.hudLevelName.textContent = levelName;
    if (this.hudScore) this.hudScore.textContent = score.toLocaleString();
    if (this.hudTimer) this.hudTimer.textContent = `${Math.ceil(timer)}s`;

    if (this.hudCombo) {
      if (combo >= 3) {
        this.hudCombo.textContent = `COMBO x${combo}`;
        this.hudCombo.classList.remove("hidden");
      } else {
        this.hudCombo.classList.add("hidden");
      }
    }
  }

  setMobileControls(type = "none") {
    if (!this.mobileControls || !this.dholTouchPads) return;

    if (type === "runner") {
      this.mobileControls.classList.remove("hidden");
      this.dholTouchPads.classList.add("hidden");
    } else if (type === "dhol") {
      this.mobileControls.classList.add("hidden");
      this.dholTouchPads.classList.remove("hidden");
    } else {
      this.mobileControls.classList.add("hidden");
      this.dholTouchPads.classList.add("hidden");
    }
  }

  // ==========================================
  // AUTH UI
  // ==========================================

  _setupAuthUI() {
    const registerTab = document.getElementById("auth-tab-register");
    const loginTab = document.getElementById("auth-tab-login");
    const registerPanel = document.getElementById("auth-register-panel");
    const loginPanel = document.getElementById("auth-login-panel");

    if (registerTab && loginTab) {
      registerTab.addEventListener("click", () => {
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
        if (registerPanel) registerPanel.classList.remove("hidden");
        if (loginPanel) loginPanel.classList.add("hidden");
      });

      loginTab.addEventListener("click", () => {
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        if (loginPanel) loginPanel.classList.remove("hidden");
        if (registerPanel) registerPanel.classList.add("hidden");
        this._renderPlayersList();
      });
    }

    // Avatar picker
    this._selectedAvatar = "🐭";
    const avatarGrid = document.getElementById("avatar-picker-grid");
    if (avatarGrid) {
      const avatars = this.game.auth.getAvatars();
      avatars.forEach(avatar => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `avatar-option ${avatar === this._selectedAvatar ? "selected" : ""}`;
        btn.textContent = avatar;
        btn.addEventListener("click", () => {
          this._selectedAvatar = avatar;
          document.querySelectorAll(".avatar-option").forEach(b => b.classList.remove("selected"));
          btn.classList.add("selected");
          const preview = document.getElementById("selected-avatar-preview");
          if (preview) preview.textContent = avatar;
        });
        avatarGrid.appendChild(btn);
      });
    }

    // Register button
    const registerBtn = document.getElementById("btn-auth-register");
    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        this.game.sound.ensureContext();
        const nameInput = document.getElementById("auth-register-name");
        const name = nameInput ? nameInput.value : "";
        const result = this.game.auth.register(name, this._selectedAvatar);
        const statusEl = document.getElementById("auth-register-status");
        
        if (statusEl) {
          statusEl.textContent = result.message;
          statusEl.className = `auth-status ${result.success ? "success" : "error"}`;
          statusEl.classList.remove("hidden");
        }

        if (result.success) {
          this.game.sound.playButtonClick();
          setTimeout(() => {
            this.game.onAuthComplete();
          }, 600);
        }
      });
    }
  }

  _renderPlayersList() {
    const container = document.getElementById("auth-players-list");
    if (!container) return;

    const players = this.game.auth.getPlayerList();
    container.innerHTML = "";

    if (players.length === 0) {
      container.innerHTML = `<div class="auth-no-players">No registered players yet. Please register first!</div>`;
      return;
    }

    players.forEach(player => {
      const card = document.createElement("div");
      card.className = "auth-player-card";
      card.innerHTML = `
        <span class="auth-player-avatar">${player.avatar || "🐭"}</span>
        <div class="auth-player-info">
          <div class="auth-player-name">${player.name}</div>
          <div class="auth-player-stats">Score: <span>${(player.totalScore || 0).toLocaleString()}</span> · Stars: <span>${player.totalStars || 0}</span></div>
        </div>
      `;
      card.addEventListener("click", () => {
        this.game.sound.ensureContext();
        const result = this.game.auth.loginDirect(player.name);
        if (result) {
          this.game.sound.playButtonClick();
          const statusEl = document.getElementById("auth-login-status");
          if (statusEl) {
            statusEl.textContent = `Welcome back, ${player.name}! 🪔`;
            statusEl.className = "auth-status success";
            statusEl.classList.remove("hidden");
          }
          setTimeout(() => {
            this.game.onAuthComplete();
          }, 500);
        }
      });
      container.appendChild(card);
    });
  }

  updatePlayerHeader() {
    const bar = document.getElementById("player-header-bar");
    const avatarEl = document.getElementById("player-header-avatar");
    const nameEl = document.getElementById("player-header-name");
    const rankEl = document.getElementById("player-header-rank");

    if (!bar) return;

    if (this.game.auth.hasSession()) {
      const player = this.game.auth.getCurrentPlayer();
      if (avatarEl) avatarEl.textContent = player.avatar || "🐭";
      if (nameEl) nameEl.textContent = player.name;
      
      // Get rank from leaderboard
      const rank = this.game.storage.getPlayerRank(player.name);
      if (rankEl) {
        rankEl.textContent = rank > 0 ? `Rank #${rank}` : "Welcome!";
      }
      bar.classList.remove("hidden");
    } else {
      bar.classList.add("hidden");
    }
  }

  // ==========================================
  // GAME OVER MODAL
  // ==========================================

  showGameOverModal(data) {
    const modal = this.modals.gameOver;
    if (!modal) return;

    // Score display
    const scoreEl = document.getElementById("game-over-score");
    if (scoreEl) {
      scoreEl.innerHTML = `Score: <span>${(data.score || 0).toLocaleString()}</span>`;
    }

    // Stats
    const statsEl = document.getElementById("game-over-stats");
    if (statsEl) {
      statsEl.innerHTML = "";
      const stats = [
        { label: "Modaks Gathered", value: data.modaksCollected || 0 },
        { label: "Max Combo", value: `x${data.maxCombo || 0}` },
        { label: "Time Survived", value: `${data.timeElapsed || 0}s` }
      ];
      stats.forEach(st => {
        const row = document.createElement("div");
        row.className = "stat-row";
        row.innerHTML = `<span class="stat-label">${st.label}</span><span class="stat-value">${st.value}</span>`;
        statsEl.appendChild(row);
      });
    }

    // Random tip
    const tips = [
      "Jump over obstacles or activate Prasad Surge to purify them!",
      "Collect modaks rapidly to fill the Prasad Meter and become invincible!",
      "During Prasad Surge, obstacles are destroyed and give +300 bonus points!",
      "Time your jumps carefully — obstacles have different sizes!",
      "Keep your combo going! Higher combos mean bigger point multipliers!",
      "Special golden modaks give 250 base points and fill the meter faster!"
    ];
    const tipEl = document.getElementById("game-over-tip-text");
    if (tipEl) {
      tipEl.textContent = tips[Math.floor(Math.random() * tips.length)];
    }

    this.showModal("gameOver");
  }

  // ==========================================
  // LEVEL COMPLETE
  // ==========================================

  showLevelCompleteModal(data) {
    const modal = this.modals.levelComplete;
    if (!modal) return;

    document.getElementById("modal-lc-title").textContent = data.title;
    document.getElementById("modal-lc-score").textContent = `${data.score.toLocaleString()} pts`;
    document.getElementById("modal-lc-bappa-msg").textContent = `"${data.bappaMessage}"`;

    // Stars render
    const starsContainer = document.getElementById("modal-lc-stars");
    starsContainer.innerHTML = "";
    for (let i = 1; i <= 3; i++) {
      const starSpan = document.createElement("span");
      starSpan.className = `star-icon ${i <= data.stars ? "star-earned" : "star-empty"}`;
      starSpan.textContent = "⭐";
      starsContainer.appendChild(starSpan);
    }

    // Stats list
    const statsContainer = document.getElementById("modal-lc-stats");
    statsContainer.innerHTML = "";
    if (data.stats) {
      data.stats.forEach(st => {
        const row = document.createElement("div");
        row.className = "stat-row";
        row.innerHTML = `<span class="stat-label">${st.label}</span><span class="stat-value">${st.value}</span>`;
        statsContainer.appendChild(row);
      });
    }

    const nextBtn = document.getElementById("btn-next-level");
    if (nextBtn) {
      nextBtn.onclick = () => {
        this.game.sound.playButtonClick();
        this.hideModal("levelComplete");
        if (data.nextLevelId === "celebration") {
          this.game.startFinalCelebration();
        } else if (data.nextLevelId) {
          this.game.startLevel(data.nextLevelId);
        } else {
          this.game.openFestivalMap();
        }
      };
    }

    const mapBtn = document.getElementById("btn-lc-map");
    if (mapBtn) {
      mapBtn.onclick = () => {
        this.game.sound.playButtonClick();
        this.hideModal("levelComplete");
        this.game.openFestivalMap();
      };
    }

    this.showModal("levelComplete");
  }

  renderFestivalMap() {
    const save = this.game.storage.getSaveData();
    const mapNodes = document.querySelectorAll(".map-node");

    mapNodes.forEach(node => {
      const lvlStr = node.dataset.level;
      let isUnlocked = false;
      let progress = { completed: false, score: 0, stars: 0 };

      if (lvlStr === "aarti") {
        isUnlocked = save.finalCelebrationUnlocked || save.unlockedLevels.includes(5);
        node.classList.toggle("node-locked", !isUnlocked);
        node.classList.toggle("node-completed", save.finalCelebrationUnlocked);
        const scoreElem = node.querySelector(".node-score");
        if (scoreElem) {
          scoreElem.textContent = isUnlocked ? "Devotion Mode" : "Complete Quests";
        }
        return;
      }

      const lvl = parseInt(lvlStr, 10);
      isUnlocked = save.unlockedLevels.includes(lvl);
      progress = save.levelProgress[lvl] || { completed: false, score: 0, stars: 0 };

      node.classList.toggle("node-locked", !isUnlocked);
      node.classList.toggle("node-completed", progress.completed);

      const starElem = node.querySelector(".node-stars");
      if (starElem) {
        if (progress.completed) {
          let starsStr = "";
          for (let s = 0; s < progress.stars; s++) starsStr += "⭐";
          starElem.textContent = starsStr;
          starElem.classList.remove("hidden");
        } else {
          starElem.classList.add("hidden");
        }
      }

      const scoreElem = node.querySelector(".node-score");
      if (scoreElem && progress.score > 0) {
        scoreElem.textContent = `${progress.score} pts`;
      }
    });

    // Grand celebration node
    const celebBtn = document.getElementById("btn-map-celebration");
    if (celebBtn) {
      celebBtn.disabled = !save.finalCelebrationUnlocked;
      celebBtn.classList.toggle("btn-pulse", save.finalCelebrationUnlocked);
    }
  }

  showResultsScreen() {
    const save = this.game.storage.getSaveData();

    // Determine Rank
    let rank = CONFIG.RANKS[CONFIG.RANKS.length - 1];
    for (const r of CONFIG.RANKS) {
      if (save.totalScore >= r.minScore) {
        rank = r;
        break;
      }
    }

    document.getElementById("res-total-score").textContent = save.totalScore.toLocaleString();
    document.getElementById("res-total-stars").textContent = `${save.totalStars} / 15`;
    document.getElementById("res-best-combo").textContent = `x${save.bestOverallCombo}`;
    document.getElementById("res-rank-title").textContent = rank.title;
    document.getElementById("res-rank-icon").textContent = rank.icon;
    document.getElementById("res-rank-desc").textContent = rank.desc;

    // Leaderboard save form
    const saveBtn = document.getElementById("btn-submit-score");
    const nameInput = document.getElementById("input-player-name");
    const saveStatus = document.getElementById("save-score-status");

    // Pre-fill with current player name
    if (nameInput && this.game.auth.hasSession()) {
      nameInput.value = this.game.auth.getPlayerName();
    }

    if (saveBtn && nameInput) {
      saveBtn.disabled = false;
      saveBtn.onclick = () => {
        const playerName = nameInput.value.trim() || this.game.auth.getPlayerName() || "DEVOTEE";
        const avatar = this.game.auth.hasSession() ? this.game.auth.getPlayerAvatar() : "🐭";
        this.game.storage.addLeaderboardEntry(playerName, save.totalScore, save.totalStars, save.bestOverallCombo, avatar);
        this.game.sound.playButtonClick();
        if (saveStatus) {
          saveStatus.textContent = "Saved to Leaderboard!";
          saveStatus.classList.remove("hidden");
        }
        saveBtn.disabled = true;
      };
    }

    this.showScreen("results");
  }

  renderLeaderboard() {
    const list = this.game.storage.getLeaderboard();
    const tableBody = document.getElementById("leaderboard-rows");
    if (!tableBody) return;

    const currentPlayerName = this.game.auth.hasSession() ? this.game.auth.getPlayerName() : null;

    tableBody.innerHTML = "";
    list.forEach((entry, idx) => {
      const isCurrentPlayer = currentPlayerName && entry.name === currentPlayerName;
      const row = document.createElement("tr");
      row.className = `lb-row ${idx === 0 ? "lb-gold" : idx === 1 ? "lb-silver" : idx === 2 ? "lb-bronze" : ""} ${isCurrentPlayer ? "lb-current-player" : ""}`;
      row.innerHTML = `
        <td><span class="rank-badge">#${idx + 1}</span></td>
        <td class="lb-avatar">${entry.avatar || "🐭"}</td>
        <td class="player-name">${entry.name}</td>
        <td class="player-score">${entry.score.toLocaleString()}</td>
        <td>${entry.stars} ⭐</td>
        <td>x${entry.combo}</td>
        <td class="player-rank">${entry.rank || "FESTIVAL HERO"}</td>
      `;
      tableBody.appendChild(row);
    });

    // Update rank summary card
    this._updateLeaderboardSummary(list, currentPlayerName);
  }

  _updateLeaderboardSummary(list, currentPlayerName) {
    const summaryCard = document.getElementById("lb-rank-summary");
    if (!summaryCard) return;

    if (!currentPlayerName) {
      summaryCard.classList.add("hidden");
      return;
    }

    const playerIdx = list.findIndex(e => e.name === currentPlayerName);
    if (playerIdx < 0) {
      summaryCard.classList.add("hidden");
      return;
    }

    const entry = list[playerIdx];
    summaryCard.classList.remove("hidden");

    const avatarEl = document.getElementById("lb-summary-avatar");
    const nameEl = document.getElementById("lb-summary-name");
    const positionEl = document.getElementById("lb-summary-position");
    const scoreEl = document.getElementById("lb-summary-score");

    if (avatarEl) avatarEl.textContent = entry.avatar || "🐭";
    if (nameEl) nameEl.textContent = entry.name;
    if (positionEl) positionEl.textContent = `Rank #${playerIdx + 1} of ${list.length}`;
    if (scoreEl) scoreEl.textContent = entry.score.toLocaleString();
  }

  _setupEventListeners() {
    // Menu Buttons
    document.getElementById("btn-play-game")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.startStoryIntro();
    });

    document.getElementById("btn-show-map")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.openFestivalMap();
    });

    document.getElementById("btn-leaderboard")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.renderLeaderboard();
      this.showScreen("leaderboard");
    });

    document.getElementById("btn-how-to-play")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.showScreen("howToPlay");
    });

    document.getElementById("btn-settings")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.showScreen("settings");
    });

    document.getElementById("btn-credits")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.showScreen("credits");
    });

    // Story Intro
    document.getElementById("btn-skip-intro")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.openFestivalMap();
    });

    document.getElementById("btn-intro-proceed")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.openFestivalMap();
    });

    // Festival Map Nodes
    document.querySelectorAll(".map-node").forEach(node => {
      node.addEventListener("click", () => {
        const lvlStr = node.dataset.level;
        const save = this.game.storage.getSaveData();

        if (lvlStr === "aarti") {
          if (save.finalCelebrationUnlocked || save.unlockedLevels.includes(5)) {
            this.game.sound.playButtonClick();
            this.game.startAartiCeremony();
          } else {
            this.game.sound.playObstacleHit();
          }
          return;
        }

        const lvl = parseInt(lvlStr, 10);
        if (save.unlockedLevels.includes(lvl)) {
          this.game.sound.playButtonClick();
          this.game.startLevel(lvl);
        } else {
          this.game.sound.playObstacleHit();
        }
      });
    });

    // Wardrobe Modal Buttons
    document.getElementById("btn-wardrobe")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.openWardrobeModal();
    });

    document.getElementById("btn-map-wardrobe")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.openWardrobeModal();
    });

    document.getElementById("btn-close-wardrobe")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.hideModal("wardrobe");
    });

    // Greeting Card Studio Buttons
    document.getElementById("btn-greeting-card")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.openGreetingCardModal();
    });

    document.getElementById("btn-celebration-greeting")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.openGreetingCardModal();
    });

    document.getElementById("btn-res-greeting")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.openGreetingCardModal();
    });

    document.getElementById("btn-close-card")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.hideModal("greetingCard");
    });

    document.getElementById("btn-download-card")?.addEventListener("click", () => {
      this.downloadGreetingCard();
    });

    // Celebration Aarti Button
    document.getElementById("btn-celebration-aarti")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.startAartiCeremony();
    });

    // Final Celebration Map Button
    document.getElementById("btn-map-celebration")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.startFinalCelebration();
    });

    // Back Buttons
    document.querySelectorAll(".btn-back-menu").forEach(btn => {
      btn.addEventListener("click", () => {
        this.game.sound.playButtonClick();
        this.game.returnToMainMenu();
      });
    });

    document.querySelectorAll(".btn-back-map").forEach(btn => {
      btn.addEventListener("click", () => {
        this.game.sound.playButtonClick();
        this.game.openFestivalMap();
      });
    });

    // Pause Button in HUD
    document.getElementById("btn-pause")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.togglePause();
    });

    // Pause Modal Controls
    document.getElementById("btn-resume")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.togglePause();
    });

    document.getElementById("btn-restart-level")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.restartCurrentLevel();
    });

    document.getElementById("btn-pause-map")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.togglePause();
      this.game.openFestivalMap();
    });

    // Game Over Modal Controls
    document.getElementById("btn-game-over-retry")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.hideModal("gameOver");
      this.game.restartCurrentLevel();
    });

    document.getElementById("btn-game-over-map")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.hideModal("gameOver");
      this.game.openFestivalMap();
    });

    // Settings Controls
    const soundToggle = document.getElementById("toggle-sound");
    const musicToggle = document.getElementById("toggle-music");
    const volSlider = document.getElementById("slider-volume");

    if (soundToggle) {
      soundToggle.addEventListener("change", (e) => {
        this.game.sound.setSFXEnabled(e.target.checked);
      });
    }

    if (musicToggle) {
      musicToggle.addEventListener("change", (e) => {
        this.game.sound.setMusicEnabled(e.target.checked);
      });
    }

    if (volSlider) {
      volSlider.addEventListener("input", (e) => {
        this.game.sound.setMasterVolume(parseFloat(e.target.value));
      });
    }

    // Background Music Track Selector
    const musicTrackSelect = document.getElementById("select-music-track");
    if (musicTrackSelect) {
      musicTrackSelect.value = this.game.storage.getSelectedMusicTrack();
      musicTrackSelect.addEventListener("change", (e) => {
        const newTrack = e.target.value;
        this.game.sound.playButtonClick();
        this.game.storage.setSelectedMusicTrack(newTrack);
        this.game.sound.startMusic(newTrack);
        this.updateGlobalMusicLabel(newTrack);
      });
    }

    // Global Audio Pill Click -> Open Settings
    document.getElementById("global-music-bar")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.showScreen("settings");
    });

    // Player Header Bar Click -> Show Leaderboard
    document.getElementById("player-header-bar")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.renderLeaderboard();
      this.showScreen("leaderboard");
    });

    document.getElementById("btn-reset-data")?.addEventListener("click", () => {
      if (confirm("Reset all game progress and high scores?")) {
        this.game.storage.resetProgress();
        this.game.sound.playButtonClick();
        alert("Progress reset successfully!");
      }
    });

    // Results Screen Buttons
    document.getElementById("btn-res-play-again")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.game.startLevel(1);
    });

    document.getElementById("btn-res-leaderboard")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.renderLeaderboard();
      this.showScreen("leaderboard");
    });

    // Celebration Overlay Button
    document.getElementById("btn-finish-celebration")?.addEventListener("click", () => {
      this.game.sound.playButtonClick();
      this.showResultsScreen();
    });

    // Touch Controls Binding for Runner
    const btnLeft = document.getElementById("btn-touch-left");
    const btnRight = document.getElementById("btn-touch-right");
    const btnJump = document.getElementById("btn-touch-jump");

    if (btnLeft) {
      btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); this.game.input.left = true; });
      btnLeft.addEventListener("touchend", (e) => { e.preventDefault(); this.game.input.left = false; });
      btnLeft.addEventListener("mousedown", () => { this.game.input.left = true; });
      btnLeft.addEventListener("mouseup", () => { this.game.input.left = false; });
    }

    if (btnRight) {
      btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); this.game.input.right = true; });
      btnRight.addEventListener("touchend", (e) => { e.preventDefault(); this.game.input.right = false; });
      btnRight.addEventListener("mousedown", () => { this.game.input.right = true; });
      btnRight.addEventListener("mouseup", () => { this.game.input.right = false; });
    }

    if (btnJump) {
      btnJump.addEventListener("touchstart", (e) => { e.preventDefault(); this.game.input.jump = true; });
      btnJump.addEventListener("touchend", (e) => { e.preventDefault(); this.game.input.jump = false; });
      btnJump.addEventListener("mousedown", () => { this.game.input.jump = true; });
      btnJump.addEventListener("mouseup", () => { this.game.input.jump = false; });
    }

    // Touch Pads for Dhol Rhythm
    const pads = ["dha", "dhi", "ta", "na"];
    pads.forEach((pad, idx) => {
      const padElem = document.getElementById(`touch-pad-${pad}`);
      if (padElem) {
        const trigger = (e) => {
          e.preventDefault();
          if (this.game.currentLevel && this.game.currentLevel.triggerLane) {
            this.game.currentLevel.triggerLane(idx);
          }
        };
        padElem.addEventListener("touchstart", trigger);
        padElem.addEventListener("mousedown", trigger);
      }
    });
  }

  openWardrobeModal() {
    const save = this.game.storage.getSaveData();
    const equipped = save.equippedOutfit || "default";
    const totalStars = save.totalStars || 0;
    const grid = document.getElementById("wardrobe-grid");
    if (!grid) return;

    grid.innerHTML = "";
    (CONFIG.WARDROBE || []).forEach(outfit => {
      const isUnlocked = totalStars >= outfit.starsRequired;
      const isEquipped = equipped === outfit.id;

      const card = document.createElement("div");
      card.className = `wardrobe-card ${isEquipped ? "equipped" : ""} ${!isUnlocked ? "locked" : ""}`;

      card.innerHTML = `
        <div class="wardrobe-icon">${outfit.icon}</div>
        <div class="wardrobe-name">${outfit.name}</div>
        <div class="wardrobe-desc">${outfit.desc}</div>
        ${!isUnlocked 
          ? `<div class="wardrobe-unlock-badge">🔒 ${outfit.starsRequired} Stars Required</div>
             <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.8rem;" disabled>LOCKED</button>`
          : isEquipped
          ? `<button class="btn btn-gold" style="padding: 6px 16px; font-size: 0.8rem;" disabled>EQUIPPED</button>`
          : `<button class="btn btn-primary btn-equip-outfit" data-id="${outfit.id}" style="padding: 6px 16px; font-size: 0.8rem;">EQUIP</button>`
        }
      `;

      const equipBtn = card.querySelector(".btn-equip-outfit");
      if (equipBtn) {
        equipBtn.onclick = () => {
          this.game.sound.playButtonClick();
          if (outfit.id === "ghungroo") {
            this.game.sound.playGhungrooJingle();
          }
          this.game.storage.setEquippedOutfit(outfit.id);
          this.openWardrobeModal();
        };
      }

      grid.appendChild(card);
    });

    this.showModal("wardrobe");
  }

  openGreetingCardModal() {
    const nameInput = document.getElementById("input-card-name");
    const selectWish = document.getElementById("select-card-wish");

    if (selectWish && CONFIG.GREETING_WISHES) {
      selectWish.innerHTML = "";
      CONFIG.GREETING_WISHES.forEach(wish => {
        const opt = document.createElement("option");
        opt.value = wish;
        opt.textContent = wish.length > 55 ? wish.slice(0, 55) + "..." : wish;
        selectWish.appendChild(opt);
      });
    }

    if (nameInput) {
      // Pre-fill with auth player name if available
      const authName = this.game.auth.hasSession() ? this.game.auth.getPlayerName() : "";
      const existingName = document.getElementById("input-player-name")?.value.trim();
      nameInput.value = existingName || authName || "DEVOTEE";
      nameInput.oninput = () => this.renderGreetingCard();
    }

    if (selectWish) {
      selectWish.onchange = () => this.renderGreetingCard();
    }

    this.renderGreetingCard();
    this.showModal("greetingCard");
  }

  renderGreetingCard() {
    const canvas = document.getElementById("greeting-card-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // 1. Rich Festival Imperial Maroon Backdrop
    const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, 380);
    bgGrad.addColorStop(0, "#4A0E13");
    bgGrad.addColorStop(0.65, "#2B090C");
    bgGrad.addColorStop(1, "#150406");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ornate Double Gold Borders
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 4;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    ctx.strokeStyle = "#F77F00";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    // Corner decorative rosettes
    const corners = [
      { x: 28, y: 28 },
      { x: width - 28, y: 28 },
      { x: 28, y: height - 28 },
      { x: width - 28, y: height - 28 }
    ];
    corners.forEach(c => {
      ctx.fillStyle = "#FFB703";
      ctx.beginPath();
      ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Sacred Header Banner
    ctx.font = "bold 14px 'Cinzel', serif";
    ctx.fillStyle = "#FFD166";
    ctx.textAlign = "center";
    ctx.fillText("ॐ SHREE GANESHAYA NAMAH ॐ", width / 2, 44);

    // 4. Center Lord Ganesha
    this.game.sprites.renderLordGanesha(ctx, 140, 195, 0.72);

    // 5. Mushak on the right side
    const currentOutfit = this.game.storage.getEquippedOutfit();
    this.game.sprites.renderMushak(ctx, 245, 275, {
      scale: 0.85,
      anim: "celebrate",
      facing: -1,
      outfit: currentOutfit
    });

    // 6. Devotee Name & Rank
    const nameInput = document.getElementById("input-card-name");
    const playerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim().toUpperCase() : "BLESSED DEVOTEE";

    ctx.textAlign = "left";
    ctx.font = "bold 12px 'Cinzel', serif";
    ctx.fillStyle = "#F77F00";
    ctx.fillText("FESTIVAL BLESSINGS FOR:", 295, 85);

    ctx.font = "bold 20px 'Outfit', sans-serif";
    ctx.fillStyle = "#FFFDF6";
    ctx.fillText(playerName, 295, 112);

    // 7. Auspicious Quote / Wish
    const selectWish = document.getElementById("select-card-wish");
    const wishText = (selectWish && selectWish.value) ? selectWish.value : (CONFIG.GREETING_WISHES ? CONFIG.GREETING_WISHES[0] : "Ganpati Bappa Moriya!");

    ctx.font = "italic 13px 'Outfit', sans-serif";
    ctx.fillStyle = "#FFD166";

    // Word wrap wish text
    const maxTextWidth = 275;
    const words = wishText.split(" ");
    let line = "";
    let lineY = 145;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxTextWidth && n > 0) {
        ctx.fillText(line, 295, lineY);
        line = words[n] + " ";
        lineY += 19;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 295, lineY);

    // Decorative Diyas at bottom
    this.game.sprites.renderDiya(ctx, 330, 310, 0.7);
    this.game.sprites.renderDiya(ctx, 530, 310, 0.7);
    this.game.sprites.renderModak(ctx, 430, 305, 0.8, true);

    // Footer
    ctx.textAlign = "center";
    ctx.font = "bold 11px 'Cinzel', serif";
    ctx.fillStyle = "#FFFDF6";
    ctx.fillText("MUSHAK – BAPPA'S FESTIVAL QUEST • GANESH CHATURTHI 2026", width / 2, height - 22);
  }

  downloadGreetingCard() {
    this.renderGreetingCard();
    const canvas = document.getElementById("greeting-card-canvas");
    if (!canvas) return;

    this.game.sound.playButtonClick();
    this.game.sound.playShankhHorn();
    this.game.particles.addConfettiBurst(512, 200, 25);

    try {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = "Bappa_Festival_Blessings_2026.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.warn("Card download triggered:", e);
    }
  }

  setAartiLyric(lyricText) {
    const hudLyric = document.getElementById("aarti-current-lyric");
    if (hudLyric) {
      hudLyric.textContent = lyricText;
    }

    const globalText = document.getElementById("global-music-text");
    if (globalText) {
      globalText.textContent = lyricText;
    }
  }

  updateGlobalMusicLabel(trackId) {
    const labels = {
      bappa_aarti: "🪔 Sukh Karta Dukh Harta",
      festival_theme: "🌸 Raag Bhupali Theme",
      dhol_groove: "🥁 Dhol Chowk Groove"
    };
    const globalText = document.getElementById("global-music-text");
    if (globalText && labels[trackId]) {
      globalText.textContent = labels[trackId];
    }
  }
}

if (typeof window !== "undefined") {
  window.UIManager = UIManager;
}
