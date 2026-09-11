/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Bonus Level: Eco-Friendly Festival Challenge
 * Interactive decision mini-game where Mushak chooses sustainable options for Bappa's celebration.
 */

class EcoBonusLevel {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.width = CONFIG.CANVAS.WIDTH;
    this.height = CONFIG.CANVAS.HEIGHT;

    this.currentStep = 0;
    this.score = 0;
    this.ecoChoicesCount = 0;
    this.isOver = false;

    // Interactive questions
    this.decisions = [
      {
        title: "1. The Sacred Ganesha Idol (Murti)",
        subtitle: "How shall Bappa's divine form be crafted?",
        options: [
          {
            title: "Shadu Maati (Natural Clay)",
            desc: "Dissolves safely in water, nourishing Mother Earth and aquatic life.",
            icon: "🏺",
            isEco: true,
            reason: "Pure eco-devotion! Natural clay returns gently to the soil."
          },
          {
            title: "Plaster of Paris (PoP)",
            desc: "Made from synthetic gypsum chemicals that harm river ecosystems.",
            icon: "⚠️",
            isEco: false,
            reason: "PoP takes months to break down and releases toxic sulfates into lakes."
          }
        ]
      },
      {
        title: "2. Grand Pandal Decoration",
        subtitle: "How shall the pandal arches be adorned?",
        options: [
          {
            title: "Single-Use Plastic & Thermocol",
            desc: "Non-biodegradable waste that clogs city storm drains.",
            icon: "🚫",
            isEco: false,
            reason: "Thermocol creates landfill waste that lasts centuries."
          },
          {
            title: "Fresh Marigolds & Banana Stems",
            desc: "Organic fragrant botanicals that can be composted into fertile soil.",
            icon: "🌼",
            isEco: true,
            reason: "Sacred and biodegradable! Fresh botanicals return vitality to nature."
          }
        ]
      },
      {
        title: "3. Sacred Rangoli Powders",
        subtitle: "What colors shall we use for the courtyard mandalas?",
        options: [
          {
            title: "Rice Flour & Natural Flower Dyes",
            desc: "Edible rice flour, turmeric (Haldi), and beetroot pigments.",
            icon: "🌺",
            isEco: true,
            reason: "Even little birds and ants can feast happily on natural rice rangoli!"
          },
          {
            title: "Synthetic Chemical Enamels",
            desc: "Powdered glass and heavy metals that irritate skin and water.",
            icon: "🧪",
            isEco: false,
            reason: "Chemical powders contain lead and chromium that poison waterways."
          }
        ]
      },
      {
        title: "4. Illumination & Evening Arti",
        subtitle: "How shall we light up the celebration?",
        options: [
          {
            title: "Reusable Brass & Clay Diyas",
            desc: "Pure sesame oil earthen lamps creating warm divine ambient glow.",
            icon: "🪔",
            isEco: true,
            reason: "Timeless tradition with zero plastic waste and a soothing divine ambiance."
          },
          {
            title: "Chemical Smoke Firecrackers",
            desc: "Loud noise pollution and smoke distressing elderly people and animals.",
            icon: "💥",
            isEco: false,
            reason: "Loud smoke crackers terrify animals and pollute the festival air."
          }
        ]
      },
      {
        title: "5. Sacred Visarjan (Immersion)",
        subtitle: "Where shall Bappa's farewell journey take place?",
        options: [
          {
            title: "Home Bucket / Garden Immersion Tank",
            desc: "The sacred water nurtures household plants and green gardens.",
            icon: "🌱",
            isEco: true,
            reason: "Bappa's sacred clay water brings life to trees and home gardens!"
          },
          {
            title: "Crowded Natural Lake / River",
            desc: "Overloading delicate public lakes with thousands of offerings.",
            icon: "🌊",
            isEco: false,
            reason: "Natural rivers choke when overwhelmed by thousands of offerings."
          }
        ]
      }
    ];

