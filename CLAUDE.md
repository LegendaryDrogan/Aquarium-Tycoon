# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Aquarium Tycoon** (v2.7.0 Enhanced), a single-file incremental browser game built with vanilla JavaScript and HTML5 Canvas. The entire game logic, rendering, and styling are contained in `Aquarium Tycoon — v261.html`.

## Architecture

### Single-File Structure
The HTML file contains three main sections in order:
1. **CSS Styles** (lines ~7-97): Complete styling using CSS custom properties for theming
2. **HTML Structure** (lines ~99-173): Grid-based layout with topbar, shop panel, tank canvas, and modals
3. **JavaScript Game Logic** (lines ~175+): All game mechanics, rendering, and state management

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

**Canvas Rendering (Enhanced in v2.7.0)**
- Uses 2D context with highly detailed sprite rendering for all 12 fish species
- `speciesStyle` object (lines ~231-244) defines color palettes per species
- Enhanced sprite features:
  - Realistic eyes with iris gradients, pupils, and reflections (`eye()` function)
  - Detailed scale patterns with highlights (`scales()` function)
  - Gradient-filled fins with translucency and fin rays
  - Body shadows for depth and 3D effect
  - Species-specific details (shark teeth, koi patterns, goldfish shimmer, etc.)
- Parallax plant layers (front/back) respond to mouse position
- Background rendering system with 10 unlockable themes
- Maturity progress bars rendered above fish

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
