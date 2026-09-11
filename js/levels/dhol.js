/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Level 4: Dhol Rhythm
 * High-energy 4-lane rhythm mini-game featuring authentic festival Dhol beats: DHA, DHI, TA, NA.
 */

class DholLevel {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.width = CONFIG.CANVAS.WIDTH;
    this.height = CONFIG.CANVAS.HEIGHT;

    this.timeLeft = 45;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.misses = 0;
    this.isOver = false;

    // 4 Lanes
    this.lanes = [
      { id: "DHA", key: "A", name: "DHA", color: "#D62828", x: 300, sound: "DHA", isPressed: false },
      { id: "DHI", key: "S", name: "DHI", color: "#F77F00", x: 440, sound: "DHI", isPressed: false },
      { id: "TA",  key: "D", name: "TA",  color: "#FFB703", x: 584, sound: "TA",  isPressed: false },
      { id: "NA",  key: "F", name: "NA",  color: "#0077B6", x: 724, sound: "NA",  isPressed: false }
    ];

    this.hitLineY = 430;
    this.noteSpeed = 340; // pixels per second
    this.notes = [];
    this.beatTimer = 0;
    this.patternStep = 0;

    // Visual pulse
    this.screenPulse = 0;
    this.lastHitType = null;

    // Jugalbandi Fever Mode
    this.isFeverActive = false;
    this.feverTimer = 0;
    this.jugalbandiTriggered = false;
  }

  init() {
    this.timeLeft = CONFIG.LEVELS[4].duration || 45;
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.perfectHits = 0;
    this.goodHits = 0;
    this.misses = 0;
    this.isOver = false;
    this.notes = [];
    this.beatTimer = 0;
    this.patternStep = 0;
    this.screenPulse = 0;
    this.isFeverActive = false;
    this.feverTimer = 0;
    this.jugalbandiTriggered = false;

    // Start celebratory dhol groove in SoundManager
    this.game.sound.startMusic("dhol_groove");
  }

  update(dt, input) {
    if (this.isOver) return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.completeLevel();
      return;
    }

    // Jugalbandi Fever Timer
    if (this.isFeverActive) {
      this.feverTimer -= dt;
      if (this.feverTimer <= 0) {
        this.isFeverActive = false;
      }
    } else if (!this.jugalbandiTriggered && this.timeLeft <= 26 && this.timeLeft >= 5) {
      // Trigger mid-session Jugalbandi fever!
      this.jugalbandiTriggered = true;
      this.isFeverActive = true;
      this.feverTimer = 12.0;
      this.game.sound.playCrowdCheer();
      this.game.particles.addFloatingText("🥁 JUGALBANDI FEVER! 🥁", 512, 160, "#FFD166", 28, true);
      this.game.particles.addConfettiBurst(512, 200, 30);
    }

    if (this.screenPulse > 0) {
      this.screenPulse = Math.max(0, this.screenPulse - dt * 2.5);
    }

    // Generate rhythmic festival notes
    this.beatTimer += dt;
    const beatInterval = this.isFeverActive ? 0.28 : 0.38; // faster during fever!

    if (this.beatTimer >= beatInterval) {
      this.beatTimer -= beatInterval;
      this._spawnRhythmBeat();
      this.patternStep++;
    }

    // Move falling notes (faster in fever)
    const currentSpeed = this.isFeverActive ? 420 : 340;
    for (let i = this.notes.length - 1; i >= 0; i--) {
      const note = this.notes[i];
      note.y += currentSpeed * dt;

      // Check if note fell past hit zone without being pressed (MISS)
      if (note.y > this.hitLineY + 50 && !note.hit) {
        note.hit = true;
        this.misses++;
        this.combo = 0;
        this.game.sound.playObstacleHit();
        this.game.particles.addFloatingText("MISS", this.lanes[note.lane].x, this.hitLineY + 20, "#6C757D", 20);
        this.notes.splice(i, 1);
      }
    }
  }

  _spawnRhythmBeat() {
    const patterns = [
      [0],        // DHA
      [1],        // DHI
      [0],        // DHA
      [2, 3],     // TA + NA
      [0],        // DHA
      [1],        // DHI
      [2],        // TA
      [3],        // NA
      [0, 1],     // DHA + DHI
      [2],        // TA
      [0],        // DHA
      [3]         // NA
    ];

    const currentPattern = patterns[this.patternStep % patterns.length];
    currentPattern.forEach(laneIdx => {
      this.notes.push({
        lane: laneIdx,
        y: -30,
        hit: false,
        pulse: 0
      });
    });
  }

  // Handle player trigger on a lane (by key A/S/D/F or mobile touch pad)
  triggerLane(laneIdx) {
    if (this.isOver || laneIdx < 0 || laneIdx >= this.lanes.length) return;

    const lane = this.lanes[laneIdx];
    lane.isPressed = true;
    setTimeout(() => { lane.isPressed = false; }, 120);

    // Play authentic dhol percussion sound
    this.game.sound.playDholBeat(lane.sound);

    // Find closest note in this lane near hit line
    let closestNote = null;
    let closestDist = Infinity;
    let closestIndex = -1;

    for (let i = 0; i < this.notes.length; i++) {
      const note = this.notes[i];
      if (note.lane === laneIdx && !note.hit) {
        const dist = Math.abs(note.y - this.hitLineY);
        if (dist < closestDist) {
          closestDist = dist;
          closestNote = note;
          closestIndex = i;
        }
      }
    }

    const laneX = lane.x;

    if (closestNote && closestDist < 60) {
      closestNote.hit = true;
      this.notes.splice(closestIndex, 1);

      const mult = this.isFeverActive ? 2 : 1;
      if (closestDist < 22) {
        // PERFECT!
        this.perfectHits++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        const pts = 150 * mult;
        this.score += pts;
        this.screenPulse = this.isFeverActive ? 0.6 : 0.4;
        this.game.particles.addShockwave(laneX, this.hitLineY, lane.color, this.isFeverActive ? 110 : 85);
        this.game.particles.addSparkles(laneX, this.hitLineY, this.isFeverActive ? 20 : 14, "#FFD166");
        this.game.particles.addFloatingText(this.isFeverActive ? `FEVER! +${pts}` : `PERFECT! +${pts}`, laneX, this.hitLineY - 25, "#FFD166", 24, true);

        if (this.combo % 10 === 0) {
          this.game.sound.playCrowdCheer();
          this.game.particles.addFloatingText(`BAPPA MORIYA! x${this.combo}!`, 512, 140, "#D62828", 28, true);
        }
      } else {
        // GOOD!
        this.goodHits++;
        this.combo++;
        if (this.combo > this.maxCombo) this.maxCombo = this.combo;

        const pts = 75 * mult;
        this.score += pts;
        this.game.particles.addShockwave(laneX, this.hitLineY, lane.color, 50);
        this.game.particles.addFloatingText(`GOOD +${pts}`, laneX, this.hitLineY - 20, "#FCBF49", 20);
      }
    } else {
      // Empty tap with no note nearby
      this.game.particles.addShockwave(laneX, this.hitLineY, "rgba(255, 255, 255, 0.4)", 30);
    }
  }

  handleKeyDown(code) {
    if (code === "KeyA") this.triggerLane(0);
    else if (code === "KeyS") this.triggerLane(1);
    else if (code === "KeyD") this.triggerLane(2);
    else if (code === "KeyF") this.triggerLane(3);
  }

  handlePointerDown(x, y) {
    // Check if tapping lane targets or touch buttons at bottom
    for (let i = 0; i < this.lanes.length; i++) {
      const lane = this.lanes[i];
      if (Math.abs(x - lane.x) < 55 && y > 360) {
        this.triggerLane(i);
        return;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // 1. Festive Chowk Night Atmosphere reacting to rhythm
    const pulseAdd = Math.sin(this.screenPulse * Math.PI) * 20;
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, `rgb(${25 + pulseAdd}, 14, 12)`);
    bgGrad.addColorStop(0.5, `rgb(${45 + pulseAdd}, 20, 18)`);
    bgGrad.addColorStop(1, `rgb(${65 + pulseAdd}, 25, 20)`);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Decorative festival arches & spotlight beams
    ctx.save();
    ctx.globalAlpha = 0.15 + this.screenPulse * 0.25;
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.moveTo(150, 0); ctx.lineTo(350, this.height); ctx.lineTo(100, this.height); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(874, 0); ctx.lineTo(674, this.height); ctx.lineTo(924, this.height); ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Giant Center Dhol (Bouncing on rhythm!)
    const dholHit = this.screenPulse > 0.15;
    this.game.sprites.renderDhol(ctx, 160, 240, 1.2, dholHit);
    this.game.sprites.renderDhol(ctx, 864, 240, 1.2, dholHit);

    // Mushak drumming joyfully on the side
    this.game.sprites.renderMushak(ctx, 160, 360, {
      scale: 1.1,
      anim: "celebrate",
      facing: 1
    });

    // 3. Rhythm Lanes Track
    ctx.save();
    // Lane highway backing
    ctx.fillStyle = "rgba(20, 10, 10, 0.75)";
    ctx.fillRect(220, 0, 584, this.height);

    // Highway border lines
    ctx.strokeStyle = "#FFB703";
    ctx.lineWidth = 3;
    ctx.strokeRect(220, 0, 584, this.height);

    // Lane dividers
    this.lanes.forEach((lane, idx) => {
      // Lane Vertical Guidelines
      ctx.strokeStyle = "rgba(255, 209, 102, 0.18)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(lane.x - 65, 0);
      ctx.lineTo(lane.x - 65, this.height);
      ctx.stroke();

      // Lane Glow Beam if key pressed
      if (lane.isPressed) {
        const laneGlow = ctx.createLinearGradient(0, 0, 0, this.height);
        laneGlow.addColorStop(0, "rgba(255, 209, 102, 0)");
        laneGlow.addColorStop(0.7, lane.color + "55");
        laneGlow.addColorStop(1, lane.color + "99");
        ctx.fillStyle = laneGlow;
        ctx.fillRect(lane.x - 64, 0, 128, this.height);
      }
    });
    ctx.restore();

    // 4. Hit Line & Target Rings
    ctx.save();
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(220, this.hitLineY);
    ctx.lineTo(804, this.hitLineY);
    ctx.stroke();

    // Target Pad Circles
    this.lanes.forEach(lane => {
      ctx.fillStyle = lane.isPressed ? lane.color : "rgba(30, 15, 15, 0.85)";
      ctx.beginPath();
      ctx.arc(lane.x, this.hitLineY, 32, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = lane.color;
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Bol Name & Key Prompt
      ctx.fillStyle = "#FFFDF6";
      ctx.font = "bold 16px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lane.name, lane.x, this.hitLineY - 2);

      // Desktop Key Label
      ctx.font = "bold 11px 'Outfit', sans-serif";
      ctx.fillStyle = "#FFD166";
      ctx.fillText(`[${lane.key}]`, lane.x, this.hitLineY + 48);
    });
    ctx.restore();

    // 5. Falling Rhythm Notes
    for (const note of this.notes) {
      if (note.hit) continue;
      const lane = this.lanes[note.lane];
      const ny = note.y;

      ctx.save();
      // Glowing aura
      const noteGrad = ctx.createRadialGradient(lane.x, ny, 4, lane.x, ny, 26);
      noteGrad.addColorStop(0, "#FFFDF6");
      noteGrad.addColorStop(0.5, lane.color);
      noteGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = noteGrad;
      ctx.beginPath();
      ctx.arc(lane.x, ny, 26, 0, Math.PI * 2);
      ctx.fill();

      // Note Core
      ctx.fillStyle = lane.color;
      ctx.beginPath();
      ctx.arc(lane.x, ny, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFFDF6";
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Mini Bol text inside note
      ctx.fillStyle = "#FFFDF6";
      ctx.font = "bold 11px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(lane.name, lane.x, ny);
      ctx.restore();
    }

    // 6. Combo & Multiplier Banner
    if (this.combo >= 5) {
      ctx.save();
      ctx.font = "bold 22px 'Cinzel', serif";
      ctx.fillStyle = (this.combo >= 10) ? "#FFD166" : "#F77F00";
      ctx.textAlign = "center";
      ctx.fillText(`COMBO x${this.combo}`, 512, 60);
      ctx.restore();
    }

    ctx.restore();
  }

  completeLevel() {
    this.isOver = true;
    this.game.sound.playLevelComplete();

    // Calculate stars
    let stars = 1;
    const thresholds = CONFIG.LEVELS[4].starThresholds;
    if (this.score >= thresholds[2]) stars = 3;
    else if (this.score >= thresholds[1]) stars = 2;

    this.game.storage.updateLevelProgress(4, this.score, stars, this.maxCombo);

    this.game.ui.showLevelCompleteModal({
      levelId: 4,
      title: "DHOL MAESTRO!",
      score: this.score,
      maxScore: CONFIG.LEVELS[4].maxScore,
      stars: stars,
      bestCombo: this.maxCombo,
      stats: [
        { label: "Perfect Beats", value: this.perfectHits },
        { label: "Good Beats", value: this.goodHits },
        { label: "Missed Notes", value: this.misses },
        { label: "Longest Rhythm Streak", value: `x${this.maxCombo}` }
      ],
      nextLevelId: 5,
      bappaMessage: CONFIG.LEVELS[4].completionMessage
    });
  }
}

if (typeof window !== "undefined") {
  window.DholLevel = DholLevel;
}
