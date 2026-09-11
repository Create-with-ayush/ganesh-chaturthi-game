/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Bonus / Special Mode: Shri Ganesh Aarti & Shankh Ceremony
 * An interactive, culturally authentic ritual simulator where devotees swirl
 * the Karpura Aarti Thali clockwise around Lord Ganesha, ring temple bells,
 * sound the resonant Shankh horn, and shower sacred marigold Pushpanjali.
 */

class AartiCeremony {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.width = CONFIG.CANVAS.WIDTH;
    this.height = CONFIG.CANVAS.HEIGHT;

    this.center = { x: 512, y: 270 }; // Bappa's center
    this.thaliPos = { x: 512, y: 440 };
    this.lastThaliPos = { x: 512, y: 440 };
    this.targetThaliPos = { x: 512, y: 440 };

    this.isDragging = false;
    this.devotion = 0;
    this.maxDevotion = 100;
    this.isComplete = false;
    this.completionTimer = 0;

    // Angle tracking for clockwise circular motion detection
    this.lastAngle = Math.PI / 2; // bottom
    this.accumulatedAngle = 0;
    this.circleCount = 0;

    // Interactive props
    this.bellRinging = false;
    this.bellTimer = 0;
    this.shankhBlowing = false;
    this.shankhTimer = 0;

    // Ambient incense smoke timer
    this.smokeTimer = 0;

