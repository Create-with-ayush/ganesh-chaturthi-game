/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Master Game Engine & State Machine
 */

class FestivalGame {
  constructor() {
    this.canvas = document.getElementById("game-canvas");
    this.ctx = this.canvas.getContext("2d");

    this.state = "BOOT";
    this.previousState = null;
    this.isPaused = false;

    // Auth system
    this.auth = new AuthManager();

    // Subsystems
    this.sound = new SoundManager();
    this.storage = new StorageManager();
    this.particles = new ParticleEngine();
    this.sprites = new SpriteRenderer();
    this.ui = null; // instantiated after DOM ready

    // Levels
    this.levels = {
      1: new ModakRushLevel(this),
      2: new PandalLevel(this),
      3: new RangoliLevel(this),
      4: new DholLevel(this),
      5: new EcoBonusLevel(this),
      6: new AartiCeremony(this),
      aarti: new AartiCeremony(this)
    };

    this.currentLevel = null;
    this.currentLevelId = 1;

    // Input state
    this.input = {
      left: false,
      right: false,
      up: false,
      down: false,
      jump: false
    };

    // Celebration sequence state
    this.celebrationTimer = 0;
    this.lastTime = 0;

    // Ambient background timer
    this.ambientPetalTimer = 0;
  }

  init() {
    this.ui = new UIManager(this);
    this._bindEvents();
    this._resizeCanvas();
    window.addEventListener("resize", () => this._resizeCanvas());

    this.sound.init();

    // Connect Aarti live lyric ticker
    this.sound.onAartiLyric = (lyric) => {
      if (this.ui && this.ui.setAartiLyric) {
        this.ui.setAartiLyric(lyric);
      }
    };

    // Check for existing auth session
    if (this.auth.hasSession()) {
      // User is already logged in, go to main menu
      this.returnToMainMenu();
      this.ui.updatePlayerHeader();
    } else {
      // Show auth screen
      this.showAuthScreen();
    }

    // Start Main Game Loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this._gameLoop(t));
  }

  _resizeCanvas() {
    const container = document.getElementById("canvas-container");
    if (!container) return;

    const targetWidth = CONFIG.CANVAS.WIDTH;
    const targetHeight = CONFIG.CANVAS.HEIGHT;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const scale = Math.min(containerWidth / targetWidth, containerHeight / targetHeight);

    this.canvasScale = scale;
    this.canvasBounds = this.canvas.getBoundingClientRect();
  }

  _bindEvents() {
    // Keyboard listeners
    window.addEventListener("keydown", (e) => {
      // Audio unlock on first key
      this.sound.ensureContext();

      if (e.code === "ArrowLeft" || e.code === "KeyA") {
        this.input.left = true;
        if (this.currentLevel && this.currentLevel.handleKeyDown) this.currentLevel.handleKeyDown("KeyA");
      }
      if (e.code === "ArrowRight" || e.code === "KeyD") {
        this.input.right = true;
        if (this.currentLevel && this.currentLevel.handleKeyDown) this.currentLevel.handleKeyDown("KeyD");
      }
      if (e.code === "ArrowUp" || e.code === "KeyW") {
        this.input.up = true;
      }
      if (e.code === "ArrowDown" || e.code === "KeyS") {
        this.input.down = true;
        if (this.currentLevel && this.currentLevel.handleKeyDown) this.currentLevel.handleKeyDown("KeyS");
      }
      if (e.code === "Space") {
        this.input.jump = true;
      }
      if (e.code === "KeyF") {
        if (this.currentLevel && this.currentLevel.handleKeyDown) this.currentLevel.handleKeyDown("KeyF");
      }
      if (e.code === "Escape") {
        if (this.state.startsWith("LEVEL_")) {
          this.togglePause();
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      if (e.code === "ArrowLeft" || e.code === "KeyA") this.input.left = false;
      if (e.code === "ArrowRight" || e.code === "KeyD") this.input.right = false;
      if (e.code === "ArrowUp" || e.code === "KeyW") this.input.up = false;
      if (e.code === "ArrowDown" || e.code === "KeyS") this.input.down = false;
      if (e.code === "Space") this.input.jump = false;
    });

    // Pointer events on Canvas (mapped to 1024x576 logical coordinates)
    const getCanvasPos = (evt) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
      const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    };

    this.canvas.addEventListener("mousedown", (e) => {
      this.sound.ensureContext();
      const pos = getCanvasPos(e);
      this._handlePointerDown(pos.x, pos.y);
    });

    this.canvas.addEventListener("mousemove", (e) => {
      const pos = getCanvasPos(e);
      this._handlePointerMove(pos.x, pos.y);
    });

    window.addEventListener("mouseup", (e) => {
      const pos = getCanvasPos(e);
      this._handlePointerUp(pos.x, pos.y);
    });

    this.canvas.addEventListener("touchstart", (e) => {
      this.sound.ensureContext();
      e.preventDefault();
      const pos = getCanvasPos(e);
      this._handlePointerDown(pos.x, pos.y);
    }, { passive: false });

    this.canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const pos = getCanvasPos(e);
      this._handlePointerMove(pos.x, pos.y);
    }, { passive: false });

