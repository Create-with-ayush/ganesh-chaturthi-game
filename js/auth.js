/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Auth Manager - Handles Player Registration, Login & Session Management
 */

class AuthManager {
  constructor() {
    this.PLAYERS_KEY = "mushak_festival_players_v1";
    this.SESSION_KEY = "mushak_festival_session_v1";
    this.currentPlayer = null;

    this.avatars = [
      "🐭", "🙏", "🪔", "🌸", "🥟", "🏛️",
      "🌺", "🥁", "🌱", "🔔", "✨", "🎭",
      "🦚", "🐘", "👑", "🎶", "💫", "🪷"
    ];

    this._loadSession();
  }

  _getPlayers() {
    try {
      const raw = localStorage.getItem(this.PLAYERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn("Error reading players:", e);
    }
    return {};
  }

  _savePlayers(players) {
    try {
      localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(players));
    } catch (e) {
      console.warn("Error saving players:", e);
    }
  }

  _loadSession() {
    try {
      const raw = localStorage.getItem(this.SESSION_KEY);
      if (raw) {
        const session = JSON.parse(raw);
        const players = this._getPlayers();
        if (players[session.name]) {
          this.currentPlayer = players[session.name];
          return true;
        }
      }
    } catch (e) {
      console.warn("Error loading session:", e);
    }
    this.currentPlayer = null;
    return false;
  }

  _saveSession(playerName) {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify({ name: playerName }));
    } catch (e) {
      console.warn("Error saving session:", e);
    }
  }

  hasSession() {
    return this.currentPlayer !== null;
  }

  getCurrentPlayer() {
    return this.currentPlayer;
  }

  getPlayerName() {
    return this.currentPlayer ? this.currentPlayer.name : "DEVOTEE";
  }

  getPlayerAvatar() {
    return this.currentPlayer ? this.currentPlayer.avatar : "🐭";
  }

  register(name, avatar) {
    const cleanName = (name || "").trim().toUpperCase().slice(0, 12);
    if (!cleanName || cleanName.length < 2) {
      return { success: false, message: "Name must be at least 2 characters!" };
    }

    const players = this._getPlayers();
    if (players[cleanName]) {
      return { success: false, message: "This name is already taken! Try logging in." };
    }

    const now = new Date().toISOString().split("T")[0];
    const newPlayer = {
      name: cleanName,
      avatar: avatar || "🐭",
      joinDate: now,
      totalScore: 0,
      totalStars: 0,
      bestCombo: 0,
      gamesPlayed: 0
    };

    players[cleanName] = newPlayer;
    this._savePlayers(players);
    this.currentPlayer = newPlayer;
    this._saveSession(cleanName);

    return { success: true, message: `Welcome, ${cleanName}! 🙏`, player: newPlayer };
  }

  login(name) {
    const cleanName = (name || "").trim().toUpperCase().slice(0, 12);
    const players = this._getPlayers();

    if (!players[cleanName]) {
      return { success: false, message: "Player not found! Please register first." };
    }

    this.currentPlayer = players[cleanName];
    this._saveSession(cleanName);

    return { success: true, message: `Welcome back, ${cleanName}! 🪔`, player: players[cleanName] };
  }

  loginDirect(name) {
    const cleanName = (name || "").trim().toUpperCase().slice(0, 12);
    const players = this._getPlayers();

    if (players[cleanName]) {
      this.currentPlayer = players[cleanName];
      this._saveSession(cleanName);
      return true;
    }
    return false;
  }

  logout() {
    this.currentPlayer = null;
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (e) {}
  }

  updatePlayerStats(totalScore, totalStars, bestCombo) {
    if (!this.currentPlayer) return;

    const players = this._getPlayers();
    const playerName = this.currentPlayer.name;

    if (players[playerName]) {
      players[playerName].totalScore = Math.max(players[playerName].totalScore || 0, totalScore);
      players[playerName].totalStars = Math.max(players[playerName].totalStars || 0, totalStars);
      players[playerName].bestCombo = Math.max(players[playerName].bestCombo || 0, bestCombo);
      players[playerName].gamesPlayed = (players[playerName].gamesPlayed || 0) + 1;
      this._savePlayers(players);
      this.currentPlayer = players[playerName];
    }
  }

  getAllPlayers() {
    const players = this._getPlayers();
    return Object.values(players).sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0));
  }

  getPlayerList() {
    return this.getAllPlayers();
  }

  getAvatars() {
    return this.avatars;
  }
}

if (typeof window !== "undefined") {
  window.AuthManager = AuthManager;
}
