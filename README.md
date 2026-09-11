# 🪔 MUSHAK – BAPPA'S FESTIVAL QUEST 🐭

> *"Prepare the celebration. Complete the quest. Celebrate with Bappa."*

[![Ganesh Chaturthi Game Contest](https://img.shields.io/badge/Contest-Ganesh%20Chaturthi%20Game%20Design-orange.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Technology](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-red.svg)](https://developer.mozilla.org)
[![Audio](https://img.shields.io/badge/Audio-Web%20Audio%20API%20Synthesizer-blue.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

A complete, polished, AAA-quality 2D browser indie game built for the **Ganesh Chaturthi Game Design Contest**. Players guide **Mushak**, Lord Ganesha's loyal mouse companion, across multiple festive mini-games to harvest modaks, build the grand pandal, create sacred rangolis, drum the high-energy dhol rhythms, and champion an eco-friendly celebration for Mother Earth!

---

## 🌟 Highlights & Features

- **Respectful & Culturally Authentic Representation**: Lord Ganesha is respectfully portrayed as a benevolent mentor and divine centerpiece of the grand celebration, bestowing motivational guidance and blessings.
- **5 Complete, Engaging Levels**:
  1. **Modak Rush**: Platformer/runner collecting golden modaks, special steamed modaks, and festive marigolds with multi-tier combo streaks.
  2. **Pandal Decorator**: Timed spatial puzzle placing torans, hanging brass bells, earthen samai diyas, marigold garlands, and the sacred kalash.
  3. **Rangoli Memory**: Memorize sacred geometric mandalas (lotus, star, and royal peacock patterns) and recreate them with vibrant festival powders.
  4. **Dhol Rhythm**: 4-lane rhythm challenge matching the authentic dhol beats of **DHA**, **DHI**, **TA**, and **NA** with pulsing visual effects and combo fanfares.
  5. **Eco-Friendly Festival Bonus**: Interactive choices promoting sustainable celebration (natural clay Shadu Maati murtis, fresh marigolds, organic rice dyes, and home bucket visarjan).
- **Procedural Web Audio API Engine**: Zero external MP3 dependency! 100% offline-ready procedural synthesizer creating authentic dhol drum beats, temple bells (*ghanti*), sacred conch horn (*shankh*), tanpura ambient drone, and Raag Bhupali festive melodies.
- **Vector & Canvas Graphics**: Dynamic procedural 60 FPS vector sprites for Mushak (idle breathing, scampering run, aerial leap, and two-paw cheering celebration) and Lord Ganesha (radiant *prabhavali* halo, *abhaya mudra* blessing, sweet modak, and lotus throne).
- **Responsive Controls**: Full keyboard controls for desktop/laptop and ergonomic virtual touch buttons (D-Pad, Jump button, and Dhol drum pads) for mobile/tablet.
- **Local Persistence**: Tracks level progression, star ratings (1–3 stars), highest combos, and high scores on a local leaderboard via `localStorage`.

---

## 🎮 Gameplay Loop

```
  START SCREEN (Main Menu)
          ↓
  ANIMATED STORY INTRO (With Skip Intro)
          ↓
  INTERACTIVE FESTIVAL MAP
          ↓
  LEVEL 1 – MODAK RUSH
          ↓
  LEVEL 2 – PANDAL DECORATOR
          ↓
  LEVEL 3 – RANGOLI MEMORY
          ↓
  LEVEL 4 – DHOL RHYTHM
          ↓
  BONUS – ECO-FRIENDLY FESTIVAL
          ↓
  GRAND FINAL CELEBRATION ("Ganpati Bappa Moriya!")
          ↓
  FINAL SCORE & RANKING
          ↓
  LEADERBOARD / PLAY AGAIN
```

---

## 🕹️ Controls Guide

### Desktop & Laptop
| Action / Level | Key Bindings |
| :--- | :--- |
| **Move Left / Right** (Level 1) | `A` / `D` or `Left` / `Right` Arrow keys |
| **Jump** (Level 1) | `Space` or `W` or `Up` Arrow |
| **Place Ornaments** (Level 2) | Click & Drag or Click Item + Click Target Slot |
| **Select Powder / Color** (Level 3) | Click Powder Pot + Click Petal/Dot |
| **Dhol Rhythm Beats** (Level 4) | `A` (DHA), `S` (DHI), `D` (TA), `F` (NA) |
| **Pause Game** | `Escape` or Click `⏸` button in HUD |

### Mobile & Tablet
- **Touch Controls**: On-screen left/right directional buttons and a large responsive **JUMP** button.
- **Dhol Touch Pads**: 4 large, color-coded drum pads located comfortably at the bottom of the screen.
- **Touch Placement**: Tap item in tray, then tap destination slot.

---

## 🏆 Scoring & Ranking System

Each level awards stars based on performance:
- ⭐ **Bronze**: 1 Star
- ⭐⭐ **Silver**: 2 Stars
- ⭐⭐⭐ **Gold**: 3 Stars

Maximum possible score across all challenges: **12,000 Points**

| Total Score | Festival Rank |
| :--- | :--- |
| **9,000+** | 🏆 **FESTIVAL LEGEND** |
| **7,500 – 8,999** | 🥇 **BAPPA'S CHAMPION** |
| **5,000 – 7,499** | 🥈 **FESTIVAL HERO** |
| **3,000 – 4,999** | 🥉 **RISING STAR** |
| **Below 3,000** | ⭐ **KEEP PLAYING!** |

---

## 💻 Technology Stack

- **Markup & Layout**: HTML5 Semantic Architecture, CSS3 Glassmorphism & Custom Properties.
- **Logic & Game Engine**: Vanilla JavaScript (ES6+), Canvas 2D API, Object-Oriented State Machine.
- **Audio Synthesis**: Native HTML5 Web Audio API (Multi-oscillator additive & FM synthesis, Biquad filtering, noise envelope transients).
- **Data Persistence**: HTML5 `localStorage` with graceful in-memory fallback.

---

## 🚀 How to Run Locally

Because the game uses clean vanilla web technologies with zero build steps or heavy node modules:

1. **Option 1: Direct File Launch**
   - Double-click `index.html` in your browser.

2. **Option 2: Using Any Local Web Server**
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node npx serve
   npx serve .
   ```
   Open `http://localhost:8000` in your web browser.

---

## 🌐 Deployment

The project is completely static and ready for instant deployment on:
- **GitHub Pages**: Push repository and set Pages branch to `main` root `/`.
- **Vercel**: Run `vercel` or connect repo on vercel.com.
- **Netlify**: Drag and drop folder or connect Git repository.

---

## 👥 Credits & Contest Attribution

- **Game Title**: MUSHAK – BAPPA'S FESTIVAL QUEST
- **Contest**: Ganesh Chaturthi Game Design Contest
- **Institution / Campus**: Vivekananda Global University (VGU)
- **Team**: Festival Indie Game Creators
- **Dedication**: Dedicated with reverence to Lord Ganesha, Vighnaharta, and Mother Earth.

*Ganpati Bappa Moriya! Pudhchya Varshi Lavkar Ya!* 🌸🙏
