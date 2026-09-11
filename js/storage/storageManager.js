/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Storage Manager - Handles LocalStorage & In-Memory Fallback
 */

class StorageManager {
  constructor() {
    this.STORAGE_KEY = "mushak_festival_quest_save_v1";
    this.LEADERBOARD_KEY = "mushak_festival_leaderboard_v1";
    this.isStorageAvailable = this._checkStorage();

    this.defaultData = {
      unlockedLevels: [1],
      levelProgress: {
        1: { completed: false, score: 0, stars: 0, bestCombo: 0 },
        2: { completed: false, score: 0, stars: 0, bestCombo: 0 },
        3: { completed: false, score: 0, stars: 0, bestCombo: 0 },
        4: { completed: false, score: 0, stars: 0, bestCombo: 0 },
        5: { completed: false, score: 0, stars: 0, bestCombo: 0 }
      },
      finalCelebrationUnlocked: false,
      totalScore: 0,
      totalStars: 0,
      bestOverallCombo: 0,
      equippedOutfit: "default",
      settings: {
        sfx: true,
        music: true,
        volume: 0.8,
        musicTrack: "bappa_aarti"
      }
    };

    this.memoryData = JSON.parse(JSON.stringify(this.defaultData));
    this.memoryLeaderboard = (CONFIG && CONFIG.DEFAULT_LEADERBOARD) 
      ? JSON.parse(JSON.stringify(CONFIG.DEFAULT_LEADERBOARD)) 
      : [];

    this._initLeaderboard();
  }

  _checkStorage() {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn("LocalStorage unavailable, using in-memory store.");
      return false;
    }
  }

  _initLeaderboard() {
    if (this.isStorageAvailable) {
      const existing = localStorage.getItem(this.LEADERBOARD_KEY);
      if (!existing) {
        localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(this.memoryLeaderboard));
      }
    }
  }

  getSaveData() {
    if (this.isStorageAvailable) {
      try {
        const raw = localStorage.getItem(this.STORAGE_KEY);
        if (raw) {
          return { ...this.defaultData, ...JSON.parse(raw) };
        }
      } catch (e) {
        console.error("Error reading save data:", e);
      }
    }
    return this.memoryData;
  }

  saveData(data) {
    this.memoryData = { ...this.memoryData, ...data };
    if (this.isStorageAvailable) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.memoryData));
      } catch (e) {
        console.error("Error saving data:", e);
      }
    }
  }

  updateLevelProgress(levelId, score, stars, combo) {
    const save = this.getSaveData();
    const lvl = parseInt(levelId, 10);

    if (!save.levelProgress[lvl]) {
      save.levelProgress[lvl] = { completed: false, score: 0, stars: 0, bestCombo: 0 };
    }

    const current = save.levelProgress[lvl];
    current.completed = true;
    current.score = Math.max(current.score, score);
    current.stars = Math.max(current.stars, stars);
    current.bestCombo = Math.max(current.bestCombo, combo);

    // Unlock next level
    const nextLevel = lvl + 1;
    if (nextLevel <= 5 && !save.unlockedLevels.includes(nextLevel)) {
      save.unlockedLevels.push(nextLevel);
    }

    if (lvl === 5 || save.unlockedLevels.includes(5)) {
      save.finalCelebrationUnlocked = true;
    }

    // Recompute total stars & scores
    let totalScore = 0;
    let totalStars = 0;
    let bestCombo = 0;

    for (let i = 1; i <= 5; i++) {
      if (save.levelProgress[i]) {
        totalScore += save.levelProgress[i].score || 0;
        totalStars += save.levelProgress[i].stars || 0;
        bestCombo = Math.max(bestCombo, save.levelProgress[i].bestCombo || 0);
      }
    }

    save.totalScore = totalScore;
    save.totalStars = totalStars;
    save.bestOverallCombo = bestCombo;

    this.saveData(save);
    return save;
  }

  getLeaderboard() {
    if (this.isStorageAvailable) {
      try {
        const raw = localStorage.getItem(this.LEADERBOARD_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      } catch (e) {
        console.error("Error reading leaderboard:", e);
      }
    }
    return this.memoryLeaderboard;
  }

  addLeaderboardEntry(name, score, stars, combo) {
    const cleanName = (name || "DEVOTEE").trim().toUpperCase().slice(0, 12);
    const list = this.getLeaderboard();

    // Determine rank title
    let rankTitle = "KEEP PLAYING!";
    if (CONFIG && CONFIG.RANKS) {
      for (const r of CONFIG.RANKS) {
        if (score >= r.minScore) {
          rankTitle = r.title;
          break;
        }
      }
    }

    const today = new Date().toISOString().split("T")[0];
    const newEntry = {
      name: cleanName,
      score: score,
      stars: stars,
      combo: combo,
      rank: rankTitle,
      date: today
    };

    list.push(newEntry);
    list.sort((a, b) => b.score - a.score);

    const topEntries = list.slice(0, 10);
    this.memoryLeaderboard = topEntries;

    if (this.isStorageAvailable) {
      try {
        localStorage.setItem(this.LEADERBOARD_KEY, JSON.stringify(topEntries));
      } catch (e) {
        console.error("Error saving leaderboard:", e);
      }
    }

    return topEntries;
  }

  getEquippedOutfit() {
    const save = this.getSaveData();
    return save.equippedOutfit || "default";
  }

  setEquippedOutfit(outfitId) {
    const save = this.getSaveData();
    save.equippedOutfit = outfitId;
    this.saveData(save);
    return outfitId;
  }

  isOutfitUnlocked(outfitId) {
    const save = this.getSaveData();
    const outfit = CONFIG.WARDROBE ? CONFIG.WARDROBE.find(w => w.id === outfitId) : null;
    if (!outfit) return false;
    return (save.totalStars || 0) >= outfit.starsRequired;
  }

  getSelectedMusicTrack() {
    const save = this.getSaveData();
    return (save.settings && save.settings.musicTrack) ? save.settings.musicTrack : "bappa_aarti";
  }

  setSelectedMusicTrack(trackId) {
    const save = this.getSaveData();
    if (!save.settings) save.settings = {};
    save.settings.musicTrack = trackId;
    this.saveData(save);
    return trackId;
  }

  resetProgress() {
    this.memoryData = JSON.parse(JSON.stringify(this.defaultData));
    if (this.isStorageAvailable) {
      try {
        localStorage.removeItem(this.STORAGE_KEY);
      } catch (e) {}
    }
    return this.memoryData;
  }
}

if (typeof window !== "undefined") {
  window.StorageManager = StorageManager;
}
