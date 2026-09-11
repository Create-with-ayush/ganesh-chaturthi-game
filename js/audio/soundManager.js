/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Web Audio API Procedural Synthesizer & Sound Engine
 * Zero external audio dependencies - 100% reliable, offline-ready & authentic.
 */

class SoundManager {
  constructor() {
    this.ctx = null;
    this.isInitialized = false;
    this.sfxEnabled = true;
    this.musicEnabled = true;
    this.masterVolume = 0.8;
    this.musicVolume = 0.5;
    this.sfxVolume = 0.7;

    this.musicInterval = null;
    this.droneGain = null;
    this.droneOscillators = [];
    this.currentTrack = null;
    this.stepCounter = 0;
    this.onAartiLyric = null;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn("Web Audio API not supported in this browser.");
        return;
      }
      this.ctx = new AudioCtx();
      this.isInitialized = true;
      if (this.ctx.state === "suspended") {
        const unlock = () => {
          if (this.ctx && this.ctx.state === "suspended") {
            this.ctx.resume();
          }
          window.removeEventListener("click", unlock);
          window.removeEventListener("keydown", unlock);
          window.removeEventListener("touchstart", unlock);
        };
        window.addEventListener("click", unlock);
        window.addEventListener("keydown", unlock);
        window.addEventListener("touchstart", unlock);
      }
    } catch (e) {
      console.warn("Failed to initialize AudioContext:", e);
    }
  }

  ensureContext() {
    if (!this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  setSFXEnabled(val) {
    this.sfxEnabled = !!val;
  }

  setMusicEnabled(val) {
    this.musicEnabled = !!val;
    if (!this.musicEnabled) {
      this.stopMusic();
    } else if (this.currentTrack) {
      this.startMusic(this.currentTrack);
    }
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.setValueAtTime(0.08 * this.musicVolume * this.masterVolume, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  setMusicVolume(val) {
    this.musicVolume = Math.max(0, Math.min(1, val));
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.setValueAtTime(0.08 * this.musicVolume * this.masterVolume, this.ctx.currentTime);
      } catch (e) {}
    }
  }

  setSFXVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  // ==========================================
  // PROCEDURAL SOUND EFFECTS
  // ==========================================

  playButtonClick() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.05);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  playModakCollect(special = false) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = special ? [523.25, 659.25, 783.99, 1046.5, 1318.5] : [523.25, 659.25, 783.99];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = special ? "triangle" : "sine";
      const startT = t + idx * 0.04;
      osc.frequency.setValueAtTime(freq, startT);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startT + 0.15);

      const peak = special ? 0.35 : 0.25;
      gain.gain.setValueAtTime(0.001, startT);
      gain.gain.linearRampToValueAtTime(peak * this.sfxVolume * this.masterVolume, startT + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + (special ? 0.45 : 0.28));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + (special ? 0.45 : 0.28));
    });
  }

  playFlowerCollect() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1174.66, t + 0.12);

    gain.gain.setValueAtTime(0.2 * this.sfxVolume * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playObstacleHit() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Low hollow wobble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.2);

    gain.gain.setValueAtTime(0.3 * this.sfxVolume * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  playPandalSnap() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Wood snap + bell
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(1400, t + 0.08);

    gain.gain.setValueAtTime(0.35 * this.sfxVolume * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.25);
  }

  playColorSelect(freq = 440) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, t + 0.15);

    gain.gain.setValueAtTime(0.25 * this.sfxVolume * this.masterVolume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.2);
  }

  playComboStinger(comboCount = 3) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const baseFreq = 440 + Math.min(comboCount * 40, 400);
    const chords = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

    chords.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      const startT = t + i * 0.03;
      osc.frequency.setValueAtTime(f, startT);
      osc.frequency.exponentialRampToValueAtTime(f * 1.1, startT + 0.2);

      gain.gain.setValueAtTime(0.2 * this.sfxVolume * this.masterVolume, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.3);
    });
  }

  // Authentic Dhol Drum Beat Synthesizer
  playDholBeat(type) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;

    switch (type) {
      case "DHA": // Deep resonant base beat + slap
        this._synthesizeBassDrum(t, 140, 50, 0.35, 0.5);
        this._synthesizeNoiseTransient(t, 0.06, 0.25);
        break;

      case "DHI": // Resonant mid tone
        this._synthesizeBassDrum(t, 220, 85, 0.28, 0.35);
        this._synthesizeNoiseTransient(t, 0.04, 0.18);
        break;

      case "TA": // High sharp rim-shot
        this._synthesizeRimshot(t, 440, 0.12, 0.4);
        break;

      case "NA": // Open ringing bell/tabla skin tone
        this._synthesizeOpenSkin(t, 330, 0.3, 0.4);
        break;

      default:
        this._synthesizeBassDrum(t, 120, 50, 0.3, 0.4);
    }
  }

  _synthesizeBassDrum(time, startFreq, endFreq, duration, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, time);
    osc.frequency.exponentialRampToValueAtTime(endFreq, time + duration * 0.4);

    gain.gain.setValueAtTime(volume * this.sfxVolume * this.masterVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  _synthesizeRimshot(time, freq, duration, volume) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, time + duration);

    gain.gain.setValueAtTime(volume * this.sfxVolume * this.masterVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
    this._synthesizeNoiseTransient(time, 0.05, 0.3);
  }

  _synthesizeOpenSkin(time, baseFreq, duration, volume) {
    // Two harmonically rich oscillators
    [baseFreq, baseFreq * 1.5].forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f, time);

      gain.gain.setValueAtTime((volume / 2) * this.sfxVolume * this.masterVolume, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  }

  _synthesizeNoiseTransient(time, duration, volume) {
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(1.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume * this.sfxVolume * this.masterVolume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(time);
    noise.stop(time + duration);
  }

  // Sacred Shankh (Conch Horn) Swell
  playShankhHorn() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 2.4;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "triangle";

    // Pitch bends upwards gracefully
    osc1.frequency.setValueAtTime(215, t);
    osc1.frequency.linearRampToValueAtTime(240, t + 0.6);
    osc1.frequency.setValueAtTime(240, t + dur - 0.5);
    osc1.frequency.exponentialRampToValueAtTime(190, t + dur);

    osc2.frequency.setValueAtTime(430, t);
    osc2.frequency.linearRampToValueAtTime(480, t + 0.6);
    osc2.frequency.exponentialRampToValueAtTime(380, t + dur);

    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(600, t);
    filter.frequency.linearRampToValueAtTime(1400, t + 0.7);
    filter.frequency.exponentialRampToValueAtTime(500, t + dur);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.4 * this.sfxVolume * this.masterVolume, t + 0.5);
    gain.gain.setValueAtTime(0.4 * this.sfxVolume * this.masterVolume, t + dur - 0.6);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur);
    osc2.stop(t + dur);
  }

  // Temple Brass Bell (Ghanti)
  playTempleBell() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [1200, 1560, 2400, 3120];

    freqs.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t);

      const amp = 0.25 / (i + 1);
      gain.gain.setValueAtTime(amp * this.sfxVolume * this.masterVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2 + i * 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.5);
    });
  }

  // Golden Ghungroo Ankle Bell Jingles (Musical Footsteps)
  playGhungrooJingle() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const bellPitches = [2850, 3420, 4100, 4980];

    bellPitches.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const startT = t + idx * 0.012;
      osc.frequency.setValueAtTime(freq + (Math.random() - 0.5) * 60, startT);

      gain.gain.setValueAtTime(0.08 * this.sfxVolume * this.masterVolume, startT);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.15);
    });
  }

  // Bappa's Blessing Prasad Surge Activation
  playSurgeActivate() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const arpeggio = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5, 1568];

    arpeggio.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      const startT = t + idx * 0.05;
      osc.frequency.setValueAtTime(freq, startT);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.04, startT + 0.3);

      gain.gain.setValueAtTime(0.25 * this.sfxVolume * this.masterVolume, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.42);
    });
  }

  // Holy Obstacle Purification (Shubh Cleansing Chime)
  playObstaclePurify() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [1046.5, 1318.5, 1568, 2093];

    freqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      const startT = t + idx * 0.03;
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.18 * this.sfxVolume * this.masterVolume, startT);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.38);
    });
  }

  // Festive Crowd Cheer Swell ("Ganpati Bappa Moriya!")
  playCrowdCheer() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const dur = 1.8;

    // Resonant filtered noise swell simulating crowd cheer
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(550, t);
    bandpass.frequency.linearRampToValueAtTime(850, t + 0.6);
    bandpass.frequency.exponentialRampToValueAtTime(450, t + dur);
    bandpass.Q.setValueAtTime(2.2, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.35 * this.sfxVolume * this.masterVolume, t + 0.4);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(t);
    noise.stop(t + dur);

    // Accompanying brass bell chime
    this.playTempleBell();
  }

  // Sacred Akshata & Flower Scatter
  playAkshataScatter() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      const startT = t + i * 0.035;
      osc.frequency.setValueAtTime(1800 + Math.random() * 800, startT);

      gain.gain.setValueAtTime(0.06 * this.sfxVolume * this.masterVolume, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.09);
    }
  }

  playLevelComplete() {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.playTempleBell();
    setTimeout(() => {
      this.playShankhHorn();
    }, 200);
  }

  // ==========================================
  // PROCEDURAL INDIAN FESTIVAL MUSIC SYSTEM
  // ==========================================

  startMusic(trackName = null) {
    if (!trackName) {
      if (typeof window !== "undefined" && window.game && window.game.storage) {
        trackName = window.game.storage.getSelectedMusicTrack();
      } else {
        trackName = "bappa_aarti";
      }
    }
    this.currentTrack = trackName;
    if (!this.musicEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    this.stopMusic();
    this.startTanpuraDrone();

    if (trackName === "bappa_aarti") {
      this._startAartiEngine();
      return;
    }

    // Rhythmic melody engine: plays festive Raag Bhupali / Bilawal phrases
    // Notes: C4, D4, E4, G4, A4, C5 (Pentatonic celebration scale)
    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
    const patterns = {
      festival_theme: [
        0, 1, 2, 4, 3, 2, 1, 0,
        2, 3, 4, 5, 4, 3, 2, 1,
        0, 2, 4, 5, 4, 2, 1, 0,
        3, 4, 5, 4, 3, 2, 0, 2
      ],
      map_theme: [
        0, 2, 3, 4, 2, 1, 0, null,
        2, 4, 5, 4, 3, 2, 0, null
      ],
      dhol_groove: [
        0, null, 1, null, 2, 3, 4, null,
        5, 4, 3, 2, 1, 2, 0, null
      ],
      celebration: [
        0, 2, 4, 5, 5, 4, 5, 5,
        4, 5, 4, 3, 2, 3, 2, 0,
        2, 4, 5, 5, 4, 2, 0, 2
      ]
    };

    const trackTitles = {
      festival_theme: "🌸 Festival Raag Bhupali Theme",
      map_theme: "🗺️ Sacred Journey (Raag Bilawal)",
      dhol_groove: "🥁 Dhol-Tasha Chowk Groove",
      celebration: "✨ Ganpati Bappa Moriya (Celebration)"
    };

    if (this.onAartiLyric && trackTitles[trackName]) {
      this.onAartiLyric(trackTitles[trackName]);
    }

    const activePattern = patterns[trackName] || patterns.festival_theme;
    let step = 0;
    const tempoMs = trackName === "celebration" ? 180 : trackName === "dhol_groove" ? 220 : 260;

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;
      const noteIdx = activePattern[step % activePattern.length];
      if (noteIdx !== null && noteIdx !== undefined) {
        this._playMelodicNote(scale[noteIdx], 0.28);
      }

      // Soft festival percussion rhythm underlying
      if (step % 4 === 0) {
        this._synthesizeBassDrum(this.ctx.currentTime, 110, 55, 0.15, 0.12);
      } else if (step % 2 === 0) {
        this._synthesizeOpenSkin(this.ctx.currentTime, 280, 0.1, 0.08);
      }

      step++;
    }, tempoMs);
  }

  // =========================================================================
  // SACRED GANESH AARTI: "SUKH KARTA DUKH HARTA" PROCEDURAL ENGINE
  // =========================================================================
  _startAartiEngine() {
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25;

    // Structure: [noteFreq, durationSec, manjiraChime, dholakBass, dholakRim, lyricTitle]
    const aartiSequence = [
      // Verse 1: "Sukh-karta dukh-harta"
      [E4, 0.22, true,  true,  false, "सुखकर्ता दुःखहर्ता (Sukh Karta Dukh Harta)"],
      [E4, 0.20, false, false, false, null],
      [E4, 0.22, true,  false, true,  null],
      [E4, 0.20, false, false, false, null],
      [D4, 0.22, true,  true,  false, null],
      [E4, 0.20, false, false, false, null],
      [F4, 0.35, true,  false, true,  "वार्ता विघ्नाची (Varta Vighnachi)"],
      [null, 0.15, false, false, false, null],
      [E4, 0.22, true,  true,  false, null],
      [D4, 0.20, false, false, false, null],
      [C4, 0.22, true,  false, true,  null],
      [D4, 0.20, false, false, false, null],
      [C4, 0.45, true,  true,  false, null],
      [null, 0.18, false, false, false, null],

      // "Nurvi poorvi prem krupa jayachi"
      [E4, 0.22, true,  true,  false, "नुरवी पुरवी प्रेम (Nurvi Poorvi Prem)"],
      [E4, 0.20, false, false, false, null],
      [E4, 0.22, true,  false, true,  null],
      [E4, 0.20, false, false, false, null],
      [D4, 0.22, true,  true,  false, null],
      [E4, 0.20, false, false, false, null],
      [F4, 0.35, true,  false, true,  "कृपा जयाची (Krupa Jayachi)"],
      [null, 0.15, false, false, false, null],
      [E4, 0.22, true,  true,  false, null],
      [D4, 0.20, false, false, false, null],
      [C4, 0.22, true,  false, true,  null],
      [D4, 0.20, false, false, false, null],
      [C4, 0.45, true,  true,  false, null],
      [null, 0.18, false, false, false, null],

      // "Sarvangi sundar uti shendurachi"
      [G4, 0.22, true,  true,  false, "सर्वांगी सुंदर उटी (Sarvangi Sundar Uti)"],
      [G4, 0.20, false, false, false, null],
      [G4, 0.22, true,  false, true,  null],
      [G4, 0.20, false, false, false, null],
      [A4, 0.22, true,  true,  false, null],
      [G4, 0.20, false, false, false, null],
      [F4, 0.35, true,  false, true,  "शेंदुराची (Shendurachi)"],
      [null, 0.15, false, false, false, null],
      [E4, 0.22, true,  true,  false, null],
      [F4, 0.20, false, false, false, null],
      [G4, 0.45, true,  false, true,  null],
      [null, 0.18, false, false, false, null],

      // "Kanthi jhalke maal mukta-phalachi"
      [G4, 0.22, true,  true,  false, "कंठी झळके माळ (Kanthi Jhalke Maal)"],
      [G4, 0.20, false, false, false, null],
      [G4, 0.22, true,  false, true,  null],
      [G4, 0.20, false, false, false, null],
      [A4, 0.22, true,  true,  false, null],
      [G4, 0.20, false, false, false, null],
      [F4, 0.35, true,  false, true,  "मुक्ताफळांची (Mukta-Phalachi)"],
      [null, 0.15, false, false, false, null],
      [E4, 0.22, true,  true,  false, null],
      [D4, 0.20, false, false, false, null],
      [C4, 0.48, true,  false, true,  null],
      [null, 0.20, false, false, false, null],

      // CHORUS: "Jai dev jai dev, jai mangal murti"
      [C5, 0.32, true,  true,  false, "जय देव जय देव! (Jai Dev Jai Dev!)"],
      [C5, 0.25, false, false, false, null],
      [C5, 0.38, true,  false, true,  null],
      [null, 0.14, false, false, false, null],
      [C5, 0.22, true,  true,  false, "जय मंगल मूर्ती (Jai Mangal Murti)"],
      [B4, 0.20, false, false, false, null],
      [A4, 0.22, true,  false, true,  null],
      [G4, 0.20, false, false, false, null],
      [A4, 0.22, true,  true,  false, "हो श्री मंगल मूर्ती (Ho Shri Mangal Murti)"],
      [B4, 0.20, false, false, false, null],
      [C5, 0.22, true,  false, true,  null],
      [B4, 0.20, false, false, false, null],
      [A4, 0.22, true,  true,  false, null],
      [G4, 0.38, false, false, false, null],
      [null, 0.16, false, false, false, null],

      // "Darshan maatre man kaamna poorti"
      [E4, 0.22, true,  true,  false, "दर्शनमात्रे मनकामना पूर्ती (Darshan Maatre...)"],
      [E4, 0.20, false, false, false, null],
      [E4, 0.22, true,  false, true,  null],
      [F4, 0.20, false, false, false, null],
      [G4, 0.35, true,  true,  false, null],
      [null, 0.14, false, false, false, null],
      [F4, 0.22, true,  false, true,  null],
      [E4, 0.20, false, false, false, null],
      [D4, 0.22, true,  true,  false, null],
      [C4, 0.20, false, false, false, null],
      [D4, 0.22, true,  false, true,  null],
      [E4, 0.35, false, true,  false, null],
      [null, 0.14, false, false, false, null],
      [E4, 0.25, true,  true,  false, "जय देव जय देव! (Jai Dev Jai Dev!)"],
      [D4, 0.25, false, false, false, null],
      [C4, 0.55, true,  false, true,  null],
      [null, 0.30, false, false, false, null],

      // Verse 2: "Ratna-khachit phara"
      [G4, 0.22, true,  true,  false, "रत्नखचित फरा (Ratna-Khachit Phara)"],
      [G4, 0.20, false, false, false, null],
      [G4, 0.22, true,  false, true,  null],
      [G4, 0.20, false, false, false, null],
      [A4, 0.22, true,  true,  false, null],
      [G4, 0.20, false, false, false, null],
      [F4, 0.35, true,  false, true,  "चंदनाची उटी कुंकुमकेशरा (Chandanachi Uti)"],
      [null, 0.15, false, false, false, null],
      [E4, 0.22, true,  true,  false, null],
      [F4, 0.20, false, false, false, null],
      [G4, 0.45, true,  false, true,  null],
      [null, 0.18, false, false, false, null],
      [G4, 0.22, true,  true,  false, "हिरेजडित मुकुट (Heerejadit Mukut)"],
      [G4, 0.20, false, false, false, null],
      [G4, 0.22, true,  false, true,  null],
      [G4, 0.20, false, false, false, null],
      [A4, 0.22, true,  true,  false, null],
      [G4, 0.20, false, false, false, null],
      [F4, 0.35, true,  false, true,  "रुणझुणती नूपुरे चरणी घागरिया (Runjhunti Nupure)"],
      [null, 0.15, false, false, false, null],
      [E4, 0.22, true,  true,  false, null],
      [D4, 0.20, false, false, false, null],
      [C4, 0.48, true,  false, true,  null],
      [null, 0.20, false, false, false, null],

      // CHORUS (Second time)
      [C5, 0.32, true,  true,  false, "जय देव जय देव! (Jai Dev Jai Dev!)"],
      [C5, 0.25, false, false, false, null],
      [C5, 0.38, true,  false, true,  null],
      [null, 0.14, false, false, false, null],
      [C5, 0.22, true,  true,  false, "जय मंगल मूर्ती (Jai Mangal Murti)"],
      [B4, 0.20, false, false, false, null],
      [A4, 0.22, true,  false, true,  null],
      [G4, 0.20, false, false, false, null],
      [A4, 0.22, true,  true,  false, "हो श्री मंगल मूर्ती (Ho Shri Mangal Murti)"],
      [B4, 0.20, false, false, false, null],
      [C5, 0.22, true,  false, true,  null],
      [B4, 0.20, false, false, false, null],
      [A4, 0.22, true,  true,  false, null],
      [G4, 0.38, false, false, false, null],
      [null, 0.16, false, false, false, null],

      // "Darshan maatre man kaamna poorti"
      [E4, 0.22, true,  true,  false, "दर्शनमात्रे मनकामना पूर्ती (Darshan Maatre...)"],
      [E4, 0.20, false, false, false, null],
      [E4, 0.22, true,  false, true,  null],
      [F4, 0.20, false, false, false, null],
      [G4, 0.35, true,  true,  false, null],
      [null, 0.14, false, false, false, null],
      [F4, 0.22, true,  false, true,  null],
      [E4, 0.20, false, false, false, null],
      [D4, 0.22, true,  true,  false, null],
      [C4, 0.20, false, false, false, null],
      [D4, 0.22, true,  false, true,  null],
      [E4, 0.35, false, true,  false, null],
      [null, 0.14, false, false, false, null],
      [E4, 0.25, true,  true,  false, "जय देव जय देव! (Jai Dev Jai Dev!)"],
      [D4, 0.25, false, false, false, null],
      [C4, 0.55, true,  false, true,  null],
      [null, 0.30, false, false, false, null]
    ];

    let step = 0;
    const stepDurationMs = 215;

    // Emit initial lyric
    if (this.onAartiLyric && aartiSequence[0][5]) {
      this.onAartiLyric(aartiSequence[0][5]);
    }

    this.musicInterval = setInterval(() => {
      if (!this.musicEnabled || !this.ctx) return;

      const item = aartiSequence[step % aartiSequence.length];
      const freq = item[0];
      const dur = item[1];
      const manjira = item[2];
      const bass = item[3];
      const openSkin = item[4];
      const lyric = item[5];

      // Update lyric if text changes
      if (lyric && this.onAartiLyric) {
        this.onAartiLyric(lyric);
      }

      // Harmonium lead tone
      if (freq !== null) {
        this._playHarmoniumNote(freq, dur, 0.24);
      }

      // Manjira (brass hand cymbal clink)
      if (manjira) {
        this._playManjiraChime(this.ctx.currentTime, 0.15);
      }

      // Traditional Keherwa Dholak / Tabla rhythm
      if (bass) {
        this._synthesizeBassDrum(this.ctx.currentTime, 115, 50, 0.18, 0.14);
      } else if (openSkin) {
        this._synthesizeOpenSkin(this.ctx.currentTime, 290, 0.12, 0.09);
      }

      step++;
    }, stepDurationMs);
  }

  // Harmonium synthesis: dual brass reeds with detune and warm resonant chamber filter
  _playHarmoniumNote(freq, dur = 0.32, vol = 0.24) {
    if (!this.ctx || !this.musicEnabled) return;
    const t = this.ctx.currentTime;
    const effectiveVol = vol * this.musicVolume * this.masterVolume;
    if (effectiveVol <= 0.0001) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Dual reeds: Sawtooth (male reed) + Triangle (female reed) with acoustic beating
    osc1.type = "sawtooth";
    osc1.frequency.setValueAtTime(freq, t);

    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 1.0035, t); // ~6 cents detune for rich harmonium warmth

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1350, t);
    filter.frequency.linearRampToValueAtTime(1650, t + dur * 0.35);
    filter.frequency.exponentialRampToValueAtTime(1100, t + dur);
    filter.Q.setValueAtTime(1.8, t);

    // Bellows envelope: gentle attack, warm sustain, soft release
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(effectiveVol, t + 0.035);
    gain.gain.setValueAtTime(effectiveVol * 0.88, t + Math.max(0.04, dur - 0.04));
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur);
    osc2.stop(t + dur);
  }

  // Manjira / Taal brass hand cymbal synthesis
  _playManjiraChime(time = null, vol = 0.15) {
    if (!this.ctx || !this.musicEnabled) return;
    const t = time !== null ? time : this.ctx.currentTime;
    const effectiveVol = vol * this.musicVolume * this.masterVolume;
    if (effectiveVol <= 0.0001) return;

    // High shimmering metallic frequencies: G7 (3136Hz) & D8 (4704Hz)
    const freqs = [3136, 4704];
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(f, t);

      gain.gain.setValueAtTime(effectiveVol * 0.7, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.23);
    });
  }

  _playMelodicNote(freq, dur = 0.3) {
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Warm bansuri flute/sitar timbre
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t);

    // Subtle gentle vibrato
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(5, t);
    lfoGain.gain.setValueAtTime(4, t);
    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + dur);

    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.18 * this.musicVolume * this.masterVolume, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + dur);
  }

  startTanpuraDrone() {
    this.stopTanpuraDrone();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.001, t);
    this.droneGain.gain.linearRampToValueAtTime(0.07 * this.musicVolume * this.masterVolume, t + 1.5);
    this.droneGain.connect(this.ctx.destination);

    // Sa (C3: 130.81 Hz), Pa (G3: 196.00 Hz), Sa' (C4: 261.63 Hz) - Perfectly tuned to C Aarti key
    const droneFreqs = [130.81, 196.00, 261.63];
    droneFreqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(f, t);
      osc.connect(this.droneGain);
      osc.start(t);
      this.droneOscillators.push(osc);
    });
  }

  stopTanpuraDrone() {
    if (this.droneGain && this.ctx) {
      try {
        this.droneGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch (e) {}
    }
    setTimeout(() => {
      this.droneOscillators.forEach(osc => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.droneOscillators = [];
      if (this.droneGain) {
        try { this.droneGain.disconnect(); } catch (e) {}
        this.droneGain = null;
      }
    }, 600);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.stopTanpuraDrone();
  }
}

if (typeof window !== "undefined") {
  window.SoundManager = SoundManager;
}
