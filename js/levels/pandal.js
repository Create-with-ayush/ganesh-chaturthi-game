/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Level 2: Pandal Decorator
 * Timed decoration puzzle mini-game where player places sacred ornaments into the Grand Pandal.
 */

class PandalLevel {
  constructor(game) {
    this.game = game;
    this.ctx = game.ctx;
    this.width = CONFIG.CANVAS.WIDTH;
    this.height = CONFIG.CANVAS.HEIGHT;

    this.timeLeft = 60;
    this.score = 0;
    this.isOver = false;
    this.selectedItemIndex = -1;
    this.draggingItem = null;
    this.dragOffset = { x: 0, y: 0 };
    this.pointerPos = { x: 0, y: 0 };

    // Slots on the grand pandal arch
    // Structure center at (512, 280)
    this.slots = [
      { id: "toran", name: "Floral Toran Arch", type: "toran", x: 512, y: 130, width: 280, height: 44, placed: false, previewLabel: "Arch Top" },
      { id: "kalash", name: "Auspicious Kalash", type: "kalash", x: 512, y: 70, width: 44, height: 44, placed: false, previewLabel: "Crown Dome" },
      { id: "bell_left", name: "Temple Bell Left", type: "bell", x: 340, y: 195, width: 40, height: 48, placed: false, previewLabel: "Left Bell" },
      { id: "bell_right", name: "Temple Bell Right", type: "bell", x: 684, y: 195, width: 40, height: 48, placed: false, previewLabel: "Right Bell" },
      { id: "garland_left", name: "Marigold Pillar Left", type: "flower_garland", x: 260, y: 310, width: 36, height: 160, placed: false, previewLabel: "Pillar Left" },
      { id: "garland_right", name: "Marigold Pillar Right", type: "flower_garland", x: 764, y: 310, width: 36, height: 160, placed: false, previewLabel: "Pillar Right" },
      { id: "diya_left", name: "Pedestal Diya Left", type: "diya", x: 260, y: 445, width: 48, height: 36, placed: false, previewLabel: "Base Left" },
      { id: "diya_right", name: "Pedestal Diya Right", type: "diya", x: 764, y: 445, width: 48, height: 36, placed: false, previewLabel: "Base Right" },
      { id: "fairy_lights", name: "Fairy Lights Strings", type: "lights", x: 512, y: 220, width: 340, height: 32, placed: false, previewLabel: "Dome Lights" },
      { id: "rangoli_base", name: "Sacred Rangoli Base", type: "rangoli", x: 512, y: 460, width: 140, height: 40, placed: false, previewLabel: "Center Base" }
    ];

    // Inventory items for the tray at bottom
    this.inventory = [];
    this.mistakes = 0;
    this.fastPlacementTimer = 0;
  }

  init() {
    this.timeLeft = CONFIG.LEVELS[2].duration || 60;
    this.score = 0;
    this.isOver = false;
    this.mistakes = 0;
    this.fastPlacementTimer = 0;
    this.selectedItemIndex = -1;
    this.draggingItem = null;

    // Reset slots
    this.slots.forEach(s => s.placed = false);

    // Populate inventory tray items (randomized order for fun puzzle challenge)
    const items = [
      { type: "toran", name: "Floral Toran", icon: "🌸" },
      { type: "kalash", name: "Sacred Kalash", icon: "🏺" },
      { type: "bell", name: "Brass Bell 1", icon: "🔔" },
      { type: "bell", name: "Brass Bell 2", icon: "🔔" },
      { type: "flower_garland", name: "Marigold Pillar 1", icon: "🌼" },
      { type: "flower_garland", name: "Marigold Pillar 2", icon: "🌼" },
      { type: "diya", name: "Samai Diya 1", icon: "🪔" },
      { type: "diya", name: "Samai Diya 2", icon: "🪔" },
      { type: "lights", name: "Fairy Lights", icon: "✨" },
      { type: "rangoli", name: "Rangoli Base", icon: "🌺" }
    ];

    // Shuffle inventory
    this.inventory = items
      .map(it => ({ ...it, placed: false, currentX: 0, currentY: 0 }))
      .sort(() => Math.random() - 0.5);

    this._layoutInventory();
  }

  _layoutInventory() {
    const unplaced = this.inventory.filter(it => !it.placed);
    const trayY = 520;
    const count = unplaced.length;
    const spacing = Math.min(84, (this.width - 120) / Math.max(1, count));
    const startX = (this.width - (count - 1) * spacing) / 2;

    unplaced.forEach((item, idx) => {
      item.trayX = startX + idx * spacing;
      item.trayY = trayY;
      if (!this.draggingItem || this.draggingItem !== item) {
        item.currentX = item.trayX;
        item.currentY = item.trayY;
      }
    });
  }