    // UI Buttons for touch & click
    this.buttons = [
      { id: "bell", label: "🔔 RING BELL", x: 220, y: 515, w: 150, h: 44, color: "#FFB703" },
      { id: "shankh", label: "🪘 BLOW SHANKH", x: 436, y: 515, w: 160, h: 44, color: "#F77F00" },
      { id: "flower", label: "🌸 OFFER FLOWERS", x: 660, y: 515, w: 160, h: 44, color: "#D62828" }
    ];
  }

  init() {
    this.devotion = 0;
    this.isComplete = false;
    this.completionTimer = 0;
    this.circleCount = 0;
    this.accumulatedAngle = 0;
    this.lastAngle = Math.PI / 2;
    this.thaliPos = { x: 512, y: 430 };
    this.targetThaliPos = { x: 512, y: 430 };
    this.lastThaliPos = { x: 512, y: 430 };
    this.isDragging = false;

    // Start peaceful Raag Bhupali festive music
    this.game.sound.startMusic("festival_theme");
    this.game.sound.playTempleBell();
  }

  handlePointerDown(x, y) {
    if (this.isComplete) {
      // Click Return to map
      if (x >= 392 && x <= 632 && y >= 330 && y <= 380) {
        this.game.sound.playButtonClick();
        this.game.openFestivalMap();
      }
      return;
    }

    // Check interactive bottom buttons
    for (const btn of this.buttons) {
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        this.triggerButton(btn.id);
        return;
      }
    }

    // Check click near thali to start dragging
    const dx = x - this.thaliPos.x;
    const dy = y - this.thaliPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 110) {
      this.isDragging = true;
      this.targetThaliPos.x = x;
      this.targetThaliPos.y = y;
    } else {
      // Tap on Bappa or background sprinkles flower petals & Akshata
      this.game.sound.playAkshataScatter();
      this.game.particles.addPetalBurst(x, y, 10);
      this.game.particles.addAkshataShower(x, y, 12);
      this.addDevotion(2.5);
    }
  }

  handlePointerMove(x, y) {
    if (this.isDragging) {
      // Keep thali in reasonable boundary around Bappa
      const minX = 260;
      const maxX = 764;
      const minY = 100;
      const maxY = 470;
      this.targetThaliPos.x = Math.max(minX, Math.min(maxX, x));
      this.targetThaliPos.y = Math.max(minY, Math.min(maxY, y));
    }
  }

  handlePointerUp() {
    this.isDragging = false;
  }

  triggerButton(action) {
    if (action === "bell") {
      this.bellRinging = true;
      this.bellTimer = 0.5;
      this.game.sound.playTempleBell();
      this.game.particles.addSparkles(295, 480, 10, "#FFD166");
      this.addDevotion(4);
    } else if (action === "shankh") {
      this.shankhBlowing = true;
      this.shankhTimer = 2.4;
      this.game.sound.playShankhHorn();
      this.game.particles.addShockwave(512, 270, "#FFD166", 180);
      this.game.particles.addSparkles(516, 480, 16, "#FFFDF6");
      this.addDevotion(8);
    } else if (action === "flower") {
      this.game.sound.playAkshataScatter();
      this.game.particles.addPetalBurst(512, 330, 22);
      this.game.particles.addAkshataShower(512, 330, 24);
      this.addDevotion(5);
    }
  }

  addDevotion(amount) {
    if (this.isComplete) return;
    this.devotion = Math.min(this.maxDevotion, this.devotion + amount);

    if (this.devotion >= this.maxDevotion) {
      this.completeCeremony();
    }
  }

  update(dt) {
    // Smooth thali physics
    this.lastThaliPos.x = this.thaliPos.x;
    this.lastThaliPos.y = this.thaliPos.y;
    this.thaliPos.x += (this.targetThaliPos.x - this.thaliPos.x) * 0.28;
    this.thaliPos.y += (this.targetThaliPos.y - this.thaliPos.y) * 0.28;

    // Emit fragrant incense smoke from the agarbatti tip
    this.smokeTimer += dt;
    if (this.smokeTimer > 0.08) {
      this.smokeTimer = 0;
      this.game.particles.addSmokeSwirl(this.thaliPos.x + 36, this.thaliPos.y + 4);
    }

    // Measure circular motion around Bappa (512, 270)
    const curDx = this.thaliPos.x - this.center.x;
    const curDy = this.thaliPos.y - this.center.y;
    const currentAngle = Math.atan2(curDy, curDx);

    let angleDiff = currentAngle - this.lastAngle;
    // Normalize angle jump across -PI / +PI boundary
    if (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    if (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    // Clockwise motion = positive angle change
    if (angleDiff > 0.02 && angleDiff < 0.6) {
      this.accumulatedAngle += angleDiff;
      // When ~1 full clockwise circle is made
      if (this.accumulatedAngle >= Math.PI * 2) {
        this.accumulatedAngle -= Math.PI * 2;
        this.circleCount++;
        this.addDevotion(12);
        this.game.sound.playTempleBell();
        this.game.particles.addSparkles(this.thaliPos.x, this.thaliPos.y, 8, "#FFD166");
        this.game.particles.addFloatingText("AARTI PRADAKSHINA! 🪔", 512, 170, "#FFD166", 22, true);
      }
    }
    this.lastAngle = currentAngle;

    // Timers
    if (this.bellTimer > 0) this.bellTimer -= dt;
    if (this.shankhTimer > 0) this.shankhTimer -= dt;

    if (this.isComplete) {
      this.completionTimer += dt;
      if (Math.random() < 0.15) {
        this.game.particles.addPetalBurst(200 + Math.random() * 624, 120 + Math.random() * 200, 8);
      }
      if (Math.random() < 0.1) {
        this.game.particles.addConfettiBurst(200 + Math.random() * 624, 120 + Math.random() * 200, 10);
      }
    }
  }

  completeCeremony() {
    this.isComplete = true;
    this.game.sound.playCrowdCheer();
    this.game.sound.playShankhHorn();
    this.game.sound.playLevelComplete();

    // Reward player with stars and score
    this.game.storage.updateLevelProgress(5, 1000, 3, 20);

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        this.game.particles.addConfettiBurst(300 + Math.random() * 424, 180 + Math.random() * 160, 30);
        this.game.particles.addPetalBurst(300 + Math.random() * 424, 180 + Math.random() * 160, 25);
        this.game.particles.addAkshataShower(300 + Math.random() * 424, 180 + Math.random() * 160, 30);
      }, i * 350);
    }
  }

  render() {
    const ctx = this.ctx;
    const time = this.game.sprites.animTime;

    // 1. Warm Sacred Temple Sanctum Backdrop (Garbhagriha)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, "#19080A");
    bgGrad.addColorStop(0.45, "#380D12");
    bgGrad.addColorStop(1, "#180608");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Ornate Golden Arch around Lord Ganesha
    ctx.strokeStyle = "rgba(255, 183, 3, 0.4)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(this.center.x, this.center.y + 20, 230, Math.PI, 0);
    ctx.stroke();

    // Sacred Om symbol glow behind Bappa
    ctx.save();
    ctx.font = "bold 90px 'Cinzel', serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 183, 3, 0.12)";
    ctx.fillText("ॐ", this.center.x, this.center.y - 100);
    ctx.restore();

    // Circular Aarti Guidance Ring
    ctx.save();
    ctx.setLineDash([8, 12]);
    ctx.strokeStyle = "rgba(255, 209, 102, 0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(this.center.x, this.center.y + 40, 190, 130, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Clockwise guidance arrows
    const arrowAng = time * 1.5;
    const ax = this.center.x + Math.cos(arrowAng) * 190;
    const ay = this.center.y + 40 + Math.sin(arrowAng) * 130;
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.arc(ax, ay, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Hanging Brass Samai Diyas on both pillars
    this.game.sprites.renderDiya(ctx, 160, 420, 1.1);
    this.game.sprites.renderDiya(ctx, 864, 420, 1.1);
    this.game.sprites.renderDiya(ctx, 240, 450, 0.85);
    this.game.sprites.renderDiya(ctx, 784, 450, 0.85);

    // 2. Lord Ganesha in Divine Center Radiance
    const ganeshaScale = this.isComplete ? 1.25 : 1.15;
    this.game.sprites.renderLordGanesha(ctx, this.center.x, this.center.y + 25, ganeshaScale);

    // 3. Mushak Reverently Ringing the Ghanti beside Bappa
    const mushakAnim = this.isComplete ? "celebrate" : "idle";
    this.game.sprites.renderMushak(ctx, 310, 440, {
      scale: 1.15,
      anim: mushakAnim,
      facing: 1
    });

    // 4. Render Active Karpura Aarti Thali
    const tiltX = (this.thaliPos.x - this.lastThaliPos.x) * 0.15;
    const tiltY = (this.thaliPos.y - this.lastThaliPos.y) * 0.15;
    this.game.sprites.renderAartiThali(ctx, this.thaliPos.x, this.thaliPos.y, 1.2, {
      tiltX,
      tiltY
    });

    // 5. Header HUD: Devotion Meter & Title
    this._renderAartiHUD(ctx);

    // 6. Interactive Bottom Buttons
    this._renderButtons(ctx);

    // 7. Completion Fanfare Overlay
    if (this.isComplete) {
      this._renderCompletionBanner(ctx);
    }
  }

  _renderAartiHUD(ctx) {
    const barWidth = 360;
    const barHeight = 20;
    const barX = (this.width - barWidth) / 2;
    const barY = 32;
    const ratio = Math.min(1.0, this.devotion / this.maxDevotion);

    ctx.save();
    // Card
    ctx.fillStyle = "rgba(20, 13, 12, 0.85)";
    ctx.beginPath();
    ctx.roundRect(barX - 40, barY - 24, barWidth + 80, 56, 14);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 183, 3, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Title
    ctx.font = "bold 13px 'Cinzel', serif";
    ctx.fillStyle = "#FFD166";
    ctx.textAlign = "center";
    ctx.fillText("🪔 SHRI GANESH AARTI & DEVOTION", this.width / 2, barY - 8);

    // Gauge Track
    ctx.fillStyle = "rgba(40, 20, 18, 0.9)";
    ctx.beginPath();
    ctx.roundRect(barX, barY + 4, barWidth, barHeight, 8);
    ctx.fill();

    // Gauge Fill
    if (ratio > 0) {
      const grad = ctx.createLinearGradient(barX, 0, barX + barWidth * ratio, 0);
      grad.addColorStop(0, "#D62828");
      grad.addColorStop(0.5, "#F77F00");
      grad.addColorStop(1, "#FFD166");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(barX, barY + 4, Math.max(12, barWidth * ratio), barHeight, 8);
      ctx.fill();
    }

    // Percentage
    ctx.font = "bold 12px 'Outfit', sans-serif";
    ctx.fillStyle = "#FFFDF6";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(ratio * 100)}% DEVOTION`, this.width / 2, barY + 18);
    ctx.restore();
  }

  _renderButtons(ctx) {
    for (const btn of this.buttons) {
      ctx.save();
      // Glass card button
      ctx.fillStyle = "rgba(33, 22, 21, 0.85)";
      ctx.beginPath();
      ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 12);
      ctx.fill();

      ctx.strokeStyle = btn.color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Label
      ctx.font = "bold 13px 'Outfit', sans-serif";
      ctx.fillStyle = btn.color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
      ctx.restore();
    }
  }

  _renderCompletionBanner(ctx) {
    ctx.save();
    ctx.fillStyle = "rgba(20, 13, 12, 0.8)";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = "rgba(255, 183, 3, 0.15)";
    ctx.beginPath();
    ctx.arc(512, 280, 260, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "900 36px 'Cinzel', serif";
    ctx.fillStyle = "#FFD166";
    ctx.textAlign = "center";
    ctx.fillText("GANPATI BAPPA MORIYA!", 512, 230);

    ctx.font = "600 18px 'Outfit', sans-serif";
    ctx.fillStyle = "#FFFDF6";
    ctx.fillText("May Lord Ganesha bestow eternal blessings, joy, and prosperity!", 512, 275);

    // Return button
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.roundRect(512 - 120, 330, 240, 50, 25);
    ctx.fill();
    ctx.fillStyle = "#140D0C";
    ctx.font = "bold 16px 'Outfit', sans-serif";
    ctx.fillText("RETURN TO MAP ➔", 512, 360);
    ctx.restore();
  }
}

if (typeof window !== "undefined") {
  window.AartiCeremony = AartiCeremony;
}
