/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * High-Definition Procedural Vector & Canvas Sprite Renderer
 * Renders Mushak (with multiple animations), Lord Ganesha, Modaks, Diyas, Pandal, and Props.
 */

class SpriteRenderer {
  constructor() {
    this.animTime = 0;
  }

  update(dt = 0.016) {
    this.animTime += dt;
  }

  // =========================================================================
  // MUSHAK THE MOUSE (Main Player Character)
  // Animations: 'idle', 'run', 'jump', 'celebrate', 'stumble'
  // =========================================================================
  renderMushak(ctx, x, y, options = {}) {
    const scale = options.scale || 1.0;
    const anim = options.anim || "idle";
    const facing = options.facing !== undefined ? options.facing : 1; // 1 = right, -1 = left
    const time = this.animTime * (options.speed || 1.0);
    const outfit = options.outfit || (typeof window !== "undefined" && window.game && window.game.storage ? window.game.storage.getEquippedOutfit() : "default");
    const isSurge = !!options.isSurge;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale);

    // Dynamic animation parameters
    let bobY = 0;
    let tilt = 0;
    let pawOffset1 = 0;
    let pawOffset2 = 0;
    let tailAngle = 0;
    let earTwitch = 0;

    if (anim === "idle") {
      bobY = Math.sin(time * 3) * 2;
      tailAngle = Math.sin(time * 2.5) * 0.15;
      earTwitch = (Math.sin(time * 6) > 0.8) ? 0.08 : 0;
    } else if (anim === "run") {
      bobY = Math.abs(Math.sin(time * 12)) * -6;
      tilt = Math.sin(time * 12) * 0.08 + 0.05;
      pawOffset1 = Math.sin(time * 12) * 8;
      pawOffset2 = -pawOffset1;
      tailAngle = Math.sin(time * 12) * 0.35;
    } else if (anim === "jump") {
      bobY = -12;
      tilt = -0.15;
      pawOffset1 = -5;
      pawOffset2 = -5;
      tailAngle = -0.4;
    } else if (anim === "celebrate") {
      bobY = Math.abs(Math.sin(time * 8)) * -10;
      tilt = Math.sin(time * 6) * 0.1;
      tailAngle = Math.sin(time * 10) * 0.4;
    } else if (anim === "stumble") {
      tilt = Math.sin(time * 15) * 0.2;
      bobY = Math.sin(time * 10) * 2;
      tailAngle = 0.5;
    }

    ctx.translate(0, bobY);
    ctx.rotate(tilt);

    // --- 0. Bappa's Blessing Prasad Surge Aura ---
    if (isSurge) {
      const surgePulse = Math.sin(time * 12) * 6;
      const auraGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 36 + surgePulse);
      auraGrad.addColorStop(0, "rgba(255, 235, 130, 0.95)");
      auraGrad.addColorStop(0.45, "rgba(255, 183, 3, 0.55)");
      auraGrad.addColorStop(0.8, "rgba(247, 127, 0, 0.25)");
      auraGrad.addColorStop(1, "rgba(247, 127, 0, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 38 + surgePulse, 0, Math.PI * 2);
      ctx.fill();

      // Rotating starlight halo
      ctx.strokeStyle = "#FFFDF6";
      ctx.lineWidth = 1.2;
      for (let si = 0; si < 4; si++) {
        const ang = time * 4 + (si * Math.PI / 2);
        const sx = Math.cos(ang) * (26 + surgePulse * 0.5);
        const sy = Math.sin(ang) * (22 + surgePulse * 0.5);
        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // --- 1. Curved Tail ---
    ctx.save();
    ctx.strokeStyle = "#4A4543";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-18, 5);
    const cpx1 = -32 + Math.sin(time * 3 + tailAngle) * 6;
    const cpy1 = 12 + Math.cos(time * 2) * 4;
    const cpx2 = -36 + Math.cos(time * 2.5) * 6;
    const cpy2 = -16 + Math.sin(time * 3) * 6;
    ctx.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, -26, -26 + Math.sin(time * 4) * 4);
    ctx.stroke();
    ctx.restore();

