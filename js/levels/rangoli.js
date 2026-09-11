/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Level 3: Rangoli Memory
 * Sacred memory mini-game: memorize the geometric rangoli pattern, then recreate it using vibrant festival colored powders.
 */

class RangoliLevel {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.width = CONFIG.CANVAS.WIDTH;
    this.height = CONFIG.CANVAS.HEIGHT;

    this.round = 1;
    this.maxRounds = 3;
    this.state = "PREVIEW"; // 'PREVIEW' or 'RECREATE'
    this.timer = 0;
    this.previewDuration = 3.5;
    this.score = 0;
    this.isOver = false;

    this.mistakes = 0;
    this.roundStartTime = 0;

    // Available Rangoli Powders
    this.powders = [
      { id: "red", name: "Gulal Red", color: "#D62828", hex: "#D62828" },
      { id: "saffron", name: "Saffron Orange", color: "#F77F00", hex: "#F77F00" },
      { id: "yellow", name: "Haldi Yellow", color: "#FFD166", hex: "#FFD166" },
      { id: "green", name: "Mehendi Green", color: "#2D6A4F", hex: "#2D6A4F" },
      { id: "blue", name: "Peacock Blue", color: "#0077B6", hex: "#0077B6" },
      { id: "violet", name: "Royal Plum", color: "#7209B7", hex: "#7209B7" }
    ];

    this.selectedPowderIndex = 0;

