/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Level 1: Modak Rush
 * Fast-paced festive runner/platformer where Mushak gathers modaks and flowers.
 * COMPETITIVE: Hitting an obstacle = instant game over & full restart!
 */

class ModakRushLevel {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.width = CONFIG.CANVAS.WIDTH;
    this.height = CONFIG.CANVAS.HEIGHT;

    this.timeLeft = 60;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.modaksCollected = 0;
    this.specialModaksCollected = 0;
    this.flowersCollected = 0;

    this.isOver = false;
    this.isGameOver = false;
    this.groundY = 460;

    // Mushak physics
    this.player = {
      x: 180,
      y: this.groundY,
      vx: 0,
      vy: 0,
      speed: 380,
      jumpForce: -580,
      gravity: 1400,
      isGrounded: true,
      facing: 1,
      anim: "idle",
      stumbleTimer: 0,
      width: 44,
      height: 38
    };

    this.cameraX = 0;
    this.items = [];
    this.obstacles = [];
    this.decorations = [];

    this.spawnTimer = 0;
    this.obstacleTimer = 0;

    // Bappa's Blessing Prasad Surge & Modak Magnet
    this.prasadMeter = 0;
    this.isSurgeActive = false;
    this.surgeTimer = 0;
    this.stepGhungrooTimer = 0;
    this.purifiedCount = 0;

    // Game over animation
    this.gameOverTimer = 0;
    this.screenShakeTimer = 0;
    this.screenShakeIntensity = 0;

