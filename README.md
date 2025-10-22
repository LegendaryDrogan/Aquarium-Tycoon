# 🐟 Aquarium Tycoon

An incremental browser game where you manage aquarium tanks, grow fish, and build your aquatic empire!

![Version](https://img.shields.io/badge/version-5.3.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)

## ✨ Features

- 🎨 **Pixel Art Sprites** - Hand-crafted retro pixel art for all 12 fish species
- 🌊 **Enhanced Backgrounds** - Stable, detailed environments with animated elements
- 🎵 **Procedural Music** - Actual melodic compositions, not static noise!
- 🏆 **Prestige System** - Permanent growth bonuses for replayability
- 🤖 **Smart Automation** - Auto-buy and auto-sell with intelligent algorithms
- 🦈 **Predator System** - 12 predators that hunt and auto-sell mature fish with animated chasing
- 🎭 **Rarity System** - Rare, Epic, and Legendary fish with glowing effects
- 🖥️ **Multiple Tanks** - Run parallel tanks that simulate simultaneously
- 💾 **Auto-Save** - Never lose your progress
- 🎮 **Smooth Animations** - Professional UI with modern design

## 🎮 Play Now

### Quick Start

**Option 1: Download and Play**
1. Download this repository
2. Open `index.html` in your browser
3. Enjoy!

**Option 2: Local Development Server**
1. Clone the repository
2. Run: `python -m http.server 8000`
3. Open: http://localhost:8000

**Option 3: Docker**
```bash
docker-compose up -d
# Visit http://localhost:8080
```

## 🚀 Development

Want to customize or improve the game? It's easy!

### Setup Development Environment

```bash
# Clone the repository
git clone https://github.com/LegendaryDrogan/Aquarium-Tycoon.git
cd Aquarium-Tycoon

# Start local server (Windows)
start-server.bat

# Or use Python directly
python -m http.server 8000
```

Then open http://localhost:8000 and start editing!

### Project Structure

```
Aquarium-Tycoon/
├── index.html              # Game structure (~200 lines)
├── styles.css              # All styling and animations (~1200 lines)
├── game.js                 # Game logic and mechanics (~3400 lines)
├── assets/fish/            # PNG sprite images for all fish species
├── Dockerfile              # Docker configuration
├── docker-compose.yml      # Docker Compose setup
├── CLAUDE.md               # AI development guide and workflow instructions
└── README.md               # This file
```

### Quick Customizations

**Change theme colors** (`styles.css` lines 12-18):
```css
:root {
  --accent: #ff6ee7;  /* Pink accents! */
  --gold: #00ff88;    /* Green coins! */
}
```

**Make fish grow faster** (`game.js` line ~1434):
```javascript
f.size=clamp(f.size + sp.growth*gMult*dt*2, 0, 1); // 2x speed!
```

See **[QUICK-EDITS.md](QUICK-EDITS.md)** for more examples!

## 🎨 Screenshots

### Main Game View
Beautiful animated fish in multiple tank environments with smooth UI

### Pixel Art Fish
All 12 fish species feature:
- Retro pixel art aesthetic with high detail
- Enhanced eye highlights with white reflections
- Scale patterns and shading for depth
- Gradient fins with detailed structure
- Species-specific details (shark teeth, koi patterns, etc.)

### Backgrounds
10 unique aquarium themes:
- **Classic Blue** - Sandy bottom with layered gradients
- **Deep Sea** - Dark depths with mysterious rock formations
- **Coral Reef** - Colorful coral heads at the seabed
- **Kelp Forest** - Swaying kelp strands (animated!)
- **Lagoon** - Tropical turquoise with sandy dunes
- **Night Mode** - Moon, twinkling stars, and dark waters
- **Sunset Glow** - Warm orange and red gradients
- **Volcanic Vent** - Dark rocks with pulsing lava glow
- **Ice Cavern** - Icicles hanging from above
- **Fantasy Glow** - Bioluminescent plants that pulse

### Music System
Procedural music generation:
- Real chord progressions (I-IV-V-I, etc.)
- Musical scales (Major, Minor, Pentatonic, etc.)
- Tempo and mood matched to each background
- Gentle water ambience layer
- No more harsh static noise!

## 🛠️ Tech Stack

- **HTML5 Canvas** - For rendering fish and backgrounds
- **Vanilla JavaScript** - No frameworks, pure performance
- **CSS3** - Modern animations and effects
- **Docker** - Optional containerized deployment
- **nginx** - Lightweight web server for Docker

## 📚 Documentation

- **[DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md)** - Complete development guide
- **[QUICK-EDITS.md](QUICK-EDITS.md)** - Quick customization examples
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Common issues and solutions
- **[IMPROVEMENTS.md](IMPROVEMENTS.md)** - Technical improvements explained

## 🎯 Gameplay

1. **Start** with 100 coins and a basic tank
2. **Buy fish** that grow over time
3. **Sell mature fish** (≥80% grown) for profit
4. **Upgrade tanks** for more capacity and faster growth
5. **Unlock backgrounds** for visual variety
6. **Prestige** to permanently boost growth speed
7. **Automate** with smart buying, selling, and predators
8. **Deploy predators** to hunt and auto-sell mature fish while you're idle

### Controls

- **S** - Sell all mature fish
- **1/2/3/4** - Switch shop tabs
- **Ctrl+S** - Manual save
- **Click fish** - Sell individual fish

## 🐛 Known Issues

None! But if you find any, please [open an issue](https://github.com/LegendaryDrogan/Aquarium-Tycoon/issues).

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Ideas for Contributions

- New fish species with unique sprites
- Additional background themes
- New game mechanics (breeding, evolution, etc.)
- Sound effects and music
- Mobile touch controls
- Achievements system
- Leaderboards

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by idle/incremental games like Cookie Clicker
- Built with modern web technologies
- No external dependencies - pure vanilla JS!

## 📊 Version History

### v5.3.1 (Current) - Background Music Fix
- **Audio Bug Fix** - Fixed background music not playing when volume slider moved above 0
- **Improved Audio State Management** - Audio properly enables/disables with `audio.enabled` flag

### v5.3.0 - Predator System & Idle Automation
- **Predator Auto-Sell System** - 12 unique predators that hunt and auto-sell mature fish
- **Animated Hunting** - Predators chase prey at 300 speed with smooth hunting animations
- **5 Upgrade Levels** - Each predator has 5 levels with faster hunting intervals (11s to 2.5s)
- **Visual Feedback** - Predators swim in tank with red glow effects and level badges that stay readable
- **Smart Targeting** - Predators only hunt mature fish (≥80% grown) with robust validation
- **8 New Achievements** - Funny predator-themed achievements like "Hire a Hitman" and "Crimes Against Fishmanity"
- **Predator Stats Tracking** - Track total predator kills and earnings in statistics dashboard
- **Time-to-Mature Display** - Fish Market shows exact maturation time based on growth multiplier
- **Non-Active Tank Earnings** - Coin animations spawn from tank selector for background tank earnings
- **Bug Fixes** - Fixed coin animation duplication, predator targeting validation, shop scrolling, and mature fish validation

### v5.2.1 - Audio System Overhaul
- **Separate Audio Controls** - Independent volume sliders for background music and sound effects
- **Smart Audio Initialization** - SFX enabled by default at 75%, music off by default
- **Splash Sound Effect** - New water splash sound when fish drop into the tank
- **Coin Particle Overlay** - Coins now fly over UI elements from tank to counter
- **UI Text Improvements** - Better labeling for tank selector and upgrade buttons
- **Bug Fixes** - Fixed shop refresh after selling fish, audio timing errors

### v5.2.0 - Visual Polish & UX
- **Animated Coin Drops** - Currency particles (coins/bags/diamonds) based on sale value
- **Accordion Shop Redesign** - Beautiful collapsible sections with shimmer header
- **Tank Cap System** - Maximum of 10 parallel tanks with clear UI feedback
- **Smart Value Breakdown** - Coins intelligently split into appropriate currency types

### v5.1.0 - Statistics & Achievements
- **Statistics Dashboard** - Lifetime tracking for coins, fish, sales, and playtime
- **Achievement System** - 46 funny achievements with toast notifications (including predator achievements!)
- **Synthesized Sound Effects** - 8 different Web Audio API sounds for all game events
- **Enhanced Progression** - Track your aquarium empire's growth over time

### v5.0.0 - Visual Overhaul
- **Realistic Fish Sprites** - Completely redesigned sprites with lifelike details
- **Enhanced Backgrounds** - Beautiful, detailed aquarium environments with improved graphics
- **Modern UI Design** - Polished interface with refined aesthetics and smooth animations
- All 12 fish species now feature highly detailed pixel art matching real-life counterparts
- Improved visual effects including enhanced lighting, shadows, and gradients

### v4.0.0 - Clean Release
- **Project Cleanup** - Removed legacy files and duplicates
- Streamlined codebase for production
- Clean folder structure with only essential files
- All .md documentation preserved

### v3.4.0
- **Enhanced Backgrounds** - Stable, non-glitchy visuals with seeded randomization
- Layered gradients, animated elements (kelp, lava, stars)
- Unique details per background theme

### v3.3.0
- **Procedural Music System** - Real melodic ambient music
- Replaced harsh static with actual musical compositions
- Each background has unique scale, tempo, and chord progressions

### v3.2.0
- **Enhanced Sprites** - Higher resolution pixel art with more detail
- Larger sprites (64x32 to 128x36) with shading and highlights
- Scale patterns, eye highlights, and fin details

### v3.1.0
- **PNG Sprite System** - Replaced canvas-drawn sprites with pixel art
- Improved performance with pre-loaded sprite images
- Retro pixel art aesthetic for all 12 fish species

### v3.0.0
- Complete sprite redesign with professional rendering
- Fixed all rendering bugs
- Better proportions and realistic features

### v2.7.0
- Enhanced fish sprites with realistic details
- Modular file structure for easier development
- Improved CSS with smooth animations

## 🌟 Star This Repo!

If you enjoy this game or find it useful for learning, please give it a star! ⭐

## 📧 Contact

Questions? Found a bug? Want to collaborate?

- Open an [Issue](https://github.com/LegendaryDrogan/Aquarium-Tycoon/issues)
- Submit a [Pull Request](https://github.com/LegendaryDrogan/Aquarium-Tycoon/pulls)

---

**Happy fishing!** 🐟🎣

Made with ❤️ and JavaScript