    this.selectedChoiceIndex = null;
    this.feedbackMessage = "";
    this.showingFeedback = false;
    this.feedbackTimer = 0;
  }

  init() {
    this.currentStep = 0;
    this.score = 0;
    this.ecoChoicesCount = 0;
    this.isOver = false;
    this.selectedChoiceIndex = null;
    this.showingFeedback = false;
    this.feedbackTimer = 0;
  }

  update(dt, input) {
    if (this.isOver) return;

    if (this.showingFeedback) {
      this.feedbackTimer -= dt;
      if (this.feedbackTimer <= 0) {
        this.showingFeedback = false;
        this.currentStep++;
        if (this.currentStep >= this.decisions.length) {
          this.completeLevel();
        }
      }
    }
  }

  handlePointerDown(x, y) {
    if (this.isOver || this.showingFeedback) return;

    // Card hit testing
    // Left card: center x = 320, Right card: center x = 704
    const cardY = 280;
    const cardW = 320;
    const cardH = 200;

    const leftBounds = { x: 320 - cardW / 2, y: cardY - cardH / 2, w: cardW, h: cardH };
    const rightBounds = { x: 704 - cardW / 2, y: cardY - cardH / 2, w: cardW, h: cardH };

    const decision = this.decisions[this.currentStep];
    if (!decision) return;

    if (x >= leftBounds.x && x <= leftBounds.x + leftBounds.w &&
        y >= leftBounds.y && y <= leftBounds.y + leftBounds.h) {
      this._makeChoice(0);
    } else if (x >= rightBounds.x && x <= rightBounds.x + rightBounds.w &&
               y >= rightBounds.y && y <= rightBounds.y + rightBounds.h) {
      this._makeChoice(1);
    }
  }

  _makeChoice(idx) {
    const decision = this.decisions[this.currentStep];
    const option = decision.options[idx];
    this.selectedChoiceIndex = idx;
    this.showingFeedback = true;
    this.feedbackTimer = 2.4;
    this.feedbackMessage = option.reason;

    if (option.isEco) {
      this.score += 200;
      this.ecoChoicesCount++;
      this.game.sound.playModakCollect(true);
      this.game.particles.addPetalBurst(512, 280, 20);
      this.game.particles.addSparkles(512, 280, 16, "#2D6A4F");
      this.game.particles.addFloatingText("ECO-HERO! +200", 512, 210, "#40916C", 26, true);
    } else {
      this.score += 50; // Partial participation credit
      this.game.sound.playObstacleHit();
      this.game.particles.addFloatingText("+50 (Learning Choice)", 512, 210, "#E85D04", 22);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // 1. Lush Green & Golden Festival Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, "#0F1E17");
    bgGrad.addColorStop(0.5, "#1B3A2B");
    bgGrad.addColorStop(1, "#2D1A16");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Decorative botanical leaves pattern in background
    ctx.save();
    ctx.strokeStyle = "rgba(64, 145, 108, 0.25)";
    ctx.lineWidth = 1.5;
    for (let lx = 60; lx < this.width; lx += 140) {
      ctx.beginPath();
      ctx.arc(lx, 100, 45, 0, Math.PI);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Header
    const decision = this.decisions[this.currentStep] || this.decisions[this.decisions.length - 1];
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#FFD166";
    ctx.font = "bold 24px 'Cinzel', serif";
    ctx.fillText("ECO-FRIENDLY FESTIVAL QUEST", 512, 44);

    ctx.fillStyle = "#FFFDF6";
    ctx.font = "bold 18px 'Outfit', sans-serif";
    ctx.fillText(decision.title, 512, 80);

    ctx.fillStyle = "#A89F91";
    ctx.font = "14px 'Outfit', sans-serif";
    ctx.fillText(decision.subtitle, 512, 106);

    // Step progress dots
    for (let s = 0; s < this.decisions.length; s++) {
      const dotX = 460 + s * 26;
      ctx.fillStyle = (s < this.currentStep) ? "#40916C" : (s === this.currentStep) ? "#FFD166" : "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.arc(dotX, 130, (s === this.currentStep) ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Two Interactive Choice Cards
    const cardY = 280;
    const cardW = 320;
    const cardH = 210;
    const cardPositions = [320, 704];

    decision.options.forEach((opt, idx) => {
      const cx = cardPositions[idx];
      const isSelected = this.showingFeedback && this.selectedChoiceIndex === idx;

      ctx.save();
      // Card Background
      let cardBg = "rgba(22, 38, 30, 0.9)";
      let borderCol = "rgba(255, 209, 102, 0.35)";

      if (isSelected) {
        cardBg = opt.isEco ? "rgba(45, 106, 79, 0.95)" : "rgba(106, 4, 15, 0.95)";
        borderCol = opt.isEco ? "#40916C" : "#D62828";
      }

      ctx.fillStyle = cardBg;
      ctx.strokeStyle = borderCol;
      ctx.lineWidth = isSelected ? 4 : 2;

      ctx.beginPath();
      ctx.roundRect(cx - cardW / 2, cardY - cardH / 2, cardW, cardH, 16);
      ctx.fill();
      ctx.stroke();

      // Card Icon
      ctx.font = "40px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(opt.icon, cx, cardY - 50);

      // Card Title
      ctx.fillStyle = "#FFFDF6";
      ctx.font = "bold 16px 'Outfit', sans-serif";
      ctx.fillText(opt.title, cx, cardY);

      // Card Description (Multi-line wrap)
      ctx.fillStyle = "#EAE4DC";
      ctx.font = "13px 'Outfit', sans-serif";
      this._renderWrappedText(ctx, opt.desc, cx, cardY + 36, cardW - 36, 18);

      // Eco badge tag
      if (opt.isEco && !this.showingFeedback) {
        ctx.fillStyle = "rgba(64, 145, 108, 0.4)";
        ctx.fillRect(cx - 50, cardY + 74, 100, 20);
        ctx.strokeStyle = "#40916C";
        ctx.lineWidth = 1;
        ctx.strokeRect(cx - 50, cardY + 74, 100, 20);
        ctx.fillStyle = "#FFD166";
        ctx.font = "bold 10px 'Outfit', sans-serif";
        ctx.fillText("ECO CHOICE", cx, cardY + 84);
      }

      ctx.restore();
    });

    // 4. Feedback Banner if an option was clicked
    if (this.showingFeedback) {
      ctx.save();
      ctx.fillStyle = "rgba(20, 10, 10, 0.92)";
      ctx.fillRect(160, 415, 704, 75);
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 2;
      ctx.strokeRect(160, 415, 704, 75);

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#FFD166";
      ctx.font = "bold 15px 'Outfit', sans-serif";
      ctx.fillText("BAPPA'S ECO WISDOM:", 512, 436);

      ctx.fillStyle = "#FFFDF6";
      ctx.font = "14px 'Outfit', sans-serif";
      ctx.fillText(this.feedbackMessage, 512, 464);
      ctx.restore();
    }

    // 5. Mushak with festive earthen diya
    this.game.sprites.renderMushak(ctx, 110, 480, {
      scale: 1.1,
      anim: "celebrate",
      facing: 1
    });

    ctx.restore();
  }

  _renderWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(" ");
    let line = "";
    let curY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, curY);
        line = words[n] + " ";
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, curY);
  }

  completeLevel() {
    this.isOver = true;
    this.game.sound.playLevelComplete();

    const stars = (this.ecoChoicesCount >= 4) ? 3 : (this.ecoChoicesCount >= 2) ? 2 : 1;
    this.game.storage.updateLevelProgress(5, this.score, stars, 0);

    this.game.ui.showLevelCompleteModal({
      levelId: 5,
      title: "ECO-WARRIOR OF BAPPA!",
      score: this.score,
      maxScore: CONFIG.LEVELS[5].maxScore,
      stars: stars,
      bestCombo: 0,
      stats: [
        { label: "Eco-Friendly Choices", value: `${this.ecoChoicesCount}/5` },
        { label: "Eco Bonus Earned", value: `+${this.score} pts` },
        { label: "Next Destination", value: "GRAND CELEBRATION" }
      ],
      nextLevelId: "celebration",
      bappaMessage: CONFIG.LEVELS[5].completionMessage
    });
  }
}

if (typeof window !== "undefined") {
  window.EcoBonusLevel = EcoBonusLevel;
}