    // Active round pattern definition
    this.segments = [];
    this.center = { x: 512, y: 260 };
  }

  init() {
    this.round = 1;
    this.score = 0;
    this.mistakes = 0;
    this.isOver = false;
    this.selectedPowderIndex = 0;
    this._startRound(1);
  }

  _startRound(roundNum) {
    this.round = roundNum;
    this.state = "PREVIEW";
    this.timer = this.previewDuration;
    this.roundStartTime = Date.now();

    const cx = this.center.x;
    const cy = this.center.y;
    this.segments = [];

    // Progressive complexity across rounds
    if (roundNum === 1) {
      // 4 Petal Sacred Lotus Pattern
      const count = 4;
      const palette = ["#D62828", "#FFD166", "#F77F00", "#2D6A4F"];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const color = palette[i % palette.length];
        this.segments.push({
          id: `r1_${i}`,
          targetColor: color,
          currentColor: null,
          angle: angle,
          rInner: 30,
          rOuter: 95,
          cx: cx + Math.cos(angle) * 60,
          cy: cy + Math.sin(angle) * 60,
          radius: 34
        });
      }
      // Center Dot
      this.segments.push({
        id: `r1_center`,
        targetColor: "#FFD166",
        currentColor: null,
        cx: cx,
        cy: cy,
        radius: 26
      });
    } else if (roundNum === 2) {
      // 8 Spoke Diya Star Mandala
      const count = 8;
      const palette = ["#F77F00", "#D62828", "#FFD166", "#0077B6"];
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const color = palette[i % palette.length];
        this.segments.push({
          id: `r2_petal_${i}`,
          targetColor: color,
          currentColor: null,
          angle: angle,
          cx: cx + Math.cos(angle) * 90,
          cy: cy + Math.sin(angle) * 90,
          radius: 28
        });
      }
      // Inner ring of 4 dots
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + (Math.PI / 4);
        this.segments.push({
          id: `r2_inner_${i}`,
          targetColor: (i % 2 === 0) ? "#2D6A4F" : "#FFD166",
          currentColor: null,
          cx: cx + Math.cos(angle) * 44,
          cy: cy + Math.sin(angle) * 44,
          radius: 20
        });
      }
      // Center
      this.segments.push({
        id: `r2_center`,
        targetColor: "#D62828",
        currentColor: null,
        cx: cx,
        cy: cy,
        radius: 24
      });
    } else if (roundNum === 3) {
      // 12 Outer Tier + 6 Inner Tier Royal Peacock Mandala
      const outerCount = 12;
      const palette = ["#0077B6", "#7209B7", "#FFD166", "#D62828", "#F77F00", "#2D6A4F"];
      for (let i = 0; i < outerCount; i++) {
        const angle = (i / outerCount) * Math.PI * 2;
        const color = palette[i % palette.length];
        this.segments.push({
          id: `r3_out_${i}`,
          targetColor: color,
          currentColor: null,
          angle: angle,
          cx: cx + Math.cos(angle) * 115,
          cy: cy + Math.sin(angle) * 115,
          radius: 22
        });
      }
      // Inner tier
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + (Math.PI / 6);
        this.segments.push({
          id: `r3_in_${i}`,
          targetColor: (i % 2 === 0) ? "#F77F00" : "#D62828",
          currentColor: null,
          cx: cx + Math.cos(angle) * 58,
          cy: cy + Math.sin(angle) * 58,
          radius: 20
        });
      }
      // Center
      this.segments.push({
        id: `r3_center`,
        targetColor: "#FFD166",
        currentColor: null,
        cx: cx,
        cy: cy,
        radius: 24
      });
    }
  }

  update(dt, input) {
    if (this.isOver) return;

    if (this.state === "PREVIEW") {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.state = "RECREATE";
        this.timer = 0;
        this.game.sound.playButtonClick();
      }
    }
  }

  handlePointerDown(x, y) {
    if (this.isOver) return;

    // 1. Check if clicking on bottom powder palette pots
    const trayY = 515;
    const spacing = 80;
    const startX = (this.width - (this.powders.length - 1) * spacing) / 2;

    for (let i = 0; i < this.powders.length; i++) {
      const px = startX + i * spacing;
      if (Math.hypot(x - px, y - trayY) < 32) {
        this.selectedPowderIndex = i;
        this.game.sound.playColorSelect(440 + i * 50);
        return;
      }
    }

    // 2. If in RECREATE mode, check if clicking on a rangoli segment
    if (this.state === "RECREATE") {
      for (const seg of this.segments) {
        if (Math.hypot(x - seg.cx, y - seg.cy) < seg.radius + 6) {
          const selectedColor = this.powders[this.selectedPowderIndex].color;
          seg.currentColor = selectedColor;

          this.game.sound.playButtonClick();
          this.game.particles.addPowderCloud(seg.cx, seg.cy, selectedColor, 12);
          this.game.particles.addSparkles(seg.cx, seg.cy, 6, selectedColor);

          this._checkRecreateProgress();
          return;
        }
      }
    }
  }

  _checkRecreateProgress() {
    // Check if all segments have been filled
    const allFilled = this.segments.every(s => s.currentColor !== null);
    if (!allFilled) return;

    // Calculate accuracy for this round
    let correctCount = 0;
    for (const seg of this.segments) {
      if (seg.currentColor === seg.targetColor) {
        correctCount++;
      } else {
        this.mistakes++;
      }
    }

    const accuracy = correctCount / this.segments.length;
    let roundPoints = Math.round(accuracy * (this.round === 1 ? 600 : this.round === 2 ? 800 : 1100));

    // Fast completion bonus
    const elapsed = (Date.now() - this.roundStartTime) / 1000;
    if (accuracy >= 0.8 && elapsed < 20) {
      roundPoints += 150;
    }

    this.score += roundPoints;

    if (accuracy >= 0.75) {
      this.game.sound.playModakCollect(true);
      this.game.particles.addPetalBurst(this.center.x, this.center.y, 24);
      this.game.particles.addFloatingText(`ROUND ${this.round} COMPLETE! +${roundPoints}`, this.center.x, this.center.y - 40, "#FFD166", 24, true);
    } else {
      this.game.sound.playObstacleHit();
      this.game.particles.addFloatingText(`ACCURACY ${(accuracy * 100).toFixed(0)}%`, this.center.x, this.center.y - 40, "#E85D04", 22);
    }

    // Transition to next round or complete level
    setTimeout(() => {
      if (this.round < this.maxRounds) {
        this._startRound(this.round + 1);
      } else {
        this.completeLevel();
      }
    }, 1200);
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // 1. Courtyard Floor with sacred geometrical kolam grid
    const floorGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    floorGrad.addColorStop(0, "#190F0D");
    floorGrad.addColorStop(0.5, "#2B1613");
    floorGrad.addColorStop(1, "#381711");
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Decorative Rangoli Board Circular Platform
    ctx.save();
    const cx = this.center.x;
    const cy = this.center.y;

    // Platform shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.arc(cx, cy + 8, 175, 0, Math.PI * 2);
    ctx.fill();

    // Dark Terrazzo / Red Sandstone Round Rangoli Base
    const boardGrad = ctx.createRadialGradient(cx, cy, 30, cx, cy, 170);
    boardGrad.addColorStop(0, "#481512");
    boardGrad.addColorStop(0.85, "#2D0A08");
    boardGrad.addColorStop(1, "#180504");
    ctx.fillStyle = boardGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 170, 0, Math.PI * 2);
    ctx.fill();

    // Golden & White Auspicious Kolam Rings
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 166, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 253, 246, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 6]);
    ctx.beginPath();
    ctx.arc(cx, cy, 140, 0, Math.PI * 2);
    ctx.arc(cx, cy, 80, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Diyas flanking the rangoli circle
    this.game.sprites.renderDiya(ctx, cx - 210, cy, 0.85);
    this.game.sprites.renderDiya(ctx, cx + 210, cy, 0.85);

    // Mushak admiring the rangoli from the left
    this.game.sprites.renderMushak(ctx, 160, 440, {
      scale: 1.1,
      anim: this.state === "PREVIEW" ? "idle" : "celebrate",
      facing: 1
    });

    // 2. Render Rangoli Segments
    for (const seg of this.segments) {
      const displayColor = (this.state === "PREVIEW") ? seg.targetColor : seg.currentColor;
      this._renderSegment(ctx, seg, displayColor);
    }

    // 3. State Banner / Countdown Timer
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (this.state === "PREVIEW") {
      // Preview Header
      ctx.fillStyle = "#FFD166";
      ctx.font = "bold 20px 'Cinzel', serif";
      ctx.fillText(`ROUND ${this.round} OF ${this.maxRounds}: MEMORIZE THE SACRED RANGOLI!`, cx, 48);

      // Countdown Bar
      const barW = 260;
      const barH = 10;
      const prog = Math.max(0, this.timer / this.previewDuration);
      ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
      ctx.fillRect(cx - barW / 2, 66, barW, barH);
      ctx.fillStyle = "#F77F00";
      ctx.fillRect(cx - barW / 2, 66, barW * prog, barH);

      ctx.fillStyle = "#FFFDF6";
      ctx.font = "bold 13px 'Outfit', sans-serif";
      ctx.fillText(`Hiding in ${Math.ceil(this.timer)}s...`, cx, 92);
    } else {
      ctx.fillStyle = "#FFD166";
      ctx.font = "bold 20px 'Cinzel', serif";
      ctx.fillText(`ROUND ${this.round} OF ${this.maxRounds}: RECREATE THE COLORS!`, cx, 48);

      ctx.fillStyle = "#FFFDF6";
      ctx.font = "14px 'Outfit', sans-serif";
      ctx.fillText("Select a colored powder below, then tap each petal/dot to fill it.", cx, 74);
    }
    ctx.restore();

    // 4. Bottom Powder Palette Tray
    this._renderPowderPalette(ctx);

    ctx.restore();
  }

  _renderSegment(ctx, seg, color) {
    ctx.save();
    if (color) {
      // Filled petal / circle with soft powder texture gradient
      const pGrad = ctx.createRadialGradient(seg.cx, seg.cy, 3, seg.cx, seg.cy, seg.radius);
      pGrad.addColorStop(0, color);
      pGrad.addColorStop(0.85, color);
      pGrad.addColorStop(1, "#180504");

      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(seg.cx, seg.cy, seg.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner golden mandala dot
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.arc(seg.cx, seg.cy, seg.radius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#FFFDF6";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Empty outline slot in RECREATE mode
      ctx.strokeStyle = "rgba(255, 209, 102, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(seg.cx, seg.cy, seg.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Small central indicator dot
      ctx.fillStyle = "rgba(255, 209, 102, 0.3)";
      ctx.beginPath();
      ctx.arc(seg.cx, seg.cy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _renderPowderPalette(ctx) {
    ctx.save();
    // Tray backdrop
    ctx.fillStyle = "rgba(20, 11, 10, 0.95)";
    ctx.fillRect(0, 485, this.width, 91);
    ctx.strokeStyle = "#FFB703";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 485);
    ctx.lineTo(this.width, 485);
    ctx.stroke();

    const trayY = 528;
    const spacing = 80;
    const startX = (this.width - (this.powders.length - 1) * spacing) / 2;

    this.powders.forEach((pow, idx) => {
      const px = startX + idx * spacing;
      const isSelected = this.selectedPowderIndex === idx;

      // Brass Bowl
      ctx.fillStyle = "#B38A00";
      ctx.beginPath();
      ctx.arc(px, trayY + 4, 24, 0, Math.PI);
      ctx.fill();

      // Colored Powder Mound
      ctx.fillStyle = pow.color;
      ctx.beginPath();
      ctx.arc(px, trayY + 3, 20, Math.PI, 0);
      ctx.fill();

      // Selection Ring
      if (isSelected) {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(px, trayY, 28, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = "bold 11px 'Outfit', sans-serif";
        ctx.fillStyle = "#FFD166";
        ctx.textAlign = "center";
        ctx.fillText(pow.name, px, trayY - 34);
      }
    });

    ctx.restore();
  }

  completeLevel() {
    this.isOver = true;
    this.game.sound.playLevelComplete();

    // Calculate stars
    let stars = 1;
    const thresholds = CONFIG.LEVELS[3].starThresholds;
    if (this.score >= thresholds[2]) stars = 3;
    else if (this.score >= thresholds[1]) stars = 2;

    this.game.storage.updateLevelProgress(3, this.score, stars, 0);

    this.game.ui.showLevelCompleteModal({
      levelId: 3,
      title: "RANGOLI ARTIST!",
      score: this.score,
      maxScore: CONFIG.LEVELS[3].maxScore,
      stars: stars,
      bestCombo: 0,
      stats: [
        { label: "Rounds Finished", value: `${this.maxRounds}/${this.maxRounds}` },
        { label: "Color Mistakes", value: this.mistakes },
        { label: "Final Artistic Score", value: this.score }
      ],
      nextLevelId: 4,
      bappaMessage: CONFIG.LEVELS[3].completionMessage
    });
  }
}

if (typeof window !== "undefined") {
  window.RangoliLevel = RangoliLevel;
}
