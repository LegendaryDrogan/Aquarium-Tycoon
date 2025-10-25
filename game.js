/* ==========================================
   Aquarium Tycoon (v5.2.0) - Visual Polish & UX
   - ANIMATED COIN DROPS - Coins/money bags/diamonds fly to counter
   - ACCORDION SHOP - Beautiful collapsible categories with shimmer effects
   - TANK CAP - Maximum 10 parallel tanks with UI feedback
   - STATISTICS DASHBOARD - Track lifetime progress & milestones
   - ACHIEVEMENT SYSTEM - 38 funny, quippy achievements to unlock
   - SOUND EFFECTS - Synthesized audio for all major game events
   - REALISTIC FISH SPRITES - Highly detailed pixel art
   - ENHANCED BACKGROUNDS - Beautiful, immersive aquarium environments
   - PROCEDURAL MUSIC SYSTEM - Real melodic ambient music
   ========================================== */
const GAME_VERSION = '5.3.1';
const PRESTIGE_BASE = 10_000_000; // starting prestige price
const AUTOMATION_PASSWORD = 'HAX'; // Password for automation features
const MAX_TANKS = 10; // Maximum number of parallel tanks

// Debug speed multiplier
let debugSpeedMultiplier = 1;

/* ---- Coin Particle System ---- */
const coinParticles = []; // Active coin particles
const COIN_TYPES = [
  { threshold: 1000, icon: '💎', value: 1000 },  // Diamonds for 1000+
  { threshold: 100, icon: '💰', value: 100 },   // Money bags for 100-999
  { threshold: 1, icon: '🪙', value: 1 }         // Coins for 1-99
];

// Spawn coin particles at fish position
function spawnCoinParticles(x, y, totalValue) {
  let remaining = totalValue;
  let spawnDelay = 0;

  // Convert canvas coordinates to screen coordinates
  const canvasRect = canvas.getBoundingClientRect();
  const screenX = canvasRect.left + x;
  const screenY = canvasRect.top + y;

  // Break down value into currency types (largest first)
  for (const coinType of COIN_TYPES) {
    while (remaining >= coinType.threshold) {
      const angle = Math.random() * Math.PI * 2;
      const spread = 30 + Math.random() * 20;

      coinParticles.push({
        x: screenX + Math.cos(angle) * spread * 0.3, // Start slightly spread
        y: screenY + Math.sin(angle) * spread * 0.3,
        targetX: coinsEl.getBoundingClientRect().left + 50,
        targetY: coinsEl.getBoundingClientRect().top + 20,
        icon: coinType.icon,
        life: 0,
        maxLife: 1.0 + Math.random() * 0.3,
        delay: spawnDelay,
        vx: Math.cos(angle) * spread,
        vy: Math.sin(angle) * spread
      });

      remaining -= coinType.value;
      spawnDelay += 0.03; // Stagger spawns slightly

      // Limit particles for performance
      if (coinParticles.length > 100) break;
    }
    if (coinParticles.length > 100) break;
  }
}

// Update and render coin particles
function updateCoinParticles(dt) {
  for (let i = coinParticles.length - 1; i >= 0; i--) {
    const p = coinParticles[i];

    // Handle spawn delay
    if (p.delay > 0) {
      p.delay -= dt;
      continue;
    }

    p.life += dt;

    // Remove completed particles
    if (p.life >= p.maxLife) {
      coinParticles.splice(i, 1);
      continue;
    }

    // Easing: start fast, slow at end
    const t = p.life / p.maxLife;
    const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic

    // Position interpolation - pop out then float to target
    if (t < 0.2) {
      // Pop out phase
      const popT = t / 0.2;
      p.x += p.vx * dt * (1 - popT);
      p.y += p.vy * dt * (1 - popT);
    } else {
      // Float to target phase - using screen coordinates now
      p.x = p.x + (p.targetX - p.x) * dt * 4;
      p.y = p.y + (p.targetY - p.y) * dt * 4;
    }
  }
}

function drawCoinParticles() {
  // Clear the coin overlay canvas
  coinCtx.clearRect(0, 0, coinCanvas.width, coinCanvas.height);

  for (const p of coinParticles) {
    if (p.delay > 0) continue;

    const t = p.life / p.maxLife;
    const alpha = t < 0.8 ? 1.0 : (1.0 - (t - 0.8) / 0.2); // Fade at end
    const scale = t < 0.1 ? (t / 0.1) : 1.0; // Quick scale in

    coinCtx.save();
    coinCtx.globalAlpha = alpha;
    coinCtx.font = `${24 * scale}px Arial`;
    coinCtx.textAlign = 'center';
    coinCtx.textBaseline = 'middle';

    // Drop shadow for visibility
    coinCtx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    coinCtx.shadowBlur = 4;
    coinCtx.shadowOffsetX = 2;
    coinCtx.shadowOffsetY = 2;

    coinCtx.fillText(p.icon, p.x, p.y);
    coinCtx.restore();
  }
}

/* ---- Backgrounds ---- */
const backgrounds = [
  { id:'default', name:'Classic Blue',  cost: 0,       desc:'Soft blue water & sandy bed.' },
  { id:'deepsea', name:'Deep Sea',      cost: 5_000,   desc:'Dark depths with seamounts.' },
  { id:'coral',   name:'Coral Reef',    cost: 12_000,  desc:'Coral heads & shelves.' },
  { id:'kelp',    name:'Kelp Forest',   cost: 25_000,  desc:'Tall kelp fronds.' },
  { id:'lagoon',  name:'Lagoon',        cost: 50_000,  desc:'Shallow turquoise dunes.' },
  { id:'night',   name:'Night Mode',    cost: 100_000, desc:'Moonlit gloom.' },
  { id:'sunset',  name:'Sunset Glow',   cost: 250_000, desc:'Warm evening rays.' },
  { id:'volcano', name:'Volcanic Vent', cost: 600_000, desc:'Smoky vents & rocks.' },
  { id:'ice',     name:'Ice Cavern',    cost: 1_500_000,desc:'Icy stalactites.' },
  { id:'fantasy', name:'Fantasy Glow',  cost: 4_000_000,desc:'Bioluminescent flora.' }
];

/* ---- Species (ordered) ---- */
const species = [
  { id:'sardine',    name:'Sardine',         cost:   10,      sellBase:    25,   growth: 0.020 },
  { id:'sandlance',  name:'Sandlance',       cost:  200,      sellBase:   160,   growth: 0.016 },
  { id:'herring',    name:'Herring',         cost:  600,      sellBase:   480,   growth: 0.015 },
  { id:'butterfly',  name:'Butterflyfish',   cost:  900,      sellBase:   720,   growth: 0.013 },
  { id:'parrot',     name:'Parrotfish',      cost: 2200,      sellBase:  1760,   growth: 0.011 },
  { id:'croaker',    name:'Gulf Croaker',    cost: 8000,      sellBase:  6400,   growth: 0.009 },
  { id:'grunt',      name:'Striped Grunt',   cost: 15000,     sellBase: 12000,   growth: 0.008 },
  { id:'jellyfish',  name:'Jellyfish',       cost: 30000,     sellBase: 24000,   growth: 0.007 },
  { id:'squid',      name:'Reef Squid',      cost:120000,     sellBase: 96000,   growth: 0.006 },
  { id:'turtle',     name:'Sea Turtle',      cost:450000,     sellBase:360000,   growth: 0.0055 },
  { id:'dolphin',    name:'Dolphin',         cost:1500000,    sellBase:1200000,  growth: 0.005 },
  { id:'shark',      name:'Thresher Shark',  cost:6000000,    sellBase:4800000,  growth: 0.0045 }
];

/* ---- Predators (Auto-sell idle mechanic) ---- */
// Each predator matches a fish species and auto-sells mature fish periodically
// 5 levels with increasing frequency and cost
const predators = [
  { id:'mackerel',   name:'Mackerel',       prey:'sardine',    baseCost:    500,    icon:'🐟' },
  { id:'bass',       name:'Bass',           prey:'sandlance',  baseCost:   5000,    icon:'🐟' },
  { id:'tuna',       name:'Tuna',           prey:'herring',    baseCost:  15000,    icon:'🐟' },
  { id:'grouper',    name:'Grouper',        prey:'butterfly',  baseCost:  25000,    icon:'🐟' },
  { id:'barracuda',  name:'Barracuda',      prey:'parrot',     baseCost:  60000,    icon:'⚡' },
  { id:'moray',      name:'Moray Eel',      prey:'croaker',    baseCost: 200000,    icon:'🐍' },
  { id:'octopus',    name:'Octopus',        prey:'grunt',      baseCost: 400000,    icon:'🐙' },
  { id:'seal',       name:'Seal',           prey:'jellyfish',  baseCost: 800000,    icon:'🦭' },
  { id:'sealion',    name:'Sea Lion',       prey:'squid',      baseCost:3000000,    icon:'🦭' },
  { id:'orca',       name:'Orca',           prey:'turtle',     baseCost:10000000,   icon:'🐋' },
  { id:'greatwhite', name:'Great White',    prey:'dolphin',    baseCost:35000000,   icon:'🦈' },
  { id:'megalodon',  name:'Megalodon',      prey:'shark',      baseCost:120000000,  icon:'🦈' }
];

// Predator level stats: interval (seconds) and cost multiplier
const predatorLevels = [
  { level: 1, interval: 11,  costMult: 1.0  }, // Sells 1 fish every 11 seconds
  { level: 2, interval: 7.5, costMult: 3.0  }, // Every 7.5 seconds
  { level: 3, interval: 5,   costMult: 9.0  }, // Every 5 seconds
  { level: 4, interval: 3.75, costMult: 27.0 }, // Every 3.75 seconds
  { level: 5, interval: 2.5, costMult: 81.0 }  // Every 2.5 seconds (max)
];

/* ---- Tank types & items ---- */
const tankTypes = [
  { id:'starter', name:'Starter Glass', capacity:6,  growthBonus:1.00, cost:0,     bg:'#408bcb22' },
  { id:'reef',    name:'Reef Nano',     capacity:12, growthBonus:1.05, cost:1500,  bg:'#50d3ff2a' },
  { id:'lagoon',  name:'Lagoon Pro',    capacity:20, growthBonus:1.10, cost:6000,  bg:'#89f7a12a' },
  { id:'ocean',   name:'Open Ocean',    capacity:32, growthBonus:1.18, cost:24000, bg:'#b9aaff2a' },
];
const itemsCatalog = [
  { id:'feeder', name:'Auto Feeder',   baseCost:100, effect:'+12% growth', growthPerLvl:0.12, max:25 },
  { id:'filter', name:'Bio Filter',    baseCost:180, effect:'+1 tank cap', capacityPerLvl:1,  max:30 },
  { id:'heater', name:'Heater',        baseCost:260, effect:'+6% growth',  growthPerLvl:0.06, max:25 },
  { id:'coral',  name:'Decor (Coral)', baseCost:220, effect:'+5% sell',    sellPerLvl:0.05,  max:25 },
];

/* ---- PNG Sprite Loading System ---- */
const fishSprites = {};
const bgDecoSprites = {}; // Background decoration sprites
let spritesLoaded = false;
let bgDecorationsLoaded = false;

function preloadSprites() {
  const spriteNames = ['sardine', 'sandlance', 'herring', 'butterfly', 'parrot', 'croaker',
                       'grunt', 'jellyfish', 'squid', 'turtle', 'dolphin', 'shark'];
  let loadedCount = 0;

  spriteNames.forEach(name => {
    const img = new Image();
    img.onload = () => {
      loadedCount++;
      if (loadedCount === spriteNames.length) {
        spritesLoaded = true;
        console.log('✅ All fish sprites loaded successfully!');
        // Start the game loop once all sprites are loaded
        startGameLoop();
      }
    };
    img.onerror = () => {
      console.error(`❌ Failed to load sprite: ${name}.png`);
      loadedCount++;
      if (loadedCount === spriteNames.length) {
        spritesLoaded = true; // Mark as loaded even with errors to prevent infinite wait
        console.warn('⚠️ Some sprites failed to load, but starting game anyway');
        startGameLoop();
      }
    };
    img.src = `assets/fish/${name}.png`;
    fishSprites[name] = img;
  });
}

// Preload background decoration sprites
function preloadBackgroundDecorations() {
  const decoSprites = {
    // Classic Blue decorations
    'coral1': '8bit-coral.png',
    'coral2': '8bit-coral2.png',
    'clam': '8bit-clam-shell-pink.png',
    'starfish': '8bit-starfish-purple.png',
    'sanddollar': '8bit-sand-dollar.png',
    'anemone': '8bit-sea-anemone-0.png',

    // Coral Reef decorations
    'brainCoral': '8bit-coral-brain-sm.png',
    'coralTall': 'coral-blue-tall.png',
    'coralPink': 'coral-pink-thin.png',
    'coralWide': 'coral-yellow-orange-wide.png',

    // Kelp Forest decorations
    'grass': '8bit-grass.png',
    'seaweed': '8bit-seaweed.png',
    'seahorse': '8bit-seahorse-0.png',

    // Lagoon decorations
    'hyacinth': '8bit-flower-water-hyacinth-small.png',
    'mangrove': '8bit-leaf-mangrove.png',

    // Night Mode decorations
    'moon': '8bit-moon1.png',
    'jellyGlow': '8bit-jellyfish-0.png',

    // Ice decorations
    'penguin1': '8bit-penguin-rockhopper1.png',
    'penguin2': '8bit-penguin-rockhopper2.png',

    // Fantasy decorations
    'jellyLarge': 'jellyfish-large1.png',
    'jellyMedium': 'jellyfish-medium1.png',
    'jellyTiny': 'jellyfish-tiny1.png',
    'octopusGlow': '8bit-octopus-0.png',

    // Volcano decorations
    'crab': 'crab-tiny.png',

    // Deep sea decorations
    'frogfish': '8bit-frogfish-0.png'
  };

  let loadedCount = 0;
  const totalSprites = Object.keys(decoSprites).length;

  Object.entries(decoSprites).forEach(([key, filename]) => {
    const img = new Image();
    img.onload = () => {
      loadedCount++;
      if (loadedCount === totalSprites) {
        bgDecorationsLoaded = true;
        console.log('✅ All background decorations loaded successfully!');
      }
    };
    img.onerror = () => {
      console.warn(`⚠️ Failed to load background decoration: ${filename}`);
      loadedCount++;
      if (loadedCount === totalSprites) {
        bgDecorationsLoaded = true;
      }
    };
    img.src = `assets/pixelart/${filename}`;
    bgDecoSprites[key] = img;
  });
}

/* ---- Visual palette (base colors per species) ---- */
const speciesStyle = {
  sardine:    { top:'#9090c0', belly:'#d0d0e8', fin:'#b0b0d8' },
  sandlance:  { top:'#b8d8b0', belly:'#e0f0d8', fin:'#c8e8c0' },
  herring:    { top:'#8080b8', belly:'#c0c0e0', fin:'#a0a0d0' },
  butterfly:  { top:'#d8a0d0', belly:'#f0d0e8', fin:'#e8c0e0' },
  parrot:     { top:'#70c0e0', belly:'#b0e0f0', fin:'#90d0e8' },
  croaker:    { top:'#f0d070', belly:'#fff0b0', fin:'#f8e090' },
  grunt:      { top:'#f0c870', belly:'#ffe8b0', fin:'#f8d890' },
  jellyfish:  { top:'#a0d8d8', belly:'#d0f0f0', fin:'#c0e8e8' },
  squid:      { top:'#e0d070', belly:'#f8f0a0', fin:'#f0e080' },
  turtle:     { top:'#806050', belly:'#c0a090', fin:'#a08070' },
  dolphin:    { top:'#6090c0', belly:'#a0c0e0', fin:'#80b0d0' },
  shark:      { top:'#7090a8', belly:'#b0c8d8', fin:'#90b0c8' }
};

/* ---- Rarities ---- */
const RARITIES = [
  { key:'COMMON',     chance: 1.0,  mult:1.0,  glow:null },
  { key:'RARE',       chance: 0.05, mult:2.0,  glow:{color:'rgba(255,211,105,0.85)', rim:'rgba(255,211,105,0.8)'} },
  { key:'EPIC',       chance: 0.01, mult:3.5,  glow:{color:'rgba(122,44,255,0.85)',  rim:'rgba(178,123,255,0.9)'} },
  { key:'LEGENDARY',  chance: 0.002,mult:6.0,  glow:{color:'rgba(255,138,0,0.9)',    rim:'rgba(255,188,73,0.95)'} }
];
function rollRarity(){ if(Math.random()<RARITIES[3].chance) return RARITIES[3]; if(Math.random()<RARITIES[2].chance) return RARITIES[2]; if(Math.random()<RARITIES[1].chance) return RARITIES[1]; return RARITIES[0]; }

/* ---- Achievements ---- */
const achievements = [
  // Beginner achievements
  { id:'first_fish', name:'Getting Your Feet Wet', desc:'Buy your first fish', icon:'🐠', check:()=>state.stats.lifetimeFishBought >= 1 },
  { id:'first_sale', name:'Fish Flipper', desc:'Sell your first fish', icon:'💰', check:()=>state.stats.lifetimeFishSold >= 1 },
  { id:'coin_hoarder', name:'Penny Pincher', desc:'Accumulate 1,000 coins', icon:'🪙', check:()=>state.coins >= 1000 },
  { id:'ten_fish', name:'School\'s In Session', desc:'Own 10 fish at once', icon:'🏫', check:()=>{ const t=currentTank(); return t && t.fish.length >= 10; }},
  { id:'first_upgrade', name:'Level Up!', desc:'Upgrade any item to level 1', icon:'⬆️', check:()=>{ const t=currentTank(); return t && Object.values(t.items).some(v=>v>=1); }},

  // Species-specific achievements
  { id:'sardine_fan', name:'Sardine School', desc:'Buy 25 Sardines', icon:'🐟', check:()=>state.stats.lifetimeFishBought >= 25 },
  { id:'shark_week', name:'Shark Week', desc:'Own a Thresher Shark', icon:'🦈', check:()=>{ const t=currentTank(); return t && t.fish.some(f=>f.sp==='shark'); }},
  { id:'jellyfish_jam', name:'Jellyfish Jam', desc:'Own 3 Jellyfish at once', icon:'🪼', check:()=>{ const t=currentTank(); return t && t.fish.filter(f=>f.sp==='jellyfish').length >= 3; }},
  { id:'turtle_power', name:'Turtle Power', desc:'Max out a Sea Turtle\'s growth', icon:'🐢', check:()=>{ const t=currentTank(); return t && t.fish.some(f=>f.sp==='turtle' && f.size>=1); }},
  { id:'dolphin_rider', name:'So Long, And Thanks!', desc:'Own a Dolphin', icon:'🐬', check:()=>{ const t=currentTank(); return t && t.fish.some(f=>f.sp==='dolphin'); }},
  { id:'apex_predator', name:'Apex Predator', desc:'Own a Thresher Shark', icon:'🦈', check:()=>{ const t=currentTank(); return t && t.fish.some(f=>f.sp==='shark'); }},

  // Milestone achievements
  { id:'millionaire', name:'Millionaire Club', desc:'Earn 1,000,000 lifetime coins', icon:'💎', check:()=>state.stats.lifetimeCoins >= 1_000_000 },
  { id:'fish_market', name:'Fish Market Mogul', desc:'Sell 100 fish', icon:'🏪', check:()=>state.stats.lifetimeFishSold >= 100 },
  { id:'fish_hoarder', name:'Compulsive Shopper', desc:'Buy 200 fish', icon:'🛒', check:()=>state.stats.lifetimeFishBought >= 200 },
  { id:'big_spender', name:'Big Spender', desc:'Spend 100,000 coins on fish', icon:'💸', check:()=>state.stats.lifetimeFishBought * 1000 >= 100_000 },
  { id:'prestige_once', name:'Prestige and Prejudice', desc:'Prestige for the first time', icon:'🏆', check:()=>state.stats.prestigeCount >= 1 },
  { id:'prestige_5', name:'Prestige Worldwide', desc:'Prestige 5 times', icon:'🌍', check:()=>state.stats.prestigeCount >= 5 },
  { id:'prestige_10', name:'Prestige God', desc:'Prestige 10 times', icon:'👑', check:()=>state.stats.prestigeCount >= 10 },

  // Rarity achievements
  { id:'rare_find', name:'Lucky Duck', desc:'Find a Rare fish', icon:'✨', check:()=>['RARE','EPIC','LEGENDARY'].includes(state.stats.rarestFish) },
  { id:'epic_find', name:'Jackpot!', desc:'Find an Epic fish', icon:'💜', check:()=>['EPIC','LEGENDARY'].includes(state.stats.rarestFish) },
  { id:'legendary_find', name:'Unicorn Finder', desc:'Find a Legendary fish', icon:'🦄', check:()=>state.stats.rarestFish==='LEGENDARY' },

  // Tank & capacity achievements
  { id:'tank_master', name:'Tank Commander', desc:'Own 3 tanks', icon:'🗂️', check:()=>state.tanks.length >= 3 },
  { id:'tank_tycoon', name:'Tank Tycoon', desc:'Own 5 tanks', icon:'🏭', check:()=>state.tanks.length >= 5 },
  { id:'full_tank', name:'Sardine Can', desc:'Fill a tank to 100% capacity', icon:'📦', check:()=>state.tanks.some(t=>t.fish.length >= totalCapacity(t)) },

  // Upgrade achievements
  { id:'feeder_max', name:'All You Can Eat', desc:'Max out Auto Feeder', icon:'🍔', check:()=>{ const t=currentTank(); return t && (t.items['feeder']||0) >= 25; }},
  { id:'filter_max', name:'Crystal Clear', desc:'Max out Bio Filter', icon:'💧', check:()=>{ const t=currentTank(); return t && (t.items['filter']||0) >= 30; }},
  { id:'heater_max', name:'Tropical Paradise', desc:'Max out Heater', icon:'🌡️', check:()=>{ const t=currentTank(); return t && (t.items['heater']||0) >= 25; }},
  { id:'coral_max', name:'Coral Reef', desc:'Max out Decor', icon:'🪸', check:()=>{ const t=currentTank(); return t && (t.items['coral']||0) >= 25; }},
  { id:'all_max', name:'Maxed Out', desc:'Max all items in one tank', icon:'🔝', check:()=>state.tanks.some(t=>(t.items['feeder']||0)>=25 && (t.items['heater']||0)>=25 && (t.items['coral']||0)>=25) },

  // Background achievements
  { id:'bg_collector', name:'Interior Designer', desc:'Unlock 5 backgrounds', icon:'🎨', check:()=>Object.keys(state.unlockedBackgrounds).length >= 5 },
  { id:'bg_complete', name:'Background Check', desc:'Unlock all backgrounds', icon:'🖼️', check:()=>Object.keys(state.unlockedBackgrounds).length >= 10 },

  // Value achievements
  { id:'big_sale', name:'Whale of a Sale', desc:'Sell a fish for 10,000+ coins', icon:'🐋', check:()=>state.stats.mostValuableSale >= 10_000 },
  { id:'huge_sale', name:'Legendary Sale', desc:'Sell a fish for 100,000+ coins', icon:'💰', check:()=>state.stats.mostValuableSale >= 100_000 },
  { id:'massive_sale', name:'Mega Sale', desc:'Sell a fish for 1,000,000+ coins', icon:'💵', check:()=>state.stats.mostValuableSale >= 1_000_000 },

  // Time-based achievements
  { id:'dedicated', name:'Dedicated Player', desc:'Play for 1 hour total', icon:'⏰', check:()=>(state.stats.totalPlayTime + (Date.now()-state.stats.sessionStart)) >= 3600000 },
  { id:'addicted', name:'Can\'t Stop Won\'t Stop', desc:'Play for 5 hours total', icon:'🎮', check:()=>(state.stats.totalPlayTime + (Date.now()-state.stats.sessionStart)) >= 18000000 },

  // Predator achievements
  { id:'first_predator', name:'Hire a Hitman', desc:'Purchase your first predator', icon:'🦈', check:()=>state.tanks.some(t=>t.predators && Object.values(t.predators).some(p=>p.level>=1)) },
  { id:'apex_predator', name:'Apex Predator', desc:'Upgrade any predator to level 5', icon:'👹', check:()=>state.tanks.some(t=>t.predators && Object.values(t.predators).some(p=>p.level>=5)) },
  { id:'predator_army', name:'Feeding Frenzy', desc:'Own 5 different predators in one tank', icon:'🔱', check:()=>state.tanks.some(t=>t.predators && Object.values(t.predators).filter(p=>p.level>=1).length>=5) },
  { id:'predator_master', name:'Ocean\'s Twelve', desc:'Own all 12 predators in one tank', icon:'🌊', check:()=>state.tanks.some(t=>t.predators && Object.values(t.predators).filter(p=>p.level>=1).length>=12) },
  { id:'lazy_farmer', name:'Passive Aggressive Income', desc:'Let predators earn 10,000 coins', icon:'😴', check:()=>state.stats.predatorEarnings >= 10_000 },
  { id:'circle_of_life', name:'Circle of Life', desc:'Watch a predator hunt down its prey', icon:'🎯', check:()=>state.stats.predatorKills >= 1 },
  { id:'serial_killer', name:'Serial Killer', desc:'Predators kill 100 fish', icon:'💀', check:()=>state.stats.predatorKills >= 100 },
  { id:'fish_genocide', name:'Crimes Against Fishmanity', desc:'Predators kill 1,000 fish', icon:'⚰️', check:()=>state.stats.predatorKills >= 1000 },

  // Misc achievements
  { id:'automation_master', name:'Set It and Forget It', desc:'Enable automation', icon:'🤖', check:()=>{ const t=currentTank(); return t && (t.automation.autoSell || t.automation.autoBuy); }},
  { id:'speed_demon', name:'Gotta Go Fast', desc:'Sell 50 fish in one session', icon:'⚡', check:()=>state.stats.lifetimeFishSold >= 50 },
  { id:'collection_complete', name:'Gotta Catch \'Em All', desc:'Own all 12 fish species at once', icon:'📚', check:()=>{ const t=currentTank(); if(!t) return false; const uniqueSpecies = new Set(t.fish.map(f=>f.sp)); return uniqueSpecies.size >= 12; }},
];