    // Danger indicator flash
    this.dangerFlash = 0;
  }

  init() {
    this.timeLeft = CONFIG.LEVELS[1].duration || 60;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.modaksCollected = 0;
    this.specialModaksCollected = 0;
    this.flowersCollected = 0;
    this.purifiedCount = 0;
    this.prasadMeter = 0;
    this.isSurgeActive = false;
    this.surgeTimer = 0;
    this.stepGhungrooTimer = 0;
    this.isOver = false;
    this.isGameOver = false;
    this.cameraX = 0;
    this.gameOverTimer = 0;
    this.screenShakeTimer = 0;
    this.screenShakeIntensity = 0;
    this.dangerFlash = 0;

    this.player.x = 180;
    this.player.y = this.groundY;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isGrounded = true;
    this.player.anim = "idle";
    this.player.stumbleTimer = 0;

    this.items = [];
    this.obstacles = [];

    // Pre-populate initial street section with sweets and flowers
    for (let i = 0; i < 8; i++) {
      this._spawnItem(350 + i * 140);
    }
    for (let i = 0; i < 3; i++) {
      this._spawnObstacle(500 + i * 380);
    }
  }

  _spawnItem(forceX = null) {
    const x = forceX !== null ? forceX : this.cameraX + this.width + 50 + Math.random() * 120;
    const rand = Math.random();
    let type = "golden_modak";
    let y = this.groundY - 15 - Math.random() * 90;

    if (rand < 0.20) {
      type = "special_modak";
      y = this.groundY - 50 - Math.random() * 70;
    } else if (rand < 0.50) {
      type = "flower";
      y = this.groundY - 10 - Math.random() * 60;
    }

    this.items.push({
      x,
      y,
      type,
      collected: false,
      pulse: Math.random() * Math.PI * 2
    });
  }

  _spawnObstacle(forceX = null) {
    const x = forceX !== null ? forceX : this.cameraX + this.width + 120 + Math.random() * 220;
    const typeRoll = Math.random();
    let type, width, height;

    if (typeRoll < 0.25) {
      type = "fire_cracker";
      width = 28;
      height = 32;
    } else if (typeRoll < 0.45) {
      type = "water_splash";
      width = 52;
      height = 22;
    } else if (typeRoll < 0.65) {
      type = "powder_bowl";
      width = 32;
      height = 28;
    } else if (typeRoll < 0.80) {
      type = "box";
      width = 32;
      height = 28;
    } else {
      type = "barricade";
      width = 38;
      height = 36;
    }

    this.obstacles.push({
      x,
      y: this.groundY + 8,
      type,
      hit: false,
      width,
      height,
      animPhase: Math.random() * Math.PI * 2
    });
  }

  update(dt, input) {
    if (this.isOver || this.isGameOver) return;

    // Screen shake decay
    if (this.screenShakeTimer > 0) {
      this.screenShakeTimer -= dt;
    }

    // Timer countdown
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.completeLevel();
      return;
    }

    // Input & Player Movement
    if (this.player.stumbleTimer > 0) {
      this.player.stumbleTimer -= dt;
      this.player.vx *= 0.88;
      this.player.anim = "stumble";
    } else {
      let moveDir = 0;
      if (input.left) moveDir -= 1;
      if (input.right) moveDir += 1;

      if (moveDir !== 0) {
        this.player.vx = moveDir * this.player.speed;
        this.player.facing = moveDir;
        if (this.player.isGrounded) this.player.anim = "run";
      } else {
        this.player.vx *= 0.6;
        if (Math.abs(this.player.vx) < 10) this.player.vx = 0;
        if (this.player.isGrounded) this.player.anim = "idle";
      }

      // Jump (Space or Up or touch Jump)
      if ((input.jump || input.up) && this.player.isGrounded) {
        this.player.vy = this.player.jumpForce;
        this.player.isGrounded = false;
        this.player.anim = "jump";
        this.game.particles.addSparkles(this.player.x, this.player.y + 10, 6, "#FFD166");
      }
    }

    // Apply gravity
    this.player.vy += this.player.gravity * dt;
    this.player.x += this.player.vx * dt;
    this.player.y += this.player.vy * dt;

    // Musical Ghungroo Footsteps
    const outfit = (this.game.storage && this.game.storage.getEquippedOutfit) ? this.game.storage.getEquippedOutfit() : "default";
    if ((outfit === "ghungroo" || outfit === "royal_pitambara") && this.player.isGrounded && Math.abs(this.player.vx) > 60) {
      this.stepGhungrooTimer += dt;
      if (this.stepGhungrooTimer > 0.22) {
        this.stepGhungrooTimer = 0;
        this.game.sound.playGhungrooJingle();
      }
    }

    // Prasad Surge Timer & Aura update
    if (this.isSurgeActive) {
      this.surgeTimer -= dt;
      this.prasadMeter = Math.max(0, (this.surgeTimer / 6.0) * 100);
      if (Math.random() < 0.65) {
        this.game.particles.addHolyAuraTrail(this.player.x - this.cameraX, this.player.y - 12);
      }
      if (this.surgeTimer <= 0) {
        this.isSurgeActive = false;
        this.prasadMeter = 0;
        this.game.particles.addFloatingText("SURGE COMPLETE", this.player.x - this.cameraX, this.player.y - 50, "#FFD166", 20);
      }
    }

    // Modak Magnet Mechanics (Pulls sweets towards Mushak during Prasad Surge)
    if (this.isSurgeActive) {
      const magnetRadius = 320;
      for (const item of this.items) {
        if (item.collected) continue;
        const dx = this.player.x - item.x;
        const dy = (this.player.y - 12) - item.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < magnetRadius && dist > 2) {
          const pullSpeed = 480 * dt;
          item.x += (dx / dist) * pullSpeed;
          item.y += (dy / dist) * pullSpeed;
          if (Math.random() < 0.25) {
            this.game.particles.addSparkles(item.x - this.cameraX, item.y, 2, "#FFD166");
          }
        }
      }
    }

    // Ground collision
    if (this.player.y >= this.groundY) {
      this.player.y = this.groundY;
      this.player.vy = 0;
      this.player.isGrounded = true;
      if (this.player.anim === "jump") {
        this.player.anim = Math.abs(this.player.vx) > 10 ? "run" : "idle";
      }
    }

    // Smooth camera tracking
    const targetCamX = this.player.x - 220;
    this.cameraX += (targetCamX - this.cameraX) * 0.1;
    if (this.cameraX < 0) this.cameraX = 0;

    // Prevent player backtracking too far behind camera
    if (this.player.x < this.cameraX + 40) {
      this.player.x = this.cameraX + 40;
      this.player.vx = 0;
    }

    // Spawning items & obstacles ahead
    this.spawnTimer += dt;
    if (this.spawnTimer > 0.8) {
      this.spawnTimer = 0;
      if (this.items.length < 16) {
        this._spawnItem();
      }
    }

    this.obstacleTimer += dt;
    if (this.obstacleTimer > 1.8) {
      this.obstacleTimer = 0;
      if (this.obstacles.length < 10) {
        this._spawnObstacle();
      }
    }

    // Animate obstacle phases
    for (const obs of this.obstacles) {
      obs.animPhase += dt * 3;
    }

    // Item Collection Collision
    for (const item of this.items) {
      if (item.collected) continue;
      const dx = this.player.x - item.x;
      const dy = (this.player.y - 12) - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 46) {
        item.collected = true;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        // Combo multiplier
        let mult = 1;
        if (this.combo >= 15) mult = 5;
        else if (this.combo >= 7) mult = 3;
        else if (this.combo >= 3) mult = 2;

        let points = 0;
        let meterGain = 0;
        if (item.type === "golden_modak") {
          points = 100 * mult;
          meterGain = 14;
          this.modaksCollected++;
          this.game.sound.playModakCollect(false);
          this.game.particles.addSparkles(item.x - this.cameraX, item.y, 10, "#FFD166");
          this.game.particles.addFloatingText(`+${points}`, item.x - this.cameraX, item.y - 10, "#FFD166", 22);
        } else if (item.type === "special_modak") {
          points = 250 * mult;
          meterGain = 30;
          this.specialModaksCollected++;
          this.modaksCollected++;
          this.game.sound.playModakCollect(true);
          this.game.particles.addSparkles(item.x - this.cameraX, item.y, 18, "#FFF9D2");
          this.game.particles.addFloatingText(`SPECIAL! +${points}`, item.x - this.cameraX, item.y - 15, "#FFF9D2", 24, true);
        } else if (item.type === "flower") {
          points = 50 * mult;
          meterGain = 8;
          this.flowersCollected++;
          this.game.sound.playFlowerCollect();
          this.game.particles.addPetalBurst(item.x - this.cameraX, item.y, 10);
          this.game.particles.addFloatingText(`+${points}`, item.x - this.cameraX, item.y - 10, "#F77F00", 20);
        }

        this.score += points;

        // Charge Prasad Surge Meter
        if (!this.isSurgeActive) {
          this.prasadMeter = Math.min(100, this.prasadMeter + meterGain);
          // Trigger Prasad Surge when meter is filled or at high combo
          if (this.prasadMeter >= 100 || this.combo === 8) {
            this.isSurgeActive = true;
            this.surgeTimer = 6.0;
            this.prasadMeter = 100;
            this.game.sound.playSurgeActivate();
            this.game.particles.addFloatingText("PRASAD SURGE!", this.player.x - this.cameraX, this.player.y - 65, "#FFD166", 28, true);
            this.game.particles.addConfettiBurst(this.player.x - this.cameraX, this.player.y - 30, 25);
            this.game.particles.addPetalBurst(this.player.x - this.cameraX, this.player.y - 30, 20);
          }
        }

        if (this.combo === 3 || this.combo === 7 || this.combo === 15) {
          this.game.sound.playComboStinger(this.combo);
          this.game.particles.addFloatingText(`COMBO x${mult}!`, item.x - this.cameraX, item.y - 35, "#D62828", 26, true);
        }
      }
    }

    // Clean up passed items
    this.items = this.items.filter(it => !it.collected && it.x > this.cameraX - 100);

    // Obstacle Collision — COMPETITIVE: Hit = Game Over!
    for (const obs of this.obstacles) {
      if (obs.hit) continue;
      const dx = Math.abs(this.player.x - obs.x);
      const dy = Math.abs(this.player.y - obs.y);

      if (dx < obs.width * 0.75 && dy < obs.height + 10 && this.player.isGrounded) {
        obs.hit = true;
        if (this.isSurgeActive) {
          // Bappa's Blessing: Purify Obstacle into Flower Petals!
          this.purifiedCount++;
          const purifyPoints = 300;
          this.score += purifyPoints;
          this.game.sound.playObstaclePurify();
          this.game.particles.addPetalBurst(obs.x - this.cameraX, obs.y, 22);
          this.game.particles.addSparkles(obs.x - this.cameraX, obs.y, 14, "#FFD166");
          this.game.particles.addFloatingText("SHUBH! +300", obs.x - this.cameraX, obs.y - 30, "#FFD166", 24, true);
        } else {
          // GAME OVER — Obstacle hit!
          this.triggerGameOver(obs);
          return;
        }
      }
    }

    // Clean up passed obstacles
    this.obstacles = this.obstacles.filter(ob => ob.x > this.cameraX - 100);
  }

  triggerGameOver(obs) {
    this.isGameOver = true;
    this.isOver = true;

    // Screen shake effect
    this.screenShakeTimer = 0.5;
    this.screenShakeIntensity = 12;

    // Visual feedback
    this.game.sound.playObstacleHit();
    this.game.particles.addFloatingText("💥 CRASH!", obs.x - this.cameraX, obs.y - 40, "#D62828", 28, true);
    this.game.particles.addSparkles(obs.x - this.cameraX, obs.y, 20, "#D62828");

    // Add canvas-container shake class
    const container = document.getElementById("canvas-container");
    if (container) {
      container.classList.add("screen-shake");
      setTimeout(() => container.classList.remove("screen-shake"), 500);
    }

    // Show game over modal after brief delay
    setTimeout(() => {
      this.game.showGameOverModal({
        score: this.score,
        modaksCollected: this.modaksCollected,
        maxCombo: this.maxCombo,
        obstacleType: obs.type,
        timeElapsed: Math.round((CONFIG.LEVELS[1].duration || 60) - this.timeLeft)
      });
    }, 600);
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // Apply screen shake offset
    if (this.screenShakeTimer > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShakeIntensity * (this.screenShakeTimer / 0.5);
      const shakeY = (Math.random() - 0.5) * this.screenShakeIntensity * (this.screenShakeTimer / 0.5);
      ctx.translate(shakeX, shakeY);
    }

    // 1. Background Sky & Festive street architecture
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, "#191110");
    skyGrad.addColorStop(0.5, "#2D1814");
    skyGrad.addColorStop(1, "#441D17");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Parallax festive flags & decorative lights in background
    ctx.save();
    const bgOffset = this.cameraX * 0.3;
    ctx.strokeStyle = "rgba(255, 209, 102, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let bx = -100; bx < this.width + 200; bx += 90) {
      const screenX = bx - (bgOffset % 90);
      ctx.quadraticCurveTo(screenX + 45, 110, screenX + 90, 85);
      // Small hanging fairy bulbs
      ctx.fillStyle = (bx % 180 === 0) ? "#FFD166" : "#F77F00";
      ctx.beginPath();
      ctx.arc(screenX + 45, 100, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.stroke();

    // Distant street pandal arch outlines
    ctx.fillStyle = "rgba(106, 4, 15, 0.35)";
    for (let px = 0; px < this.width + 400; px += 350) {
      const archX = px - (bgOffset % 350);
      ctx.beginPath();
      ctx.arc(archX + 80, 320, 110, Math.PI, 0);
      ctx.lineTo(archX + 190, this.groundY);
      ctx.lineTo(archX - 30, this.groundY);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 2. Hanging Marigold & Mango Leaf Toran along the street
    ctx.save();
    const toranOffset = this.cameraX * 0.6;
    for (let tx = -120; tx < this.width + 200; tx += 160) {
      const tScreenX = tx - (toranOffset % 160);
      // Toran rope
      ctx.strokeStyle = "#2D6A4F";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(tScreenX, 160);
      ctx.quadraticCurveTo(tScreenX + 80, 200, tScreenX + 160, 160);
      ctx.stroke();

      // Hanging marigolds & green mango leaves
      for (let m = 0; m < 5; m++) {
        const mx = tScreenX + 26 + m * 26;
        const my = 175 + Math.sin((m / 4) * Math.PI) * 16;
        this.game.sprites.renderMarigoldFlower(ctx, mx, my, 0.6);
      }
    }
    ctx.restore();

    // 3. Street Ground & Rangoli Border Pathway
    const groundGrad = ctx.createLinearGradient(0, this.groundY + 12, 0, this.height);
    groundGrad.addColorStop(0, "#2D1B18");
    groundGrad.addColorStop(0.3, "#421E19");
    groundGrad.addColorStop(1, "#180C0A");
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, this.groundY + 14, this.width, this.height - (this.groundY + 14));

    // Auspicious Golden Border line
    ctx.fillStyle = "#FFB703";
    ctx.fillRect(0, this.groundY + 14, this.width, 5);

    // Decorative Street Rangoli Kolam Pattern on ground
    ctx.fillStyle = "rgba(255, 253, 246, 0.35)";
    const rOffset = this.cameraX % 40;
    for (let rx = -40; rx < this.width + 40; rx += 40) {
      ctx.beginPath();
      ctx.arc(rx - rOffset, this.groundY + 28, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Street Diyas along the ground
    const diyaOffset = this.cameraX % 220;
    for (let dx = -100; dx < this.width + 220; dx += 220) {
      this.game.sprites.renderDiya(ctx, dx - diyaOffset, this.groundY + 10, 0.7);
    }

    // 5. Render Obstacles with DANGER indicators
    for (const obs of this.obstacles) {
      const screenX = obs.x - this.cameraX;
      if (screenX > -50 && screenX < this.width + 50) {
        // Danger glow under obstacle (pulsing red)
        if (!this.isSurgeActive) {
          const glowIntensity = 0.3 + Math.sin(obs.animPhase) * 0.15;
          ctx.save();
          ctx.fillStyle = `rgba(214, 40, 40, ${glowIntensity})`;
          ctx.beginPath();
          ctx.ellipse(screenX, obs.y + 12, obs.width * 0.9, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // Warning triangle above dangerous obstacles
          if (obs.type === "fire_cracker" || obs.type === "barricade") {
            const bobY = Math.sin(obs.animPhase * 1.5) * 3;
            ctx.save();
            ctx.font = "bold 14px 'Outfit', sans-serif";
            ctx.fillStyle = `rgba(214, 40, 40, ${0.6 + Math.sin(obs.animPhase * 2) * 0.3})`;
            ctx.textAlign = "center";
            ctx.fillText("⚠️", screenX, obs.y - 30 + bobY);
            ctx.restore();
          }
        }

        this.game.sprites.renderObstacle(ctx, screenX, obs.y, obs.type, 1.0);
      }
    }

    // 6. Render Collectible Items
    for (const item of this.items) {
      if (item.collected) continue;
      const screenX = item.x - this.cameraX;
      if (screenX > -50 && screenX < this.width + 50) {
        const floatY = item.y + Math.sin(this.game.sprites.animTime * 4 + item.pulse) * 4;
        if (item.type === "golden_modak") {
          this.game.sprites.renderModak(ctx, screenX, floatY, 0.9, false);
        } else if (item.type === "special_modak") {
          this.game.sprites.renderModak(ctx, screenX, floatY, 1.1, true);
        } else if (item.type === "flower") {
          this.game.sprites.renderMarigoldFlower(ctx, screenX, floatY, 0.9);
        }
      }
    }

    // 7. Render Mushak
    const playerScreenX = this.player.x - this.cameraX;
    this.game.sprites.renderMushak(ctx, playerScreenX, this.player.y, {
      scale: 1.05,
      anim: this.player.anim,
      facing: this.player.facing,
      isSurge: this.isSurgeActive
    });

    // 8. In-Canvas Prasad Surge Meter HUD (Bottom Left)
    const barX = 24;
    const barY = this.height - 34;
    const barWidth = 180;
    const barHeight = 16;
    const fillRatio = Math.min(1.0, this.prasadMeter / 100);

    ctx.save();
    // Meter Backing Card
    ctx.fillStyle = "rgba(20, 13, 12, 0.75)";
    ctx.beginPath();
    ctx.roundRect(barX - 8, barY - 22, barWidth + 64, 42, 10);
    ctx.fill();
    ctx.strokeStyle = this.isSurgeActive ? "#FFD166" : "rgba(255, 183, 3, 0.4)";
    ctx.lineWidth = this.isSurgeActive ? 2 : 1;
    ctx.stroke();

    // Meter Label
    ctx.font = "bold 11px 'Outfit', sans-serif";
    ctx.fillStyle = this.isSurgeActive ? "#FFD166" : "#FFFDF6";
    ctx.textAlign = "left";
    ctx.fillText(this.isSurgeActive ? "⚡ PRASAD SURGE ACTIVE!" : "🥟 PRASAD METER", barX, barY - 7);

    // Percentage
    ctx.textAlign = "right";
    ctx.fillStyle = "#FFB703";
    ctx.fillText(`${Math.round(this.prasadMeter)}%`, barX + barWidth + 48, barY - 7);

    // Track
    ctx.fillStyle = "rgba(40, 20, 18, 0.8)";
    ctx.beginPath();
    ctx.roundRect(barX, barY, barWidth + 48, barHeight, 6);
    ctx.fill();

    // Fill
    if (fillRatio > 0) {
      const fillGrad = ctx.createLinearGradient(barX, 0, barX + (barWidth + 48) * fillRatio, 0);
      if (this.isSurgeActive) {
        fillGrad.addColorStop(0, "#D62828");
        fillGrad.addColorStop(0.5, "#F77F00");
        fillGrad.addColorStop(1, "#FFD166");
      } else {
        fillGrad.addColorStop(0, "#F77F00");
        fillGrad.addColorStop(1, "#FFB703");
      }
      ctx.fillStyle = fillGrad;
      ctx.beginPath();
      ctx.roundRect(barX, barY, Math.max(8, (barWidth + 48) * fillRatio), barHeight, 6);
      ctx.fill();
    }
    ctx.restore();

    // 9. Danger Warning HUD indicator (bottom right) when near obstacles
    if (!this.isSurgeActive) {
      let nearestDist = Infinity;
      for (const obs of this.obstacles) {
        if (obs.hit) continue;
        const dist = obs.x - this.player.x;
        if (dist > 0 && dist < 250) {
          nearestDist = Math.min(nearestDist, dist);
        }
      }
      if (nearestDist < 250) {
        const urgency = 1 - (nearestDist / 250);
        ctx.save();
        ctx.fillStyle = `rgba(214, 40, 40, ${0.15 + urgency * 0.25})`;
        ctx.beginPath();
        ctx.roundRect(this.width - 160, this.height - 34, 140, 24, 8);
        ctx.fill();
        ctx.strokeStyle = `rgba(214, 40, 40, ${0.4 + urgency * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.font = "bold 11px 'Outfit', sans-serif";
        ctx.fillStyle = `rgba(255, 107, 107, ${0.6 + urgency * 0.4})`;
        ctx.textAlign = "center";
        ctx.fillText("⚠️ OBSTACLE AHEAD!", this.width - 90, this.height - 18);
        ctx.restore();
      }
    }

    // Game over red flash overlay
    if (this.isGameOver) {
      ctx.fillStyle = "rgba(214, 40, 40, 0.35)";
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }

  completeLevel() {
    this.isOver = true;
    this.game.sound.playLevelComplete();

    // Calculate stars
    let stars = 1;
    const thresholds = CONFIG.LEVELS[1].starThresholds;
    if (this.score >= thresholds[2]) stars = 3;
    else if (this.score >= thresholds[1]) stars = 2;

    this.game.storage.updateLevelProgress(1, this.score, stars, this.maxCombo);

    this.game.ui.showLevelCompleteModal({
      levelId: 1,
      title: "MODAK MASTER!",
      score: this.score,
      maxScore: CONFIG.LEVELS[1].maxScore,
      stars: stars,
      bestCombo: this.maxCombo,
      stats: [
        { label: "Modaks Gathered", value: this.modaksCollected },
        { label: "Special Modaks", value: this.specialModaksCollected },
        { label: "Festival Flowers", value: this.flowersCollected },
        { label: "Obstacles Purified", value: this.purifiedCount },
        { label: "Max Combo Streak", value: `x${this.maxCombo}` }
      ],
      nextLevelId: 2,
      bappaMessage: CONFIG.LEVELS[1].completionMessage
    });
  }
}

if (typeof window !== "undefined") {
  window.ModakRushLevel = ModakRushLevel;
}