  update(dt, input) {
    if (this.isOver) return;

    this.timeLeft -= dt;
    this.fastPlacementTimer += dt;

    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.completeLevel();
      return;
    }

    // Check if all slots placed
    const allPlaced = this.slots.every(s => s.placed);
    if (allPlaced) {
      this.completeLevel();
    }
  }

  // Handle pointer down (drag start or tap select)
  handlePointerDown(x, y) {
    if (this.isOver) return;
    this.pointerPos = { x, y };

    // 1. Check if clicking on an inventory item
    for (let i = 0; i < this.inventory.length; i++) {
      const it = this.inventory[i];
      if (it.placed) continue;
      const dist = Math.hypot(x - it.trayX, y - it.trayY);
      if (dist < 34) {
        this.selectedItemIndex = i;
        this.draggingItem = it;
        this.dragOffset = { x: it.trayX - x, y: it.trayY - y };
        this.game.sound.playButtonClick();
        return;
      }
    }

    // 2. If an item is already selected, check if clicking on a valid target slot (Tap-to-place mode)
    if (this.selectedItemIndex >= 0) {
      const item = this.inventory[this.selectedItemIndex];
      for (const slot of this.slots) {
        if (!slot.placed && this._isPointInSlot(x, y, slot)) {
          this._tryPlaceItem(item, slot);
          this.selectedItemIndex = -1;
          this.draggingItem = null;
          return;
        }
      }
    }
  }

  handlePointerMove(x, y) {
    this.pointerPos = { x, y };
    if (this.draggingItem) {
      this.draggingItem.currentX = x + this.dragOffset.x;
      this.draggingItem.currentY = y + this.dragOffset.y;
    }
  }

  handlePointerUp(x, y) {
    if (this.draggingItem) {
      const item = this.draggingItem;
      let placed = false;

      // Check collision with any matching empty slot
      for (const slot of this.slots) {
        if (!slot.placed && this._isPointInSlot(x, y, slot)) {
          placed = this._tryPlaceItem(item, slot);
          break;
        }
      }

      if (!placed) {
        // Return to tray
        item.currentX = item.trayX;
        item.currentY = item.trayY;
      }

      this.draggingItem = null;
    }
  }

  _isPointInSlot(x, y, slot) {
    const halfW = slot.width / 2 + 20;
    const halfH = slot.height / 2 + 20;
    return x >= slot.x - halfW && x <= slot.x + halfW &&
           y >= slot.y - halfH && y <= slot.y + halfH;
  }

  _tryPlaceItem(item, slot) {
    if (item.type === slot.type) {
      // Correct placement!
      slot.placed = true;
      item.placed = true;

      // Fast placement bonus
      let points = 100;
      if (this.fastPlacementTimer < 4.0) {
        points += 50; // Quick placement bonus
      }
      this.fastPlacementTimer = 0;
      this.score += points;

      this.game.sound.playPandalSnap();
      this.game.particles.addSparkles(slot.x, slot.y, 20, "#FFD166");
      this.game.particles.addPetalBurst(slot.x, slot.y, 14);
      this.game.particles.addFloatingText(`PERFECT! +${points}`, slot.x, slot.y - 20, "#FFD166", 22);

      this._layoutInventory();
      return true;
    } else {
      // Wrong placement penalty
      this.mistakes++;
      this.timeLeft = Math.max(0, this.timeLeft - 3); // 3 second penalty
      this.game.sound.playObstacleHit();
      this.game.particles.addFloatingText("-3s WRONG SPOT!", slot.x, slot.y - 15, "#E63946", 20);
      return false;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // 1. Background Pandal Courtyard
    const bgGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    bgGrad.addColorStop(0, "#191110");
    bgGrad.addColorStop(0.5, "#2A1715");
    bgGrad.addColorStop(1, "#3D1A16");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Decorative festival lights curtain in background
    ctx.strokeStyle = "rgba(255, 209, 102, 0.25)";
    ctx.lineWidth = 1;
    for (let lx = 60; lx < this.width; lx += 48) {
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, 480);
      ctx.stroke();

      for (let ly = 40; ly < 460; ly += 50) {
        ctx.fillStyle = (ly % 100 === 0) ? "#FFD166" : "#F77F00";
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. Grand Pandal Architectural Structure
    this._renderPandalStructure(ctx);

    // 3. Render Slots (Ghost Outlines or Placed Decorations)
    for (const slot of this.slots) {
      if (slot.placed) {
        this._renderPlacedDecoration(ctx, slot);
      } else {
        this._renderGhostSlot(ctx, slot);
      }
    }

    // 4. Center Deity Platform: Lord Ganesha seated peacefully
    this.game.sprites.renderLordGanesha(ctx, 512, 340, 0.85);

    // Mushak supervisor standing happily at the side
    this.game.sprites.renderMushak(ctx, 160, 440, {
      scale: 1.1,
      anim: this.slots.every(s => s.placed) ? "celebrate" : "idle",
      facing: 1
    });

    // 5. Bottom Inventory Tray
    this._renderInventoryTray(ctx);

    // 6. Currently dragged item
    if (this.draggingItem) {
      this._renderInventoryIcon(ctx, this.draggingItem, this.draggingItem.currentX, this.draggingItem.currentY, true);
    }

    ctx.restore();
  }

  _renderPandalStructure(ctx) {
    // Grand Wooden & Gold Temple Archway
    const cx = 512;
    const archBaseY = 480;

    // Stone / Wooden Pillars
    ctx.fillStyle = "#4A121A"; // Royal Maroon Pillars
    ctx.fillRect(235, 180, 50, 290);
    ctx.fillRect(739, 180, 50, 290);

    // Golden Pillar Trim
    ctx.fillStyle = "#FFB703";
    ctx.fillRect(230, 170, 60, 14);
    ctx.fillRect(734, 170, 60, 14);
    ctx.fillRect(230, 465, 60, 14);
    ctx.fillRect(734, 465, 60, 14);

    // Grand Arch Dome
    ctx.strokeStyle = "#D62828";
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(cx, 260, 245, Math.PI, 0, false);
    ctx.stroke();

    // Gold Inner Arch Trim
    ctx.strokeStyle = "#FFD166";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, 260, 235, Math.PI, 0, false);
    ctx.stroke();

    // Royal Canopy Roof
    ctx.fillStyle = "#780016";
    ctx.beginPath();
    ctx.moveTo(220, 180);
    ctx.quadraticCurveTo(cx, 30, 804, 180);
    ctx.lineTo(740, 180);
    ctx.quadraticCurveTo(cx, 70, 280, 180);
    ctx.closePath();
    ctx.fill();

    // Ground platform stage
    ctx.fillStyle = "#2B1310";
    ctx.fillRect(180, 475, 664, 25);
    ctx.fillStyle = "#FFB703";
    ctx.fillRect(175, 473, 674, 4);
  }

  _renderGhostSlot(ctx, slot) {
    ctx.save();
    // Dashed glowing outline
    const isTarget = this.draggingItem && this.draggingItem.type === slot.type;
    ctx.strokeStyle = isTarget ? "#FFD166" : "rgba(255, 209, 102, 0.4)";
    ctx.lineWidth = isTarget ? 3 : 1.5;
    ctx.setLineDash([6, 6]);

    ctx.strokeRect(slot.x - slot.width / 2, slot.y - slot.height / 2, slot.width, slot.height);

    // Slot preview icon or label
    ctx.font = "bold 11px 'Outfit', sans-serif";
    ctx.fillStyle = isTarget ? "#FFD166" : "rgba(255, 253, 246, 0.6)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(slot.previewLabel, slot.x, slot.y);

    ctx.restore();
  }

  _renderPlacedDecoration(ctx, slot) {
    ctx.save();
    const x = slot.x;
    const y = slot.y;

    switch (slot.type) {
      case "toran":
        // Arch Toran Garland
        ctx.strokeStyle = "#2D6A4F";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(x - 140, y);
        ctx.quadraticCurveTo(x, y + 25, x + 140, y);
        ctx.stroke();
        for (let t = -5; t <= 5; t++) {
          this.game.sprites.renderMarigoldFlower(ctx, x + t * 25, y + 12 - Math.abs(t) * 1.5, 0.65);
        }
        break;

      case "kalash":
        // Golden Kalash with Coconut
        ctx.fillStyle = "#FFB703";
        ctx.beginPath();
        ctx.arc(x, y + 8, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#5E3023"; // Coconut
        ctx.beginPath();
        ctx.arc(x, y - 6, 8, 0, Math.PI * 2);
        ctx.fill();
        // Green Mango leaves
        ctx.fillStyle = "#2D6A4F";
        ctx.beginPath();
        ctx.ellipse(x - 9, y - 2, 7, 3, -0.6, 0, Math.PI * 2);
        ctx.ellipse(x + 9, y - 2, 7, 3, 0.6, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "bell":
        // Hanging brass temple bell
        ctx.strokeStyle = "#D62828";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, y - 24);
        ctx.lineTo(x, y - 6);
        ctx.stroke();

        ctx.fillStyle = "#FFD166";
        ctx.beginPath();
        ctx.moveTo(x - 12, y + 10);
        ctx.quadraticCurveTo(x - 10, y - 6, x, y - 6);
        ctx.quadraticCurveTo(x + 10, y - 6, x + 12, y + 10);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#B38A00";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Clapper
        ctx.fillStyle = "#FFB703";
        ctx.beginPath();
        ctx.arc(x, y + 13, 3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "flower_garland":
        // Hanging vertical marigold pillar garland
        for (let gy = y - 70; gy <= y + 70; gy += 18) {
          this.game.sprites.renderMarigoldFlower(ctx, x, gy, 0.65);
        }
        break;

      case "diya":
        this.game.sprites.renderDiya(ctx, x, y, 0.85);
        break;

      case "lights":
        // Glowing fairy lights
        ctx.strokeStyle = "rgba(255, 209, 102, 0.7)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 160, y - 10);
        ctx.quadraticCurveTo(x, y + 20, x + 160, y - 10);
        ctx.stroke();
        for (let lx = -140; lx <= 140; lx += 24) {
          const ly = y + 10 - Math.pow(lx / 160, 2) * 15;
          ctx.fillStyle = (Math.abs(lx) % 48 === 0) ? "#FFD166" : "#F77F00";
          ctx.beginPath();
          ctx.arc(x + lx, ly, 4, 0, Math.PI * 2);
          ctx.fill();
        }
        break;

      case "rangoli":
        // Base Lotus Rangoli
        ctx.fillStyle = "#D62828";
        ctx.beginPath();
        ctx.ellipse(x, y, 65, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#FFD166";
        ctx.beginPath();
        ctx.ellipse(x, y, 40, 11, 0, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  }

  _renderInventoryTray(ctx) {
    // Elegant Dark Tray at Bottom
    ctx.save();
    ctx.fillStyle = "rgba(26, 17, 16, 0.95)";
    ctx.fillRect(0, 495, this.width, 81);
    ctx.strokeStyle = "#FFB703";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 495);
    ctx.lineTo(this.width, 495);
    ctx.stroke();

    // Inventory items
    this.inventory.forEach((item, idx) => {
      if (item.placed) return;
      if (this.draggingItem && this.draggingItem === item) return;

      const isSelected = this.selectedItemIndex === idx;
      this._renderInventoryIcon(ctx, item, item.trayX, item.trayY, isSelected);
    });

    ctx.restore();
  }

  _renderInventoryIcon(ctx, item, x, y, highlighted = false) {
    ctx.save();
    // Card background
    ctx.fillStyle = highlighted ? "#F77F00" : "#382321";
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = highlighted ? "#FFD166" : "rgba(255, 209, 102, 0.5)";
    ctx.lineWidth = highlighted ? 3 : 1.5;
    ctx.stroke();

    // Emoji / Icon
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(item.icon, x, y - 1);

    // Item name tooltip if hovered/selected
    if (highlighted) {
      ctx.font = "bold 11px 'Outfit', sans-serif";
      ctx.fillStyle = "#FFFDF6";
      ctx.fillText(item.name, x, y - 36);
    }

    ctx.restore();
  }

  completeLevel() {
    this.isOver = true;
    this.game.sound.playLevelComplete();

    // Calculate stars
    let stars = 1;
    const thresholds = CONFIG.LEVELS[2].starThresholds;
    if (this.score >= thresholds[2]) stars = 3;
    else if (this.score >= thresholds[1]) stars = 2;

    this.game.storage.updateLevelProgress(2, this.score, stars, 0);

    this.game.ui.showLevelCompleteModal({
      levelId: 2,
      title: "PANDAL ARCHITECT!",
      score: this.score,
      maxScore: CONFIG.LEVELS[2].maxScore,
      stars: stars,
      bestCombo: 0,
      stats: [
        { label: "Items Placed", value: `${this.slots.filter(s => s.placed).length}/${this.slots.length}` },
        { label: "Time Remaining", value: `${Math.ceil(this.timeLeft)}s` },
        { label: "Placement Mistakes", value: this.mistakes }
      ],
      nextLevelId: 3,
      bappaMessage: CONFIG.LEVELS[2].completionMessage
    });
  }
}

if (typeof window !== "undefined") {
  window.PandalLevel = PandalLevel;
}
