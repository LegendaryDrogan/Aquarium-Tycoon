# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Aquarium Tycoon** (v5.0.0), an incremental browser game built with vanilla JavaScript and HTML5 Canvas. This version features a complete visual overhaul with highly detailed, realistic fish sprites, enhanced backgrounds with immersive graphics, and a modern, polished UI design. The project uses a clean, modular file structure optimized for production.

## Architecture

### Modular Structure
The project is split into separate files:
1. **index.html** (~90 lines): HTML structure with topbar, shop panel, tank canvas, and modals
2. **styles.css** (~500 lines): Complete styling using CSS custom properties for theming
3. **game.js** (~1900 lines): All game mechanics, rendering, and state management
4. **assets/fish/**: PNG sprite images for all 12 fish species

### Core Game Systems

**State Management**
- Global `state` object (line ~256) contains:
  - `tanks[]`: Array of tank instances that simulate in parallel
  - `activeTankUid`: Currently viewed tank
  - `coins`, `prestige`: Global currency and progression
  - `unlockedBackgrounds`: Global background purchases
  - `settings`: Audio, FPS cap, visual intensity
- Save/load uses localStorage key `'aquariumSave_v2'` with migration from v1 format

**Tank System (lines ~542-570)**
Each tank is an independent instance with:
- `uid`: Unique identifier
- `typeId`: Tank type (starter/reef/lagoon/ocean) determining base capacity and growth bonus
- `fish[]`: Array of fish entities with growth simulation
- `items`: Per-tank upgrade levels (feeder, filter, heater, coral)
- `automation`: Auto-sell/auto-buy settings with smart mode or target species
- `backgroundId`: Visual theme for this tank
- `lastTick`: Used for offline progression calculation

**Fish & Species (lines ~201-214)**
- 12 species from Guppy to Angler Fish with exponential cost scaling
- Each fish has: `sp` (species), `rarity` (COMMON/RARE/EPIC/LEGENDARY), `size`, `age`, position, velocity
- Growth rate per species defined in `species[]` array
- Fish grow continuously based on tank multipliers and prestige bonuses

**Prestige System (lines ~427-460)**
- Resets tanks/items/coins but permanently doubles growth speed per prestige level
- Cost formula: `PRESTIGE_BASE * pow(3, prestige)`
- Multiplier: `pow(2, prestige)`

**Canvas Rendering (v3.4.0)**
- Uses PNG sprite system for all 12 fish species (loaded from `assets/fish/`)
- Pixel art aesthetic with enhanced detail (64x32 to 128x36 resolution)
- Sprite features:
  - Hand-crafted pixel art with shading and highlights
  - Scale patterns and eye reflections
  - Gradient fins with structure details
  - Species-specific details (shark teeth, koi patterns, etc.)
- Enhanced backgrounds with stable decorations:
  - Seeded randomization prevents glitchy rendering
  - Layered gradients for depth
  - Animated elements (kelp sway, star twinkle, lava pulse)
  - 10 unique themes with distinct visuals
- Parallax plant layers (front/back) respond to mouse position
- Maturity progress bars rendered above fish with rarity-colored rims

**Audio System (v3.3.0)**
- Procedural music generation using Web Audio API
- Musical scales (Major, Minor, Pentatonic, etc.)
- Real chord progressions (I-IV-V-I patterns)
- Tempo and mood matched to each background
- ADSR envelope for natural note attack/decay
- Layered synthesis: pads, melodies, water ambience
- No more harsh static noise!

**Automation (lines ~710-755)**
- Per-tank auto-sell: Sells fish at ≥80% maturity
- Per-tank auto-buy: Two modes:
  - **Smart mode**: Buys most expensive affordable fish first
  - **Target mode**: Only buys specified species
- Reserve system prevents automation from spending below threshold

## Key Mechanics

**Growth Multiplier Calculation** (line ~469)
```
(1 + feeder_bonus + heater_bonus) × tank_type_bonus × prestige_speed
```

**Sell Value Formula** (line ~479)
- Base: `species.sellBase × size_factor × sell_multiplier × rarity_mult × 1.20`
- Size factor: `size01 < 0.4 ? size01 × 0.7 : size01`

**Item Upgrade Cost** (line ~484)
```
base_cost × pow(1.6, current_level)
```

## Hotkeys
- `S`: Sell mature fish (≥80% growth)
- `1/2/3/4`: Switch shop tabs (Fish/Tanks/Items/Backgrounds)
- `Ctrl+S` / `Cmd+S`: Manual save

## Development Workflow

### Quick Start for Development Sessions

1. **Start Local Server**
   ```bash
   cd "C:\Users\chase\Desktop\WebGame"
   python -m http.server 8000
   ```
   Then open http://localhost:8000 in your browser

2. **Testing Changes**
   - Make changes to files (game.js, styles.css, index.html)
   - Refresh browser to see changes
   - Use browser DevTools console to inspect/modify `state` object
   - localStorage key: `'aquariumSave_v2'`
   - Clear save: `localStorage.removeItem('aquariumSave_v2'); location.reload()`

3. **Git Workflow**
   ```bash
   git status                    # Check what changed
   git add -A                    # Stage all changes
   git commit -m "message"       # Commit with descriptive message
   git push origin main          # Push to GitHub
   ```

### Vibe Coding Sessions with Claude

When starting a new coding session with Claude Code, follow this workflow:

1. **Read this file** to get context on the project structure and current state
2. **Check git status** to see any uncommitted changes
3. **Discuss goals** - What feature/improvement are we working on?
4. **Use TodoWrite tool** to create a task list for tracking progress
5. **Iterate** - Make changes, test, refine
6. **Commit often** - Create meaningful commits with descriptive messages
7. **Update documentation** - Keep README.md, CLAUDE.md, and version numbers current

### Common Development Tasks

**Adding New Fish Species**
1. Add entry to `species[]` array in game.js (~line 34)
2. Create sprite using `generate_enhanced_sprites.py` or manually
3. Save sprite as `assets/fish/{species_id}.png`
4. Add to sprite preloading in `preloadSprites()` (~line 67)

**Creating New Backgrounds**
1. Add to `backgrounds[]` array (~line 20)
2. Implement rendering in `drawBackgroundBase()` switch statement (~line 1432)
3. Use `getStableDecor()` for consistent, non-glitchy decorations
4. Add corresponding music scale/tempo in `setBackgroundSound()` if desired

**Adding UI Features**
1. Modify HTML structure in `index.html`
2. Add styling in `styles.css` using CSS variables for theming
3. Implement logic in `game.js`
4. Wire up event listeners in the interaction section

**Generating Enhanced Sprites**
```bash
python generate_enhanced_sprites.py
```
This creates realistic pixel art sprites in `assets/fish/` for all 12 species

### Project Philosophy

**Visual Quality**
- Aim for realistic, detailed sprites that match real-life counterparts
- Use pixel art aesthetic with proper shading, highlights, and anatomical accuracy
- Backgrounds should be immersive with depth and atmospheric effects
- UI should be modern, polished, and professional

**Code Organization**
- Keep files modular and clean
- Use descriptive variable/function names
- Comment complex logic
- Maintain consistent code style

**Version Management**
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Update version in: game.js (GAME_VERSION), index.html (title), README.md (badge)
- Document changes in README.md version history
- Create descriptive commit messages with emojis for visual clarity

### File Organization

```
WebGame/
├── index.html              # HTML structure
├── styles.css              # All styling
├── game.js                 # Game logic & rendering
├── assets/fish/            # Fish sprite PNGs
├── generate_enhanced_sprites.py  # Sprite generation tool
├── README.md               # User-facing documentation
├── CLAUDE.md               # This file - AI development guide
└── .claude/                # Claude Code settings
```

### Key Code Locations

- **Game Constants**: game.js ~lines 12-62
- **Species Data**: game.js ~lines 34-47
- **Background Rendering**: game.js ~lines 1427-1939
- **Equipment Visualization**: game.js ~lines 2014-2233
- **Fish Rendering**: Uses PNG sprites from assets/fish/
- **CSS Variables**: styles.css ~lines 6-37
- **UI Layout**: styles.css ~lines 62-74

### Testing Checklist

Before committing major changes:
- [ ] Test all 12 fish species render correctly
- [ ] Verify all 10 backgrounds display properly
- [ ] Check equipment visualizations appear when items are purchased
- [ ] Test automation features (auto-buy, auto-sell)
- [ ] Verify prestige system works
- [ ] Test on different screen sizes (responsive design)
- [ ] Check browser console for errors
- [ ] Test save/load functionality
