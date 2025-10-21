# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Aquarium Tycoon** (v3.4.0), an incremental browser game built with vanilla JavaScript and HTML5 Canvas. The project uses a modular file structure for easier development and maintenance.

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

## Development Notes

**Modifying the Game**
- All code is in one file - search for specific game constants or functions by name
- Visual constants in `:root` CSS variables (line ~8)
- Game balance constants at top of `<script>` section (lines ~177-228)
- No build process required - just open HTML file in browser

**Testing Changes**
- Open the HTML file directly in a browser
- Use browser DevTools console to inspect/modify `state` object
- localStorage key: `'aquariumSave_v2'`
- Clear save: `localStorage.removeItem('aquariumSave_v2'); location.reload()`

**Common Modifications**
- Adjust species costs/growth: Edit `species[]` array (lines ~201-214)
- Add new backgrounds: Add to `backgrounds[]` array and implement rendering in canvas draw functions
- Change prestige scaling: Modify `PRESTIGE_BASE` (line ~184) and `prestigeSpeed()` (line ~459)
- Tweak item effects: Edit `itemsCatalog[]` (lines ~223-228)