/* ---- Settings & State ---- */
const state = {
  version: GAME_VERSION,
  coins: 100,
  prestige: 0,
  settings: { musicVolume:0, sfxVolume:0.75, intensity:1.0 }, // SFX on by default
  unlockedBackgrounds: { default: true }, // global unlocks
  automationUnlocked: false, // track automation unlock status
  tanks: [], // { uid,typeId,name,items,fish,lastTick,automation,backgroundId,predators }
  activeTankUid: null,
  nextUid: 1,
  // Statistics tracking (lifetime, persists through prestige)
  stats: {
    lifetimeCoins: 0,      // total coins earned ever
    lifetimeFishSold: 0,   // total fish sold
    lifetimeFishBought: 0, // total fish bought
    prestigeCount: 0,      // total times prestiged
    totalPlayTime: 0,      // milliseconds played
    sessionStart: Date.now(), // track current session
    mostValuableSale: 0,   // highest single fish sale
    rarestFish: 'COMMON',  // best rarity found
    predatorKills: 0,      // total fish killed by predators
    predatorEarnings: 0    // total coins earned by predators
  },
  // Achievement tracking
  achievements: {}
};
function prestigeCost(){ return Math.floor(PRESTIGE_BASE * Math.pow(3, state.prestige||0)); }

/* ---- DOM ---- */
const logEl = document.getElementById('log');
const logPanel = document.getElementById('logPanel');
const coinsEl = document.getElementById('coins');
const fishCountEl = document.getElementById('fishCount');
const capacityEl = document.getElementById('capacity');
const growthMultEl = document.getElementById('growthMult');
const prestigeEl = document.getElementById('prestige');
const tankSelectEl = document.getElementById('tankSelect');
const listEl = document.getElementById('list');
const prestigeBtn = document.getElementById('prestigeBtn');
const toggleLogBtn = document.getElementById('toggleLog');
const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const musicVol = document.getElementById('musicVol');
const sfxVol = document.getElementById('sfxVol');
const vizIntensity = document.getElementById('vizIntensity');
const closeSettings = document.getElementById('closeSettings');
const statsBtn = document.getElementById('statsBtn');
const statsOverlay = document.getElementById('statsOverlay');
const closeStats = document.getElementById('closeStats');
const toastContainer = document.getElementById('toastContainer');

const canvas = document.getElementById('aquarium');
const ctx = canvas.getContext('2d', { alpha: true });
// Disable image smoothing for crisp pixel art
ctx.imageSmoothingEnabled = false;
ctx.webkitImageSmoothingEnabled = false;
ctx.mozImageSmoothingEnabled = false;
ctx.msImageSmoothingEnabled = false;

const coinCanvas = document.getElementById('coinCanvas');
const coinCtx = coinCanvas.getContext('2d', { alpha: true });
let viewW=0, viewH=0;

