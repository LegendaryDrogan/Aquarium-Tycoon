# Developer Guide - Aquarium Tycoon v2.7.0

## 🚀 Quick Start

### 1. Start the Development Server

**Double-click:** `start-server.bat`

Or run manually:
```bash
cd C:\Users\chase\Desktop\WebGame
python -m http.server 8000
```

### 2. Open in Browser

Navigate to: **http://localhost:8000**

### 3. Edit and Refresh!

- Edit any file (HTML, CSS, JS)
- Save your changes
- Refresh browser (F5 or Ctrl+R)
- See changes instantly!

---

## 📁 File Structure & What to Edit

```
WebGame/
├── index.html          ← Edit layout/structure
├── styles.css          ← Edit colors/design/animations
├── game.js             ← Edit game logic/mechanics
├── start-server.bat    ← Double-click to start server
└── ...other files
```

### Quick Reference: Where to Make Changes

| What You Want to Change | File to Edit | Line Numbers (approx) |
|------------------------|--------------|----------------------|
| **Colors/Theme** | `styles.css` | Lines 1-20 (CSS variables) |
| **Button styles** | `styles.css` | Lines 95-175 |
| **Animations** | `styles.css` | Search for `@keyframes` |
| **Fish sprites** | `game.js` | Lines 920-1230 (sprite functions) |
| **Fish species data** | `game.js` | Lines 12-30 (species array) |
| **Game balance** | `game.js` | Lines 8-40 (constants) |
| **Backgrounds** | `game.js` | Lines 12-25 (backgrounds array) |
| **Tank types** | `game.js` | Lines 32-36 (tankTypes array) |
| **HTML layout** | `index.html` | Entire file (90 lines) |

---

## 🎨 Common Customizations

### Change Colors

Edit `styles.css` at the top:

```css
:root {
  --bg: #0b1220;        /* Background color */
  --accent: #6ee7ff;    /* Accent color (cyan) */
  --gold: #ffd369;      /* Gold/coins color */
  --text: #e8eefb;      /* Text color */
  --muted: #9bb0d0;     /* Muted text color */
}
```

**Try this:** Change `--accent` to `#ff6ee7` for pink accents!

### Add a New Fish Species

Edit `game.js` around line 14-30:

```javascript
const species = [
  // ... existing fish ...
  { id:'newfish', name:'New Fish', cost: 10000, sellBase: 8000, growth: 0.010 }
];
```

Then add sprite rendering function around line 1230:

```javascript
function drawNewFish(f, style, rarity){
  const size=12+f.size*46, L=size*2.5, H=size*1.2;
  // ... your sprite code here ...
  return {L,H};
}
```

And add to the drawer map around line 1214:

```javascript
const drawerMap = {
  // ... existing fish ...
  newfish: drawNewFish
};
```

### Change Game Speed

Edit `game.js` line ~234:

```javascript
f.age+=dt; f.size=clamp(f.size + sp.growth*gMult*dt, 0, 1);
```

Multiply by 2 for 2x speed:
```javascript
f.age+=dt; f.size=clamp(f.size + sp.growth*gMult*dt*2, 0, 1);
```

### Add More Backgrounds

Edit `game.js` lines 12-25:

```javascript
const backgrounds = [
  // ... existing backgrounds ...
  { id:'custom', name:'My Background', cost: 1000, desc:'My custom background!' }
];
```

Then add rendering in `drawBackgroundBase()` function around line 1251:

```javascript
case 'custom': {
  const g=ctx.createLinearGradient(0,0,0,viewH);
  g.addColorStop(0,'#ff00ff'); // Purple
  g.addColorStop(1,'#00ffff'); // Cyan
  ctx.fillStyle=g; ctx.fillRect(0,0,viewW,viewH);
  break;
}
```

---

## 💻 Development Workflow

### Best Practices

1. **Keep server running** - Don't close the terminal
2. **Edit in your favorite editor** - Notepad++, VS Code, Sublime, etc.
3. **Save file** - Ctrl+S
4. **Refresh browser** - F5
5. **Check console** - F12 for errors

### Debugging

**Open Browser Console:**
- Press `F12`
- Click "Console" tab
- Look for red errors

**Common errors:**
- Syntax errors (missing `,` or `)`)
- Undefined variables
- Typos in function names

### Testing Changes

**Quick test cycle:**
1. Edit `styles.css` to change a color
2. Save file
3. Refresh browser
4. See color change immediately!

**Example:**
```css
/* Change button hover color */
button:hover {
  background: linear-gradient(180deg, #ff1744, #c41c00); /* Red! */
}
```

---

## 🔧 Advanced Tips

### Use Browser Dev Tools

