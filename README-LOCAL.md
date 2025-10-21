# Aquarium Tycoon

An incremental browser game where you manage aquarium tanks, grow fish, and build your aquatic empire!

## 🚀 Quick Start for Development

**The fastest way to start developing:**

1. **Double-click:** `start-server.bat`
2. **Open browser:** http://localhost:8000
3. **Edit files** → **Save** → **Refresh browser** (F5)

See **[DEVELOPER-GUIDE.md](DEVELOPER-GUIDE.md)** for complete development documentation!

## Features

- 12 unique fish species from Guppy to Angler Fish
- Multiple parallel tanks that run simultaneously
- Prestige system for permanent growth bonuses
- Auto-buy and auto-sell automation
- 10 unlockable background themes
- Offline progression
- Local save system

## Running with Docker

### Quick Start (Recommended)

1. **Using Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Open your browser:**
   Navigate to `http://localhost:8080`

3. **To stop the server:**
   ```bash
   docker-compose down
   ```

### Manual Docker Commands

1. **Build the image:**
   ```bash
   docker build -t aquarium-tycoon .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 8080:80 --name aquarium-tycoon aquarium-tycoon
   ```

3. **Stop and remove:**
   ```bash
   docker stop aquarium-tycoon
   docker rm aquarium-tycoon
   ```

### Customizing the Port

Edit `docker-compose.yml` and change the port mapping:
```yaml
ports:
  - "3000:80"  # Change 3000 to your desired port
```

## Running Without Docker

### 🎮 For Playing (Easiest - Just Double-Click!)

**Enhanced All-In-One Version (RECOMMENDED):**
```bash
Open: "Aquarium Tycoon v2.7.0 Enhanced.html"
```
- ✅ All new graphics and improvements
- ✅ Works by double-clicking
- ✅ No server needed!

**Legacy Single-File Version:**
```bash
Open: "Aquarium Tycoon — v261.html"
```

### 💻 For Development (Requires Web Server)

The modular version (index.html + styles.css + game.js) requires a web server:

**Option 1 - Python:**
```bash
# Double-click start-server.bat, then open http://localhost:8000
# OR run manually:
python -m http.server 8000
```

**Option 2 - Docker (see above)**

**Why?** Browsers block external files when opened directly (file:// protocol security).

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed solutions.

## Game Controls

- **S**: Sell all mature fish (≥80% growth)
- **1/2/3/4**: Switch shop tabs (Fish/Tanks/Items/Backgrounds)
- **Ctrl+S** / **Cmd+S**: Manual save

## Development

See [CLAUDE.md](CLAUDE.md) for detailed information about the game architecture and how to modify the code.

## Technical Details

- **Container**: nginx:alpine (lightweight ~2MB base)
- **Port**: 80 (mapped to 8080 on host by default)
- **No external dependencies**: Everything runs in the browser
- **Save data**: Stored in browser's localStorage

## Version

Current version: 2.7.0 Enhanced

### What's New in v2.7.0

**🎨 Enhanced Graphics & UI:**
- Smooth animations on all buttons and UI elements
- Material Design-style ripple effects on buttons
- Enhanced shadows and depth for 3D appearance
- Backdrop blur effects (glass-morphism)
- Smooth fade-in animations for log entries
- Improved hover states with scaling and glows
- Better responsive design for mobile/tablet

**📁 Modular Structure (Major Improvement!):**
- Separated into clean files: `index.html`, `styles.css`, `game.js`
- Easier to edit and maintain
- Better browser caching and performance
- Professional industry-standard structure
- Legacy single-file version still included

**🐟 Dramatically Improved Fish Sprites:**
- Enhanced eye details with iris gradients, pupils, and multiple light reflections
- Improved scale textures with individual highlights for a shimmering effect
- Gradient-based fins with translucency and ray structures
- Better body shading with depth shadows for 3D appearance
- Species-specific enhancements (shark teeth, koi patterns, goldfish shimmer, etc.)
- Smoother animations and more realistic movement

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for detailed explanation of all enhancements!