    window.addEventListener("touchend", (e) => {
      const pos = getCanvasPos(e.changedTouches ? { clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY } : e);
      this._handlePointerUp(pos.x, pos.y);
    });
  }

  _handlePointerDown(x, y) {
    if (this.state === "FINAL_CELEBRATION") {
      this.sound.playTempleBell();
      this.particles.addConfettiBurst(x, y, 32);
      this.particles.addPetalBurst(x, y, 20);
      return;
    }

    if (this.currentLevel && this.currentLevel.handlePointerDown) {
      this.currentLevel.handlePointerDown(x, y);
    }
  }

  _handlePointerMove(x, y) {
    if (this.currentLevel && this.currentLevel.handlePointerMove) {
      this.currentLevel.handlePointerMove(x, y);
    }
  }

  _handlePointerUp(x, y) {
    if (this.currentLevel && this.currentLevel.handlePointerUp) {
      this.currentLevel.handlePointerUp(x, y);
    }
  }

  // ==========================================
  // STATE TRANSITIONS
  // ==========================================

  showAuthScreen() {
    this.state = "AUTH";
    this.currentLevel = null;
    this.particles.reset();
    this.ui.showScreen("auth");
    this.ui.setMobileControls("none");
  }

  onAuthComplete() {
    // Called after successful login/register
    this.ui.updatePlayerHeader();
    this.returnToMainMenu();
  }

  returnToMainMenu() {
    this.state = "MAIN_MENU";
    this.currentLevel = null;
    this.particles.reset();
    this.ui.showScreen("menu");
    this.ui.setMobileControls("none");
    const track = this.storage.getSelectedMusicTrack();
    this.sound.startMusic(track);
  }

  startStoryIntro() {
    this.state = "INTRO";
    this.ui.showScreen("intro");
    const track = this.storage.getSelectedMusicTrack();
    this.sound.startMusic(track);
  }

  openFestivalMap() {
    this.state = "MAP";
    this.currentLevel = null;
    this.particles.reset();
    this.ui.renderFestivalMap();
    this.ui.showScreen("map");
    this.ui.setMobileControls("none");
    const track = this.storage.getSelectedMusicTrack();
    this.sound.startMusic(track);
  }

  startAartiCeremony() {
    this.currentLevelId = "aarti";
    this.currentLevel = this.levels.aarti;
    this.state = "LEVEL_AARTI";
    this.isPaused = false;
    this.particles.reset();

    this.currentLevel.init();
    this.ui.showScreen("gameplay");
    this.ui.setMobileControls("none");
    this.sound.startMusic("bappa_aarti");
  }

  startLevel(levelId) {
    if (levelId === "aarti" || levelId === 6) {
      return this.startAartiCeremony();
    }
    const lvlNum = parseInt(levelId, 10);
    this.currentLevelId = lvlNum;
    this.currentLevel = this.levels[lvlNum];
    this.state = `LEVEL_${lvlNum}`;
    this.isPaused = false;
    this.particles.reset();

    this.currentLevel.init();
    this.ui.showScreen("gameplay");

    // Set mobile controls style
    if (lvlNum === 1) {
      this.ui.setMobileControls("runner");
    } else if (lvlNum === 4) {
      this.ui.setMobileControls("dhol");
    } else {
      this.ui.setMobileControls("none");
    }

    // Play appropriate music
    if (lvlNum === 4) {
      this.sound.startMusic("dhol_groove");
    } else {
      const track = this.storage.getSelectedMusicTrack();
      this.sound.startMusic(track);
    }
  }

  restartCurrentLevel() {
    if (this.currentLevelId) {
      this.startLevel(this.currentLevelId);
    }
  }

  togglePause() {
    if (this.isPaused) {
      this.isPaused = false;
      this.ui.hideModal("pause");
    } else {
      this.isPaused = true;
      this.ui.showModal("pause");
    }
  }

  showGameOverModal(data) {
    this.ui.showGameOverModal(data);
  }

  startFinalCelebration() {
    this.state = "FINAL_CELEBRATION";
    this.currentLevel = null;
    this.celebrationTimer = 0;
    this.particles.reset();

    this.ui.showScreen("celebrationOverlay");
    this.ui.setMobileControls("none");

    this.sound.startMusic("celebration");
    this.sound.playShankhHorn();

    // Initial big burst of flower petals & confetti
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this.particles.addConfettiBurst(200 + Math.random() * 600, 200 + Math.random() * 200, 35);
        this.particles.addPetalBurst(200 + Math.random() * 600, 200 + Math.random() * 200, 25);
      }, i * 300);
    }
  }

  // ==========================================
  // MAIN GAME LOOP (60 FPS)
  // ==========================================

  _gameLoop(time) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.05); // cap delta time
    this.lastTime = time;

    this._update(dt);
    this._render();

    requestAnimationFrame((t) => this._gameLoop(t));
  }

  _update(dt) {
    // Continuous ambient marigold petals
    this.ambientPetalTimer += dt;
    if (this.ambientPetalTimer > 0.4) {
      this.ambientPetalTimer = 0;
      this.particles.spawnAmbientPetal(CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);
    }

    this.sprites.update(dt);
    this.particles.update();

    if (this.isPaused) return;

    if (this.state.startsWith("LEVEL_") && this.currentLevel) {
      this.currentLevel.update(dt, this.input);

      // Update HUD
      if (this.currentLevelId === "aarti") {
        this.ui.updateHUD("Shri Ganesh Aarti", Math.round(this.currentLevel.devotion) + "%", 0, 0);
      } else {
        const lvlConfig = CONFIG.LEVELS[this.currentLevelId];
        this.ui.updateHUD(
          lvlConfig ? lvlConfig.name : "Festival Quest",
          this.currentLevel.score || 0,
          this.currentLevel.timeLeft !== undefined ? this.currentLevel.timeLeft : 0,
          this.currentLevel.combo || 0
        );
      }
    } else if (this.state === "FINAL_CELEBRATION") {
      this.celebrationTimer += dt;
      // Periodic confetti & flower petal showers
      if (Math.random() < 0.15) {
        this.particles.addPetalBurst(150 + Math.random() * 724, 150 + Math.random() * 250, 8);
      }
      if (Math.random() < 0.08) {
        this.particles.addConfettiBurst(200 + Math.random() * 624, 100 + Math.random() * 200, 14);
      }
    }
  }

  _render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    if (this.state.startsWith("LEVEL_") && this.currentLevel) {
      this.currentLevel.render();
    } else if (this.state === "FINAL_CELEBRATION") {
      this._renderFinalCelebrationScene(ctx);
    } else {
      // Menu / Intro / Map / Auth background scene
      this._renderMenuBackgroundScene(ctx);
    }

    // Always render particles over scene
    this.particles.render(ctx);
  }

  _renderMenuBackgroundScene(ctx) {
    // Rich Warm Indian Festival Night Backdrop
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT);
    bgGrad.addColorStop(0, "#150C0B");
    bgGrad.addColorStop(0.5, "#2C1412");
    bgGrad.addColorStop(1, "#3E1713");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    // Warm Golden Temple Silhouette in center
    ctx.save();
    ctx.fillStyle = "rgba(106, 4, 15, 0.4)";
    ctx.beginPath();
    ctx.arc(512, 380, 220, Math.PI, 0);
    ctx.fill();

    // Floating fairy lights
    ctx.strokeStyle = "rgba(255, 209, 102, 0.25)";
    ctx.lineWidth = 1.5;
    for (let x = 80; x < CONFIG.CANVAS.WIDTH; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(x + 60, 90, x + 120, 0);
      ctx.stroke();

      ctx.fillStyle = "#FFD166";
      ctx.beginPath();
      ctx.arc(x + 60, 50, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lord Ganesha subtle golden silhouette / centerpiece
    this.sprites.renderLordGanesha(ctx, 512, 310, 0.75);

    // Mushak in foreground welcoming the player
    this.sprites.renderMushak(ctx, 220, 470, {
      scale: 1.15,
      anim: "celebrate",
      facing: 1
    });

    // Decorative Diyas at bottom corners
    this.sprites.renderDiya(ctx, 120, 510, 0.9);
    this.sprites.renderDiya(ctx, 904, 510, 0.9);
    ctx.restore();
  }

  _renderFinalCelebrationScene(ctx) {
    // Grand Festive Pandal with all decorations active
    const bgGrad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS.HEIGHT);
    bgGrad.addColorStop(0, "#2B0B0E");
    bgGrad.addColorStop(0.5, "#480E14");
    bgGrad.addColorStop(1, "#180608");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, CONFIG.CANVAS.WIDTH, CONFIG.CANVAS.HEIGHT);

    // Grand Arch Dome
    ctx.strokeStyle = "#FFB703";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(512, 280, 250, Math.PI, 0);
    ctx.stroke();

    // Hanging Toran garlands
    for (let t = -8; t <= 8; t++) {
      const tx = 512 + t * 28;
      const ty = 90 + Math.pow(t / 8, 2) * 40;
      this.sprites.renderMarigoldFlower(ctx, tx, ty, 0.7);
    }

    // Hanging brass bells
    this.sprites.renderDiya(ctx, 280, 480, 1.0);
    this.sprites.renderDiya(ctx, 744, 480, 1.0);
    this.sprites.renderDiya(ctx, 380, 500, 0.85);
    this.sprites.renderDiya(ctx, 644, 500, 0.85);

    // Lord Ganesha in glorious full radiance at center throne
    this.sprites.renderLordGanesha(ctx, 512, 310, 1.15);

    // Mushak leaping happily beside Bappa
    this.sprites.renderMushak(ctx, 330, 440, {
      scale: 1.25,
      anim: "celebrate",
      facing: 1
    });

    // Giant Golden Modak Offerings at Bappa's lotus feet
    this.sprites.renderModak(ctx, 512, 450, 1.3, true);
    this.sprites.renderModak(ctx, 470, 460, 0.9, false);
    this.sprites.renderModak(ctx, 554, 460, 0.9, false);
  }
}

if (typeof window !== "undefined") {
  window.FestivalGame = FestivalGame;
}