    // --- 2. Back Paws ---
    ctx.fillStyle = "#FFB4A2"; // soft pink paws
    ctx.beginPath();
    ctx.ellipse(-12 + pawOffset2, 14, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ghungroo Ankle Bells on back paw
    if (outfit === "ghungroo" || outfit === "royal_pitambara") {
      ctx.fillStyle = "#FFD166";
      ctx.beginPath();
      ctx.arc(-12 + pawOffset2 - 2, 12, 1.8, 0, Math.PI * 2);
      ctx.arc(-12 + pawOffset2 + 1, 12, 1.8, 0, Math.PI * 2);
      ctx.arc(-12 + pawOffset2 + 4, 13, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 3. Chubby Dark Slate Body ---
    ctx.save();
    const bodyGrad = ctx.createRadialGradient(-2, 0, 4, 0, 2, 22);
    bodyGrad.addColorStop(0, "#484343");
    bodyGrad.addColorStop(0.7, "#282323");
    bodyGrad.addColorStop(1, "#181414");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 3, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cream / Light grey chest patch
    ctx.fillStyle = "#EAE4DC";
    ctx.beginPath();
    ctx.ellipse(6, 4, 9, 11, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // --- Mini Dholak on Back (Wardrobe Item) ---
    if (outfit === "dholak") {
      ctx.save();
      ctx.translate(-8, -2);
      ctx.rotate(-0.35);
      // Dholak barrel
      ctx.fillStyle = "#A81D24";
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Tension cords
      ctx.strokeStyle = "#FFFDF6";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-7, -10); ctx.lineTo(7, 10);
      ctx.moveTo(7, -10); ctx.lineTo(-7, 10);
      ctx.stroke();
      // Shoulder strap
      ctx.strokeStyle = "#F77F00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(6, 4, 12, 10, 0.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // --- 4. Festive Dhoti / Dupatta Ribbon ---
    ctx.save();
    ctx.fillStyle = (outfit === "royal_pitambara") ? "#FFB703" : "#F77F00";
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(8, -1);
    ctx.lineTo(6, 12);
    ctx.lineTo(-8, 9);
    ctx.closePath();
    ctx.fill();

    // Gold / Red Zari Border
    ctx.strokeStyle = (outfit === "royal_pitambara") ? "#FFFDF6" : "#D62828";
    ctx.lineWidth = (outfit === "royal_pitambara") ? 2.8 : 2.5;
    ctx.beginPath();
    ctx.moveTo(-7, 2);
    ctx.lineTo(8, 4);
    ctx.stroke();

    // Royal Pearl Necklace (Mala)
    if (outfit === "royal_pitambara") {
      ctx.fillStyle = "#FFFDF6";
      for (let mi = -4; mi <= 6; mi += 2.5) {
        ctx.beginPath();
        ctx.arc(mi, 0 + Math.abs(mi - 1) * 0.7, 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
      // Center ruby pendant
      ctx.fillStyle = "#D62828";
      ctx.beginPath();
      ctx.arc(1, 3, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Tiny golden bell / bead on collar
      ctx.fillStyle = "#FFD166";
      ctx.beginPath();
      ctx.arc(3, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#B38A00";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // --- 5. Front Paws ---
    ctx.fillStyle = "#FFB4A2";
    if (anim === "celebrate") {
      // Both paws held high cheering with a mini golden modak!
      ctx.beginPath();
      ctx.ellipse(8, -16, 4, 6, 0.2, 0, Math.PI * 2);
      ctx.ellipse(-4, -16, 4, 6, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Held Mini Modak
      this.renderModak(ctx, 2, -26, 0.5);
    } else {
      ctx.beginPath();
      ctx.ellipse(12 + pawOffset1, 14, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- 6. Cute Expressive Head ---
    ctx.save();
    ctx.translate(10, -10);

    // Left Ear (Background)
    ctx.save();
    ctx.translate(-4, -14 - earTwitch * 15);
    ctx.rotate(-0.25);
    ctx.fillStyle = "#282323";
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFAAA6";
    ctx.beginPath();
    ctx.ellipse(0, 1, 5, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Head base
    ctx.fillStyle = "#342E2E";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 12, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Snout
    ctx.beginPath();
    ctx.moveTo(4, -4);
    ctx.quadraticCurveTo(18, 0, 18, 5);
    ctx.quadraticCurveTo(8, 10, -2, 7);
    ctx.fill();

    // Pink Sniffing Nose
    ctx.fillStyle = "#FF758F";
    ctx.beginPath();
    ctx.ellipse(17, 3, 3, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(14, 4); ctx.lineTo(26, 1);
    ctx.moveTo(14, 6); ctx.lineTo(25, 8);
    ctx.moveTo(13, 2); ctx.lineTo(23, -4);
    ctx.stroke();

    // Right Ear (Foreground)
    ctx.save();
    ctx.translate(4, -13 + earTwitch * 15);
    ctx.rotate(0.2);
    ctx.fillStyle = "#3D3636";
    ctx.beginPath();
    ctx.ellipse(0, 0, 9, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFAAA6";
    ctx.beginPath();
    ctx.ellipse(1, 2, 5.5, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Ear Stud (Festival jewelry)
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.arc(-5, 8, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Large Sparkly Expressive Eye
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.ellipse(6, -2, 6, 7.5, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Pupil
    ctx.fillStyle = "#161110";
    ctx.beginPath();
    ctx.ellipse(7.5, -2, 4.5, 6, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Warm amber iris ring
    ctx.strokeStyle = "#F77F00";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Shiny highlights
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(8.5, -4, 2.2, 0, Math.PI * 2);
    ctx.arc(6.5, -0.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Auspicious Vermilion Red Tilak on Forehead
    ctx.fillStyle = "#D62828";
    ctx.beginPath();
    ctx.ellipse(0, -6, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.arc(0, -1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // --- PUNERI PAGDI (Royal Maharashtrian Turban) ---
    if (outfit === "pagdi") {
      ctx.save();
      ctx.translate(-1, -16);
      // Saffron Turban Dome
      ctx.fillStyle = "#F77F00";
      ctx.beginPath();
      ctx.ellipse(1, 0, 14, 8, -0.15, 0, Math.PI * 2);
      ctx.fill();
      // Maroon Pleats
      ctx.strokeStyle = "#9D0208";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(-11, 2); ctx.quadraticCurveTo(0, -5, 12, 0);
      ctx.moveTo(-9, -2); ctx.quadraticCurveTo(1, -7, 10, -4);
      ctx.stroke();
      // Golden Zari Hem Band
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(-13, 3);
      ctx.quadraticCurveTo(1, -2, 14, 1);
      ctx.stroke();
      // Fan-shaped Pleated Crest (Kalgi / Chira)
      ctx.fillStyle = "#D62828";
      ctx.beginPath();
      ctx.moveTo(-6, -6);
      ctx.lineTo(-12, -18);
      ctx.lineTo(-4, -14);
      ctx.lineTo(2, -20);
      ctx.lineTo(2, -6);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Emerald / Pearl Gem Kalgi Brooch
      ctx.fillStyle = "#2D6A4F";
      ctx.beginPath();
      ctx.arc(-2, -6, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (outfit === "royal_pitambara") {
      // Royal Golden Mukut (Coronet)
      ctx.save();
      ctx.translate(0, -17);
      ctx.fillStyle = "#FFB703";
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-8, -10);
      ctx.lineTo(-2, -5);
      ctx.lineTo(0, -14);
      ctx.lineTo(2, -5);
      ctx.lineTo(8, -10);
      ctx.lineTo(10, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#D62828";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // Center Ruby Jewel
      ctx.fillStyle = "#D62828";
      ctx.beginPath();
      ctx.arc(0, -6, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Stumble expression additions
    if (anim === "stumble") {
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 1.5;
      // Dizzy stars over head
      const sX = Math.sin(time * 8) * 8;
      const sY = -22 + Math.cos(time * 8) * 4;
      ctx.strokeText("✦", sX, sY);
    }

    ctx.restore(); // Head
    ctx.restore(); // Character
  }

  // =========================================================================
  // SACRED AARTI THALI (Ornate Brass Ceremonial Plate & Flickering Camphor Flame)
  // =========================================================================
  renderAartiThali(ctx, x, y, scale = 1.0, options = {}) {
    const time = this.animTime;
    const tiltX = options.tiltX || 0;
    const tiltY = options.tiltY || 0;

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Dynamic flame flicker
    const flicker = Math.sin(time * 16) * 2;
    const flameLagX = -tiltX * 12;

    // --- 1. Soft Warm Light Cast under Thali ---
    const thaliGlow = ctx.createRadialGradient(0, 0, 15, 0, 0, 95);
    thaliGlow.addColorStop(0, "rgba(255, 209, 102, 0.45)");
    thaliGlow.addColorStop(0.6, "rgba(247, 127, 0, 0.2)");
    thaliGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = thaliGlow;
    ctx.beginPath();
    ctx.arc(0, 0, 95, 0, Math.PI * 2);
    ctx.fill();

    // --- 2. Carved Brass Thali Base (Peetala Plate) ---
    const rimGrad = ctx.createRadialGradient(0, -6, 20, 0, 0, 60);
    rimGrad.addColorStop(0, "#FFF3B0");
    rimGrad.addColorStop(0.5, "#FFD166");
    rimGrad.addColorStop(0.85, "#B38A00");
    rimGrad.addColorStop(1, "#6B5000");

    ctx.fillStyle = rimGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 58, 42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ornate Engraved Scalloped Border
    ctx.strokeStyle = "#FFE680";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 53, 38, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#997300";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2;
      const bx = Math.cos(ang) * 52;
      const by = Math.sin(ang) * 37;
      ctx.beginPath();
      ctx.arc(bx, by, 2.2, 0, Math.PI * 2);
      ctx.stroke();
    }

    // --- 3. Marigold Petals on Plate ---
    const petalPositions = [
      { x: -28, y: -10, col: "#F77F00" },
      { x: -32, y: 8,   col: "#FFD166" },
      { x: 30,  y: -12, col: "#FFD166" },
      { x: 26,  y: 12,  col: "#F77F00" },
      { x: 2,   y: 22,  col: "#D62828" }
    ];
    petalPositions.forEach(p => {
      ctx.fillStyle = p.col;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 4, 6, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // --- 4. Haldi & Kumkum Miniature Bowls ---
    // Kumkum (Red)
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.ellipse(-18, 14, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#D62828";
    ctx.beginPath();
    ctx.ellipse(-18, 13, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Haldi (Yellow Turmeric)
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.ellipse(-4, 18, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.ellipse(-4, 17, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 5. Fragrant Incense Stick (Agarbatti) ---
    ctx.strokeStyle = "#4A2810";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(18, 16);
    ctx.lineTo(38, 2);
    ctx.stroke();
    // Glowing red burning tip
    ctx.fillStyle = "#FF3300";
    ctx.beginPath();
    ctx.arc(38, 2, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // --- 6. Central Aarti Deepa / Camphor Flame (Karpura Aarti) ---
    // Brass Cup
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.ellipse(0, -6, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#8A6500";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Golden Oil / Ghee pool
    ctx.fillStyle = "#FFE382";
    ctx.beginPath();
    ctx.ellipse(0, -7, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Radiant Flame Aura
    const flameAura = ctx.createRadialGradient(flameLagX * 0.3, -24 + flicker * 0.5, 2, 0, -22, 38);
    flameAura.addColorStop(0, "rgba(255, 235, 150, 0.95)");
    flameAura.addColorStop(0.4, "rgba(255, 183, 3, 0.6)");
    flameAura.addColorStop(0.8, "rgba(232, 93, 4, 0.25)");
    flameAura.addColorStop(1, "rgba(232, 93, 4, 0)");
    ctx.fillStyle = flameAura;
    ctx.beginPath();
    ctx.arc(0, -22, 38, 0, Math.PI * 2);
    ctx.fill();

    // Vibrant Flickering Teardrop Flame
    const tipX = flameLagX + flicker * 0.6;
    const tipY = -40 + flicker;
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(12 + flameLagX * 0.3, -16, 0, -8);
    ctx.quadraticCurveTo(-12 + flameLagX * 0.3, -16, tipX, tipY);
    ctx.fill();

    // Inner Radiant Saffron Core
    ctx.fillStyle = "#F77F00";
    ctx.beginPath();
    ctx.moveTo(tipX * 0.7, tipY + 8);
    ctx.quadraticCurveTo(8 + flameLagX * 0.2, -14, 0, -8);
    ctx.quadraticCurveTo(-8 + flameLagX * 0.2, -14, tipX * 0.7, tipY + 8);
    ctx.fill();

    // Pure Sacred Blue-White Core
    ctx.fillStyle = "#FFFDF6";
    ctx.beginPath();
    ctx.ellipse(flameLagX * 0.15, -10, 3.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#0077B6";
    ctx.beginPath();
    ctx.ellipse(flameLagX * 0.15, -8, 2.2, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // LORD GANESHA (Peaceful, Reverent, Stylized Festival Centerpiece)
  // Seated majestically on a lotus pedestal with Abhaya mudra & golden modak.
  // =========================================================================
  renderLordGanesha(ctx, x, y, scale = 1.0, options = {}) {
    const time = this.animTime;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // --- 1. Divine Radiant Prabhavali (Golden Sunburst Halo) ---
    const haloRadius = 140;
    const auraPulse = Math.sin(time * 2) * 6;
    const haloGrad = ctx.createRadialGradient(0, -60, 20, 0, -60, haloRadius + auraPulse);
    haloGrad.addColorStop(0, "rgba(255, 230, 140, 0.95)");
    haloGrad.addColorStop(0.5, "rgba(255, 183, 3, 0.45)");
    haloGrad.addColorStop(0.85, "rgba(247, 127, 0, 0.15)");
    haloGrad.addColorStop(1, "rgba(247, 127, 0, 0)");

    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, -60, haloRadius + auraPulse, 0, Math.PI * 2);
    ctx.fill();

    // Radiant Rays
    ctx.save();
    ctx.translate(0, -60);
    ctx.rotate(time * 0.1);
    ctx.strokeStyle = "rgba(255, 215, 100, 0.35)";
    ctx.lineWidth = 2;
    for (let r = 0; r < 24; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(haloRadius - 15, 0);
      ctx.stroke();
      ctx.rotate((Math.PI * 2) / 24);
    }
    ctx.restore();

    // --- 2. Sacred Lotus Throne (Padmasana Base) ---
    ctx.save();
    ctx.translate(0, 95);
    // Outer Lotus Petals
    const petalColors = ["#E63946", "#F77F00", "#FFD166"];
    for (let layer = 0; layer < 2; layer++) {
      const pCount = 9 + layer * 2;
      const rOuter = 110 - layer * 15;
      const rInner = 85 - layer * 12;
      for (let p = 0; p < pCount; p++) {
        const angle = Math.PI - (p / (pCount - 1)) * Math.PI;
        const px = Math.cos(angle) * rOuter;
        const py = -Math.sin(angle) * 32 + (layer * 8);

        ctx.fillStyle = petalColors[layer % petalColors.length];
        ctx.beginPath();
        ctx.ellipse(px, py, 14 - layer * 2, 22 - layer * 3, angle - Math.PI / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#FFD166";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    // Lotus Center Podium
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.ellipse(0, 0, 90, 22, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#D62828";
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    // --- 3. Body & Golden Pitambara Silk Robes (Lalitasana Seated Posture) ---
    ctx.save();
    // Warm saffron/clay skin tone
    const skinGrad = ctx.createRadialGradient(0, 0, 10, 0, 10, 70);
    skinGrad.addColorStop(0, "#FFD7A8");
    skinGrad.addColorStop(0.7, "#F4A261");
    skinGrad.addColorStop(1, "#E76F51");

    // Rounded joyful belly (Modakodara)
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.ellipse(0, 35, 52, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Folded Legs in royal Lalitasana
    // Left leg folded flat, right leg resting downward
    ctx.fillStyle = "#F77F00"; // Royal Saffron Pitambara Silk
    ctx.beginPath();
    ctx.ellipse(-38, 70, 42, 20, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(38, 72, 38, 22, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden Zari border on dhoti
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 52, 48, 0.3, Math.PI - 0.3);
    ctx.stroke();

    // Sacred Thread (Janeu) & Pearl Necklaces
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-28, -5);
    ctx.bezierCurveTo(-15, 30, 25, 45, 35, 68);
    ctx.stroke();

    // Golden Kantha Necklace
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 5, 26, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.restore();

    // --- 4. Four Royal Arms ---
    // Upper Left: Holding Sacred Ankusha/Lotus
    ctx.save();
    ctx.fillStyle = "#F4A261";
    ctx.beginPath();
    ctx.ellipse(-58, -5, 12, 28, -0.4, 0, Math.PI * 2);
    ctx.fill();
    // Lotus bud in upper left hand
    ctx.fillStyle = "#E63946";
    ctx.beginPath();
    ctx.ellipse(-66, -34, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Upper Right: Holding Sacred Goad / Axe (Stylized Golden Scepter)
    ctx.save();
    ctx.fillStyle = "#F4A261";
    ctx.beginPath();
    ctx.ellipse(58, -5, 12, 28, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(68, -48);
    ctx.lineTo(62, -8);
    ctx.stroke();
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.arc(68, -48, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Lower Left Hand: Bowl of Golden Modaks (Modak-Patra)
    ctx.save();
    ctx.fillStyle = "#F4A261";
    ctx.beginPath();
    ctx.ellipse(-48, 32, 14, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Bowl
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.ellipse(-52, 28, 16, 8, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = "#B38A00";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pile of steaming mini modaks
    this.renderModak(ctx, -56, 18, 0.45);
    this.renderModak(ctx, -48, 16, 0.48);
    this.renderModak(ctx, -40, 18, 0.45);
    ctx.restore();

    // Lower Right Hand: Abhaya Mudra (Blessing & Protection)
    ctx.save();
    ctx.fillStyle = "#F4A261";
    ctx.beginPath();
    ctx.ellipse(48, 25, 13, 18, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Auspicious 'AUM' / Red Swastika / Lotus symbol in palm
    ctx.fillStyle = "#D62828";
    ctx.beginPath();
    ctx.arc(48, 25, 4, 0, Math.PI * 2);
    ctx.fill();

    // Radiating Blessing Rings
    ctx.strokeStyle = `rgba(255, 209, 102, ${0.4 + Math.sin(time * 4) * 0.25})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(48, 25, 14 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // --- 5. Fragrant Marigold Garland (Genda Phool Mala) ---
    ctx.save();
    const gPoints = 14;
    for (let g = 0; g < gPoints; g++) {
      const gAngle = (g / (gPoints - 1)) * Math.PI;
      const gx = -Math.cos(gAngle) * 44;
      const gy = 8 + Math.sin(gAngle) * 46;
      const isYellow = g % 2 === 0;

      ctx.fillStyle = isYellow ? "#FFD166" : "#F77F00";
      ctx.beginPath();
      ctx.arc(gx, gy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isYellow ? "#F77F00" : "#D62828";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore();

    // --- 6. Majestic Elephant Head & Face ---
    ctx.save();
    ctx.translate(0, -32);

    // Broad Royal Ears (Supakarana)
    // Left Ear
    const earWobble = Math.sin(time * 2.5) * 0.03;
    ctx.save();
    ctx.translate(-42, 0);
    ctx.rotate(-earWobble);
    ctx.fillStyle = "#F4A261";
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 38, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFAAA6";
    ctx.beginPath();
    ctx.ellipse(2, 2, 16, 26, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Right Ear
    ctx.save();
    ctx.translate(42, 0);
    ctx.rotate(earWobble);
    ctx.fillStyle = "#F4A261";
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 38, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FFAAA6";
    ctx.beginPath();
    ctx.ellipse(-2, 2, 16, 26, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Elephant Temples & Forehead (Kumbha)
    ctx.fillStyle = "#F4A261";
    ctx.beginPath();
    ctx.arc(0, -10, 36, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Tilak & Trishul Pattern on Forehead
    ctx.fillStyle = "#D62828"; // Vermilion Sindoor
    ctx.beginPath();
    ctx.moveTo(-10, -26);
    ctx.quadraticCurveTo(0, -34, 10, -26);
    ctx.lineTo(7, -10);
    ctx.quadraticCurveTo(0, -18, -7, -10);
    ctx.closePath();
    ctx.fill();

    // Haldi Gold Center Line
    ctx.fillStyle = "#FFD166";
    ctx.fillRect(-2, -30, 4, 20);

    // Red Bindi
    ctx.fillStyle = "#D62828";
    ctx.beginPath();
    ctx.arc(0, -7, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Gentle Peaceful Smiling Eyes
    ctx.strokeStyle = "#38231E";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    // Left Eye (Gentle curved smile)
    ctx.beginPath();
    ctx.arc(-18, -4, 9, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    // Right Eye
    ctx.beginPath();
    ctx.arc(18, -4, 9, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

    // Auspicious Tusks (Ekadanta: Right tusk intact, left broken)
    ctx.fillStyle = "#FFFDF6";
    // Right Full Tusk
    ctx.beginPath();
    ctx.moveTo(14, 15);
    ctx.quadraticCurveTo(24, 24, 26, 36);
    ctx.quadraticCurveTo(18, 30, 10, 18);
    ctx.fill();
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left Broken Tusk (Sacred symbol of sacrifice to write Mahabharata)
    ctx.beginPath();
    ctx.moveTo(-14, 15);
    ctx.lineTo(-21, 23);
    ctx.lineTo(-11, 21);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Graceful Curved Trunk (Vakratunda) turning towards the Modak on the left
    ctx.save();
    ctx.strokeStyle = "#F4A261";
    ctx.lineWidth = 18;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.bezierCurveTo(-4, 30, -20, 42, -38, 40);
    ctx.bezierCurveTo(-48, 38, -46, 26, -38, 22);
    ctx.stroke();

    // Trunk Tip Holding Modak
    this.renderModak(ctx, -38, 16, 0.45);
    ctx.restore();

    // --- 7. Royal Crown (Mukut) ---
    ctx.save();
    ctx.translate(0, -38);
    // Base Gold Band
    ctx.fillStyle = "#FFB703";
    ctx.beginPath();
    ctx.roundRect(-30, -8, 60, 12, 4);
    ctx.fill();
    ctx.strokeStyle = "#D62828";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Ornate Tiers
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.moveTo(-28, -6);
    ctx.lineTo(-18, -36);
    ctx.lineTo(-6, -46);
    ctx.lineTo(0, -56); // Peak Kalash
    ctx.lineTo(6, -46);
    ctx.lineTo(18, -36);
    ctx.lineTo(28, -6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ruby & Emerald Jewel Insets
    const gems = [
      { x: 0, y: -44, color: "#D62828", r: 4.5 },
      { x: -12, y: -26, color: "#2D6A4F", r: 3.5 },
      { x: 12, y: -26, color: "#2D6A4F", r: 3.5 },
      { x: 0, y: -2, color: "#D62828", r: 3.5 }
    ];
    for (const g of gems) {
      ctx.fillStyle = g.color;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.restore(); // Crown

    ctx.restore(); // Head
    ctx.restore(); // Root
  }

  // =========================================================================
  // FESTIVE MODAKS
  // =========================================================================
  renderModak(ctx, x, y, scale = 1.0, special = false) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Glowing aura if special
    if (special) {
      const pulse = Math.sin(this.animTime * 6) * 3;
      const glow = ctx.createRadialGradient(0, 0, 5, 0, 0, 32 + pulse);
      glow.addColorStop(0, "rgba(255, 215, 0, 0.8)");
      glow.addColorStop(0.6, "rgba(247, 127, 0, 0.4)");
      glow.addColorStop(1, "rgba(247, 127, 0, 0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 32 + pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // Classic Steamed / Golden Modak Body
    const modakGrad = ctx.createLinearGradient(0, -22, 0, 18);
    if (special) {
      modakGrad.addColorStop(0, "#FFF9D2");
      modakGrad.addColorStop(0.5, "#FFD166");
      modakGrad.addColorStop(1, "#F77F00");
    } else {
      modakGrad.addColorStop(0, "#FFFDF6");
      modakGrad.addColorStop(0.5, "#F8EDEB");
      modakGrad.addColorStop(1, "#F0DFC8");
    }

    ctx.fillStyle = modakGrad;
    ctx.beginPath();
    ctx.moveTo(0, -22); // pointed pleated top
    ctx.bezierCurveTo(10, -12, 18, 2, 18, 12);
    ctx.quadraticCurveTo(18, 18, 0, 18);
    ctx.quadraticCurveTo(-18, 18, -18, 12);
    ctx.bezierCurveTo(-18, 2, -10, -12, 0, -22);
    ctx.fill();

    // Pleated folds (Karanji / Modak folds)
    ctx.strokeStyle = special ? "#E85D04" : "#D4B89C";
    ctx.lineWidth = 1.5;
    [-11, -5, 0, 5, 11].forEach(offset => {
      ctx.beginPath();
      ctx.moveTo(0, -20);
      ctx.quadraticCurveTo(offset * 1.3, 0, offset, 17);
      ctx.stroke();
    });

    // Saffron strand (Kesar) at the tip
    ctx.strokeStyle = "#D62828";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -21);
    ctx.lineTo(2, -26);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // FESTIVAL MARIGOLD FLOWER (Genda Phool)
  // =========================================================================
  renderMarigoldFlower(ctx, x, y, scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    const petals = 12;
    for (let layer = 0; layer < 3; layer++) {
      const pRadius = 16 - layer * 4;
      const count = petals - layer * 2;
      const color = layer === 0 ? "#F77F00" : layer === 1 ? "#FFB703" : "#FFD166";
      ctx.fillStyle = color;

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (layer * 0.2);
        const px = Math.cos(angle) * pRadius;
        const py = Math.sin(angle) * pRadius;

        ctx.beginPath();
        ctx.arc(px, py, 6 - layer, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Flower Center
    ctx.fillStyle = "#D62828";
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // BRASS / CLAY DIYA LAMP (With Animated Flame)
  // =========================================================================
  renderDiya(ctx, x, y, scale = 1.0) {
    const time = this.animTime;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Diya Earthen / Brass Body
    const baseGrad = ctx.createLinearGradient(0, -4, 0, 14);
    baseGrad.addColorStop(0, "#FFB703");
    baseGrad.addColorStop(1, "#B3541E");
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.moveTo(-18, 0);
    ctx.quadraticCurveTo(0, 16, 18, 0);
    ctx.quadraticCurveTo(10, 4, -10, 4);
    ctx.closePath();
    ctx.fill();

    // Oil Pool
    ctx.fillStyle = "#5E3023";
    ctx.beginPath();
    ctx.ellipse(0, 1, 12, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flickering Flame & Glow
    const flicker = Math.sin(time * 12) * 1.5;
    const flameY = -6 + flicker * 0.5;

    // Outer Glow
    const glow = ctx.createRadialGradient(0, flameY, 2, 0, flameY, 24);
    glow.addColorStop(0, "rgba(255, 209, 102, 0.9)");
    glow.addColorStop(0.5, "rgba(247, 127, 0, 0.4)");
    glow.addColorStop(1, "rgba(247, 127, 0, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, flameY, 24, 0, Math.PI * 2);
    ctx.fill();

    // Teardrop Flame
    ctx.fillStyle = "#FFD166";
    ctx.beginPath();
    ctx.moveTo(0, flameY - 14 + flicker);
    ctx.quadraticCurveTo(6 + flicker * 0.3, flameY - 4, 0, flameY + 4);
    ctx.quadraticCurveTo(-6 - flicker * 0.3, flameY - 4, 0, flameY - 14 + flicker);
    ctx.fill();

    // Blue/White Core
    ctx.fillStyle = "#FFFDF6";
    ctx.beginPath();
    ctx.arc(0, flameY + 1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // DHOL DRUM (Authentic Festival Drum)
  // =========================================================================
  renderDhol(ctx, x, y, scale = 1.0, isHit = false) {
    ctx.save();
    ctx.translate(x, y);
    const bounce = isHit ? 1.15 : 1.0;
    ctx.scale(scale * bounce, scale * bounce);

    // Wooden Barrel (Red & Gold Carved Wood)
    const barrelGrad = ctx.createLinearGradient(-35, 0, 35, 0);
    barrelGrad.addColorStop(0, "#780016");
    barrelGrad.addColorStop(0.5, "#D62828");
    barrelGrad.addColorStop(1, "#590D22");

    ctx.fillStyle = barrelGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 36, 44, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Tension Bands
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, -24, 30, 10, 0, 0, Math.PI * 2);
    ctx.ellipse(0, 24, 30, 10, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Tension Ropes (V-Pattern)
    ctx.strokeStyle = "#FFFDF6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    [-22, -11, 0, 11, 22].forEach(vx => {
      ctx.moveTo(vx, -24);
      ctx.lineTo(vx + (vx > 0 ? -6 : 6), 24);
    });
    ctx.stroke();

    // Resonant Black Masala Circle in center
    ctx.fillStyle = "#1B1B1B";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Drumsticks (Dagga & Thapi)
    ctx.strokeStyle = "#FFB703";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    // Curved wooden stick
    ctx.moveTo(-36, -30);
    ctx.quadraticCurveTo(-24, -20, -10, -5);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // FESTIVAL OBSTACLES (Harmless festive obstacles)
  // Types: 'box', 'puddle', 'powder_bowl'
  // =========================================================================
  renderObstacle(ctx, x, y, type = "box", scale = 1.0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (type === "box") {
      // Festive gift box with ribbon
      ctx.fillStyle = "#D62828";
      ctx.fillRect(-16, -20, 32, 28);
      ctx.strokeStyle = "#FFD166";
      ctx.lineWidth = 5;
      ctx.strokeRect(-16, -20, 32, 28);

      // Gold Ribbon
      ctx.fillStyle = "#FFD166";
      ctx.fillRect(-4, -20, 8, 28);
      ctx.fillRect(-16, -8, 32, 6);

      // Ribbon Bow
      ctx.beginPath();
      ctx.ellipse(-6, -24, 7, 5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(6, -24, 7, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (type === "puddle") {
      // Water puddle with ripples
      ctx.fillStyle = "rgba(0, 119, 182, 0.45)";
      ctx.beginPath();
      ctx.ellipse(0, 2, 28, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 2, 16, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (type === "powder_bowl") {
      // Brass bowl with bright Gulal / Kumkum powder
      ctx.fillStyle = "#FFB703";
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 8, 0, 0, Math.PI);
      ctx.fill();

      // Bright Pink/Orange powder mound
      ctx.fillStyle = "#E85D04";
      ctx.beginPath();
      ctx.arc(0, 2, 12, Math.PI, 0);
      ctx.fill();
    }

    ctx.restore();
  }
}

if (typeof window !== "undefined") {
  window.SpriteRenderer = SpriteRenderer;
}
