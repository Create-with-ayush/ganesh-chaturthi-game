/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Particle Engine - Handles Petals, Sparks, Confetti, Floating Scores & Shockwaves
 */

class ParticleEngine {
  constructor() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }

  reset() {
    this.particles = [];
    this.floatingTexts = [];
    this.shockwaves = [];
  }

  // Floating Score Numbers & Badges
  addFloatingText(text, x, y, color = "#FFD166", size = 20, isCombo = false) {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -1.6,
      vx: (Math.random() - 0.5) * 0.8,
      color,
      size,
      alpha: 1.0,
      scale: isCombo ? 1.4 : 1.0,
      life: 0,
      maxLife: 50
    });
  }

  // Glowing Sparkles
  addSparkles(x, y, count = 12, color = "#FFD166") {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        type: "sparkle",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        decay: 0.02 + Math.random() * 0.03,
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }
  }

  // Marigold & Rose Flower Petals
  addPetalBurst(x, y, count = 16) {
    const colors = ["#F77F00", "#FFB703", "#FCBF49", "#D62828", "#E85D04"];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 4.0;
      this.particles.push({
        type: "petal",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        gravity: 0.06,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 8 + Math.random() * 6,
        height: 12 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15,
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.015,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.05 + Math.random() * 0.05
      });
    }
  }

  // Ambient Falling Petals (Continuous)
  spawnAmbientPetal(width, height) {
    const colors = ["#F77F00", "#FFB703", "#FCBF49", "#D62828"];
    this.particles.push({
      type: "ambient_petal",
      x: Math.random() * width,
      y: -20,
      vx: (Math.random() - 0.5) * 0.8,
      vy: 1.2 + Math.random() * 1.5,
      gravity: 0.01,
      color: colors[Math.floor(Math.random() * colors.length)],
      width: 7 + Math.random() * 5,
      height: 10 + Math.random() * 6,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.08,
      alpha: 0.85,
      decay: 0.002,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.03 + Math.random() * 0.04
    });
  }

  // Celebration Confetti
  addConfettiBurst(x, y, count = 28) {
    const colors = ["#D62828", "#FFB703", "#F77F00", "#2D6A4F", "#0077B6", "#E85D04", "#FFFFFF"];
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI) - Math.PI; // upwards arc
      const speed = 3.0 + Math.random() * 6.0;
      this.particles.push({
        type: "confetti",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.0,
        gravity: 0.12,
        color: colors[Math.floor(Math.random() * colors.length)],
        width: 6 + Math.random() * 6,
        height: 10 + Math.random() * 8,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        alpha: 1.0,
        decay: 0.01 + Math.random() * 0.01
      });
    }
  }

  // Rangoli Powder Cloud
  addPowderCloud(x, y, color = "#F77F00", count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 2.0;
      this.particles.push({
        type: "powder",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 6 + Math.random() * 10,
        alpha: 0.7,
        decay: 0.025 + Math.random() * 0.02
      });
    }
  }

  // Sacred Akshata (Colored Holy Rice Grains) Shower
  addAkshataShower(x, y, count = 20) {
    const colors = ["#FFD166", "#D62828", "#FFFDF6", "#F77F00"];
    for (let i = 0; i < count; i++) {
      const angle = (Math.random() * Math.PI) - Math.PI; // upward scatter
      const speed = 1.2 + Math.random() * 3.5;
      this.particles.push({
        type: "akshata",
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        gravity: 0.14,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.01
      });
    }
  }

  // Bappa's Blessing Holy Aura Starlight Trail
  addHolyAuraTrail(x, y, color = "#FFD166") {
    this.particles.push({
      type: "holy_trail",
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 15,
      vx: (Math.random() - 0.5) * 0.8,
      vy: -0.8 - Math.random() * 1.2,
      color,
      size: 4 + Math.random() * 4,
      rotation: Math.random() * Math.PI,
      vRot: (Math.random() - 0.5) * 0.15,
      alpha: 0.9,
      decay: 0.035
    });
  }

  // Incense & Camphor Fragrant Smoke Curl
  addSmokeSwirl(x, y) {
    this.particles.push({
      type: "smoke",
      x: x + (Math.random() - 0.5) * 8,
      y: y,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -1.0 - Math.random() * 0.8,
      size: 6 + Math.random() * 4,
      maxSize: 22 + Math.random() * 12,
      alpha: 0.55,
      decay: 0.012
    });
  }

  // Dhol Rhythm Shockwave
  addShockwave(x, y, color = "#FFD166", maxRadius = 70) {
    this.shockwaves.push({
      x,
      y,
      radius: 10,
      maxRadius,
      color,
      alpha: 1.0,
      lineWidth: 4
    });
  }

  update() {
    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.gravity) {
        p.vy += p.gravity;
      }

      if (p.swayPhase !== undefined) {
        p.swayPhase += p.swaySpeed;
        p.x += Math.sin(p.swayPhase) * 0.6;
      }

      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot;
      }

      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > 650) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.x += ft.vx;
      ft.y += ft.vy;
      ft.life++;

      if (ft.life > ft.maxLife * 0.5) {
        ft.alpha -= 1 / (ft.maxLife * 0.5);
      }

      if (ft.alpha <= 0 || ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.25 + 1.5;
      sw.alpha -= 0.05;
      sw.lineWidth = Math.max(1, sw.lineWidth * 0.92);

      if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }
  }

  render(ctx) {
    ctx.save();

    // Render Shockwaves
    for (const sw of this.shockwaves) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sw.alpha);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.lineWidth;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Render Particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);

      if (p.type === "sparkle") {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        // 4-point star
        ctx.beginPath();
        const s = p.size;
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      } else if (p.type === "petal" || p.type === "ambient_petal") {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        // Tear-shaped marigold petal
        ctx.beginPath();
        ctx.ellipse(0, 0, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Inner petal vein
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -p.height / 3);
        ctx.lineTo(0, p.height / 3);
        ctx.stroke();
      } else if (p.type === "confetti") {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else if (p.type === "powder") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "akshata") {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, 1.8, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "holy_trail") {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.quadraticCurveTo(0, 0, s, 0);
        ctx.quadraticCurveTo(0, 0, 0, s);
        ctx.quadraticCurveTo(0, 0, -s, 0);
        ctx.quadraticCurveTo(0, 0, 0, -s);
        ctx.fill();
      } else if (p.type === "smoke") {
        const grad = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, p.size || 10);
        grad.addColorStop(0, "rgba(240, 235, 230, 0.6)");
        grad.addColorStop(0.5, "rgba(200, 195, 190, 0.25)");
        grad.addColorStop(1, "rgba(180, 175, 170, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size || 10, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Render Floating Text
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold ${ft.size}px 'Outfit', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Shadow / Outline
      ctx.strokeStyle = "#140D0C";
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);

      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
  }
}

if (typeof window !== "undefined") {
  window.ParticleEngine = ParticleEngine;
}