/* ---- Parallax plants & mouse ---- */
let mouse = { x: 0.5, y: 0.5 };
canvas.addEventListener('mousemove', e=>{
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) / r.width;
  mouse.y = (e.clientY - r.top)  / r.height;
});
let plantsBack = [], plantsFront = [];
function genPlant(front){
  return {
    x: Math.random() * viewW,
    baseY: viewH * (0.90 + Math.random()*0.06),
    h: (front ? viewH*0.28 : viewH*0.22) * (0.7 + Math.random()*0.6),
    sway: (front ? 14 : 10) * (0.6 + Math.random()*0.8),
    width: 5 + Math.random()*5,
    color: front ? 'rgba(60,140,100,0.75)' : 'rgba(40,120,90,0.55)',
    blades: 3 + (Math.random()*3|0),
    front,
    phase: Math.random()*Math.PI*2
  };
}
function makePlants(){
  const countBack  = Math.max(8,  (viewW/140)|0);
  const countFront = Math.max(6,  (viewW/180)|0);
  plantsBack  = Array.from({length:countBack }, ()=>genPlant(false));
  plantsFront = Array.from({length:countFront}, ()=>genPlant(true));
}
function drawPlant(p, t){
  const parallaxX = (mouse.x - 0.5) * (p.front ? 36 : 20);
  const parallaxY = (mouse.y - 0.5) * (p.front ?  8 :  4);
  const x = p.x + parallaxX; const y = p.baseY + parallaxY;
  ctx.save(); ctx.translate(x, y); ctx.strokeStyle = p.color; ctx.lineWidth = p.width; ctx.lineCap = 'round';
  for(let b=0; b<p.blades; b++){
    const bh = p.h * (0.85 + b*0.12);
    const amp = p.sway * (0.7 + b*0.15);
    const swayBase = Math.sin(t*0.8 + p.phase + b*0.6) * amp;
    ctx.beginPath();
    const steps = 6;
    for(let i=0;i<=steps;i++){
      const k = i/steps; const yy = -bh * k; const xx = Math.sin(k*1.6 + t*0.5 + b*0.3) * amp*(1-k) + swayBase*k;
      if(i===0) ctx.moveTo(0,0); else ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}
function drawPlantLayer(arr, t){ for(const p of arr) drawPlant(p, t); }
function drawForeground(){ drawPlantLayer(plantsFront, Date.now()*0.001); }

/* ---- Utils ---- */
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const fmt = n => Math.floor(n).toLocaleString();
const rnd = (a,b)=>a + Math.random()*(b-a);
function log(msg){ const div=document.createElement('div'); div.className='entry'; div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`; logEl.prepend(div); }
function logClear(){ logEl.innerHTML=''; }
function nextUid(){ return state.nextUid++; }
function getTankType(id){ return tankTypes.find(t=>t.id===id); }
function currentTank(){ return state.tanks.find(t=>t.uid===state.activeTankUid) || state.tanks[0]; }
function ensureActive(){ if(!state.activeTankUid && state.tanks.length) state.activeTankUid = state.tanks[0].uid; }
function roundRectPath(ctx, x, y, w, h, r=6){
  const rr = Math.min(r, h/2, w/2);
  ctx.beginPath();
  ctx.moveTo(x+rr, y); ctx.lineTo(x+w-rr, y); ctx.quadraticCurveTo(x+w, y, x+w, y+rr);
  ctx.lineTo(x+w, y+h-rr); ctx.quadraticCurveTo(x+w, y+h, x+w-rr, y+h);
  ctx.lineTo(x+rr, y+h); ctx.quadraticCurveTo(x, y+h, x, y+h-rr);
  ctx.lineTo(x, y+rr); ctx.quadraticCurveTo(x, y, x+rr, y); ctx.closePath();
}

/* ---- Save/Load ---- */
function save(){
  // Update total play time before saving
  const sessionTime = Date.now() - state.stats.sessionStart;
  state.stats.totalPlayTime += sessionTime;
  state.stats.sessionStart = Date.now(); // reset session timer

  localStorage.setItem('aquariumSave_v2', JSON.stringify(state));
  log('Game saved.');
}
function hardReset(){ if(confirm('Hard reset and clear your save?')){ localStorage.removeItem('aquariumSave_v2'); localStorage.removeItem('aquariumSave'); location.reload(); } }
function migrateFromV1(raw){
  try{
    const v1 = JSON.parse(raw);
    if(!v1 || !v1.version) return false;
    const tank = {
      uid: nextUid(),
      typeId: v1.tankId || 'starter',
      name: 'Tank 1',
      items: v1.items || Object.fromEntries(itemsCatalog.map(i=>[i.id,0])),
      fish: (v1.fish||[]).map(f=>({ ...f, rarity: f.isRare ? 'RARE' : 'COMMON' })),
      lastTick: v1.lastTick || Date.now(),
      automation: { autoSell:false, autoBuy:false, mode:'smart', target:'sardine', reserve:0 },
      backgroundId: 'default'
    };
    state.coins = v1.coins ?? 100;
    state.prestige = 0;
    state.settings = { musicVolume:0, sfxVolume:0.75, intensity:1.0 };
    state.unlockedBackgrounds = { default: true };
    state.tanks = [tank];
    state.activeTankUid = tank.uid;
    log('Save migrated to parallel tanks.');
    return true;
  }catch{ return false; }
}
function load(){
  const raw2 = localStorage.getItem('aquariumSave_v2');
  if(raw2){
    try{
      const data = JSON.parse(raw2);
      Object.assign(state, data);
      state.prestige = state.prestige||0;
      // Migrate old settings format to new format
      if(state.settings && state.settings.audio !== undefined){
        // Old format detected
        state.settings = {
          musicVolume: state.settings.audio ? (state.settings.volume || 0.4) : 0,
          sfxVolume: 0.75, // Enable SFX by default
          intensity: state.settings.intensity || 1.0
        };
      }
      state.settings = state.settings || { musicVolume:0, sfxVolume:0.75, intensity:1.0 };
      state.unlockedBackgrounds = state.unlockedBackgrounds || { default: true };
      state.automationUnlocked = state.automationUnlocked || false;
      // Initialize stats if missing
      state.stats = state.stats || {
        lifetimeCoins: 0, lifetimeFishSold: 0, lifetimeFishBought: 0,
        prestigeCount: 0, totalPlayTime: 0, sessionStart: Date.now(),
        mostValuableSale: 0, rarestFish: 'COMMON',
        predatorKills: 0, predatorEarnings: 0
      };
      // Add new predator stats if missing (backwards compatibility)
      state.stats.predatorKills = state.stats.predatorKills || 0;
      state.stats.predatorEarnings = state.stats.predatorEarnings || 0;
      state.stats.sessionStart = Date.now(); // reset session timer on load
      // Initialize achievements if missing
      state.achievements = state.achievements || {};
      for(const t of state.tanks){
        t.automation = t.automation || { autoSell:false, autoBuy:false, mode:'smart', target:'guppy', reserve:0 };
        t.automation.mode = t.automation.mode || 'smart';
        t.items = t.items || Object.fromEntries(itemsCatalog.map(i=>[i.id,0]));
        t.lastTick = t.lastTick || Date.now();
        t.backgroundId = t.backgroundId || 'default';
      }
      log('Save loaded.');
      return;
    }catch(e){ console.warn('Load v2 failed', e); }
  }
  const raw1 = localStorage.getItem('aquariumSave'); // legacy
  if(raw1 && migrateFromV1(raw1)) return;

  // Fresh game
  const t = {
    uid: nextUid(),
    typeId: 'starter',
    name: 'Tank 1',
    items: Object.fromEntries(itemsCatalog.map(i=>[i.id,0])),
    fish: [],
    lastTick: Date.now(),
    automation: { autoSell:false, autoBuy:false, mode:'smart', target:'guppy', reserve:0 },
    backgroundId: 'default'
  };
  state.coins = 100;
  state.prestige = 0;
  state.tanks = [t];
  state.activeTankUid = t.uid;
}

/* ---- Prestige ---- */
function prestige(){
  const cost = prestigeCost();
  if(state.coins < cost){ log(`Not enough coins to Prestige. Need ${fmt(cost)}.`); return; }
  const msg = `Prestige resets your tanks, items, and coins but permanently doubles growth speed per prestige.\nCost now: ${fmt(cost)} coins.\nProceed?`;
  if(!confirm(msg)) return;

  state.prestige = (state.prestige||0) + 1;
  state.stats.prestigeCount++; // Track prestige stat

  const t = {
    uid: 1,
    typeId: 'starter',
    name: 'Tank 1',
    items: Object.fromEntries(itemsCatalog.map(i=>[i.id,0])),
    fish: [],
    lastTick: Date.now(),
    automation: { autoSell:false, autoBuy:false, mode:'smart', target:'guppy', reserve:0 },
    backgroundId: 'default'
  };

  state.coins = 100;
  state.tanks = [t];
  state.activeTankUid = t.uid;
  state.nextUid = 2;

  state.unlockedBackgrounds = state.unlockedBackgrounds || { default: true };
  state.settings = state.settings || { musicVolume:0, sfxVolume:0.75, intensity:1.0 };
  // NOTE: stats and achievements persist through prestige!

  playSFX('prestige'); // Dramatic sound for prestige
  updateAmbientForActiveTank();
  log(`Prestiged to level ${state.prestige}. Cost next time: ${fmt(prestigeCost())}.`);
  save(); refreshStats(); refreshTankSelect(); renderShop(); applyTankBackground();
}
function prestigeSpeed(){ return Math.pow(2, state.prestige||0); }
prestigeBtn.addEventListener('click', prestige);

/* ---- Mechanics ---- */
function itemsOf(t){ return t.items; }
function totalCapacity(t){
  const base = getTankType(t.typeId).capacity;
  const extra = (itemsOf(t)['filter']||0) * (itemsCatalog.find(i=>i.id==='filter').capacityPerLvl||0);
  return base + extra;
}
function growthMultiplier(t){
  const tt = getTankType(t.typeId);
  const feeder = (itemsOf(t)['feeder']||0) * (itemsCatalog.find(i=>i.id==='feeder').growthPerLvl||0);
  const heater = (itemsOf(t)['heater']||0) * (itemsCatalog.find(i=>i.id==='heater').growthPerLvl||0);
  return (1 + feeder + heater) * tt.growthBonus * prestigeSpeed();
}
function sellMultiplier(t){
  const decor = (itemsOf(t)['coral']||0) * (itemsCatalog.find(i=>i.id==='coral').sellPerLvl||0);
  return 1 + decor;
}
function fishValue(t, sp, size01, rarity){
  const sizeFactor = size01 < 0.4 ? size01 * 0.7 : size01;
  const base = sp.sellBase * (0.5 + sizeFactor) * sellMultiplier(t);
  return base * (rarity?.mult||1) * 1.20; // +20% boost
}
function nextLevelCost(itemDef, levelNow){ return Math.floor(itemDef.baseCost * Math.pow(1.6, levelNow)); }

/* ---- Buying / Selling ---- */
function buyFish(spId){
  const t = currentTank(); if(!t) return;
  const sp = species.find(s=>s.id===spId);
  if(!sp) return;
  if(t.fish.length >= totalCapacity(t)){ log('Tank is full. Upgrade capacity or sell fish.'); return; }
  if(state.coins < sp.cost){ log('Not enough coins.'); return; }

  state.coins -= sp.cost;
  const dir = Math.random()<0.5?1:-1;
  const rarity = rollRarity();
  t.fish.push({
    id: Math.random().toString(36).slice(2),
    sp: sp.id,
    rarity: rarity.key,
    x: rnd(80, viewW-80),
    y: rnd(80, viewH-140),
    dir,
    size: 0.18,
    age: 0,
    vx: rnd(15,45) * dir,
    vy: rnd(-10,10),
    wobble: Math.random()*Math.PI*2,
    seed: Math.floor(Math.random()*2**31)
  });

  // Track stats
  state.stats.lifetimeFishBought++;
  // Track rarest fish found
  const rarityOrder = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY'];
  if(rarityOrder.indexOf(rarity.key) > rarityOrder.indexOf(state.stats.rarestFish)){
    state.stats.rarestFish = rarity.key;
  }

  // Sound effects
  playSFX('buyFish');
  playSFX('splash'); // Water splash when fish drops into tank
  if(rarity.key !== 'COMMON'){
    playSFX('rareFish');
  }

  log(`Bought ${sp.name} for ${fmt(sp.cost)}${rarity.key!=='COMMON' ? ` — <${rarity.key}>` : ''}`);
  refreshStats(); renderShop(); refreshTankSelect();
}
function sellFishById(id, note=''){
  const t = currentTank(); if(!t) return;
  const idx = t.fish.findIndex(f=>f.id===id); if(idx===-1) return;
  const f = t.fish[idx];
  const sp = species.find(s=>s.id===f.sp);
  const rar = RARITIES.find(r=>r.key===f.rarity) || RARITIES[0];
  const value = Math.floor(fishValue(t, sp, f.size, rar));

  // Spawn coin particles at fish position
  spawnCoinParticles(f.x, f.y, value);

  state.coins += value;
  t.fish.splice(idx,1);

  // Track stats
  state.stats.lifetimeCoins += value;
  state.stats.lifetimeFishSold++;
  if(value > state.stats.mostValuableSale){
    state.stats.mostValuableSale = value;
  }

  // Sound effects
  playSFX('sellFish');

  log(`Sold ${sp.name}${f.rarity!=='COMMON'?` (${f.rarity})`:''} for ${fmt(value)}.${note}`);
  refreshStats();
  renderShop(); // Update shop to refresh available fish options
}
function sellMatureFish(){
  const t = currentTank(); if(!t) return;
  let sold=0, coinsEarned=0;
  for(let i=t.fish.length-1;i>=0;i--){
    const f=t.fish[i];
    if(f.size>=0.8){
      const sp = species.find(s=>s.id===f.sp);
      const rar = RARITIES.find(r=>r.key===f.rarity) || RARITIES[0];
      const value = Math.floor(fishValue(t, sp, f.size, rar));
      coinsEarned += value;
      if(value > state.stats.mostValuableSale){
        state.stats.mostValuableSale = value;
      }
      t.fish.splice(i,1); sold++;
    }
  }
  if(sold){
    // Spawn particles from center of screen for bulk sales
    spawnCoinParticles(viewW / 2, viewH / 2, coinsEarned);

    state.coins+=coinsEarned;
    state.stats.lifetimeCoins += coinsEarned;
    state.stats.lifetimeFishSold += sold;
    playSFX('sellFish'); // Play sound once for bulk sale
    log(`Sold ${sold} mature fish for ${fmt(coinsEarned)}.`);
    refreshStats(); renderShop();
  }
  else log('No mature fish yet (need ≥80% growth).');
}

/* ---- Tanks management ---- */
function addParallelTank(cost=2500){
  if(state.tanks.length >= MAX_TANKS){ log(`Maximum tanks reached (${MAX_TANKS}/${MAX_TANKS}).`); return; }
  if(state.coins < cost){ log('Not enough coins for a new tank.'); return; }
  state.coins -= cost;
  const uid = nextUid();
  state.tanks.push({
    uid, typeId:'starter', name:`Tank ${state.tanks.length+1}`,
    items: Object.fromEntries(itemsCatalog.map(i=>[i.id,0])),
    fish: [],
    lastTick: Date.now(),
    automation: { autoSell:false, autoBuy:false, mode:'smart', target:'guppy', reserve:0 },
    backgroundId: 'default',
    predators: Object.fromEntries(predators.map(p=>[p.id, { level:0, lastHunt:Date.now() }])) // Predator levels & timers
  });
  state.activeTankUid = uid;
  log(`Added a new tank (Starter Glass) for ${fmt(cost)}.`);
  refreshStats(); refreshTankSelect(); renderShop(); applyTankBackground(); updateAmbientForActiveTank();
}
function upgradePredator(predId, targetLevel){
  const t = currentTank(); if(!t) return;
  if(!t.predators) t.predators = Object.fromEntries(predators.map(p=>[p.id, { level:0, lastHunt:Date.now() }]));

  const pred = predators.find(p=>p.id===predId);
  if(!pred) return;

  // Ensure this specific predator entry exists
  if(!t.predators[predId]){
    t.predators[predId] = { level: 0, lastHunt: Date.now() };
  }

  const currentLevel = t.predators[predId].level || 0;

  // Can only upgrade to next level
  if(targetLevel !== currentLevel + 1){
    log('You must upgrade predators one level at a time.');
    return;
  }

  const levelData = predatorLevels[targetLevel - 1];
  const cost = Math.floor(pred.baseCost * levelData.costMult);

  if(state.coins < cost){
    log(`Not enough coins for ${pred.name} Level ${targetLevel}.`);
    return;
  }

  state.coins -= cost;
  t.predators[predId].level = targetLevel;
  t.predators[predId].lastHunt = Date.now();

  playSFX('upgrade');
  log(`${pred.name} upgraded to Level ${targetLevel}! Auto-sells ${species.find(s=>s.id===pred.prey).name} every ${levelData.interval}s.`);
  refreshStats();
  renderShop();
}

function upgradeTankType(tankUid, newTypeId){
  const t = state.tanks.find(x=>x.uid===tankUid); if(!t) return;
  const tt = getTankType(newTypeId); if(!tt) return;
  if(t.typeId===newTypeId) return;
  if(state.coins < tt.cost){ log('Not enough coins.'); return; }
  state.coins -= tt.cost;
  t.typeId = newTypeId;
  if(t.uid===state.activeTankUid) applyTankBackground();
  playSFX('upgrade'); // Sound effect for upgrade
  log(`Upgraded ${t.name} to ${tt.name} for ${fmt(tt.cost)}.`);
  refreshStats(); renderShop();
}

/* ---- Item upgrades (per tank) ---- */
function buyItem(itemId){
  const t = currentTank(); if(!t) return;
  const def = itemsCatalog.find(i=>i.id===itemId);
  const lvl = t.items[itemId]||0;
  if(def.max && lvl>=def.max){ log(`${def.name} is maxed.`); return; }
  const cost = nextLevelCost(def, lvl);
  if(state.coins < cost){ log('Not enough coins.'); return; }
  state.coins -= cost;
  t.items[itemId] = lvl+1;
  playSFX('upgrade'); // Sound effect for upgrade
  log(`Upgraded ${def.name} in ${t.name} to Lv.${lvl+1} for ${fmt(cost)}.`);
  refreshStats(); renderShop();
}

/* ---- UI: Shop (Accordion) ---- */
let activeSection='fish'; // Currently open section

// Initialize accordion handlers
function initAccordion(){
  document.querySelectorAll('.accordionHeader').forEach(header=>{
    header.addEventListener('click',()=>{
      const section = header.parentElement;
      const sectionName = section.getAttribute('data-section');

      // Toggle active section
      if(activeSection === sectionName){
        // Clicking active section closes it
        section.classList.remove('active');
        activeSection = null;
      } else {
        // Close all sections
        document.querySelectorAll('.accordionSection').forEach(s=>s.classList.remove('active'));
        // Open clicked section
        section.classList.add('active');
        activeSection = sectionName;
      }

      renderShop();
    });
  });

  // Open first section by default
  const firstSection = document.querySelector('.accordionSection[data-section="fish"]');
  if(firstSection){
    firstSection.classList.add('active');
    activeSection = 'fish';
  }
}

// Call after DOM loaded
setTimeout(initAccordion, 100);

function bgPreviewCSS(id){
  switch(id){
    case 'default': return 'linear-gradient(180deg,#4da6ff,#002b66)';
    case 'deepsea': return 'linear-gradient(180deg,#001f33,#000a0f)';
    case 'coral':   return 'linear-gradient(180deg,#2f6d7a,#10333a)';
    case 'kelp':    return 'linear-gradient(180deg,#1a472a,#002b1a)';
    case 'lagoon':  return 'linear-gradient(180deg,#66ffe0,#006666)';
    case 'night':   return 'linear-gradient(180deg,#001f3f,#000000)';
    case 'sunset':  return 'linear-gradient(180deg,#ff9966,#660000)';
    case 'volcano': return 'linear-gradient(180deg,#2f1b0c,#0a0502)';
    case 'ice':     return 'linear-gradient(180deg,#cceeff,#00334d)';
    case 'fantasy': return 'linear-gradient(180deg,#a64dff,#1a0033)';
  }
  return 'linear-gradient(180deg,#4da6ff,#002b66)';
}

function renderShop(){
  const t = currentTank(); if(!t) return;
  const coins = state.coins;

  // Clear all accordion contents
  document.querySelectorAll('.accordionContent').forEach(content=>content.innerHTML='');

  // Get active content area
  if(!activeSection) return;
  const contentEl = document.querySelector(`.accordionSection[data-section="${activeSection}"] .accordionContent`);
  if(!contentEl) return;

  if(activeSection==='fish'){
    const gMult = growthMultiplier(t);
    species.forEach(sp=>{
      const full = t.fish.length >= totalCapacity(t);
      const afford = coins>=sp.cost;

      // Calculate time to mature (0% -> 80%)
      const timeToMature = 0.8 / (sp.growth * gMult); // seconds
      const formatTime = (secs) => {
        if(secs < 60) return `${Math.ceil(secs)}s`;
        if(secs < 3600) return `${Math.floor(secs/60)}m ${Math.ceil(secs%60)}s`;
        return `${Math.floor(secs/3600)}h ${Math.floor((secs%3600)/60)}m`;
      };

      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `
        <div>
          <div class="title">${sp.name} <span class="badge">⏱️ ${formatTime(timeToMature)}</span></div>
          <div class="muted">Buy <span class="price">${fmt(sp.cost)}</span> • Mature base sell ~ <span class="price">${fmt(Math.floor(sp.sellBase*1.5*1.2))}</span></div>
          <div class="tiny">Time to mature with current ${gMult.toFixed(2)}× growth multiplier • Rarity: Rare 5% • Epic 1% • Legendary 0.2%</div>
        </div>
        <div><button ${(!afford||full)?'disabled':''}>Buy</button></div>`;
      const btn = div.querySelector('button');
      if(!afford && !full){ btn.classList.add('cant-afford'); btn.title='Not enough coins'; }
      if(full){ btn.title='Tank is full'; }
      btn.onclick=()=>buyFish(sp.id);
      contentEl.appendChild(div);
    });
    const cap = document.createElement('div');
    cap.className='tiny';
    cap.innerHTML = `<div style="height:1px;background:#1a2946;margin:8px 0"></div>Capacity: <b>${t.fish.length}</b>/<b>${totalCapacity(t)}</b> in <b>${t.name}</b>`;
    contentEl.appendChild(cap);
  }

  if(activeSection==='tanks'){
    state.tanks.forEach(inst=>{
      const tt = getTankType(inst.typeId);
      const isActive = inst.uid===state.activeTankUid;
      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `
        <div>
          <div class="title">${inst.name} ${isActive?'<span class="badge">Active</span>':''}</div>
          <div class="muted">Type <b>${tt.name}</b> • Capacity <b>${totalCapacity(inst)}</b> • Growth bonus <b>${Math.round((tt.growthBonus-1)*100)}%</b></div>
          <div class="tiny">Fish: ${inst.fish.length} • Background: ${inst.backgroundId}</div>
        </div>
        <div><button ${isActive?'disabled':''}>Activate</button></div>`;
      div.querySelector('button').onclick=()=>{ state.activeTankUid=inst.uid; refreshStats(); refreshTankSelect(); applyTankBackground(); renderShop(); updateAmbientForActiveTank(); };
      contentEl.appendChild(div);
    });

    const upHead = document.createElement('div'); upHead.className='tiny';
    upHead.innerHTML = `<div style="height:1px;background:#1a2946;margin:8px 0"></div><b>Upgrade Active Tank</b>`;
    contentEl.appendChild(upHead);

    getUpgradesForActive().forEach(u=>{
      const afford = state.coins>=u.cost;
      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `
        <div>
          <div class="title">${u.name}</div>
          <div class="muted">Capacity <b>${u.capacity}</b> • Growth bonus <b>${Math.round((u.growthBonus-1)*100)}%</b> • Cost <span class="price">${fmt(u.cost)}</span></div>
        </div>
        <div><button ${afford?'':'disabled'}>Unlock</button></div>`;
      const btn = div.querySelector('button');
      if(!afford){ btn.classList.add('cant-afford'); btn.title='Not enough coins'; }
      btn.onclick=()=>upgradeTankType(state.activeTankUid, u.id);
      contentEl.appendChild(div);
    });

    const addHead = document.createElement('div'); addHead.className='tiny';
    addHead.innerHTML = `<div style="height:1px;background:#1a2946;margin:8px 0"></div><b>Expand Your Empire</b>`;
    contentEl.appendChild(addHead);

    const add = document.createElement('div'); add.className='card';
    const affordTank = state.coins>=2500;
    const atCap = state.tanks.length >= MAX_TANKS;
    const tankPrice = fmt(2500);
    add.innerHTML = `
      <div>
        <div class="title">Add Parallel Tank ${atCap?'<span class="badge">Max Reached</span>':''}</div>
        <div class="muted">${atCap?`Maximum of ${MAX_TANKS} tanks allowed.`:`Adds a new Starter Glass tank that runs in parallel. Cost <span class="price">${tankPrice}</span>`}</div>
        ${atCap?`<div class="tiny">You own ${state.tanks.length}/${MAX_TANKS} tanks.</div>`:''}
      </div>
      <div><button ${(affordTank && !atCap)?'':'disabled'}>${atCap?'Maxed':'Buy'}</button></div>`;
    const addBtn = add.querySelector('button');
    if(!affordTank && !atCap){ addBtn.classList.add('cant-afford'); addBtn.title='Not enough coins'; }
    if(atCap){ addBtn.title=`Maximum ${MAX_TANKS} tanks reached`; }
    addBtn.onclick=()=>addParallelTank(2500);
    contentEl.appendChild(add);
  }

  if(activeSection==='items'){
    const tInst = currentTank();
    itemsCatalog.forEach(def=>{
      const lvl = tInst.items[def.id]||0;
      const maxed = def.max && lvl>=def.max;
      const cost = nextLevelCost(def, lvl);
      const afford = state.coins>=cost;
      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `
        <div>
          <div class="title">${def.name} <span class="badge">Lv.${lvl}${maxed?' • Max':''}</span></div>
          <div class="muted">Effect: ${def.effect} • Next: ${maxed?'<span class="badge">—</span>':`<span class="price">${fmt(cost)}</span>`}</div>
        </div>
        <div><button ${(!maxed&&afford)?'':'disabled'}>${maxed?'Maxed':'Upgrade'}</button></div>`;
      const btn = div.querySelector('button');
      if(!maxed && !afford){ btn.classList.add('cant-afford'); btn.title='Not enough coins'; }
      btn.onclick=()=>buyItem(def.id);
      contentEl.appendChild(div);
    });

    // Automations - Password Protected
    const auto = document.createElement('div'); auto.className='card';

    if(!state.automationUnlocked){
      // Show password prompt
      auto.innerHTML = `
        <div>
          <div class="title">🔒 Automations (Locked)</div>
          <div class="muted">Advanced automation features are password-protected.</div>
          <div style="margin-top:8px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <input type="password" id="autoPassword" placeholder="Enter password" style="flex:1;min-width:150px">
            <button id="unlockAuto" class="btn-accent small">Unlock</button>
          </div>
        </div>`;
      contentEl.appendChild(auto);

      auto.querySelector('#unlockAuto').onclick = ()=>{
        const pw = auto.querySelector('#autoPassword').value;
        if(pw === AUTOMATION_PASSWORD){
          state.automationUnlocked = true;
          log('✅ Automation features unlocked!');
          save(); // Save the unlock state
          renderShop(); // Refresh to show automations
        } else {
          log('❌ Incorrect password. Access denied.');
          auto.querySelector('#autoPassword').value = '';
          auto.querySelector('#autoPassword').style.borderColor = '#ff4444';
          setTimeout(()=>{ auto.querySelector('#autoPassword').style.borderColor = ''; }, 1000);
        }
      };

      // Allow Enter key to unlock
      auto.querySelector('#autoPassword').onkeypress = (e)=>{
        if(e.key === 'Enter') auto.querySelector('#unlockAuto').click();
      };
    } else {
      // Show full automation controls
      const a = tInst.automation || (tInst.automation = { autoSell:false, autoBuy:false, mode:'smart', target:'guppy', reserve:0 });
      auto.innerHTML = `
        <div>
          <div class="title">🔓 Automations (Unlocked)</div>
          <div class="muted">Per-tank toggles that run continuously in the background.</div>
          <div class="tiny">Auto-Sell sells fish at ≥80% maturity. Auto-Buy keeps capacity full.</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          <button id="togSell" class="small toggle ${a.autoSell?'on':''}">${a.autoSell?'Auto-Sell: ON':'Auto-Sell: OFF'}</button>
          <button id="togBuy" class="small toggle ${a.autoBuy?'on':''}">${a.autoBuy?'Auto-Buy: ON':'Auto-Buy: OFF'}</button>
        </div>`;
      contentEl.appendChild(auto);

      auto.querySelector('#togSell').onclick = (e)=>{ a.autoSell = !a.autoSell; e.target.classList.toggle('on', a.autoSell); e.target.textContent = a.autoSell?'Auto-Sell: ON':'Auto-Sell: OFF'; log(`${tInst.name}: Auto-Sell ${a.autoSell?'enabled':'disabled'}.`); save(); };
      auto.querySelector('#togBuy').onclick  = (e)=>{ a.autoBuy  = !a.autoBuy;  e.target.classList.toggle('on', a.autoBuy ); e.target.textContent  = a.autoBuy?'Auto-Buy: ON':'Auto-Buy: OFF';  log(`${tInst.name}: Auto-Buy ${a.autoBuy?'enabled':'disabled'}.`); save(); };
    }

    // Only show automation settings if unlocked
    if(state.automationUnlocked){
      const a = tInst.automation || (tInst.automation = { autoSell:false, autoBuy:false, mode:'smart', target:'guppy', reserve:0 });
      const controls = document.createElement('div'); controls.className='card';
      const speciesOpts = species.map(s=>`<option value="${s.id}" ${s.id===a.target?'selected':''}>${s.name}</option>`).join('');
      controls.innerHTML = `
        <div>
          <div class="title">Auto-Buy Settings</div>
          <div class="muted">In <b>Smart</b> mode, the tank buys the most expensive fish it can afford (then cheaper ones) while keeping your reserve intact.</div>
          <div style="display:flex;gap:12px;margin-top:6px;align-items:center;flex-wrap:wrap">
            <label>Mode:</label>
            <select id="autoMode">
              <option value="smart" ${a.mode==='smart'?'selected':''}>Smart (Most Expensive First)</option>
              <option value="target" ${a.mode!=='smart'?'selected':''}>Target Species Only</option>
            </select>
            <label>Target:</label>
            <select id="autoTarget" ${a.mode==='smart'?'disabled':''}>${speciesOpts}</select>
            <label>Reserve:</label>
            <input id="autoReserve" type="number" min="0" step="10" value="${a.reserve}">
          </div>
        </div>
        <div style="display:flex;align-items:center"><span class="badge">Tank: ${tInst.name}</span></div>`;
      contentEl.appendChild(controls);

      controls.querySelector('#autoMode').onchange = (e)=>{
        a.mode = e.target.value;
        controls.querySelector('#autoTarget').disabled = (a.mode==='smart');
        log(`${tInst.name}: Auto-Buy mode → ${a.mode.toUpperCase()}.`); save();
      };
      controls.querySelector('#autoTarget').onchange = (e)=>{ a.target = e.target.value; log(`${tInst.name}: Auto-Buy target set to ${species.find(s=>s.id===a.target).name}.`); save(); };
      controls.querySelector('#autoReserve').onchange = (e)=>{ a.reserve = Math.max(0, parseInt(e.target.value||0,10)); log(`${tInst.name}: Auto-Buy reserve set to ${fmt(a.reserve)}.`); save(); };

      // Debug Speed Controls (only in Automations)
      const debugCard = document.createElement('div'); debugCard.className='card';
      debugCard.innerHTML = `
        <div>
          <div class="title">⚡ Debug Speed</div>
          <div class="muted">Speed up fish growth for testing. Does not affect game balance.</div>
          <div style="display:flex;gap:12px;margin-top:6px;align-items:center;flex-wrap:wrap">
            <label>Growth Speed:</label>
            <select id="debugSpeed">
              <option value="1" ${debugSpeedMultiplier===1?'selected':''}>1x (Normal)</option>
              <option value="2" ${debugSpeedMultiplier===2?'selected':''}>2x</option>
              <option value="5" ${debugSpeedMultiplier===5?'selected':''}>5x</option>
              <option value="10" ${debugSpeedMultiplier===10?'selected':''}>10x</option>
              <option value="50" ${debugSpeedMultiplier===50?'selected':''}>50x</option>
              <option value="100" ${debugSpeedMultiplier===100?'selected':''}>100x (Instant)</option>
            </select>
          </div>
        </div>
        <div style="display:flex;align-items:center"><span class="badge">Current: ${debugSpeedMultiplier}x</span></div>`;
      contentEl.appendChild(debugCard);

      debugCard.querySelector('#debugSpeed').onchange = (e)=>{
        debugSpeedMultiplier = parseInt(e.target.value,10)||1;
        log(`⚡ Debug speed set to ${debugSpeedMultiplier}x. Fish will grow ${debugSpeedMultiplier}x faster!`);
        renderShop(); // Refresh to update badge
      };
    }
  }

  if(activeSection==='backgrounds'){
    const tInst = currentTank();
    backgrounds.forEach(bg=>{
      const owned = !!state.unlockedBackgrounds[bg.id] || bg.cost===0;
      const selected = (tInst.backgroundId === bg.id);
      const card = document.createElement('div'); card.className='card';
      const row = document.createElement('div'); row.className='bgRow';
      row.innerHTML = `
        <div class="bgPreview" style="background:${bgPreviewCSS(bg.id)}"></div>
        <div>
          <div class="title">${bg.name} ${selected?'<span class="badge">Equipped</span>':''}</div>
          <div class="tiny">${bg.desc}</div>
        </div>
        <div>
          ${owned
            ? `<button class="small">${selected?'Equipped':'Equip'}</button>`
            : `<button class="small ${state.coins<bg.cost?'cant-afford':''}" ${state.coins<bg.cost?'disabled':''}>Buy ${fmt(bg.cost)}</button>`}
        </div>`;
      card.appendChild(row);
      const btn = card.querySelector('button');
      btn.onclick = ()=>{
        if(owned){
          tInst.backgroundId = bg.id;
          if(tInst.uid===state.activeTankUid) updateAmbientForActiveTank();
          log(`Background set to ${bg.name} for ${tInst.name}.`);
          save(); renderShop();
        } else {
          if(state.coins >= bg.cost){
            state.coins -= bg.cost;
            state.unlockedBackgrounds[bg.id] = true;
            tInst.backgroundId = bg.id;
            if(tInst.uid===state.activeTankUid) updateAmbientForActiveTank();
            log(`Purchased and equipped ${bg.name} background for ${tInst.name}.`);
            save(); refreshStats(); renderShop();
          } else {
            log(`Not enough coins for ${bg.name}.`);
          }
        }
      };
      contentEl.appendChild(card);
    });
  }

  if(activeSection==='predators'){
    const t = currentTank();
    if(!t) return;

    // Ensure tank has predators field (for backwards compatibility)
    if(!t.predators){
      t.predators = Object.fromEntries(predators.map(p=>[p.id, { level:0, lastHunt:Date.now() }]));
    }

    // Ensure each predator entry exists individually
    predators.forEach(p => {
      if(!t.predators[p.id]) {
        t.predators[p.id] = { level: 0, lastHunt: Date.now() };
      }
    });

    const header = document.createElement('div');
    header.className = 'tiny';
    header.innerHTML = `<b>${t.name}</b> — Predators auto-sell mature prey fish at intervals`;
    contentEl.appendChild(header);

    predators.forEach(pred=>{
      const currentLevel = t.predators[pred.id].level || 0;
      const preySpecies = species.find(s=>s.id===pred.prey);

      // Count mature prey fish
      const maturePrey = t.fish.filter(f=>f.sp===pred.prey && f.size>=0.8).length;

      const card = document.createElement('div');
      card.className = 'card';

      // Build level buttons HTML with prices
      let levelButtonsHTML = '<div style="display:flex;gap:4px;margin-top:8px;flex-wrap:wrap;">';
      for(let i=1; i<=5; i++){
        const levelData = predatorLevels[i-1];
        const cost = Math.floor(pred.baseCost * levelData.costMult);
        const isCurrentLevel = currentLevel === i;
        const canAfford = state.coins >= cost;
        const isLocked = i > currentLevel + 1; // Can only buy next level
        const isOwned = i <= currentLevel;

        let buttonClass = 'tiny';
        if(isOwned) buttonClass += ' owned';
        else if(isLocked) buttonClass += ' locked';
        else if(!canAfford) buttonClass += ' cant-afford';

        const priceText = isOwned ? '✓' : (isLocked ? '🔒' : fmt(cost));
        const tooltipText = isOwned ? 'Owned' : (isLocked ? 'Unlock previous levels first' : (!canAfford ? `Need ${fmt(cost)} coins (you have ${fmt(state.coins)})` : `${fmt(cost)} coins - Auto-sells every ${levelData.interval}s`));

        levelButtonsHTML += `<button class="${buttonClass}" data-pred="${pred.id}" data-level="${i}" ${(isLocked || isOwned || !canAfford)?'disabled':''} title="${tooltipText}">
          Lv${i}<br><span style="font-size:0.8em;opacity:0.9">${priceText}</span>
        </button>`;
      }
      levelButtonsHTML += '</div>';

      const intervalText = currentLevel > 0 ? `Every ${predatorLevels[currentLevel-1].interval}s` : 'Inactive';

      card.innerHTML = `
        <div>
          <div class="title">${pred.icon} ${pred.name} <span class="badge">Lv ${currentLevel}/5</span></div>
          <div class="muted">Hunts <b>${preySpecies.name}</b> • ${intervalText} • Prey available: <b>${maturePrey}</b></div>
          ${levelButtonsHTML}
        </div>
      `;

      // Attach click handlers to each level button
      card.querySelectorAll('button[data-pred]').forEach(btn => {
        if (!btn.disabled) {
          btn.onclick = () => {
            const predId = btn.getAttribute('data-pred');
            const level = parseInt(btn.getAttribute('data-level'));
            upgradePredator(predId, level);
          };
        }
      });

      contentEl.appendChild(card);
    });
  }

  if(activeSection==='achievements'){
    const unlocked = achievements.filter(a=>state.achievements[a.id]);
    const locked = achievements.filter(a=>!state.achievements[a.id]);
    const progress = document.createElement('div');
    progress.className='tiny';
    progress.innerHTML = `<b>Progress:</b> ${unlocked.length}/${achievements.length} unlocked (${Math.floor(unlocked.length/achievements.length*100)}%)`;
    contentEl.appendChild(progress);

    // Show unlocked achievements first
    unlocked.forEach(ach=>{
      const card = document.createElement('div');
      card.className = 'achievementCard unlocked';
      card.innerHTML = `
        <span class="achIcon">${ach.icon}</span>
        <div class="achContent">
          <div class="achName">${ach.name}</div>
          <div class="achDesc">${ach.desc}</div>
        </div>
        <div class="badge">✓</div>
      `;
      contentEl.appendChild(card);
    });

    // Then show locked achievements
    locked.forEach(ach=>{
      const card = document.createElement('div');
      card.className = 'achievementCard locked';
      card.innerHTML = `
        <span class="achIcon">${ach.icon}</span>
        <div class="achContent">
          <div class="achName">${ach.name}</div>
          <div class="achDesc">${ach.desc}</div>
        </div>
        <span class="achLockIcon">🔒</span>
      `;
      contentEl.appendChild(card);
    });
  }
}
function getUpgradesForActive(){
  const t = currentTank(); if(!t) return [];
  const currentIdx = tankTypes.findIndex(x=>x.id===t.typeId);
  return tankTypes.slice(currentIdx+1);
}

/* ---- Stats & Topbar ---- */
function refreshTopButtons(){
  const cost = prestigeCost();
  prestigeBtn.textContent = `Prestige (${fmt(cost)})`;
  const afford = state.coins >= cost;
  prestigeBtn.disabled = !afford;
  prestigeBtn.classList.toggle('cant-afford', !afford);
}
function refreshStats(){
  const t = currentTank(); if(!t) return;
  coinsEl.textContent = fmt(state.coins);
  fishCountEl.textContent = t.fish.length;
  capacityEl.textContent = totalCapacity(t);
  growthMultEl.textContent = growthMultiplier(t).toFixed(2)+'×';
  prestigeEl.textContent = state.prestige||0;
  refreshTopButtons();
  checkAchievements(); // Check for new achievements
}
function refreshTankSelect(){
  ensureActive();
  tankSelectEl.innerHTML = state.tanks.map(t=>`<option value="${t.uid}" ${t.uid===state.activeTankUid?'selected':''}>${t.name}</option>`).join('');
}

/* ---- Canvas / Resize ---- */
function resize(){
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  viewW = Math.max(300, rect.width|0); viewH = Math.max(300, rect.height|0);
  canvas.width = (viewW * dpr)|0; canvas.height = (viewH * dpr)|0; ctx.setTransform(dpr,0,0,dpr,0,0);

  // Resize coin overlay canvas to full screen
  coinCanvas.width = (window.innerWidth * dpr)|0;
  coinCanvas.height = (window.innerHeight * dpr)|0;
  coinCtx.setTransform(dpr,0,0,dpr,0,0);

  makePlants();
}
window.addEventListener('resize', resize);

/* =========================================================
   SPRITE ENGINE — Lifelike redraw (no <script> tag here)
   ========================================================= */

/* ---------- helpers ---------- */
function specular(x, y, r, a){
  const g = ctx.createRadialGradient(x,y,0,x,y,r);
  g.addColorStop(0, 'rgba(255,255,255,'+(a==null?0.55:a)+')');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
}
function bodyGrad(top, belly, H){
  const g = ctx.createLinearGradient(0,-H*0.7,0,H*0.7);
  g.addColorStop(0, top); g.addColorStop(0.55, top); g.addColorStop(1, belly);
  return g;
}
function eye(x,y, r, spark){
  // Outer eye white
  ctx.fillStyle='rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(x,y, r*1.1, 0, Math.PI*2); ctx.fill();
  // Iris with gradient
  const irisGrad = ctx.createRadialGradient(x,y,0,x,y,r*0.9);
  irisGrad.addColorStop(0, '#1a2a3a'); irisGrad.addColorStop(0.6, '#0b1220'); irisGrad.addColorStop(1, '#000000');
  ctx.fillStyle=irisGrad; ctx.beginPath(); ctx.arc(x,y, r*0.9, 0, Math.PI*2); ctx.fill();
  // Pupil
  ctx.fillStyle='#000000'; ctx.beginPath(); ctx.arc(x,y, r*0.5, 0, Math.PI*2); ctx.fill();
  // Highlight sparkle
  ctx.fillStyle='#ffffff'; ctx.globalAlpha=0.9; ctx.beginPath();
  ctx.arc(x+r*0.35, y-r*0.4, r*(spark==null?0.35:spark), 0, Math.PI*2); ctx.fill();
  // Secondary reflection
  ctx.globalAlpha=0.4; ctx.beginPath();
  ctx.arc(x-r*0.25, y+r*0.3, r*0.15, 0, Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
}
function scales(L,H,density,alpha,r){
  ctx.save(); ctx.globalAlpha = (alpha==null?0.18:alpha);
  const stepX = Math.max(3, L*0.075), stepY = Math.max(3, L*0.11);
  for(let yy=-H*0.48; yy<=H*0.48; yy+=stepY){
    for(let xx=-L*0.40; xx<=L*0.40; xx+=stepX){
      if(Math.random() > (density==null?0.92:density)) continue;
      const offsetX = (((yy/stepY)&1)? stepX*0.5:0);
      const scaleX = xx + offsetX;
      const scaleY = yy;
      // Scale outline
      ctx.beginPath();
      ctx.arc(scaleX, scaleY, (r==null?1.3:r), Math.PI*0.15, Math.PI*0.85, true);
      ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=0.8; ctx.stroke();
      // Scale highlight
      ctx.beginPath();
      ctx.arc(scaleX - (r==null?0.4:r*0.3), scaleY - (r==null?0.4:r*0.3), (r==null?0.6:r*0.45), 0, Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fill();
    }
  } ctx.restore();
}
function maturityBar(dir, L, H, pct, rim){
  const barW=Math.max(44, L*0.92), barH=8, pad=6; const bx=-barW/2; const by=-H*0.95-12;
  ctx.save(); ctx.scale(1/Math.sign(dir||1),1);
  ctx.globalAlpha=0.95; ctx.fillStyle='rgba(10,18,35,0.75)';
  roundRectPath(ctx,bx-pad,by-pad,barW+pad*2,barH+pad*2,8); ctx.fill();
  ctx.globalAlpha=1; ctx.fillStyle='rgba(191,231,255,0.25)';
  roundRectPath(ctx,bx,by,barW,barH,6); ctx.fill();
  const fillW=barW*Math.max(0,Math.min(1,pct||0));
  if(fillW>0){
    const g=ctx.createLinearGradient(bx,0,bx+barW,0);
    if((pct||0)>=0.8){ g.addColorStop(0,'#89f7a1'); g.addColorStop(1,'#4caf50'); }
    else{ g.addColorStop(0,'#ff7b7b'); g.addColorStop(1,'#ff3b3b'); }
    ctx.fillStyle=g; roundRectPath(ctx,bx,by,fillW,barH,6); ctx.fill();
  }
  ctx.strokeStyle = rim||'rgba(64,139,203,0.6)'; ctx.lineWidth=1; roundRectPath(ctx,bx,by,barW,barH,6); ctx.stroke();
  ctx.restore();
}
function rarityGlow(rarity, pathFn){
  if(!rarity || !rarity.glow) return;
  ctx.save(); ctx.shadowColor = rarity.glow.color; ctx.shadowBlur = 30; ctx.globalAlpha = 0.25; ctx.fillStyle = rarity.glow.color;
  pathFn(); ctx.fill(); ctx.restore();
}
function rimLightPath(pathFn, rgba, blur){
  ctx.save();
  ctx.shadowColor = rgba||'rgba(255,255,255,0.30)'; ctx.shadowBlur = blur==null?12:blur; ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; pathFn(); ctx.fill();
  ctx.restore();
}
function translucent(alpha){ ctx.save(); ctx.globalAlpha *= (alpha==null?0.65:alpha); }
function restoreAlpha(){ ctx.restore(); }

/* ---------- species renderers (lifelike & accurate) ---------- */
function drawGuppy(f, style, rarity){
  const size=12+f.size*46, L=size*2.45, H=size*1.22, flap=Math.sin(f.wobble*2.3)*(size*0.08);

  // Enhanced flowing tail fin with rainbow iridescence
  translucent(0.70);
  ctx.save(); ctx.translate(-L*0.52,0); ctx.rotate(flap*0.025);
  const tailGrad = ctx.createRadialGradient(0,0,0,0,0,L*0.65);
  tailGrad.addColorStop(0, style.fin);
  tailGrad.addColorStop(0.4, style.fin);
  tailGrad.addColorStop(0.75, 'rgba(255,180,255,0.4)');
  tailGrad.addColorStop(1, 'rgba(100,200,255,0.2)');
  ctx.fillStyle=tailGrad; ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.quadraticCurveTo(-L*0.38,-H*1.12,-L*0.72,-H*0.12);
  ctx.quadraticCurveTo(-L*0.78,0,-L*0.72,H*0.12);
  ctx.quadraticCurveTo(-L*0.38,H*1.12,0,0); ctx.closePath(); ctx.fill();
  // Enhanced tail fin rays with shimmer
  ctx.strokeStyle='rgba(255,255,255,0.35)'; ctx.lineWidth=0.9;
  for(let i=0; i<7; i++){
    const angle = (-0.6 + i*0.2) * Math.PI*0.45;
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-L*0.60*Math.cos(angle), -L*0.60*Math.sin(angle)); ctx.stroke();
  }
  ctx.restore(); restoreAlpha();

  // Body with enhanced gradient and iridescent shimmer
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.ellipse(0,0,L*0.52,H*0.60,0,0,Math.PI*2); });
  const bodyG = ctx.createLinearGradient(0,-H*0.6,0,H*0.6);
  bodyG.addColorStop(0, style.top);
  bodyG.addColorStop(0.3, style.top);
  bodyG.addColorStop(0.7, style.belly);
  bodyG.addColorStop(1, style.belly);
  ctx.fillStyle=bodyG;
  ctx.beginPath(); ctx.ellipse(0,0,L*0.52,H*0.60,0,0,Math.PI*2); ctx.fill();

  // Iridescent spots on body
  ctx.globalAlpha=0.25;
  for(let i=0; i<15; i++){
    const spotX = (Math.random()*2-1)*L*0.35;
    const spotY = (Math.random()*2-1)*H*0.40;
    ctx.fillStyle = i%2===0 ? 'rgba(255,150,255,0.6)' : 'rgba(100,220,255,0.6)';
    ctx.beginPath(); ctx.arc(spotX, spotY, 0.5+Math.random()*1.2, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha=1;

  // Body shadow/depth
  ctx.save(); ctx.globalAlpha=0.18; ctx.fillStyle='#000000';
  ctx.beginPath(); ctx.ellipse(0,H*0.22,L*0.46,H*0.28,0,0,Math.PI*2); ctx.fill(); ctx.restore();

  // Enhanced dorsal and ventral fins
  translucent(0.78);
  const finGrad = ctx.createLinearGradient(0,-H*0.55,0,0);
  finGrad.addColorStop(0, style.fin);
  finGrad.addColorStop(0.5, 'rgba(255,180,255,0.5)');
  finGrad.addColorStop(1, 'rgba(255,255,255,0.3)');
  ctx.fillStyle=finGrad;
  ctx.beginPath(); ctx.moveTo(-L*0.02,-H*0.50);
  ctx.quadraticCurveTo(L*0.14,-H*0.88 + flap, L*0.28,-H*0.20);
  ctx.quadraticCurveTo(L*0.02,-H*0.18,-L*0.02,-H*0.50); ctx.fill();

  const finGrad2 = ctx.createLinearGradient(0,H*0.55,0,0);
  finGrad2.addColorStop(0, style.fin);
  finGrad2.addColorStop(0.5, 'rgba(100,220,255,0.5)');
  finGrad2.addColorStop(1, 'rgba(255,255,255,0.3)');
  ctx.fillStyle=finGrad2;
  ctx.beginPath(); ctx.moveTo(0,H*0.42);
  ctx.quadraticCurveTo(L*0.20,H*0.80 + flap, L*0.26,H*0.20);
  ctx.quadraticCurveTo(L*0.02,H*0.22,0,H*0.42); ctx.fill(); restoreAlpha();

  scales(L,H,0.96,0.24,1.3); specular(L*0.14,-H*0.09,H*0.54,0.65);
  eye(L*0.32,-H*0.11, Math.max(2.5,size*0.115));
  return {L,H};
}

function drawGoldfish(f, style, rarity){
  const size=12+f.size*46, L=size*2.55, H=size*1.28, flap=Math.sin(f.wobble*2.0)*(size*0.06);

  // Elegant tail fin with golden gradient
  translucent(0.7); ctx.save(); ctx.translate(-L*0.48,0); ctx.rotate(flap*0.018);
  const tailGrad = ctx.createRadialGradient(0,0,0,0,0,L*0.5);
  tailGrad.addColorStop(0, style.fin); tailGrad.addColorStop(0.6, style.fin);
  tailGrad.addColorStop(1, 'rgba(255,255,220,0.4)');
  ctx.fillStyle=tailGrad; ctx.beginPath();
  ctx.moveTo(0,0);
  ctx.quadraticCurveTo(-L*0.22,-H*0.72,-L*0.52,-H*0.12);
  ctx.quadraticCurveTo(-L*0.60,0,-L*0.52,H*0.12);
  ctx.quadraticCurveTo(-L*0.22,H*0.72,0,0); ctx.fill();
  // Tail fin structure
  ctx.beginPath(); ctx.moveTo(-L*0.52, -H*0.12); ctx.lineTo(-L*0.52, H*0.12);
  ctx.strokeStyle='rgba(255,255,255,0.45)'; ctx.lineWidth=1.2; ctx.stroke();
  ctx.strokeStyle='rgba(255,200,100,0.3)'; ctx.lineWidth=0.6;
  for(let i=-3; i<=3; i++){
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-L*0.48, i*H*0.04); ctx.stroke();
  }
  ctx.restore(); restoreAlpha();

  // Plump body with metallic sheen
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.ellipse(0,0,L*0.56,H*0.64,0,0,Math.PI*2); });
  ctx.fillStyle=bodyGrad(style.top, style.belly, H);
  ctx.beginPath(); ctx.ellipse(0,0,L*0.54,H*0.62,0,0,Math.PI*2); ctx.fill();
  // Depth shadow
  ctx.save(); ctx.globalAlpha=0.18; ctx.fillStyle='#000000';
  ctx.beginPath(); ctx.ellipse(-L*0.05,H*0.22,L*0.42,H*0.28,0,0,Math.PI*2); ctx.fill(); ctx.restore();

  // Flowing dorsal fin
  translucent(0.8);
  const dorsalGrad = ctx.createLinearGradient(0,-H*0.7,L*0.2,-H*0.2);
  dorsalGrad.addColorStop(0, style.fin); dorsalGrad.addColorStop(1, 'rgba(255,240,200,0.5)');
  ctx.fillStyle=dorsalGrad;
  ctx.beginPath(); ctx.moveTo(-L*0.04,-H*0.50);
  ctx.quadraticCurveTo(L*0.10,-H*0.96 + flap, L*0.24,-H*0.22);
  ctx.quadraticCurveTo(0,-H*0.18,-L*0.04,-H*0.50); ctx.fill(); restoreAlpha();

  // Metallic speckles for goldfish shimmer
  ctx.globalAlpha=0.28; ctx.fillStyle='#fff8d0';
  ctx.shadowColor='rgba(255,230,150,0.5)'; ctx.shadowBlur=3;
  for(let i=0;i<28;i++){
    const px = (Math.random()*2-1)*L*0.36;
    const py = (Math.random()*2-1)*H*0.46;
    ctx.beginPath(); ctx.arc(px, py, 0.8 + Math.random()*0.8, 0, Math.PI*2); ctx.fill();
  }
  ctx.shadowBlur=0; ctx.globalAlpha=1;

  scales(L,H,0.88,0.16,1.4);
  specular(L*0.14,-H*0.10,H*0.56,0.65);
  eye(L*0.30,-H*0.12, Math.max(2.4,size*0.11));
  return {L,H};
}

function drawSquid(f, style, rarity){
  const size=12+f.size*46, L=size*2.45, H=size*1.28, sway=Math.sin(f.wobble*1.6)*6;
  // ARMS behind the mantle
  ctx.save(); ctx.strokeStyle='rgba(200,220,255,0.80)'; ctx.lineWidth=2;
  for(let i=0;i<8;i++){
    const spread = -0.22 + i*0.06, phase = i*0.7;
    ctx.beginPath();
    ctx.moveTo(-L*0.02, H*0.06 + Math.sin(f.wobble+phase)*H*0.03);
    ctx.quadraticCurveTo(-L*0.20 - Math.abs(sway)*0.01, H*(0.20+spread),
                         -L*(0.50+0.08*Math.sin(f.wobble+phase)), H*(0.28+spread));
    ctx.stroke();
  }
  for(let i=0;i<2;i++){
    const spread = i? 0.16 : -0.16, phase = 2+i;
    ctx.beginPath();
    ctx.moveTo(-L*0.02, H*0.04);
    ctx.bezierCurveTo(-L*0.24, H*(0.10+spread), -L*0.46, H*(0.18+spread*1.2),
                      -L*(0.72+0.06*Math.sin(f.wobble+phase)), H*(0.22+spread));
    ctx.stroke();
  }
  ctx.restore();

  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.ellipse(0,0,L*0.52,H*0.72,0,0,Math.PI*2); });
  ctx.fillStyle=bodyGrad(style.top, style.belly, H);
  ctx.beginPath(); ctx.ellipse(0,0,L*0.50,H*0.70,0,0,Math.PI*2); ctx.fill();

  translucent(0.85); ctx.fillStyle=style.fin;
  ctx.beginPath(); ctx.moveTo(-L*0.10,-H*0.40);
  ctx.quadraticCurveTo(0,-H*0.78 + sway*0.01,L*0.10,-H*0.40);
  ctx.quadraticCurveTo(0,-H*0.28,-L*0.10,-H*0.40); ctx.fill(); restoreAlpha();

  eye(L*0.06,-H*0.06, size*0.10, 0.5);
  return {L,H};
}

function drawKoi(f, style, rarity){
  const size=12+f.size*46, L=size*2.8, H=size*1.12, flap=Math.sin(f.wobble*1.7)*(size*0.06);

  // Flowing koi tail with gradient
  translucent(0.72); ctx.save(); ctx.translate(-L*0.52,0); ctx.rotate(flap*0.02);
  const koiTailGrad = ctx.createRadialGradient(0,0,0,-L*0.3,0,L*0.4);
  koiTailGrad.addColorStop(0, style.fin); koiTailGrad.addColorStop(0.8, style.fin);
  koiTailGrad.addColorStop(1, 'rgba(255,220,220,0.3)');
  ctx.fillStyle=koiTailGrad; ctx.beginPath();
  ctx.moveTo(0,0); ctx.quadraticCurveTo(-L*0.28,-H*0.66,-L*0.52,0);
  ctx.quadraticCurveTo(-L*0.28,H*0.66,0,0); ctx.fill();
  // Tail fin rays
  ctx.strokeStyle='rgba(255,255,255,0.3)'; ctx.lineWidth=0.8;
  for(let i=-2; i<=2; i++){
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-L*0.45, i*H*0.15); ctx.stroke();
  }
  ctx.restore(); restoreAlpha();

  // Elegant koi body
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.ellipse(0,0,L*0.52,H*0.60,0,0,Math.PI*2); });
  ctx.fillStyle=bodyGrad(style.top, style.belly, H);
  ctx.beginPath(); ctx.ellipse(0,0,L*0.50,H*0.56,0,0,Math.PI*2); ctx.fill();
  // Subtle depth shadow
  ctx.save(); ctx.globalAlpha=0.12; ctx.fillStyle='#000000';
  ctx.beginPath(); ctx.ellipse(0,H*0.18,L*0.42,H*0.22,0,0,Math.PI*2); ctx.fill(); ctx.restore();

  // Traditional koi pattern spots with better blending
  const patternSeed = f.seed || 0;
  for(let i=0;i<7;i++){
    const r=Math.sin(patternSeed + i*0.7) * 0.5 + 0.5;
    const px=(r*2-1)*L*0.28, py=((r*1.6-0.8) + Math.cos(patternSeed + i)*0.2)*H*0.46;
    const pw=L*(0.14+(r*0.16)), ph=H*(0.24+(r*0.14));
    ctx.globalAlpha=0.85;
    ctx.fillStyle = (i%3===0)? '#e84440' : (i%3===1)? '#2a2a2a' : '#d6773a';
    ctx.shadowColor = (i%3===0)? 'rgba(232,68,64,0.3)' : 'rgba(0,0,0,0.2)';
    ctx.shadowBlur=4;
    ctx.beginPath(); ctx.ellipse(px,py,pw*0.5,ph*0.5,(r*Math.PI*0.5),0,Math.PI*2); ctx.fill();
  }
  ctx.shadowBlur=0; ctx.globalAlpha=1;

  // Koi whisker-like barbels
  ctx.strokeStyle='#444'; ctx.lineWidth=1.6; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(L*0.38, H*0.02); ctx.quadraticCurveTo(L*0.52,H*0.12, L*0.58, H*0.02); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L*0.38,-H*0.02); ctx.quadraticCurveTo(L*0.52,-H*0.12, L*0.58,-H*0.02); ctx.stroke();

  scales(L,H,0.86,0.15,1.3);
  specular(L*0.10,-H*0.08,H*0.50,0.58);
  eye(L*0.32,-H*0.12, Math.max(2.5,size*0.115));
  return {L,H};
}

function drawAngelfish(f, style, rarity){
  const size=12+f.size*46, L=size*2.30, H=size*1.82;

  // Majestic triangular body with rich gradient
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.moveTo(L*0.40,0); ctx.quadraticCurveTo(L*0.10,-H*0.92,-L*0.30,0); ctx.quadraticCurveTo(L*0.10,H*0.92,L*0.40,0); });
  const angelGrad = ctx.createLinearGradient(L*0.3,-H*0.6,L*0.3,H*0.6);
  angelGrad.addColorStop(0, style.top); angelGrad.addColorStop(0.5, style.top);
  angelGrad.addColorStop(1, style.belly);
  ctx.fillStyle=angelGrad;
  ctx.beginPath(); ctx.moveTo(L*0.40,0); ctx.quadraticCurveTo(L*0.10,-H*0.92,-L*0.30,0);
  ctx.quadraticCurveTo(L*0.10,H*0.92,L*0.40,0); ctx.fill();

  // Long flowing fins with gradient
  translucent(0.80);
  const finTopGrad = ctx.createLinearGradient(0,-H*0.9,L*0.2,-H*0.1);
  finTopGrad.addColorStop(0, style.fin); finTopGrad.addColorStop(0.7, style.fin);
  finTopGrad.addColorStop(1, 'rgba(255,255,255,0.2)');
  ctx.strokeStyle=finTopGrad; ctx.lineWidth=3.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(-L*0.04,-H*0.86);
  ctx.quadraticCurveTo(L*0.05,-H*1.24, L*0.27,-H*0.08); ctx.stroke();

  const finBotGrad = ctx.createLinearGradient(0,H*0.9,L*0.2,H*0.1);
  finBotGrad.addColorStop(0, style.fin); finBotGrad.addColorStop(0.7, style.fin);
  finBotGrad.addColorStop(1, 'rgba(255,255,255,0.2)');
  ctx.strokeStyle=finBotGrad;
  ctx.beginPath(); ctx.moveTo(-L*0.04, H*0.86);
  ctx.quadraticCurveTo(L*0.05, H*1.24, L*0.27, H*0.08); ctx.stroke(); restoreAlpha();

  // Vertical stripe pattern characteristic of angelfish
  ctx.globalAlpha=0.32; ctx.fillStyle='#0b1220';
  for(let i=-1;i<=1;i++){
    ctx.save();
    const stripeGrad = ctx.createLinearGradient(i*L*0.10,-H*0.7,i*L*0.10,H*0.7);
    stripeGrad.addColorStop(0, 'rgba(11,18,32,0.1)'); stripeGrad.addColorStop(0.3, 'rgba(11,18,32,0.35)');
    stripeGrad.addColorStop(0.7, 'rgba(11,18,32,0.35)'); stripeGrad.addColorStop(1, 'rgba(11,18,32,0.1)');
    ctx.fillStyle=stripeGrad;
    ctx.beginPath(); ctx.ellipse(i*L*0.12,0,L*0.20,H*0.76,Math.PI/10,0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
  ctx.globalAlpha=1;

  // Subtle shimmer on body
  ctx.save(); ctx.globalAlpha=0.18; ctx.fillStyle='rgba(255,255,255,0.8)';
  ctx.beginPath(); ctx.ellipse(L*0.08,-H*0.15,L*0.25,H*0.40,0.2,0,Math.PI*2); ctx.fill();
  ctx.restore();

  specular(L*0.12,-H*0.12,H*0.48,0.55);
  eye(L*0.28,-H*0.16, Math.max(2.2,size*0.105));
  return {L,H};
}

function drawDiscus(f, style, rarity){
  const size=12+f.size*46, L=size*2.0, H=size*1.95;
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.ellipse(0,0,L*0.48,H*0.86,0,0,Math.PI*2); });
  ctx.fillStyle=bodyGrad(style.top, style.belly, H);
  ctx.beginPath(); ctx.ellipse(0,0,L*0.47,H*0.86,0,0,Math.PI*2); ctx.fill();

  ctx.globalAlpha=1; ctx.strokeStyle='rgba(11,18,32,0.30)'; ctx.lineWidth=2;
  for(let y=-H*0.36;y<=H*0.36;y+=H*0.12){ ctx.beginPath();
    for(let x=-L*0.43;x<=L*0.43;x+=L*0.08){ const off=Math.sin((x+y)*0.09 + (f.seed%100))*4; ctx.lineTo(x,y+off); }
    ctx.stroke();
  }
  eye(L*0.22,-H*0.12, Math.max(1.9,size*0.095));
  return {L,H};
}

function drawEel(f, style, rarity){
  const size=12+f.size*46, L=size*3.4, H=size*0.95;
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.rect(-L*0.5,-H*0.6, L, H*1.2); });
  ctx.fillStyle=bodyGrad(style.top, style.belly, H);
  ctx.beginPath();
  ctx.moveTo(L*0.46,0);
  ctx.quadraticCurveTo(L*0.20,-H*0.95,-L*0.30,-H*0.08);
  ctx.quadraticCurveTo(-L*0.42,0,-L*0.30,H*0.08);
  ctx.quadraticCurveTo(L*0.20,H*0.95,L*0.46,0); ctx.closePath(); ctx.fill();

  translucent(0.6); ctx.fillStyle='rgba(255,255,255,0.33)';
  ctx.beginPath(); ctx.moveTo(-L*0.26,-H*0.46); ctx.quadraticCurveTo(L*0.06,-H*0.80, L*0.34,-H*0.18);
  ctx.quadraticCurveTo(L*0.08,-H*0.28,-L*0.26,-H*0.46); ctx.fill(); restoreAlpha();
  eye(L*0.34,-H*0.04, size*0.07);
  return {L,H};
}

function drawTurtle(f, style, rarity){
  const size=12+f.size*46, L=size*2.7, H=size*1.45;

  // rear flippers (behind shell)
  ctx.save(); translucent(0.9); ctx.fillStyle=style.fin;
  ctx.beginPath(); ctx.moveTo(-L*0.08, H*0.36);
  ctx.quadraticCurveTo(-L*0.18, H*0.56, L*0.02, H*0.42); ctx.quadraticCurveTo(-L*0.02, H*0.40, -L*0.08, H*0.36); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-L*0.08,-H*0.36);
  ctx.quadraticCurveTo(-L*0.18,-H*0.56, L*0.02,-H*0.42); ctx.quadraticCurveTo(-L*0.02,-H*0.40, -L*0.08,-H*0.36); ctx.fill();
  restoreAlpha(); ctx.restore();

  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.ellipse(0,0,L*0.54,H*0.64,0,0,Math.PI*2); });
  ctx.fillStyle=bodyGrad(style.top, style.belly, H);
  ctx.beginPath(); ctx.ellipse(0,0,L*0.54,H*0.62,0,0,Math.PI*2); ctx.fill();

  ctx.globalAlpha=0.20; ctx.strokeStyle='#1b2a1a'; ctx.lineWidth=2;
  for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.ellipse(i*L*0.10,0,L*0.16,H*0.46,0,0,Math.PI*2); ctx.stroke(); }
  for(let i=-1;i<=1;i++){ ctx.beginPath(); ctx.ellipse(0,i*H*0.20,L*0.36,H*0.18,0,0,Math.PI*2); ctx.stroke(); }
  ctx.globalAlpha=1;

  ctx.fillStyle=style.belly; ctx.beginPath(); ctx.ellipse(L*0.46,0,L*0.16,H*0.18,0,0,Math.PI*2); ctx.fill();

  ctx.fillStyle=style.fin;
  ctx.beginPath(); ctx.moveTo(L*0.05,-H*0.38);
  ctx.quadraticCurveTo(L*0.22,-H*0.70, L*0.40,-H*0.20);
  ctx.quadraticCurveTo(L*0.20,-H*0.18, L*0.05,-H*0.38); ctx.fill();
  ctx.beginPath(); ctx.moveTo(L*0.05, H*0.38);
  ctx.quadraticCurveTo(L*0.22, H*0.70, L*0.40, H*0.20);
  ctx.quadraticCurveTo(L*0.20, H*0.18, L*0.05, H*0.38); ctx.fill();
  eye(L*0.54,-H*0.02, size*0.06);
  return {L,H};
}

function drawShark(f, style, rarity){
  const size=12+f.size*46, L=size*3.2, H=size*1.18, flap=Math.sin(f.wobble*1.6)*(size*0.03);

  // Tail fin (draw first, behind body)
  translucent(0.75); ctx.save(); ctx.translate(-L*0.50,0); ctx.rotate(flap*0.02);
  ctx.fillStyle=style.fin;
  ctx.beginPath(); ctx.moveTo(0,-H*0.05); ctx.lineTo(-L*0.28,-H*0.20);
  ctx.lineTo(-L*0.24,0); ctx.lineTo(-L*0.22, H*0.18); ctx.lineTo(0,H*0.05);
  ctx.closePath(); ctx.fill();
  ctx.restore(); restoreAlpha();

  // Streamlined predator body with gradient
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.ellipse(0,0,L*0.60,H*0.64,0,0,Math.PI*2); });
  const bodyGradShark = ctx.createLinearGradient(0,-H*0.7,0,H*0.7);
  bodyGradShark.addColorStop(0, style.top);
  bodyGradShark.addColorStop(0.42, style.top);
  bodyGradShark.addColorStop(0.45, '#dae9f5');
  bodyGradShark.addColorStop(1, style.belly);
  ctx.fillStyle=bodyGradShark;
  ctx.beginPath(); ctx.moveTo(L*0.54,0);
  ctx.quadraticCurveTo(L*0.24,-H*0.70,-L*0.38,-H*0.06);
  ctx.quadraticCurveTo(-L*0.42,0,-L*0.38,H*0.06);
  ctx.quadraticCurveTo(L*0.24,H*0.70,L*0.54,0); ctx.closePath(); ctx.fill();

  // Depth shadow
  ctx.save(); ctx.globalAlpha=0.18; ctx.fillStyle='#000000';
  ctx.beginPath(); ctx.ellipse(-L*0.02,H*0.26,L*0.46,H*0.20,-0.08,0,Math.PI*2); ctx.fill(); ctx.restore();

  // Iconic dorsal fin
  translucent(0.80); ctx.fillStyle=style.fin;
  ctx.shadowColor='rgba(0,0,0,0.25)'; ctx.shadowBlur=3; ctx.shadowOffsetY=1.5;
  ctx.beginPath(); ctx.moveTo(-L*0.06,-H*0.52); ctx.lineTo(L*0.14,-H*0.94 + flap);
  ctx.lineTo(L*0.26,-H*0.24); ctx.closePath(); ctx.fill();
  ctx.shadowBlur=0; ctx.shadowOffsetY=0; restoreAlpha();

  // Pectoral fins
  translucent(0.85);
  ctx.fillStyle=style.fin;
  ctx.beginPath(); ctx.moveTo(-L*0.02, H*0.16); ctx.lineTo(L*0.24, H*0.42);
  ctx.lineTo(L*0.08, H*0.14); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-L*0.02,-H*0.16); ctx.lineTo(L*0.24,-H*0.42);
  ctx.lineTo(L*0.08,-H*0.14); ctx.closePath(); ctx.fill();
  restoreAlpha();

  // Gill slits
  ctx.strokeStyle='rgba(11,18,32,0.55)'; ctx.lineWidth=2.0;
  for(let i=0;i<5;i++){
    ctx.beginPath(); ctx.moveTo(L*0.26 - i*L*0.044, -H*0.08);
    ctx.lineTo(L*0.22 - i*L*0.044, H*0.18); ctx.stroke();
  }

  // Mouth with teeth INSIDE body silhouette
  ctx.strokeStyle='rgba(11,18,32,0.8)'; ctx.lineWidth=2.6; ctx.lineCap='round';
  ctx.beginPath();
  ctx.moveTo(L*0.42,H*0.04); ctx.quadraticCurveTo(L*0.46,H*0.14,L*0.52,H*0.06); ctx.stroke();

  // Teeth inside mouth area (not sticking out!)
  ctx.fillStyle='#f8f8f8'; ctx.shadowColor='rgba(0,0,0,0.15)'; ctx.shadowBlur=1.5;
  for(let i=0;i<6;i++){
    const tx=L*0.44 + i*L*0.012, ty=H*0.06;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx+L*0.006, ty+H*0.030);
    ctx.lineTo(tx-L*0.006, ty+H*0.030); ctx.closePath(); ctx.fill();
  }
  for(let i=0;i<6;i++){
    const tx=L*0.44 + i*L*0.012, ty=-H*0.06;
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx+L*0.006, ty-H*0.030);
    ctx.lineTo(tx-L*0.006, ty-H*0.030); ctx.closePath(); ctx.fill();
  }
  ctx.shadowBlur=0;

  specular(L*0.10,-H*0.10,H*0.62,0.52);
  eye(L*0.34,-H*0.10, Math.max(2.2,size*0.080));
  return {L,H};
}

function drawDolphin(f, style, rarity){
  const size=12+f.size*46, L=size*3.05, H=size*1.16, flap=Math.sin(f.wobble*1.5)*(size*0.02);
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.ellipse(0,0,L*0.60,H*0.66,0,0,Math.PI*2); });
  ctx.fillStyle=bodyGrad(style.top, style.belly, H);
  ctx.beginPath(); ctx.moveTo(L*0.46,0);
  ctx.quadraticCurveTo(L*0.30,-H*0.10,L*0.40,-H*0.02);
  ctx.quadraticCurveTo(L*0.52, -H*0.02, L*0.58, 0);
  ctx.quadraticCurveTo(L*0.48, H*0.02, L*0.36, H*0.03);
  ctx.quadraticCurveTo(-L*0.38, H*0.08, -L*0.40, 0);
  ctx.quadraticCurveTo(-L*0.38,-H*0.08, L*0.36, -H*0.03);
  ctx.closePath(); ctx.fill();

  translucent(0.85); ctx.fillStyle=style.fin;
  ctx.beginPath(); ctx.moveTo(-L*0.04,-H*0.54); ctx.lineTo(L*0.06,-H*0.82 + flap); ctx.lineTo(L*0.16,-H*0.22); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(-L*0.50,0); ctx.rotate(flap*0.02);
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-L*0.20,-H*0.08); ctx.lineTo(-L*0.20,H*0.08); ctx.closePath(); ctx.fill();
  ctx.restore(); restoreAlpha();

  translucent(0.9); ctx.beginPath(); ctx.moveTo(0,H*0.10); ctx.lineTo(L*0.20,H*0.24); ctx.lineTo(L*0.06,H*0.04); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0,-H*0.10); ctx.lineTo(L*0.20,-H*0.24); ctx.lineTo(L*0.06,-H*0.04); ctx.closePath(); ctx.fill(); restoreAlpha();

  eye(L*0.28,-H*0.06, size*0.070);
  return {L,H};
}

function drawOarfish(f, style, rarity){
  const size=12+f.size*46, L=size*3.7, H=size*0.92;
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.rect(-L*0.5,-H*0.6, L, H*1.3); });
  ctx.fillStyle=bodyGrad(style.top, style.belly, H);
  ctx.beginPath();
  ctx.moveTo(L*0.50,0);
  ctx.quadraticCurveTo(L*0.22,-H*0.90,-L*0.40,-H*0.05);
  ctx.quadraticCurveTo(-L*0.42,0,-L*0.40,H*0.05);
  ctx.quadraticCurveTo(L*0.22,H*0.90,L*0.50,0); ctx.closePath(); ctx.fill();

  ctx.strokeStyle=style.fin; ctx.lineWidth=3; ctx.beginPath();
  for(let x=-L*0.36;x<L*0.46;x+=L*0.12){
    ctx.moveTo(x,-H*0.56); ctx.lineTo(x+L*0.04,-H*0.82 + Math.sin(f.wobble+x*0.05)*6);
  } ctx.stroke();

  eye(L*0.32,-H*0.05, size*0.062, 0.5);
  return {L,H};
}

function drawAngler(f, style, rarity){
  const size=12+f.size*46, L=size*2.6, H=size*1.55;
  rarityGlow(rarity, function(){ ctx.beginPath(); ctx.ellipse(0,0,L*0.66,H*0.82,0,0,Math.PI*2); });
  ctx.fillStyle=bodyGrad(style.top, style.belly, H);
  ctx.beginPath(); ctx.ellipse(0,0,L*0.58,H*0.72,0,0,Math.PI*2); ctx.fill();

  ctx.strokeStyle='#0b1220'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(L*0.10,H*0.12); ctx.quadraticCurveTo(L*0.28,H*0.28,L*0.38,H*0.04); ctx.stroke();

  ctx.fillStyle='#ffffff';
  for(let i=0;i<8;i++){ const tx=L*(0.12+i*0.02), ty=H*(0.10+0.01*i);
    ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx+L*0.010, ty+H*0.05); ctx.lineTo(tx-L*0.010, ty+H*0.05); ctx.closePath(); ctx.fill();
  }
  for(let i=0;i<8;i++){ const tx=L*(0.12+i*0.02), ty=-H*(0.10+0.01*i);
    ctx.beginPath(); ctx.moveTo(tx, -ty); ctx.lineTo(tx+L*0.010, -ty-H*0.05); ctx.lineTo(tx-L*0.010, -ty-H*0.05); ctx.closePath(); ctx.fill();
  }

  // LURE in front of face
  ctx.strokeStyle='rgba(255,245,210,0.95)'; ctx.lineWidth=2; ctx.beginPath();
  ctx.moveTo(L*0.00,-H*0.34);
  ctx.quadraticCurveTo(L*0.22,-H*0.58, L*0.42,-H*0.22);
  ctx.quadraticCurveTo(L*0.46,-H*0.10, L*0.48,-H*0.06);
  ctx.stroke();
  specular(L*0.50,-H*0.06, 10, 0.95);

  eye(L*0.18,-H*0.08, size*0.082);
  return {L,H};
}

/* ---------- dispatcher & safe wrapper ---------- */
const drawerMap = {
  guppy:   drawGuppy,
  gold:    drawGoldfish,
  squid:   drawSquid,
  koi:     drawKoi,
  angel:   drawAngelfish,
  discus:  drawDiscus,
  eel:     drawEel,
  turtle:  drawTurtle,
  shark:   drawShark,
  dolphin: drawDolphin,
  oarfish: drawOarfish,
  angler:  drawAngler
};

function renderSprite(f){
  const sp = species.find(s=>s.id===f.sp);
  if (!sp) return;

  const rarity = ({COMMON:null,RARE:RARITIES[1],EPIC:RARITIES[2],LEGENDARY:RARITIES[3]})[f.rarity] || RARITIES[0];

  ctx.save();
  ctx.translate(f.x, f.y);
  ctx.scale(f.dir, 1);

  try {
    // Get the sprite image
    const sprite = fishSprites[sp.id];

    if (sprite && sprite.complete && spritesLoaded) {
      // Calculate size based on fish growth
      const baseSize = 60 + f.size * 230; // 5x original for better visibility
      const scale = (baseSize / 24) / 4; // Divide by 4 since sprites are now 4x upscaled

      const width = sprite.width * scale;
      const height = sprite.height * scale;

      // Apply rarity glow effect
      if (rarity && rarity.glow) {
        ctx.shadowColor = rarity.glow.color;
        ctx.shadowBlur = 20;
      } else {
        ctx.shadowColor = 'rgba(0,0,0,.35)';
        ctx.shadowBlur = 10;
      }

      // Draw the PNG sprite centered
      ctx.drawImage(sprite, -width / 2, -height / 2, width, height);

      // Calculate dimensions for maturity bar
      const L = width * 0.8;
      const H = height * 0.8;

      var rim = (rarity && rarity.glow && rarity.glow.rim) ? rarity.glow.rim : 'rgba(64,139,203,0.6)';
      maturityBar(f.dir, L, H, f.size, rim);
    } else {
      // Fallback: draw a simple colored circle if sprites not loaded
      const size = 12 + f.size * 46;
      ctx.fillStyle = '#4da6ff';
      ctx.beginPath();
      ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  } catch(err) {
    console.error('Sprite render error for', sp && sp.id, err);
  }
  ctx.restore();
}

/* ---- Render Predator ---- */
function renderPredator(pred, predData){
  ctx.save();
  ctx.translate(predData.x, predData.y);
  ctx.scale(predData.dir, 1);

  // Predators are larger than regular fish
  const size = 60 + (predData.level * 10); // Size increases with level

  // Draw predator icon with glow effect
  ctx.shadowColor = 'rgba(255, 100, 100, 0.6)';
  ctx.shadowBlur = 20;

  ctx.font = `${size}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(pred.icon, 0, 0);

  // Add level badge (counter-flip the text so it's always readable)
  ctx.scale(predData.dir, 1); // Counter the parent flip
  ctx.shadowBlur = 0;
  ctx.font = '12px Arial';
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  const badgeText = `Lv${predData.level}`;
  ctx.strokeText(badgeText, 0, size/2 + 8);
  ctx.fillText(badgeText, 0, size/2 + 8);

  ctx.restore();
}

/* ---- Background: base (per-tank) ---- */
// Stable background decorations (generated once per background type)
// Store as percentages (0-1) instead of absolute positions
const bgDecoCache = {};
function getStableDecor(bgId, count, seed=0){
  const key = `${bgId}_${count}_${seed}`;
  if(bgDecoCache[key]) return bgDecoCache[key];

  // Use seeded random for stable positions
  const seededRandom = (i) => {
    const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };

  const decor = [];
  for(let i=0; i<count; i++){
    decor.push({
      xPct: seededRandom(i * 2),           // 0-1 percentage
      yPct: seededRandom(i * 2 + 1),       // 0-1 percentage
      sizeFactor: seededRandom(i * 3),     // 0-1 factor
      hue: seededRandom(i * 4) * 360,
      offset: seededRandom(i * 5) * 100
    });
  }
  bgDecoCache[key] = decor;
  return decor;
}

function drawBackgroundBase(){
  const t = currentTank(); if(!t) return;
  const id = t.backgroundId || 'default';
  const time = Date.now() * 0.001;

  switch(id){
    case 'default': {
      // Enhanced layered blue gradient with depth
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#6fb3ff');
      g.addColorStop(0.25,'#4da6ff');
      g.addColorStop(0.6,'#2b7fcc');
      g.addColorStop(0.85,'#1a5c99');
      g.addColorStop(1,'#002b66');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Enhanced sandy bottom with realistic texture
      const sandBase = viewH * 0.82;

      // Sand layers with depth
      const sandGrad = ctx.createLinearGradient(0, sandBase, 0, viewH);
      sandGrad.addColorStop(0, '#d4b890');
      sandGrad.addColorStop(0.3, '#c2a875');
      sandGrad.addColorStop(0.7, '#b59965');
      sandGrad.addColorStop(1, '#a08855');
      ctx.fillStyle = sandGrad;
      ctx.fillRect(0, sandBase, viewW, viewH - sandBase);

      // Sand ripples and texture
      const ripples = getStableDecor('default_sand', 15, 999);
      ctx.save();
      ctx.globalAlpha = 0.2;
      ripples.forEach((ripple, i) => {
        const y = sandBase + ripple.yPct * (viewH - sandBase) * 0.6;
        const x = ripple.xPct * viewW;
        const width = 60 + ripple.sizeFactor * 100;

        ctx.fillStyle = i % 2 ? 'rgba(220,200,170,0.5)' : 'rgba(180,150,120,0.5)';
        ctx.beginPath();
        ctx.ellipse(x, y, width, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Small pebbles on sand
      const pebbles = getStableDecor('default_pebbles', 8, 888);
      pebbles.forEach(pebble => {
        const x = pebble.xPct * viewW;
        const y = sandBase + pebble.yPct * (viewH - sandBase) * 0.5;
        const r = 3 + pebble.sizeFactor * 5;

        ctx.fillStyle = `hsl(${30 + pebble.hue * 0.1}, 25%, 40%)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Highlight on pebble
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add pixel art decorations
      if (bgDecorationsLoaded) {
        const decoItems = getStableDecor('default_deco', 10, 777);
        decoItems.forEach((deco, i) => {
          const x = deco.xPct * viewW;
          const y = sandBase + deco.yPct * (viewH - sandBase) * 0.7;
          const scale = 0.8 + deco.sizeFactor * 1.2;

          // Rotate between different decoration types
          const decoType = i % 6;
          let sprite, w = 32, h = 32;

          if (decoType === 0 && bgDecoSprites.coral1?.complete) {
            sprite = bgDecoSprites.coral1;
          } else if (decoType === 1 && bgDecoSprites.coral2?.complete) {
            sprite = bgDecoSprites.coral2;
          } else if (decoType === 2 && bgDecoSprites.clam?.complete) {
            sprite = bgDecoSprites.clam;
            w = 24; h = 20;
          } else if (decoType === 3 && bgDecoSprites.starfish?.complete) {
            sprite = bgDecoSprites.starfish;
            w = 16; h = 16;
          } else if (decoType === 4 && bgDecoSprites.sanddollar?.complete) {
            sprite = bgDecoSprites.sanddollar;
            w = 16; h = 16;
          } else if (decoType === 5 && bgDecoSprites.anemone?.complete) {
            sprite = bgDecoSprites.anemone;
            w = 16; h = 24;
          }

          if (sprite) {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.drawImage(sprite, x - (w * scale) / 2, y - (h * scale) / 2, w * scale, h * scale);
            ctx.restore();
          }
        });
      }
      break;
    }

    case 'deepsea': {
      // Deep dark gradient
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#001f33');
      g.addColorStop(0.6,'#000f1a');
      g.addColorStop(1,'#000a0f');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Stable rock formations
      const rocks = getStableDecor('deepsea', 4, 123);
      ctx.fillStyle='rgba(0,0,0,0.5)';
      rocks.forEach(rock => {
        const x = rock.xPct * viewW * 0.6 + viewW * 0.2;
        const y = viewH * 0.75;
        const w = viewW * 0.3;
        const h = rock.sizeFactor * 50 + 20;
        ctx.beginPath();
        ctx.moveTo(x,viewH);
        ctx.quadraticCurveTo(x+w*0.4, y, x+w, viewH);
        ctx.closePath();
        ctx.fill();
      });
      break;
    }

    case 'coral': {
      // Enhanced coral reef with vibrant colors
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#3d8a9e');
      g.addColorStop(0.4,'#2f6d7a');
      g.addColorStop(0.75,'#1a4550');
      g.addColorStop(1,'#10333a');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Sandy bottom with coral debris
      ctx.fillStyle='rgba(200,180,140,0.2)';
      ctx.fillRect(0, viewH * 0.88, viewW, viewH * 0.12);

      // Large coral formations (background layer)
      const largeCoral = getStableDecor('coral_large', 5, 456);
      largeCoral.forEach(coral => {
        const x = coral.xPct * viewW;
        const y = viewH * 0.88;
        const w = 80 + coral.sizeFactor * 100;
        const h = 60 + coral.sizeFactor * 80;

        // Base coral structure (brown/tan)
        ctx.fillStyle = `hsl(${25 + coral.hue * 0.1}, 35%, 30%)`;
        ctx.beginPath();
        ctx.ellipse(x, y, w * 0.6, h * 0.5, 0, 0, Math.PI, false);
        ctx.fill();

        // Coral polyps (colorful)
        const coralColors = [
          { h: 340, s: 65, l: 55 }, // Pink
          { h: 30, s: 75, l: 50 },  // Orange
          { h: 280, s: 60, l: 50 }, // Purple
          { h: 180, s: 50, l: 45 }  // Teal
        ];
        const colorPalette = coralColors[Math.floor(coral.hue * 4 / 360)];

        // Multiple coral heads
        for (let i = 0; i < 4; i++) {
          const offsetX = (i - 1.5) * (w * 0.3);
          const polyp = getStableDecor(`coral_polyp_${coral.offset}_${i}`, 1, i * 7)[0];

          ctx.save();
          ctx.globalAlpha = 0.85;

          // Main polyp body
          ctx.fillStyle = `hsl(${colorPalette.h + polyp.hue * 0.1}, ${colorPalette.s}%, ${colorPalette.l}%)`;
          ctx.beginPath();
          ctx.ellipse(x + offsetX, y - h * 0.3, w * 0.15, h * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Tentacles/branches
          ctx.strokeStyle = `hsl(${colorPalette.h + polyp.hue * 0.1}, ${colorPalette.s - 10}%, ${colorPalette.l + 10}%)`;
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';

          for (let j = 0; j < 5; j++) {
            const angle = (j / 5) * Math.PI - Math.PI * 0.5;
            const length = h * 0.2 * (0.7 + polyp.sizeFactor * 0.6);
            ctx.beginPath();
            ctx.moveTo(x + offsetX, y - h * 0.5);
            ctx.lineTo(
              x + offsetX + Math.cos(angle) * length,
              y - h * 0.5 + Math.sin(angle) * length
            );
            ctx.stroke();
          }

          // Highlight
          ctx.globalAlpha = 0.4;
          ctx.fillStyle = `hsl(${colorPalette.h}, ${colorPalette.s}%, ${colorPalette.l + 25}%)`;
          ctx.beginPath();
          ctx.ellipse(x + offsetX - w * 0.05, y - h * 0.4, w * 0.08, h * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // Small coral clusters (foreground)
      const smallCoral = getStableDecor('coral_small', 12, 789);
      smallCoral.forEach(coral => {
        const x = coral.xPct * viewW;
        const y = viewH * 0.90 + coral.yPct * (viewH * 0.08);
        const r = 8 + coral.sizeFactor * 15;

        // Brain coral or round coral
        ctx.fillStyle = `hsl(${150 + coral.hue * 0.3}, 45%, 35%)`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();

        // Texture lines
        ctx.strokeStyle = `hsl(${150 + coral.hue * 0.3}, 45%, 25%)`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(x, y, r * (0.3 + i * 0.25), 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Add pixel art coral decorations for visual variety
      if (bgDecorationsLoaded) {
        const coralSprites = getStableDecor('coral_sprites', 8, 445);
        coralSprites.forEach((deco, i) => {
          const x = deco.xPct * viewW;
          const y = viewH * 0.85 + deco.yPct * (viewH * 0.13);
          const scale = 1.5 + deco.sizeFactor * 2.0;

          const spriteType = i % 4;
          let sprite, w = 32, h = 32;

          if (spriteType === 0 && bgDecoSprites.brainCoral?.complete) {
            sprite = bgDecoSprites.brainCoral;
            w = 16; h = 16;
          } else if (spriteType === 1 && bgDecoSprites.coralTall?.complete) {
            sprite = bgDecoSprites.coralTall;
            w = 24; h = 48;
          } else if (spriteType === 2 && bgDecoSprites.coralPink?.complete) {
            sprite = bgDecoSprites.coralPink;
            w = 16; h = 32;
          } else if (spriteType === 3 && bgDecoSprites.coralWide?.complete) {
            sprite = bgDecoSprites.coralWide;
            w = 48; h = 32;
          }

          if (sprite) {
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.drawImage(sprite, x - (w * scale) / 2, y - h * scale, w * scale, h * scale);
            ctx.restore();
          }
        });
      }
      break;
    }

    case 'kelp': {
      // Kelp forest ambiance
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#1a472a');
      g.addColorStop(0.6,'#0f3820');
      g.addColorStop(1,'#002b1a');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Animated kelp strands (stable positions)
      const kelps = getStableDecor('kelp', 10, 789);
      ctx.save();
      ctx.strokeStyle='rgba(46,140,90,0.6)';
      ctx.lineWidth=8;
      ctx.lineCap='round';

      kelps.forEach((kelp, i) => {
        const x = kelp.xPct * viewW;
        const base = viewH * 0.95;
        const height = viewH * 0.5 + kelp.sizeFactor * 50;

        ctx.beginPath();
        for(let s=0; s<=8; s++){
          const k = s / 8;
          const yy = base - height * k;
          const sway = Math.sin(k * 2 + time * 0.5 + kelp.offset) * 20 * (1 - k);
          const xx = x + sway;
          if(s === 0) ctx.moveTo(xx, base);
          else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      });
      ctx.restore();

      // Add pixel art seaweed and seahorse decorations
      if (bgDecorationsLoaded) {
        const kelpSprites = getStableDecor('kelp_sprites', 6, 665);
        kelpSprites.forEach((deco, i) => {
          const x = deco.xPct * viewW;
          const y = viewH * 0.85 + deco.yPct * (viewH * 0.10);
          const scale = 1.2 + deco.sizeFactor * 1.5;

          const spriteType = i % 3;
          let sprite, w = 16, h = 24;

          if (spriteType === 0 && bgDecoSprites.grass?.complete) {
            sprite = bgDecoSprites.grass;
            w = 16; h = 24;
          } else if (spriteType === 1 && bgDecoSprites.seaweed?.complete) {
            sprite = bgDecoSprites.seaweed;
            w = 16; h = 32;
          } else if (spriteType === 2 && bgDecoSprites.seahorse?.complete) {
            sprite = bgDecoSprites.seahorse;
            w = 16; h = 32;
          }

          if (sprite) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.drawImage(sprite, x - (w * scale) / 2, y - h * scale, w * scale, h * scale);
            ctx.restore();
          }
        });
      }
      break;
    }

    case 'lagoon': {
      // Tropical lagoon
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#66ffe0');
      g.addColorStop(0.5,'#33ccbb');
      g.addColorStop(1,'#006666');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Sandy dunes (stable)
      ctx.fillStyle='rgba(240,220,150,0.4)';
      for(let i=0; i<4; i++){
        const y = viewH * (0.80 + i * 0.05);
        ctx.beginPath();
        ctx.moveTo(-50, y);
        ctx.quadraticCurveTo(viewW * 0.25, y - 10, viewW * 0.5, y + 5);
        ctx.quadraticCurveTo(viewW * 0.75, y, viewW + 50, y + 10);
        ctx.lineTo(viewW + 50, viewH);
        ctx.lineTo(-50, viewH);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'night': {
      // Enhanced night ocean with atmospheric depth
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#0a1929');
      g.addColorStop(0.3,'#001f3f');
      g.addColorStop(0.7,'#001020');
      g.addColorStop(1,'#000000');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Realistic moon with craters
      ctx.save();
      const moonX = viewW * 0.75;
      const moonY = viewH * 0.15;
      const moonR = 80;

      // Moon glow/halo
      ctx.globalCompositeOperation='screen';
      const moonHalo = ctx.createRadialGradient(moonX, moonY, moonR * 0.5, moonX, moonY, moonR * 2);
      moonHalo.addColorStop(0, 'rgba(220,230,255,0.15)');
      moonHalo.addColorStop(0.5, 'rgba(200,220,255,0.08)');
      moonHalo.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = moonHalo;
      ctx.fillRect(moonX - moonR * 2, moonY - moonR * 2, moonR * 4, moonR * 4);

      // Moon body
      ctx.globalCompositeOperation='source-over';
      const moonGrad = ctx.createRadialGradient(
        moonX - moonR * 0.3, moonY - moonR * 0.3, 0,
        moonX, moonY, moonR
      );
      moonGrad.addColorStop(0, 'rgba(255,255,245,0.95)');
      moonGrad.addColorStop(0.7, 'rgba(230,235,245,0.9)');
      moonGrad.addColorStop(1, 'rgba(200,210,230,0.85)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // Moon craters
      const craters = getStableDecor('moon_craters', 8, 555);
      craters.forEach(crater => {
        const dx = (crater.xPct - 0.5) * moonR * 1.6;
        const dy = (crater.yPct - 0.5) * moonR * 1.6;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < moonR * 0.85) {
          const cx = moonX + dx;
          const cy = moonY + dy;
          const cr = 5 + crater.sizeFactor * 15;

          // Crater shadow
          ctx.fillStyle = 'rgba(180,185,200,0.4)';
          ctx.beginPath();
          ctx.arc(cx, cy, cr, 0, Math.PI * 2);
          ctx.fill();

          // Crater highlight rim
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(cx - cr * 0.1, cy - cr * 0.1, cr * 0.9, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Enhanced starfield with varying sizes and brightness
      ctx.globalCompositeOperation='screen';

      // Large distant stars
      const stars = getStableDecor('night_stars', 40, 111);
      stars.forEach(star => {
        const y = star.yPct * viewH;
        if(y < viewH * 0.45){ // Only in upper portion
          const x = star.xPct * viewW;
          const twinkle = Math.sin(time * (1.5 + star.offset * 0.01) + star.offset) * 0.4 + 0.6;
          const size = star.sizeFactor > 0.7 ? 3 : (star.sizeFactor > 0.4 ? 2 : 1);

          // Star color (slight variation)
          const starHue = 200 + star.hue * 0.15;
          ctx.fillStyle = `hsla(${starHue}, 30%, 95%, ${twinkle})`;

          if (size > 2) {
            // Large star with cross effect
            ctx.globalAlpha = twinkle;
            ctx.fillRect(x - 1, y - 1, 3, 3);
            ctx.fillRect(x - 2, y, 1, 1);
            ctx.fillRect(x + 2, y, 1, 1);
            ctx.fillRect(x, y - 2, 1, 1);
            ctx.fillRect(x, y + 2, 1, 1);
          } else {
            ctx.globalAlpha = twinkle * 0.9;
            ctx.fillRect(x, y, size, size);
          }
        }
      });

      // Milky Way effect (faint)
      ctx.globalAlpha = 0.08;
      const milkyWayGrad = ctx.createLinearGradient(0, 0, viewW, viewH * 0.4);
      milkyWayGrad.addColorStop(0, 'rgba(200,220,255,0)');
      milkyWayGrad.addColorStop(0.5, 'rgba(220,230,255,0.8)');
      milkyWayGrad.addColorStop(1, 'rgba(200,220,255,0)');
      ctx.fillStyle = milkyWayGrad;
      ctx.fillRect(0, 0, viewW, viewH * 0.4);

      ctx.restore();

      // Dark seabed with moonlight reflection
      ctx.fillStyle = 'rgba(10,20,40,0.6)';
      ctx.fillRect(0, viewH * 0.85, viewW, viewH * 0.15);

      // Moonlight on water (shimmering path)
      ctx.save();
      ctx.globalCompositeOperation = 'lighten';
      ctx.globalAlpha = 0.1;
      const shimmer = Math.sin(time * 0.8) * 0.5 + 0.5;
      const pathGrad = ctx.createLinearGradient(moonX - 100, moonY, moonX - 50, viewH);
      pathGrad.addColorStop(0, 'rgba(220,230,255,0)');
      pathGrad.addColorStop(0.3, `rgba(220,230,255,${0.3 * shimmer})`);
      pathGrad.addColorStop(1, 'rgba(220,230,255,0)');
      ctx.fillStyle = pathGrad;
      ctx.fillRect(moonX - 150, moonY, 200, viewH - moonY);
      ctx.restore();

      // Add glowing jellyfish for atmosphere
      if (bgDecorationsLoaded) {
        const nightJellies = getStableDecor('night_jellies', 5, 111);
        nightJellies.forEach((jelly, i) => {
          const x = jelly.xPct * viewW;
          const yBase = viewH * 0.3 + jelly.yPct * (viewH * 0.5);
          const bob = Math.sin(time * 0.5 + jelly.offset * 0.1) * 15;
          const y = yBase + bob;
          const scale = 1.0 + jelly.sizeFactor * 1.5;

          if (bgDecoSprites.jellyGlow?.complete) {
            ctx.save();
            // Add glow effect
            ctx.shadowColor = 'rgba(150,220,255,0.6)';
            ctx.shadowBlur = 25;
            ctx.globalAlpha = 0.6 + Math.sin(time + jelly.offset) * 0.2;
            ctx.drawImage(bgDecoSprites.jellyGlow, x - 8 * scale, y - 8 * scale, 16 * scale, 16 * scale);
            ctx.restore();
          }
        });
      }
      break;
    }

    case 'sunset': {
      // Warm sunset
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#ff9966');
      g.addColorStop(0.3,'#ff7733');
      g.addColorStop(0.7,'#cc4400');
      g.addColorStop(1,'#660000');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Warm glow at top
      const glowGrad = ctx.createRadialGradient(viewW * 0.5, 0, 0, viewW * 0.5, 0, viewH * 0.5);
      glowGrad.addColorStop(0, 'rgba(255,220,160,0.3)');
      glowGrad.addColorStop(1, 'rgba(255,220,160,0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, viewW, viewH * 0.5);
      break;
    }

    case 'volcano': {
      // Volcanic darkness
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#2f1b0c');
      g.addColorStop(0.7,'#1a0f06');
      g.addColorStop(1,'#0a0502');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Volcanic rock (stable)
      ctx.fillStyle='rgba(20,10,6,0.9)';
      ctx.beginPath();
      ctx.moveTo(-50, viewH);
      ctx.quadraticCurveTo(viewW * 0.3, viewH * 0.75, viewW * 0.6, viewH);
      ctx.lineTo(-50, viewH);
      ctx.fill();

      // Lava glow
      ctx.save();
      ctx.globalCompositeOperation='screen';
      const lavaX = viewW * 0.35;
      const lavaY = viewH * 0.86;
      const pulse = Math.sin(time * 1.5) * 0.2 + 0.8;

      const lavaGrad = ctx.createRadialGradient(lavaX, lavaY, 10, lavaX, lavaY, 100);
      lavaGrad.addColorStop(0, `rgba(255,120,20,${0.6 * pulse})`);
      lavaGrad.addColorStop(0.5, `rgba(255,80,10,${0.3 * pulse})`);
      lavaGrad.addColorStop(1, 'rgba(255,120,20,0)');
      ctx.fillStyle = lavaGrad;
      ctx.beginPath();
      ctx.arc(lavaX, lavaY, 100, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      break;
    }

    case 'ice': {
      // Icy cavern
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#e6f7ff');
      g.addColorStop(0.4,'#99d6ff');
      g.addColorStop(1,'#00334d');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Ice stalactites (stable)
      const icicles = getStableDecor('ice', 12, 222);
      ctx.fillStyle='rgba(255,255,255,0.4)';
      icicles.forEach(icicle => {
        const x = icicle.xPct * viewW;
        const h = icicle.sizeFactor * 50 + 30;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 10, 0);
        ctx.lineTo(x + 5, h);
        ctx.closePath();
        ctx.fill();

        // Ice shine
        ctx.fillStyle='rgba(255,255,255,0.7)';
        ctx.fillRect(x + 2, 0, 2, h * 0.4);
        ctx.fillStyle='rgba(255,255,255,0.4)';
      });

      // Add penguin decorations for arctic theme
      if (bgDecorationsLoaded) {
        const icePenguins = getStableDecor('ice_penguins', 4, 333);
        icePenguins.forEach((penguin, i) => {
          const x = penguin.xPct * viewW;
          const y = viewH * 0.7 + penguin.yPct * (viewH * 0.25);
          const scale = 1.2 + penguin.sizeFactor * 1.0;
          const swim = Math.sin(time * 2 + penguin.offset) * 20;

          // Alternate between two penguin sprites
          const sprite = (i % 2 === 0 && bgDecoSprites.penguin1?.complete)
            ? bgDecoSprites.penguin1
            : bgDecoSprites.penguin2?.complete
              ? bgDecoSprites.penguin2
              : null;

          if (sprite) {
            ctx.save();
            ctx.globalAlpha = 0.8;
            ctx.drawImage(sprite, x + swim - 8 * scale, y - 8 * scale, 16 * scale, 16 * scale);
            ctx.restore();
          }
        });
      }
      break;
    }

    case 'fantasy': {
      // Magical fantasy
      const g=ctx.createLinearGradient(0,0,0,viewH);
      g.addColorStop(0,'#a64dff');
      g.addColorStop(0.5,'#7733cc');
      g.addColorStop(1,'#1a0033');
      ctx.fillStyle=g;
      ctx.fillRect(0,0,viewW,viewH);

      // Bioluminescent plants (stable)
      const plants = getStableDecor('fantasy', 10, 333);
      ctx.save();
      ctx.globalCompositeOperation='screen';

      plants.forEach(plant => {
        const x = plant.xPct * viewW;
        const y = viewH * 0.88;
        const hue = 180 + plant.hue * 0.4;
        const glow = Math.sin(time * 1.2 + plant.offset * 0.1) * 0.3 + 0.7;

        const plantGrad = ctx.createRadialGradient(x, y - 20, 5, x, y - 20, 70);
        plantGrad.addColorStop(0, `hsla(${hue},80%,70%,${0.7 * glow})`);
        plantGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = plantGrad;
        ctx.beginPath();
        ctx.arc(x, y - 20, 70, 0, Math.PI * 2);
        ctx.fill();

        // Plant stem
        ctx.fillStyle = `hsla(${hue},60%,50%,0.3)`;
        ctx.fillRect(x - 3, y - 40, 6, 40);
      });
      ctx.restore();

      // Add bioluminescent jellyfish for fantasy atmosphere
      if (bgDecorationsLoaded) {
        const fantasyJellies = getStableDecor('fantasy_jellies', 8, 444);
        fantasyJellies.forEach((jelly, i) => {
          const x = jelly.xPct * viewW;
          const yBase = viewH * 0.2 + jelly.yPct * (viewH * 0.6);
          const bob = Math.sin(time * 0.8 + jelly.offset * 0.15) * 25;
          const y = yBase + bob;
          const scale = 0.8 + jelly.sizeFactor * 1.5;
          const hue = 180 + jelly.hue * 0.5;

          // Choose jellyfish size
          let sprite, w = 16, h = 16;
          const jellyType = i % 3;
          if (jellyType === 0 && bgDecoSprites.jellyLarge?.complete) {
            sprite = bgDecoSprites.jellyLarge;
            w = 32; h = 48;
          } else if (jellyType === 1 && bgDecoSprites.jellyMedium?.complete) {
            sprite = bgDecoSprites.jellyMedium;
            w = 24; h = 32;
          } else if (jellyType === 2 && bgDecoSprites.jellyTiny?.complete) {
            sprite = bgDecoSprites.jellyTiny;
            w = 16; h = 16;
          }

          if (sprite) {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            // Pulsing glow effect
            ctx.shadowColor = `hsla(${hue}, 80%, 70%, 0.8)`;
            ctx.shadowBlur = 30 * (0.7 + Math.sin(time * 2 + jelly.offset) * 0.3);
            ctx.globalAlpha = 0.7 + Math.sin(time * 1.5 + jelly.offset * 0.2) * 0.3;
            ctx.drawImage(sprite, x - (w * scale) / 2, y - (h * scale) / 2, w * scale, h * scale);
            ctx.restore();
          }
        });
      }
      break;
    }
  }

  // Seabed vignette (applies to all)
  const grd2 = ctx.createLinearGradient(0, viewH*0.7, 0, viewH);
  grd2.addColorStop(0, 'rgba(20,34,60,0)');
  grd2.addColorStop(1, 'rgba(20,34,60,0.75)');
  ctx.fillStyle = grd2;
  ctx.fillRect(0, viewH*0.7, viewW, viewH*0.3);
}

/* ---- Background Effects: rays + caustics + bubbles ---- */
function drawBackgroundEffects(){
  const tMs = Date.now(); const t = tMs * 0.001;
  const intensity = state.settings?.intensity ?? 1;

  // Light shafts
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const rayCount = 5;
  for(let i=0;i<rayCount;i++){
    const drift = (t*0.05 + i*0.18) % 1;
    const cx = drift * (viewW + viewW*0.25) - viewW*0.125;
    const angle = -0.18 + Math.sin(t*0.7 + i)*0.05;
    const topY = -viewH*0.05; const h = viewH*0.95;
    const topW = viewW * (0.10 + (i%2?0.02:0)); const botW = topW*0.35;

    const grad = ctx.createRadialGradient(cx, topY + h*0.2, topW*0.15, cx, topY + h*0.2, topW*0.6);
    grad.addColorStop(0,`rgba(180,220,255,${0.20*intensity})`); grad.addColorStop(1,'rgba(180,220,255,0.0)');

    ctx.save(); ctx.translate(cx, topY); ctx.rotate(angle);
    ctx.fillStyle=grad; ctx.globalAlpha=0.8;
    ctx.beginPath(); ctx.moveTo(-topW/2,0); ctx.lineTo(topW/2,0); ctx.lineTo(botW/2,h); ctx.lineTo(-botW/2,h); ctx.closePath(); ctx.fill();

    const vgrad = ctx.createLinearGradient(0,0,0,h);
    vgrad.addColorStop(0.00, `rgba(255,255,255,${0.35*intensity})`);
    vgrad.addColorStop(0.35, `rgba(255,255,255,${0.15*intensity})`);
    vgrad.addColorStop(0.80, `rgba(255,255,255,${0.03*intensity})`);
    vgrad.addColorStop(1.00, 'rgba(255,255,255,0.00)');
    ctx.fillStyle = vgrad; ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // Caustics
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const yStart = viewH*0.68, yEnd = viewH*0.98, rowH = 22, colW = 28;
  for(let y=yStart; y<yEnd; y+=rowH){
    for(let x=0; x<viewW; x+=colW){
      const n = Math.sin(x*0.045 + t*2.0) * Math.cos(y*0.08 - t*1.6);
      let a = Math.max(0, n*0.5 + 0.5) * (0.18*(state.settings?.intensity ?? 1));
      a *= 0.8 * (1 - (y - yStart) / (yEnd - yStart));
      if(a < 0.01) continue;
      ctx.fillStyle = `rgba(180,220,255,${a.toFixed(3)})`;
      const w = colW * (0.6 + Math.sin(t + x*0.03 + y*0.02)*0.2);
      ctx.fillRect(x, y, w, 3);
    }
  }
  ctx.restore();

  // Bubbles
  for(let i=0;i<12;i++){
    const x = (tMs*0.03 + i*120) % (viewW+60) - 30;
    const y = viewH - ((tMs*0.06 + i*240) % (viewH+60));
    ctx.globalAlpha = 0.25*(state.settings?.intensity ?? 1);
    ctx.beginPath(); ctx.arc(x, y, 2 + (i%3), 0, Math.PI*2);
    ctx.fillStyle = '#bfe7ff'; ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Volcano extra bubbles
  const tnk = currentTank();
  if(tnk && tnk.backgroundId==='volcano'){
    ctx.save();
    const baseX=viewW*0.35, baseY=viewH*0.86;
    for(let i=0;i<8;i++){
      const p=(tMs*0.12 + i*80) % (viewH*0.4);
      const x=baseX + Math.sin((t+i)*2)*8;
      const y=baseY - p*0.4;
      ctx.globalAlpha = 0.2*(state.settings?.intensity ?? 1); ctx.beginPath(); ctx.arc(x,y,2+(i%3),0,Math.PI*2); ctx.fillStyle='#ffb36b'; ctx.fill();
    }
    ctx.restore();
  }
}

/* ---- Equipment Visualization ---- */
function drawEquipment() {
  const t = currentTank();
  if (!t || !t.items) return;

  const time = Date.now() * 0.001;

  // Auto Feeder (top right corner)
  const feederLevel = t.items.feeder || 0;
  if (feederLevel > 0) {
    const x = viewW - 80;
    const y = 40;
    const size = 40 + feederLevel * 2;

    ctx.save();
    // Feeder box
    ctx.fillStyle = 'rgba(100, 120, 140, 0.8)';
    ctx.strokeStyle = 'rgba(150, 170, 190, 0.9)';
    ctx.lineWidth = 2;
    ctx.fillRect(x - size/2, y - size/2, size, size);
    ctx.strokeRect(x - size/2, y - size/2, size, size);

    // Feeder hopper/funnel
    ctx.fillStyle = 'rgba(120, 140, 160, 0.85)';
    ctx.beginPath();
    ctx.moveTo(x - size/3, y + size/2);
    ctx.lineTo(x + size/3, y + size/2);
    ctx.lineTo(x + size/6, y + size);
    ctx.lineTo(x - size/6, y + size);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Food particles falling (animated)
    if (feederLevel >= 5) {
      ctx.fillStyle = 'rgba(255, 200, 100, 0.7)';
      for (let i = 0; i < Math.min(feederLevel / 3, 8); i++) {
        const offset = (time * 80 + i * 30) % 120;
        const px = x + Math.sin(time + i) * 8;
        const py = y + size + offset;
        if (py < viewH - 100) {
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Level indicator
    ctx.fillStyle = 'rgba(100, 255, 100, 0.3)';
    const fillHeight = (size * 0.8) * (feederLevel / 25);
    ctx.fillRect(x - size/2 + 4, y + size/2 - fillHeight - 4, size - 8, fillHeight);

    ctx.restore();
  }

  // Bio Filter (top left corner)
  const filterLevel = t.items.filter || 0;
  if (filterLevel > 0) {
    const x = 80;
    const y = 40;
    const size = 45 + filterLevel * 1.5;

    ctx.save();
    // Filter housing
    ctx.fillStyle = 'rgba(60, 80, 100, 0.8)';
    ctx.strokeStyle = 'rgba(100, 140, 180, 0.9)';
    ctx.lineWidth = 2;
    ctx.fillRect(x - size/2, y - size/2, size, size * 1.2);
    ctx.strokeRect(x - size/2, y - size/2, size, size * 1.2);

    // Filter grille lines
    ctx.strokeStyle = 'rgba(120, 160, 200, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const gy = y - size/2 + (size * 1.2 * i / 5);
      ctx.beginPath();
      ctx.moveTo(x - size/2 + 5, gy);
      ctx.lineTo(x + size/2 - 5, gy);
      ctx.stroke();
    }

    // Bubbles from filter
    if (filterLevel >= 3) {
      ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
      for (let i = 0; i < Math.min(filterLevel / 2, 10); i++) {
        const offset = (time * 60 + i * 25) % 100;
        const bx = x + Math.sin(time * 2 + i) * 15;
        const by = y + size * 0.6 + offset;
        if (by < viewH - 100) {
          ctx.beginPath();
          ctx.arc(bx, by, 1.5 + Math.sin(time + i) * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Power indicator light
    const pulse = Math.sin(time * 3) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(100, 255, 150, ${pulse * 0.8})`;
    ctx.beginPath();
    ctx.arc(x + size/2 - 8, y - size/2 + 8, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Heater (left side, vertical)
  const heaterLevel = t.items.heater || 0;
  if (heaterLevel > 0) {
    const x = 50;
    const y = viewH * 0.5;
    const width = 15 + heaterLevel * 0.5;
    const height = 80 + heaterLevel * 3;

    ctx.save();
    // Heater tube
    ctx.fillStyle = 'rgba(180, 40, 40, 0.7)';
    ctx.strokeStyle = 'rgba(220, 80, 80, 0.9)';
    ctx.lineWidth = 2;
    ctx.fillRect(x - width/2, y - height/2, width, height);
    ctx.strokeRect(x - width/2, y - height/2, width, height);

    // Heating coil visualization
    ctx.strokeStyle = 'rgba(255, 150, 100, 0.8)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const cy = y - height/2 + height * (i + 0.5) / 5;
      ctx.beginPath();
      ctx.moveTo(x - width/2 + 3, cy);
      ctx.lineTo(x + width/2 - 3, cy);
      ctx.stroke();
    }

    // Heat waves rising
    if (heaterLevel >= 5) {
      ctx.strokeStyle = 'rgba(255, 200, 100, 0.3)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 3; i++) {
        const waveOffset = (time * 50 + i * 30) % 80;
        const wy = y - height/2 - waveOffset;
        if (wy > 60) {
          ctx.beginPath();
          ctx.moveTo(x - 5, wy);
          ctx.quadraticCurveTo(x + Math.sin(time * 2 + i) * 8, wy - 15, x - 5, wy - 30);
          ctx.stroke();
        }
      }
    }

    // Temperature indicator
    const tempPct = Math.min(heaterLevel / 25, 1);
    ctx.fillStyle = `rgba(255, ${255 - tempPct * 155}, 0, 0.4)`;
    const tempHeight = height * 0.8 * tempPct;
    ctx.fillRect(x - width/2 + 2, y + height/2 - tempHeight - 2, width - 4, tempHeight);

    ctx.restore();
  }

  // Coral Decoration (bottom, scattered)
  const coralLevel = t.items.coral || 0;
  if (coralLevel > 0) {
    const corals = getStableDecor('equipment_coral', Math.min(coralLevel, 15), 777);

    ctx.save();
    corals.forEach((coral, i) => {
      if (i >= coralLevel / 2) return; // Show more corals as level increases

      const x = coral.xPct * viewW * 0.8 + viewW * 0.1;
      const y = viewH * 0.88 + coral.yPct * (viewH * 0.08);
      const size = 15 + coral.sizeFactor * 25 + (coralLevel / 25) * 10;

      // Coral colors - vibrant decorative pieces
      const hue = (coral.hue + i * 40) % 360;
      const colors = {
        main: `hsl(${hue}, 70%, 50%)`,
        light: `hsl(${hue}, 70%, 65%)`,
        dark: `hsl(${hue}, 70%, 35%)`
      };

      // Base
      ctx.fillStyle = colors.dark;
      ctx.beginPath();
      ctx.ellipse(x, y + size * 0.1, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Main coral structure
      ctx.fillStyle = colors.main;
      ctx.beginPath();
      ctx.ellipse(x, y - size * 0.3, size * 0.5, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Branches
      ctx.strokeStyle = colors.light;
      ctx.lineWidth = 2 + coralLevel / 10;
      ctx.lineCap = 'round';

      for (let b = 0; b < 4; b++) {
        const angle = (b / 4) * Math.PI * 2 - Math.PI / 2;
        const branchLen = size * (0.4 + coral.sizeFactor * 0.3);
        ctx.beginPath();
        ctx.moveTo(x, y - size * 0.3);
        ctx.lineTo(
          x + Math.cos(angle) * branchLen,
          y - size * 0.3 + Math.sin(angle) * branchLen
        );
        ctx.stroke();
      }

      // Highlight
      ctx.fillStyle = colors.light;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.ellipse(x - size * 0.15, y - size * 0.45, size * 0.25, size * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    ctx.restore();
  }
}

/* ---- Interaction ---- */
canvas.addEventListener('click', (e)=>{
  const t=currentTank(); if(!t) return;
  const rect=canvas.getBoundingClientRect(); const x=e.clientX-rect.left; const y=e.clientY-rect.top;
  for(let i=t.fish.length-1;i>=0;i--){ const f=t.fish[i];
    const size=10+f.size*40; const L=size*2.6; const H=size*1.2;
    const minX=f.x-L*0.6, maxX=f.x+L*0.6, minY=f.y-H*0.7, maxY=f.y+H*0.7;
    if(x>=minX && x<=maxX && y>=minY && y<=maxY){ sellFishById(f.id, f.size<0.4?' (juvenile)':''); return; }
  }
});
document.getElementById('sellMature').onclick=sellMatureFish;
document.getElementById('saveBtn').onclick=save;
document.getElementById('resetBtn').onclick=hardReset;
document.getElementById('clearLog').onclick=logClear;
document.getElementById('toggleLog').onclick = ()=>{ logPanel.classList.toggle('hidden'); };
settingsBtn.onclick = ()=>{ settingsOverlay.classList.add('show'); syncSettingsUIFromState(); };
closeSettings.onclick = ()=>{ settingsOverlay.classList.remove('show'); save(); };
settingsOverlay.addEventListener('click', (e)=>{ if(e.target===settingsOverlay) settingsOverlay.classList.remove('show'); });

// Stats modal
function updateStatsDisplay(){
  // Update play time
  const totalMs = state.stats.totalPlayTime + (Date.now() - state.stats.sessionStart);
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMins = Math.floor((totalMs % 3600000) / 60000);
  document.getElementById('statPlayTime').textContent = `${totalHours}h ${totalMins}m`;

  const sessionMs = Date.now() - state.stats.sessionStart;
  const sessionMins = Math.floor(sessionMs / 60000);
  const sessionSecs = Math.floor((sessionMs % 60000) / 1000);
  document.getElementById('statSessionTime').textContent = `${sessionMins}m ${sessionSecs}s`;

  // Update other stats
  document.getElementById('statLifetimeCoins').textContent = fmt(state.stats.lifetimeCoins);
  document.getElementById('statFishSold').textContent = fmt(state.stats.lifetimeFishSold);
  document.getElementById('statFishBought').textContent = fmt(state.stats.lifetimeFishBought);
  document.getElementById('statPrestigeCount').textContent = fmt(state.stats.prestigeCount);
  document.getElementById('statBestSale').textContent = fmt(state.stats.mostValuableSale);
  document.getElementById('statRarestFish').textContent = state.stats.rarestFish;
}
statsBtn.onclick = ()=>{
  updateStatsDisplay();
  statsOverlay.classList.add('show');
};
closeStats.onclick = ()=>{ statsOverlay.classList.remove('show'); };
statsOverlay.addEventListener('click', (e)=>{ if(e.target===statsOverlay) statsOverlay.classList.remove('show'); });

// Achievement system
function showToast(achievement){
  playSFX('achievement'); // Play achievement sound

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toastIcon">${achievement.icon}</span>
    <div class="toastTitle">${achievement.name}</div>
    <div class="toastDesc">${achievement.desc}</div>
  `;
  toastContainer.appendChild(toast);

  // Auto-dismiss after 5 seconds
  setTimeout(()=>{
    toast.classList.add('fadeOut');
    setTimeout(()=>toast.remove(), 300);
  }, 5000);

  // Click to dismiss
  toast.onclick = ()=>{
    toast.classList.add('fadeOut');
    setTimeout(()=>toast.remove(), 300);
  };
}

function checkAchievements(){
  for(const ach of achievements){
    if(!state.achievements[ach.id] && ach.check()){
      state.achievements[ach.id] = Date.now(); // timestamp when unlocked
      showToast(ach);
      log(`🏆 Achievement Unlocked: ${ach.name}!`);
      save();
    }
  }
}

document.addEventListener('keydown',(e)=>{
  if(e.key==='s'||e.key==='S') sellMatureFish();
  if(e.key==='1') setSection('fish');
  if(e.key==='2') setSection('tanks');
  if(e.key==='3') setSection('items');
  if(e.key==='4') setSection('backgrounds');
  if(e.key==='5') setSection('achievements');
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); save(); }
});
function setSection(sectionName){
  // Close all sections first
  document.querySelectorAll('.accordionSection').forEach(s=>s.classList.remove('active'));
  // Open requested section
  const section = document.querySelector(`.accordionSection[data-section="${sectionName}"]`);
  if(section){
    section.classList.add('active');
    activeSection = sectionName;
    renderShop();
  }
}
tankSelectEl.addEventListener('change', ()=>{ state.activeTankUid = Number(tankSelectEl.value); refreshStats(); applyTankBackground(); renderShop(); updateAmbientForActiveTank(); });

/* ---- Sim Loop, FPS cap & Automations ---- */
let lastFrame=Date.now();
let lastDrawMs=0;
let autoTimer=0;
function tick(){
  const now=Date.now(); const dt=(now-lastFrame)/1000; lastFrame=now;
  simulateAll(Math.min(dt,0.05));
  updateCoinParticles(dt); // Update coin particle animations

  const cap = state.settings?.fpsCap||0;
  if(cap>0){
    const need = 1000/cap;
    if(now - lastDrawMs < need){ requestAnimationFrame(tick); return; }
    lastDrawMs = now;
  }

  ctx.clearRect(0,0,viewW,viewH);
  drawBackgroundBase();
  drawPlantLayer(plantsBack, Date.now()*0.001);
  drawBackgroundEffects();
  drawEquipment();

  const t=currentTank();
  if(t){
    // Draw prey fish
    for(const f of t.fish) renderSprite(f);

    // Draw predators
    if(t.predators){
      predators.forEach(pred=>{
        const predData = t.predators[pred.id];
        if(predData && predData.level > 0){
          // Initialize predator position if not exist
          if(!predData.x){
            predData.x = rnd(100, viewW - 100);
            predData.y = rnd(100, viewH - 150);
            predData.vx = rnd(20, 40) * (Math.random() < 0.5 ? 1 : -1);
            predData.vy = rnd(-15, 15);
            predData.dir = predData.vx > 0 ? 1 : -1;
            predData.wobble = Math.random() * Math.PI * 2;
          }
          renderPredator(pred, predData);
        }
      });
    }
  }

  drawForeground();
  drawCoinParticles(); // Draw coin particles on top of everything
  requestAnimationFrame(tick);
}
function simulateAll(dt){
  autoTimer += dt;
  for(const t of state.tanks){
    const gMult=growthMultiplier(t);
    for(const f of t.fish){
      const sp=species.find(s=>s.id===f.sp);
      f.age+=dt; f.size=clamp(f.size + sp.growth*gMult*dt*debugSpeedMultiplier, 0, 1);
      f.wobble += dt*2; f.vy += Math.sin(f.wobble)*2*dt; f.x += f.vx*dt; f.y += f.vy*dt;
      if(f.x<50){f.x=50; f.vx=Math.abs(f.vx); f.dir=1;}
      if(f.x>viewW-50){f.x=viewW-50; f.vx=-Math.abs(f.vx); f.dir=-1;}
      if(f.y<60){f.y=60; f.vy+=10*dt;}
      if(f.y>viewH-140){f.y=viewH-140; f.vy-=10*dt;}
      if(Math.random()<0.01) f.vx += rnd(-10,10);
      if(Math.random()<0.01) f.vy += rnd(-10,10);
      f.vx = clamp(f.vx,-60,60); f.vy = clamp(f.vy,-40,40); f.dir = f.vx>=0?1:-1;
    }

    // Simulate predator movement and hunting
    if(t.predators){
      predators.forEach(pred=>{
        const p = t.predators[pred.id];
        if(p && p.level > 0 && p.x !== undefined){

          if(p.hunting && p.targetFish){
            // Check if target fish still exists in the tank AND is still mature
            const stillExists = t.fish.find(f => f.id === p.targetFish.id);

            if(!stillExists || stillExists.size < 0.8){
              // Target was killed by player or is no longer mature - find a new target
              const newPreyIndex = t.fish.findIndex(f=>f.sp===pred.prey && f.size>=0.8);
              if(newPreyIndex !== -1){
                // Found new prey, switch target
                p.targetFish = t.fish[newPreyIndex];
                p.targetIndex = newPreyIndex;
              } else {
                // No more prey available, stop hunting
                p.hunting = false;
                p.targetFish = null;
                p.targetIndex = null;
                p.lastHunt = Date.now();
              }
              return; // Skip this frame
            }

            // Hunting behavior - chase the target fish
            const target = p.targetFish;
            const dx = target.x - p.x;
            const dy = target.y - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Check if close enough to catch (within 40 pixels)
            if(distance < 40){
              // Double-check fish still exists AND is mature before killing
              const finalCheck = t.fish.findIndex(f => f.id === target.id);
              const fishToKill = t.fish[finalCheck];
              if(finalCheck === -1 || !fishToKill || fishToKill.size < 0.8){
                // Fish disappeared or is not mature, abort
                p.hunting = false;
                p.targetFish = null;
                p.targetIndex = null;
                return;
              }

              // Kill the fish!
              const sp = species.find(s=>s.id===target.sp);
              const rar = RARITIES.find(r=>r.key===target.rarity) || RARITIES[0];
              const value = Math.floor(fishValue(t, sp, target.size, rar));

              // Remove the fish
              t.fish.splice(finalCheck, 1);
              state.coins += value;
              state.stats.lifetimeCoins += value;
              state.stats.lifetimeFishSold++;

              // Track predator stats
              state.stats.predatorKills = (state.stats.predatorKills || 0) + 1;
              state.stats.predatorEarnings = (state.stats.predatorEarnings || 0) + value;

              // Play sound effect
              playSFX('sellFish');

              // Check achievements
              checkAchievements();

              // Log and update UI
              if(t.uid === state.activeTankUid){
                // Spawn coin particles at kill location for active tank
                spawnCoinParticles(target.x, target.y, value);
                log(`${pred.icon} ${pred.name} hunted a ${sp.name} for ${fmt(value)}.`);
                refreshStats();
                renderShop();
              } else {
                // Spawn coins from tank selector for non-active tanks
                const tankSelectEl = document.getElementById('tankSelect');
                const rect = tankSelectEl.getBoundingClientRect();
                spawnCoinParticles(rect.left + rect.width/2 - canvas.getBoundingClientRect().left,
                                   rect.top + rect.height - canvas.getBoundingClientRect().top,
                                   value);
              }

              // Reset hunting state
              p.hunting = false;
              p.targetFish = null;
              p.targetIndex = null;
              p.lastHunt = Date.now();
            } else {
              // Chase the target - move MUCH faster when hunting
              const speed = 300; // Very fast hunting speed!
              p.vx = (dx / distance) * speed;
              p.vy = (dy / distance) * speed;
              p.x += p.vx * dt;
              p.y += p.vy * dt;
              p.dir = p.vx >= 0 ? 1 : -1;
            }
          } else {
            // Normal patrol behavior
            p.wobble = (p.wobble || 0) + dt * 1.5;
            p.vy += Math.sin(p.wobble) * 1.5 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Boundary checks
            if(p.x < 70){ p.x = 70; p.vx = Math.abs(p.vx); p.dir = 1; }
            if(p.x > viewW - 70){ p.x = viewW - 70; p.vx = -Math.abs(p.vx); p.dir = -1; }
            if(p.y < 80){ p.y = 80; p.vy += 8 * dt; }
            if(p.y > viewH - 160){ p.y = viewH - 160; p.vy -= 8 * dt; }

            // Random direction changes (less frequent than fish)
            if(Math.random() < 0.005) p.vx += rnd(-8, 8);
            if(Math.random() < 0.005) p.vy += rnd(-8, 8);

            p.vx = clamp(p.vx, -50, 50);
            p.vy = clamp(p.vy, -30, 30);
            p.dir = p.vx >= 0 ? 1 : -1;
          }
        }
      });
    }
  }

  // Automations every 0.5s
  if(autoTimer >= 0.5){ runAutomations(); autoTimer = 0; }
}
function runAutomations(){
  for(const t of state.tanks){
    const a = t.automation || (t.automation = { autoSell:false, autoBuy:false, mode:'smart', target:'guppy', reserve:0 });

    if(a.autoSell && t.fish.length){
      let sold=0, coins=0;
      for(let i=t.fish.length-1;i>=0;i--){
        const f=t.fish[i];
        if(f.size>=0.8){
          const sp=species.find(s=>s.id===f.sp);
          const rar = RARITIES.find(r=>r.key===f.rarity) || RARITIES[0];
          coins += Math.floor(fishValue(t, sp, f.size, rar));
          t.fish.splice(i,1); sold++;
        }
      }
      if(sold){
        state.coins += coins;
        if(t.uid===state.activeTankUid){
          refreshStats();
          renderShop();
        } else {
          // Spawn coins from tank selector for non-active tanks
          const tankSelectEl = document.getElementById('tankSelect');
          const rect = tankSelectEl.getBoundingClientRect();
          spawnCoinParticles(rect.left + rect.width/2 - canvas.getBoundingClientRect().left,
                             rect.top + rect.height - canvas.getBoundingClientRect().top,
                             coins);
        }
        log(`${t.name}: Auto-sold ${sold} mature fish for ${fmt(coins)}.`);
      }
    }

    if(a.autoBuy){
      let bought = 0;
      const cheapest = Math.min(...species.map(s=>s.cost));
      const byCostDesc = [...species].sort((A,B)=>B.cost - A.cost);

      while(t.fish.length < totalCapacity(t)){
        const budget = state.coins - (a.reserve||0);
        if(budget < cheapest) break;

        let sp;
        if(a.mode === 'smart'){
          sp = byCostDesc.find(s=>s.cost <= budget);
          if(!sp) break;
        } else {
          sp = species.find(s=>s.id===a.target) || species[0];
          if(sp.cost > budget) break;
        }

        state.coins -= sp.cost;
        const dir = Math.random()<0.5?1:-1;
        const rarity = rollRarity();
        t.fish.push({
          id: Math.random().toString(36).slice(2),
          sp: sp.id,
          rarity: rarity.key,
          x: rnd(80, viewW-80),
          y: rnd(80, viewH-140),
          dir,
          size: 0.18,
          age: 0,
          vx: rnd(15,45) * dir,
          vy: rnd(-10,10),
          wobble: Math.random()*Math.PI*2,
          seed: Math.floor(Math.random()*2**31)
        });
        bought++;
        if(bought > 60) break;
      }
      if(bought){ if(t.uid===state.activeTankUid){ refreshStats(); renderShop(); } log(`${t.name}: Auto-bought ${bought} fish${a.mode==='smart'?' (smart)':''}.`); }
    }

    // Predator automation - initiate hunt for mature prey fish
    if(t.predators){
      const now = Date.now();
      predators.forEach(pred=>{
        const predData = t.predators[pred.id];
        if(!predData || predData.level === 0) return; // Skip inactive predators

        // Skip if already hunting
        if(predData.hunting) return;

        const levelData = predatorLevels[predData.level - 1];
        const intervalMs = levelData.interval * 1000;

        // Check if enough time has passed
        if(now - predData.lastHunt < intervalMs) return;

        // Find mature prey fish
        const preyIndex = t.fish.findIndex(f=>f.sp===pred.prey && f.size>=0.8);
        if(preyIndex === -1) return; // No mature prey available

        // Start hunting animation
        const targetFish = t.fish[preyIndex];
        predData.hunting = true;
        predData.targetFish = targetFish;
        predData.targetIndex = preyIndex;
      });
    }
  }
}

/* ---- Offline progress (all tanks) ---- */
function applyOfflineProgressAll(){
  const now=Date.now();
  for(const t of state.tanks){
    const elapsed=Math.max(0, Math.min(60*60*1000*8, now - (t.lastTick||now))); // cap 8h per tank
    if(elapsed<15000){ t.lastTick=now; continue; }
    const secs=elapsed/1000; const gMult=growthMultiplier(t);
    let matured=0;
    for(const f of t.fish){
      const sp=species.find(s=>s.id===f.sp);
      f.size = clamp(f.size + sp.growth*gMult*secs*debugSpeedMultiplier, 0, 1);
      if(f.size>=0.8) matured++;
    }
    log(`${t.name}: while away (${(secs/3600).toFixed(2)}h), ${matured} fish matured.`);
    t.lastTick=now;
  }
}

/* ---- Auto-save ---- */
setInterval(()=>save(), 10000);

/* ---- Tank background frame ---- */
function applyTankBackground(){
  const t=currentTank(); if(!t) return;
  const tt=getTankType(t.typeId);
  const tankDiv=canvas.parentElement;
  tankDiv.style.background = `
    radial-gradient(1200px 700px at 50% 0%, ${tt.bg}, rgba(4,10,18,.8)),
    linear-gradient(180deg, rgba(20,34,60,.65), rgba(10,18,35,.95))
  `;
}

/* ========== Ambient Audio (WebAudio, procedural music) ========== */
const audio = { ctx:null, gain:null, current:{nodes:[], stop:()=>{}}, enabled:false };
function initAudio(){
  if(audio.ctx) return true;
  try{
    audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
    audio.gain = audio.ctx.createGain();
    audio.gain.gain.value = state.settings.musicVolume ?? 0;
    audio.gain.connect(audio.ctx.destination);
    return true;
  }catch(e){ console.warn('Audio init failed', e); return false; }
}

// Create gentle water ambience (not harsh static)
function makeWaterBuffer(ctx, seconds=4){
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(2, len, ctx.sampleRate);

  for(let channel=0; channel<2; channel++){
    const data = buf.getChannelData(channel);
    for(let i=0; i<len; i++){
      // Gentle filtered noise with wave-like modulation
      const t = i / ctx.sampleRate;
      const wave = Math.sin(t * 0.5) * 0.5 + 0.5;
      const noise = (Math.random() * 2 - 1) * 0.08 * wave;
      data[i] = noise;
    }
  }
  return buf;
}

/* ========== Sound Effects (Synthesized) ========== */
const soundEffects = {
  // Bubble "bloop" for buying fish
  buyFish: (ctx, gainNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(gainNode);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  },

  // Cash register "cha-ching" for selling fish
  sellFish: (ctx, gainNode) => {
    const times = [0, 0.05, 0.1];
    const freqs = [800, 1200, 1000];
    times.forEach((time, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freqs[i], ctx.currentTime + time);
      gain.gain.setValueAtTime(0.12, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + 0.15);
      osc.connect(gain);
      gain.connect(gainNode);
      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + 0.15);
    });
  },

  // Power-up ascending arpeggio for upgrades
  upgrade: (ctx, gainNode) => {
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.15);
      osc.connect(gain);
      gain.connect(gainNode);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.15);
    });
  },

  // Dramatic fanfare for prestige
  prestige: (ctx, gainNode) => {
    // Main chord
    const chord = [523.25, 659.25, 783.99]; // C E G
    chord.forEach(freq => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(gainNode);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.8);
    });
    // Top note flourish
    setTimeout(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.50, ctx.currentTime); // C6
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(gainNode);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    }, 300);
  },

  // Sparkle/chime for achievement
  achievement: (ctx, gainNode) => {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.06 + 0.4);
      osc.connect(gain);
      gain.connect(gainNode);
      osc.start(ctx.currentTime + i * 0.06);
      osc.stop(ctx.currentTime + i * 0.06 + 0.4);
    });
  },

  // Soft click for UI
  click: (ctx, gainNode) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(gainNode);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.05);
  },

  // Special shimmer for rare fish
  rareFish: (ctx, gainNode) => {
    for (let i = 0; i < 5; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000 + Math.random() * 500, ctx.currentTime + i * 0.05);
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.05 + 0.3);
      osc.connect(gain);
      gain.connect(gainNode);
      osc.start(ctx.currentTime + i * 0.05);
      osc.stop(ctx.currentTime + i * 0.05 + 0.3);
    }
  },

  // Water splash for fish drop
  splash: (ctx, gainNode) => {
    // Initial impact - sharp noise burst
    const noiseGain = ctx.createGain();
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    noise.connect(noiseGain);
    noiseGain.connect(gainNode);
    noise.start(ctx.currentTime);

    // Water ripple - descending tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
    oscGain.gain.setValueAtTime(0.1, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.connect(oscGain);
    oscGain.connect(gainNode);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  }
};

// Play a sound effect
function playSFX(effect){
  if(state.settings.sfxVolume === 0) return;

  // Initialize audio context if needed (for SFX)
  if(!audio.ctx){
    if(!initAudio()) return;
  }

  try{
    // Create a temporary gain node for SFX volume control
    const sfxGain = audio.ctx.createGain();
    sfxGain.gain.value = state.settings.sfxVolume ?? 0.75;
    sfxGain.connect(audio.ctx.destination);
    soundEffects[effect](audio.ctx, sfxGain);
  }catch(e){ console.warn(`SFX error: ${effect}`, e); }
}

// Musical scales for different moods
const musicalScales = {
  peaceful: [0, 2, 4, 5, 7, 9, 11], // Major scale (C major)
  dreamy: [0, 2, 3, 5, 7, 8, 10],    // Natural minor (C minor)
  mystical: [0, 2, 3, 5, 7, 8, 11],  // Harmonic minor
  cheerful: [0, 2, 4, 7, 9],         // Major pentatonic
  deep: [0, 3, 5, 7, 10]             // Minor pentatonic
};

// Play a note with ADSR envelope
function playNote(ctx, frequency, startTime, duration, gainNode, waveType='sine'){
  const osc = ctx.createOscillator();
  const noteGain = ctx.createGain();

  osc.type = waveType;
  osc.frequency.value = frequency;

  // Ensure startTime is never negative or in the past
  const safeStartTime = Math.max(startTime, ctx.currentTime);

  // ADSR envelope (Attack, Decay, Sustain, Release)
  const attack = 0.1;
  const decay = 0.2;
  const sustain = 0.4;
  const release = 0.5;

  noteGain.gain.setValueAtTime(0, safeStartTime);
  noteGain.gain.linearRampToValueAtTime(0.3, safeStartTime + attack);
  noteGain.gain.linearRampToValueAtTime(sustain, safeStartTime + attack + decay);
  noteGain.gain.setValueAtTime(sustain, safeStartTime + duration - release);
  noteGain.gain.linearRampToValueAtTime(0, safeStartTime + duration);

  osc.connect(noteGain);
  noteGain.connect(gainNode);

  osc.start(safeStartTime);
  osc.stop(safeStartTime + duration);

  return {osc, noteGain};
}
function setBackgroundSound(bgId){
  if(audio.current.stop) try{ audio.current.stop(); }catch{}
  audio.current = {nodes:[], stop:()=>{}};
  if(!audio.enabled || !audio.ctx) return;

  const ctx = audio.ctx;
  const nodes = [];

  // Music configuration per background
  let config = {
    scale: musicalScales.peaceful,
    baseNote: 48, // C3 in MIDI
    tempo: 120,   // BPM
    chords: [[0,4,7], [5,9,12], [7,11,14], [0,4,7]], // I-IV-V-I progression
    melody: true,
    waterAmbience: true,
    padSynth: true
  };

  switch(bgId){
    case 'default':
      config = {scale: musicalScales.peaceful, baseNote: 48, tempo: 100,
                chords: [[0,4,7], [5,9,12], [7,11,14], [0,4,7]], melody: true, waterAmbience: true, padSynth: true};
      break;
    case 'deepsea':
      config = {scale: musicalScales.deep, baseNote: 36, tempo: 60,
                chords: [[0,3,7], [5,8,12], [0,3,7]], melody: false, waterAmbience: true, padSynth: true};
      break;
    case 'coral':
      config = {scale: musicalScales.cheerful, baseNote: 60, tempo: 140,
                chords: [[0,4,7], [2,5,9], [4,7,11], [0,4,7]], melody: true, waterAmbience: true, padSynth: true};
      break;
    case 'kelp':
      config = {scale: musicalScales.dreamy, baseNote: 52, tempo: 90,
                chords: [[0,3,7], [7,10,14], [5,8,12], [0,3,7]], melody: true, waterAmbience: true, padSynth: true};
      break;
    case 'lagoon':
      config = {scale: musicalScales.cheerful, baseNote: 55, tempo: 110,
                chords: [[0,4,7], [5,9,12], [7,11,14], [0,4,7]], melody: true, waterAmbience: true, padSynth: true};
      break;
    case 'night':
      config = {scale: musicalScales.mystical, baseNote: 40, tempo: 70,
                chords: [[0,3,7], [8,11,15], [0,3,7]], melody: true, waterAmbience: false, padSynth: true};
      break;
    case 'sunset':
      config = {scale: musicalScales.peaceful, baseNote: 50, tempo: 85,
                chords: [[0,4,7,11], [5,9,12,16], [7,11,14,17], [0,4,7,11]], melody: true, waterAmbience: true, padSynth: true};
      break;
    case 'volcano':
      config = {scale: musicalScales.deep, baseNote: 32, tempo: 50,
                chords: [[0,5,7], [3,7,10], [0,5,7]], melody: false, waterAmbience: false, padSynth: true};
      break;
    case 'ice':
      config = {scale: musicalScales.mystical, baseNote: 64, tempo: 95,
                chords: [[0,3,7], [5,8,12], [7,10,14], [0,3,7]], melody: true, waterAmbience: false, padSynth: true};
      break;
    case 'fantasy':
      config = {scale: musicalScales.mystical, baseNote: 55, tempo: 105,
                chords: [[0,4,7,11], [2,5,9,12], [4,7,11,14], [0,4,7,11]], melody: true, waterAmbience: true, padSynth: true};
      break;
  }

  // Helper: MIDI note to frequency
  const midiToFreq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

  // 1. Water ambience layer (gentle, not harsh)
  if(config.waterAmbience){
    const waterBuf = makeWaterBuffer(ctx, 5);
    const water = ctx.createBufferSource();
    water.buffer = waterBuf;
    water.loop = true;

    const waterFilter = ctx.createBiquadFilter();
    waterFilter.type = 'lowpass';
    waterFilter.frequency.value = 800;

    const waterGain = ctx.createGain();
    waterGain.gain.value = 0.15;

    water.connect(waterFilter).connect(waterGain).connect(audio.gain);
    water.start();
    nodes.push(water, waterFilter, waterGain);
  }

  // 2. Pad synth (sustained chords)
  if(config.padSynth){
    const padGain = ctx.createGain();
    padGain.gain.value = 0.08;
    padGain.connect(audio.gain);

    const beatDuration = 60 / config.tempo;
    const chordDuration = beatDuration * 4; // Each chord lasts 4 beats
    const totalDuration = chordDuration * config.chords.length;

    // Loop chords
    const startChords = () => {
      config.chords.forEach((chord, i) => {
        const startTime = ctx.currentTime + i * chordDuration;
        chord.forEach(semitone => {
          const freq = midiToFreq(config.baseNote + semitone);
          const {osc, noteGain} = playNote(ctx, freq, startTime, chordDuration * 0.95, padGain, 'triangle');
          nodes.push(osc, noteGain);
        });
      });

      // Schedule next loop
      audio.current.chordTimeout = setTimeout(startChords, totalDuration * 1000);
    };
    startChords();
  }

  // 3. Melody layer (optional)
  if(config.melody){
    const melodyGain = ctx.createGain();
    melodyGain.gain.value = 0.12;
    melodyGain.connect(audio.gain);

    const beatDuration = 60 / config.tempo;
    const melodyPattern = [0, 2, 4, 2, 5, 4, 2, 0]; // Simple ascending/descending melody

    const startMelody = () => {
      melodyPattern.forEach((scaleIndex, i) => {
        const semitone = config.scale[scaleIndex % config.scale.length];
        const freq = midiToFreq(config.baseNote + 12 + semitone); // One octave higher
        const startTime = ctx.currentTime + i * beatDuration;
        const {osc, noteGain} = playNote(ctx, freq, startTime, beatDuration * 0.8, melodyGain, 'sine');
        nodes.push(osc, noteGain);
      });

      // Schedule next loop
      const totalDuration = beatDuration * melodyPattern.length;
      audio.current.melodyTimeout = setTimeout(startMelody, totalDuration * 1000);
    };
    startMelody();
  }

  // Cleanup function
  audio.current.stop = () => {
    clearTimeout(audio.current.chordTimeout);
    clearTimeout(audio.current.melodyTimeout);
    nodes.forEach(n => {
      try {
        if(n.stop) n.stop();
        if(n.disconnect) n.disconnect();
      } catch {}
    });
  };
  audio.current.nodes = nodes;
}
function updateAmbientForActiveTank(){
  const t = currentTank(); if(!t) return;
  if(audio.enabled) setBackgroundSound(t.backgroundId || 'default');
}

/* ---- Settings UI sync ---- */
function syncSettingsUIFromState(){
  musicVol.value = state.settings.musicVolume ?? 0;
  sfxVol.value = state.settings.sfxVolume ?? 0.75;
  vizIntensity.value = state.settings.intensity ?? 1.0;
  // Update displays
  document.getElementById('musicVolDisplay').textContent = `${Math.round(Number(musicVol.value) * 100)}%`;
  document.getElementById('sfxVolDisplay').textContent = `${Math.round(Number(sfxVol.value) * 100)}%`;
  document.getElementById('vizDisplay').textContent = `${Number(vizIntensity.value).toFixed(1)}x`;
}

// Music volume handler
musicVol.oninput = ()=>{
  const v = Number(musicVol.value||0);
  state.settings.musicVolume = v;
  document.getElementById('musicVolDisplay').textContent = `${Math.round(v * 100)}%`;

  // Init audio if needed
  if(v > 0 && !audio.ctx){
    if(initAudio()){
      audio.enabled = true;
      audio.ctx.resume();
      updateAmbientForActiveTank();
      log('Background music enabled.');
    }
  }

  // Update gain
  if(audio.gain) audio.gain.gain.value = v;

  // Stop music if volume is 0
  if(v === 0 && audio.ctx){
    audio.enabled = false;
    if(audio.current.stop) audio.current.stop();
    log('Background music disabled.');
  } else if(v > 0 && audio.ctx){
    // Enable audio and start music if not playing
    if(!audio.enabled){
      audio.enabled = true;
      audio.ctx.resume();
      updateAmbientForActiveTank();
      log('Background music enabled.');
    } else if(!audio.current.nodes.length){
      updateAmbientForActiveTank();
    }
  }

  save();
};

// SFX volume handler
sfxVol.oninput = ()=>{
  const v = Number(sfxVol.value||0);
  state.settings.sfxVolume = v;
  document.getElementById('sfxVolDisplay').textContent = `${Math.round(v * 100)}%`;
  save();
};

// Visual intensity handler
vizIntensity.oninput = ()=>{
  state.settings.intensity = Number(vizIntensity.value||1);
  document.getElementById('vizDisplay').textContent = `${vizIntensity.value}x`;
  save();
};

/* ---- Boot ---- */
function applyTankBackground(){
  const t=currentTank(); if(!t) return;
  const tt=getTankType(t.typeId);
  const tankDiv=canvas.parentElement;
  tankDiv.style.background = `
    radial-gradient(1200px 700px at 50% 0%, ${tt.bg}, rgba(4,10,18,.8)),
    linear-gradient(180deg, rgba(20,34,60,.65), rgba(10,18,35,.95))
  `;
}

// Start the game loop (called after sprites are loaded)
function startGameLoop(){
  requestAnimationFrame(()=>{ lastFrame=Date.now(); tick(); });
}

function init(){
  load(); ensureActive();
  resize(); refreshTankSelect(); applyTankBackground(); refreshStats(); renderShop();
  makePlants();
  syncSettingsUIFromState();
  if(state.settings.musicVolume > 0){ if(initAudio()){ audio.enabled=true; audio.ctx.resume(); updateAmbientForActiveTank(); } }
  applyOfflineProgressAll();

  // Render initial frame with background before sprites load
  ctx.clearRect(0,0,viewW,viewH);
  drawBackgroundBase();
  drawPlantLayer(plantsBack, Date.now()*0.001);
  drawBackgroundEffects();
  drawEquipment();
  drawForeground();

  preloadSprites(); // Load PNG sprites (will call startGameLoop when ready)
  preloadBackgroundDecorations(); // Load background decoration sprites
}
window.addEventListener('load', init);
