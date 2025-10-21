# Quick Edit Cheat Sheet

## 🎯 Most Common Edits

### Change Theme Colors (2 minutes)

**File:** `styles.css` (Lines 12-18)

```css
:root {
  --bg: #0b1220;        /* Change to #1a0033 for purple background */
  --accent: #6ee7ff;    /* Change to #ff6ee7 for pink accents */
  --gold: #ffd369;      /* Change to #69ffd3 for cyan gold */
  --text: #e8eefb;      /* Text color */
}
```

**Examples:**
- Dark Purple Theme: `--bg: #1a0033; --accent: #b366ff;`
- Ocean Theme: `--bg: #001a33; --accent: #00d4ff;`
- Sunset Theme: `--bg: #331a00; --accent: #ff8c00;`

---

### Make Fish Grow Faster (30 seconds)

**File:** `game.js` (Line ~1434)

```javascript
// Find this line:
f.size=clamp(f.size + sp.growth*gMult*dt, 0, 1);

// Change to (2x speed):
f.size=clamp(f.size + sp.growth*gMult*dt*2, 0, 1);

// Or 10x speed:
f.size=clamp(f.size + sp.growth*gMult*dt*10, 0, 1);
```

---

### Give Yourself Free Money (10 seconds)

**In Browser Console** (F12):

```javascript
state.coins = 999999999
refreshStats()
```

Or **edit game.js** (Line ~421):
```javascript
// In the load() function, add:
state.coins = 1000000; // Start with 1M coins
```

---

### Add New Fish Species (5 minutes)

**File:** `game.js` (Line ~30, after existing fish)

```javascript
{ id:'dragon',  name:'Dragon Fish', cost: 10000000, sellBase: 8000000, growth: 0.004 }
```

**Add to species style** (Line ~244):
```javascript
dragon: { top:'#ff0000', belly:'#ffaa00', fin:'#ff6600' }
```

**Add simple renderer** (Line ~1227):
```javascript
function drawDragon(f, style, rarity){
  return drawShark(f, style, rarity); // Use shark sprite for now
}
```

**Add to drawer map** (Line ~1227):
```javascript
dragon: drawDragon
```

---

### Make Starting Money Higher (10 seconds)

**File:** `game.js` (Line ~421)

```javascript
// Find:
state.coins = 100;

// Change to:
state.coins = 10000; // Start with 10k
```

---

### Change Max Tank Capacity (30 seconds)

**File:** `game.js` (Lines ~32-36)

```javascript
const tankTypes = [
  { id:'starter', name:'Starter Glass', capacity:100,  growthBonus:1.00, cost:0 }, // Was 6
  { id:'reef',    name:'Reef Nano',     capacity:200, growthBonus:1.05, cost:1500 }, // Was 12
  // ... etc
];
```

---

### Add Animated Buttons (2 minutes)

**File:** `styles.css` (add anywhere)

```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

button:hover {
  animation: bounce 0.5s ease infinite;
}
```

---

### Change Button Colors (1 minute)

**File:** `styles.css` (Lines ~140-170)

```css
.btn-gold {
  background: linear-gradient(180deg, #ff1744, #c41c00); /* Now red! */
}

.btn-accent {
  background: linear-gradient(180deg, #00ff88, #00cc66); /* Now green! */
}
```

---

### Make Fish HUGE (30 seconds)

**File:** `game.js` (Line ~923 and throughout sprite functions)

```javascript
// Find (in each sprite function):
const size=12+f.size*46

// Change to:
const size=50+f.size*200 // MASSIVE fish!
```

---

### Add Custom Background (3 minutes)

**File:** `game.js`

**1. Add to backgrounds array** (Line ~19):
```javascript
{ id:'rainbow', name:'Rainbow', cost: 50000, desc:'Colorful!' }
```

**2. Add rendering** (Line ~1285):
```javascript
case 'rainbow': {
  const g=ctx.createLinearGradient(0,0,viewW,viewH);
  g.addColorStop(0,'#ff0000');
  g.addColorStop(0.2,'#ff7700');
  g.addColorStop(0.4,'#ffff00');
  g.addColorStop(0.6,'#00ff00');
  g.addColorStop(0.8,'#0000ff');
  g.addColorStop(1,'#ff00ff');
  ctx.fillStyle=g; ctx.fillRect(0,0,viewW,viewH);
  break;
}
```

---

### Disable Auto-Save (10 seconds)

**File:** `game.js` (Search for "save()")

Comment out the auto-saves:
```javascript
// save(); // Disabled auto-save
```

---

### Add Sound Effect (5 minutes)

**1. Get a .mp3 file** (download from freesound.org)

**2. Put in WebGame folder** (e.g., `splash.mp3`)

**3. Add to game.js**:
```javascript
const splashSound = new Audio('splash.mp3');

// When buying fish:
function buyFish(spId){
  // ... existing code ...
  splashSound.play(); // Add this line
  // ... rest of code ...
}
```

---

### Cheat Mode (1 minute)

**File:** `game.js` (Add at top after constants)

```javascript
const CHEAT_MODE = true; // Set to false to disable

// Then in buyFish():
if(CHEAT_MODE || state.coins >= sp.cost){
  if(!CHEAT_MODE) state.coins -= sp.cost;
  // ... rest of code ...
}
```

---

### Slow Down Time (For Screenshots) (10 seconds)

**In Browser Console:**
```javascript
// Pause game
lastFrame = Infinity

// Resume
lastFrame = Date.now()
```

---

## 💡 Pro Tips

### Test Multiple Things
Open console (F12) and run:
```javascript
// Add tons of fish
for(let i=0; i<20; i++) buyFish('shark')

// Fill tank capacity
while(currentTank().fish.length < totalCapacity(currentTank())) {
  buyFish('guppy')
}

// Max out prestige
state.prestige = 10
refreshStats()
```

### Edit While Running
1. Keep server running
2. Keep browser open
3. Edit file
4. Save
5. Press F5 to refresh
6. See changes instantly!

### Backup Before Big Changes
```bash
# Copy the file first
cp game.js game.js.backup
```

---

## 🎨 Color Scheme Ideas

### Neon Cyberpunk
```css
--bg: #0a0a0a;
--accent: #00ffff;
--gold: #ff00ff;
--text: #00ff00;
```

### Forest Theme
```css
--bg: #0d2818;
--accent: #2ecc71;
--gold: #f1c40f;
--text: #ecf0f1;
```

### Fire Theme
```css
--bg: #1a0000;
--accent: #ff4444;
--gold: #ffaa00;
--text: #ffeeee;
```

### Ice Theme
```css
--bg: #0a1a2e;
--accent: #79c0ff;
--gold: #7ee8fa;
--text: #eef5ff;
```

---

## 📝 Remember

1. **Always save files** before refreshing
2. **Check console** (F12) for errors
3. **Use Ctrl+Z** to undo edits
4. **Make backups** before big changes
5. **Have fun!** 🎉