**Inspect Element** (Right-click → Inspect):
- See CSS applied to elements
- Edit CSS live in browser
- Copy changes back to `styles.css`

**Console Commands:**
```javascript
// Get current state
state

// Give yourself coins
state.coins = 999999999

// Add a fish instantly
buyFish('shark')

// Check fish count
state.tanks[0].fish.length
```

### File Organization Tips

**styles.css sections:**
- Line 1-20: CSS Variables (colors)
- Line 22-100: Base styles
- Line 102-200: Buttons & forms
- Line 202-350: Layout (shop, tank, etc.)
- Line 352+: Modals & special features

**game.js sections:**
- Line 1-40: Constants & data
- Line 42-250: Core game logic
- Line 252-800: UI rendering
- Line 802-900: Sprite helpers
- Line 902-1230: Fish sprite renderers
- Line 1232-1400: Background rendering
- Line 1402+: Game loop & initialization

### Performance Tips

**If game runs slow:**

1. **Lower FPS cap** in settings
2. **Reduce visual intensity** slider
3. **Reduce fish count**
4. **Comment out particle effects** in game.js:

```javascript
// Bubbles - around line 1343
// Comment these lines to disable bubbles:
// for(let i=0;i<12;i++){
//   ...bubble code...
// }
```

---

## 🎯 Common Tasks

### Adding a New UI Button

**1. Add HTML** (`index.html`):
```html
<button id="myNewButton" class="btn-accent">My Button</button>
```

**2. Add JavaScript** (`game.js`):
```javascript
document.getElementById('myNewButton').onclick = () => {
  alert('Button clicked!');
  // Your code here
};
```

### Adding a New Stat Display

**1. Add HTML** (`index.html`):
```html
<div class="stat">⭐ My Stat: <span id="myStat" class="val">0</span></div>
```

**2. Update in JS** (`game.js`):
```javascript
function refreshStats(){
  // ... existing code ...
  document.getElementById('myStat').textContent = 123; // Your value
}
```

### Adding Animation

**In styles.css:**

```css
/* Define animation */
@keyframes myAnimation {
  from { transform: scale(1); }
  to { transform: scale(1.1); }
}

/* Apply to element */
.my-element {
  animation: myAnimation 0.5s ease-in-out;
}
```

---

## 📝 Git Version Control (Optional)

If you want to track changes:

```bash
cd C:\Users\chase\Desktop\WebGame
git init
git add .
git commit -m "Initial commit - v2.7.0"

# After making changes:
git add .
git commit -m "Description of changes"
```

---

## 🚀 Deploying Your Changes

### To Docker

After editing modular files:

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

### To a Web Server

Just upload these 3 files:
- `index.html`
- `styles.css`
- `game.js`

### Creating New All-In-One File

If you want to share a single file:

```bash
# Edit the files
# Then combine them manually or use the original as template
```

---

## 🎓 Learning Resources

### HTML
- Structure and layout
- Adding new elements
- Forms and inputs

### CSS
- Colors and styling
- Animations and transitions
- Flexbox and Grid

### JavaScript
- Game logic
- Canvas drawing
- Event handling

### Canvas API
- Drawing shapes
- Gradients and shadows
- Transformations

---

## ⚡ Quick Reference

### Server Commands

```bash
# Start server
python -m http.server 8000

# Or double-click
start-server.bat

# Stop server
Ctrl+C (in terminal)
```

### Browser Shortcuts

- `F5` - Refresh page
- `Ctrl+F5` - Hard refresh (clear cache)
- `F12` - Developer tools
- `Ctrl+Shift+I` - Inspector
- `Ctrl+Shift+C` - Element selector

### File Paths

```
Styles: http://localhost:8000/styles.css
Game:   http://localhost:8000/game.js
Main:   http://localhost:8000/index.html (or just /)
```

---

## 🐛 Troubleshooting

### Server won't start

**Error:** "Python is not recognized"
- Install Python from python.org
- Make sure to check "Add to PATH" during install

**Error:** "Port 8000 already in use"
```bash
# Use different port
python -m http.server 8001
# Then open http://localhost:8001
```

### Changes not showing

1. **Hard refresh:** `Ctrl+F5`
2. **Clear browser cache**
3. **Check if you saved the file**
4. **Check console for errors** (F12)

### Game not working

1. **Check console** (F12) for errors
2. **Verify all 3 files are in same folder**
3. **Check you're using http://localhost:8000** (not file://)

---

## 🎉 You're Ready!

1. ✅ Double-click `start-server.bat`
2. ✅ Open http://localhost:8000
3. ✅ Edit files
4. ✅ Save & refresh
5. ✅ Build amazing things!

**Happy coding!** 🐟✨
