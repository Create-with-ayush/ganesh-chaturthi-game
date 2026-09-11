/**
 * MUSHAK – BAPPA'S FESTIVAL QUEST
 * Game Configuration & Constants
 */

const CONFIG = {
  GAME_TITLE: "MUSHAK – BAPPA'S FESTIVAL QUEST",
  TAGLINE: "Prepare the celebration. Complete the quest. Celebrate with Bappa.",
  
  CANVAS: {
    WIDTH: 1024,
    HEIGHT: 576, // 16:9 ratio
  },

  COLORS: {
    CREAM: "#FFFDF6",
    CREAM_DARK: "#F5EFE0",
    DARK_BG: "#140D0C",
    CHARCOAL: "#211615",
    FESTIVAL_RED: "#D62828",
    MAROON: "#6A040F",
    SAFFRON: "#F77F00",
    ORANGE_VIBRANT: "#E85D04",
    GOLD: "#FFB703",
    HALDI_YELLOW: "#FFD166",
    LEAF_GREEN: "#2D6A4F",
    ACCENT_GREEN: "#40916C",
    PEACOCK_BLUE: "#0077B6",
    WHITE: "#FFFFFF",
    TEXT_MUTED: "#A89F91"
  },

  RANKS: [
    { minScore: 9000, title: "FESTIVAL LEGEND", icon: "🏆", desc: "Bappa showers divine blessings upon your festive devotion!" },
    { minScore: 7500, title: "BAPPA'S CHAMPION", icon: "🥇", desc: "The pandal echoes with joy and victory thanks to Mushak's skill!" },
    { minScore: 5000, title: "FESTIVAL HERO", icon: "🥈", desc: "A heartwarming celebration prepared with great spirit!" },
    { minScore: 3000, title: "RISING STAR", icon: "🥉", desc: "Good effort! The festival lights shine brightly on your quest." },
    { minScore: 0,    title: "KEEP PLAYING!", icon: "⭐", desc: "Mushak is ready for another round of festive fun!" }
  ],

  LEVELS: {
    1: {
      id: "modak_rush",
      name: "Modak Street",
      title: "Level 1 – Modak Rush",
      subtitle: "Collect sweets and flowers while avoiding festival obstacles!",
      duration: 60, // seconds
      maxScore: 3000,
      starThresholds: [1000, 1800, 2500],
      bappaMessage: "Every small effort brings the celebration closer. Run with joy, little Mushak!",
      completionMessage: "Sweet success! Bappa is delighted by your festive harvest!"
    },
    2: {
      id: "pandal_decorator",
      name: "Grand Pandal",
      title: "Level 2 – Pandal Decorator",
      subtitle: "Place sacred decorations into the grand pandal before time runs out!",
      duration: 60,
      maxScore: 2500,
      starThresholds: [1000, 1600, 2200],
      bappaMessage: "Beauty and harmony in the pandal reflect purity in our hearts.",
      completionMessage: "Splendid! The grand pandal shines with divine elegance!"
    },
    3: {
      id: "rangoli_memory",
      name: "Rangoli Courtyard",
      title: "Level 3 – Rangoli Memory",
      subtitle: "Memorize sacred rangoli patterns and recreate them with colorful powders!",
      rounds: 3,
      previewTime: 3.5, // seconds
      maxScore: 2500,
      starThresholds: [1200, 1800, 2300],
      bappaMessage: "Focus and devotion turn simple colors into divine sacred art.",
      completionMessage: "Wonderful artistry! The rangoli welcomes all devotees with grace!"
    },
    4: {
      id: "dhol_rhythm",
      name: "Dhol Chowk",
      title: "Level 4 – Dhol Rhythm",
      subtitle: "Match the festival rhythm beats of Dha, Dhi, Ta, Na!",
      duration: 45,
      maxScore: 3000,
      starThresholds: [1200, 2000, 2600],
      bappaMessage: "Let the joy of the dhol resonate through every heart in the chowk!",
      completionMessage: "Electrifying rhythm! The chowk roars: Ganpati Bappa Moriya!"
    },
    5: {
      id: "eco_bonus",
      name: "Eco Celebration Zone",
      title: "Bonus – Eco-Friendly Festival",
      subtitle: "Choose sustainable, mother-earth friendly options for Bappa's celebration!",
      maxScore: 1000,
      bappaMessage: "Respecting nature is the truest worship of the Divine.",
      completionMessage: "Inspiring devotion! An eco-friendly festival protects all creations!"
    }
  },

  STORY_DIALOGUES: [
    {
      speaker: "Narrator",
      text: "Ganpati Bappa is arriving! The festival preparations have begun, but the celebration is not yet complete."
    },
    {
      speaker: "Lord Ganesha",
      text: "Mushak, dear friend! The devotees are on their way. Will you help prepare our grand festival?"
    },
    {
      speaker: "Mushak",
      text: "With all my heart, Bappa! I will gather the freshest modaks, adorn the pandal, craft the rangoli, and lead the dhol!"
    },
    {
      speaker: "Lord Ganesha",
      text: "Go forth with joy and devotion. Remember to protect Mother Earth as we celebrate together!"
    }
  ],

  DEFAULT_LEADERBOARD: [
    { name: "AARAV", score: 10850, stars: 15, combo: 24, rank: "FESTIVAL LEGEND", date: "2026-09-08" },
    { name: "RAHUL", score: 10120, stars: 14, combo: 21, rank: "FESTIVAL LEGEND", date: "2026-09-09" },
    { name: "AYUSH", score: 9870,  stars: 13, combo: 19, rank: "FESTIVAL LEGEND", date: "2026-09-10" },
    { name: "PRIYA", score: 8650,  stars: 12, combo: 16, rank: "BAPPA'S CHAMPION", date: "2026-09-10" },
    { name: "TANVI", score: 7820,  stars: 11, combo: 14, rank: "BAPPA'S CHAMPION", date: "2026-09-11" },
    { name: "ROHAN", score: 6540,  stars: 9,  combo: 11, rank: "FESTIVAL HERO", date: "2026-09-11" }
  ],

  WARDROBE: [
    {
      id: "default",
      name: "Festival Sash",
      icon: "🧣",
      starsRequired: 0,
      desc: "Traditional saffron dhoti, sash & vermilion tilak."
    },
    {
      id: "pagdi",
      name: "Puneri Pagdi",
      icon: "👑",
      starsRequired: 3,
      desc: "Royal Maharashtrian saffron turban with golden crest."
    },
    {
      id: "dholak",
      name: "Mini Dholak",
      icon: "🥁",
      starsRequired: 6,
      desc: "Festive drum strapped across Mushak's shoulder."
    },
    {
      id: "ghungroo",
      name: "Golden Ghungroos",
      icon: "🔔",
      starsRequired: 9,
      desc: "Jingling ankle bells that sound musical footsteps as you run!"
    },
    {
      id: "royal_pitambara",
      name: "Royal Pitambara",
      icon: "✨",
      starsRequired: 12,
      desc: "Golden zari silk, jeweled mukut & pearl kantha necklace."
    }
  ],

  AARTI: {
    title: "Shri Ganesh Aarti & Shankh",
    subtitle: "Circle the sacred flame clockwise, ring the temple bells, and sound the holy Shankh!",
    devotionTarget: 100
  },

  GREETING_WISHES: [
    "May Lord Ganesha remove all obstacles and shower wisdom, prosperity, and joy upon you and your family!",
    "Vakratunda Mahakaya Suryakoti Samaprabha | Nirvighnam Kuru Me Deva Sarva-Karyeshu Sarvada 🙏",
    "May Bappa bless your home with sweet happiness as delightful as fresh golden modaks!",
    "Ganpati Bappa Moriya! May this auspicious Ganesh Chaturthi bring victory, good health, and peace!"
  ],

  MUSIC_TRACKS: [
    { id: "bappa_aarti", name: "🪔 Sukh Karta Dukh Harta (Bappa's Aarti)", default: true },
    { id: "festival_theme", name: "🌸 Festival Raag Bhupali Theme", default: false },
    { id: "dhol_groove", name: "🥁 Dhol-Tasha Chowk Groove", default: false }
  ]
};

if (typeof window !== "undefined") {
  window.CONFIG = CONFIG;
}
