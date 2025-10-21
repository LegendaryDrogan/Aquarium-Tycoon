/* ==========================================
   Aquarium Tycoon (v5.0.0) - Visual Overhaul
   - REALISTIC FISH SPRITES - Highly detailed pixel art matching real-life counterparts
   - ENHANCED BACKGROUNDS - Beautiful, immersive aquarium environments
   - MODERN UI DESIGN - Polished interface with refined aesthetics
   - CLEAN PROJECT STRUCTURE - Organized and production-ready
   - PROCEDURAL MUSIC SYSTEM - Real melodic ambient music
   - Background tank simulation: all tanks grow fish & run automations
   - Debug speed moved to Automations (password-protected)
   - Responsive design optimized for all screen sizes
   ========================================== */
const GAME_VERSION = '5.0.0';
const PRESTIGE_BASE = 10_000_000; // starting prestige price
const AUTOMATION_PASSWORD = 'HAX'; // Password for automation features

// Debug speed multiplier
let debugSpeedMultiplier = 1;

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
  { id:'guppy',   name:'Guppy',        cost:   10,      sellBase:     8,   growth: 0.020 },
  { id:'gold',    name:'Goldfish',     cost:  200,      sellBase:   160,   growth: 0.016 },
  { id:'squid',   name:'Squid',        cost:  600,      sellBase:   480,   growth: 0.015 },
  { id:'koi',     name:'Koi',          cost:  900,      sellBase:   720,   growth: 0.013 },
  { id:'angel',   name:'Angelfish',    cost: 2200,      sellBase:  1760,   growth: 0.011 },
  { id:'discus',  name:'Discus',       cost: 8000,      sellBase:  6400,   growth: 0.009 },
  { id:'eel',     name:'Eel',          cost: 15000,     sellBase: 12000,   growth: 0.008 },
  { id:'turtle',  name:'Turtle',       cost: 30000,     sellBase: 24000,   growth: 0.007 },
  { id:'shark',   name:'Shark',        cost:120000,     sellBase: 96000,   growth: 0.006 },
  { id:'dolphin', name:'Dolphin',      cost:450000,     sellBase:360000,   growth: 0.0055 },
  { id:'oarfish', name:'Oarfish',      cost:1500000,    sellBase:1200000,  growth: 0.005 },
  { id:'angler',  name:'Angler Fish',  cost:6000000,    sellBase:4800000,  growth: 0.0045 }
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
let spritesLoaded = false;

function preloadSprites() {
  const spriteNames = ['guppy', 'gold', 'squid', 'koi', 'angel', 'discus',
                       'eel', 'turtle', 'shark', 'dolphin', 'oarfish', 'angler'];
  let loadedCount = 0;

  spriteNames.forEach(name => {
    const img = new Image();
    img.onload = () => {
      loadedCount++;
      if (loadedCount === spriteNames.length) {
        spritesLoaded = true;
        console.log('✅ All fish sprites loaded successfully!');
      }
    };
    img.onerror = () => {
      console.error(`❌ Failed to load sprite: ${name}.png`);
      loadedCount++;
    };
    img.src = `assets/fish/${name}.png`;
    fishSprites[name] = img;
  });
}

/* ---- Visual palette (base colors per species) ---- */
const speciesStyle = {
  guppy:   { top:'#64c8ff', belly:'#e6f6ff', fin:'#f6a9ff' },
  gold:    { top:'#ffae3a', belly:'#fff1c9', fin:'#ffd36a' },
  squid:   { top:'#c0d2ff', belly:'#eaf0ff', fin:'#d7e0ff' },
  koi:     { top:'#ffffff', belly:'#f7f7f7', fin:'#ffd6d6' },
  angel:   { top:'#b9aaff', belly:'#e9e4ff', fin:'#d6cdff' },
  discus:  { top:'#6ad0af', belly:'#c8ffef', fin:'#aef7de' },
  eel:     { top:'#7ac7a5', belly:'#ccf4e3', fin:'#a6e3c9' },
  turtle:  { top:'#7e8c6a', belly:'#e6f0c8', fin:'#b2c493' },
  shark:   { top:'#9fb3c7', belly:'#e4f1ff', fin:'#bfd0e0' },
  dolphin: { top:'#8ec1ff', belly:'#e6f4ff', fin:'#b9dcff' },
  oarfish: { top:'#cde8ff', belly:'#f4fbff', fin:'#f06a6a' },
  angler:  { top:'#cda86a', belly:'#ffe7c0', fin:'#ffd38f' }
};

/* ---- Rarities ---- */
const RARITIES = [
  { key:'COMMON',     chance: 1.0,  mult:1.0,  glow:null },
  { key:'RARE',       chance: 0.05, mult:2.0,  glow:{color:'rgba(255,211,105,0.85)', rim:'rgba(255,211,105,0.8)'} },
  { key:'EPIC',       chance: 0.01, mult:3.5,  glow:{color:'rgba(122,44,255,0.85)',  rim:'rgba(178,123,255,0.9)'} },
  { key:'LEGENDARY',  chance: 0.002,mult:6.0,  glow:{color:'rgba(255,138,0,0.9)',    rim:'rgba(255,188,73,0.95)'} }
];
function rollRarity(){ if(Math.random()<RARITIES[3].chance) return RARITIES[3]; if(Math.random()<RARITIES[2].chance) return RARITIES[2]; if(Math.random()<RARITIES[1].chance) return RARITIES[1]; return RARITIES[0]; }

/* ---- Settings & State ---- */
const state = {
  version: GAME_VERSION,
  coins: 100,
  prestige: 0,
  settings: { audio:false, volume:0.4, fpsCap:60, intensity:1.0 },
  unlockedBackgrounds: { default: true }, // global unlocks
  automationUnlocked: false, // track automation unlock status
  tanks: [], // { uid,typeId,name,items,fish,lastTick,automation,backgroundId }
  activeTankUid: null,
  nextUid: 1
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
const audioToggle = document.getElementById('audioToggle');
const audioVol = document.getElementById('audioVol');
const fpsCapSel = document.getElementById('fpsCap');
const vizIntensity = document.getElementById('vizIntensity');
const closeSettings = document.getElementById('closeSettings');

const canvas = document.getElementById('aquarium');
const ctx = canvas.getContext('2d', { alpha: true });
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
function save(){ localStorage.setItem('aquariumSave_v2', JSON.stringify(state)); log('Game saved.'); }
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
      automation: { autoSell:false, autoBuy:false, mode:'smart', target:'guppy', reserve:0 },
      backgroundId: 'default'
    };
    state.coins = v1.coins ?? 100;
    state.prestige = 0;
    state.settings = { audio:false, volume:0.4, fpsCap:60, intensity:1.0 };
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
      state.settings = state.settings || { audio:false, volume:0.4, fpsCap:60, intensity:1.0 };
      state.unlockedBackgrounds = state.unlockedBackgrounds || { default: true };
      state.automationUnlocked = state.automationUnlocked || false;
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
  state.settings = state.settings || { audio:false, volume:0.4, fpsCap:60, intensity:1.0 };

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
  state.coins += value;
  t.fish.splice(idx,1);
  log(`Sold ${sp.name}${f.rarity!=='COMMON'?` (${f.rarity})`:''} for ${fmt(value)}.${note}`);
  refreshStats();
}
function sellMatureFish(){
  const t = currentTank(); if(!t) return;
  let sold=0, coinsEarned=0;
  for(let i=t.fish.length-1;i>=0;i--){
    const f=t.fish[i];
    if(f.size>=0.8){
      const sp = species.find(s=>s.id===f.sp);
      const rar = RARITIES.find(r=>r.key===f.rarity) || RARITIES[0];
      coinsEarned += Math.floor(fishValue(t, sp, f.size, rar));
      t.fish.splice(i,1); sold++;
    }
  }
  if(sold){ state.coins+=coinsEarned; log(`Sold ${sold} mature fish for ${fmt(coinsEarned)}.`); refreshStats(); renderShop(); }
  else log('No mature fish yet (need ≥80% growth).');
}

/* ---- Tanks management ---- */
function addParallelTank(cost=2500){
  if(state.coins < cost){ log('Not enough coins for a new tank.'); return; }
  state.coins -= cost;
  const uid = nextUid();
  state.tanks.push({
    uid, typeId:'starter', name:`Tank ${state.tanks.length+1}`,
    items: Object.fromEntries(itemsCatalog.map(i=>[i.id,0])),
    fish: [],
    lastTick: Date.now(),
    automation: { autoSell:false, autoBuy:false, mode:'smart', target:'guppy', reserve:0 },
    backgroundId: 'default'
  });
  state.activeTankUid = uid;
  log(`Added a new tank (Starter Glass) for ${fmt(cost)}.`);
  refreshStats(); refreshTankSelect(); renderShop(); applyTankBackground(); updateAmbientForActiveTank();
}
function upgradeTankType(tankUid, newTypeId){
  const t = state.tanks.find(x=>x.uid===tankUid); if(!t) return;
  const tt = getTankType(newTypeId); if(!tt) return;
  if(t.typeId===newTypeId) return;
  if(state.coins < tt.cost){ log('Not enough coins.'); return; }
  state.coins -= tt.cost;
  t.typeId = newTypeId;
  if(t.uid===state.activeTankUid) applyTankBackground();
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
  log(`Upgraded ${def.name} in ${t.name} to Lv.${lvl+1} for ${fmt(cost)}.`);
  refreshStats(); renderShop();
}

/* ---- UI: Shop ---- */
let activeTab='fish';
document.querySelectorAll('.tab').forEach(b=>{
  b.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    b.classList.add('active'); activeTab = b.getAttribute('data-tab'); renderShop();
  });
});

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
  const t = currentTank(); if(!t){ listEl.innerHTML=''; return; }
  const coins = state.coins;
  listEl.innerHTML = '';

  if(activeTab==='fish'){
    species.forEach(sp=>{
      const full = t.fish.length >= totalCapacity(t);
      const afford = coins>=sp.cost;
      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `
        <div>
          <div class="title">${sp.name} <span class="badge">${(sp.growth*100|0)}%/s growth</span></div>
          <div class="muted">Buy <span class="price">${fmt(sp.cost)}</span> • Mature base sell ~ <span class="price">${fmt(Math.floor(sp.sellBase*1.5*1.2))}</span></div>
          <div class="tiny">Rarity: Rare 5% • Epic 1% • Legendary 0.2% &nbsp;
            <span class="rarity r-RARE">Rare</span> <span class="rarity r-EPIC">Epic</span> <span class="rarity r-LEGENDARY">Legendary</span>
          </div>
        </div>
        <div><button ${(!afford||full)?'disabled':''}>Buy</button></div>`;
      const btn = div.querySelector('button');
      if(!afford && !full){ btn.classList.add('cant-afford'); btn.title='Not enough coins'; }
      if(full){ btn.title='Tank is full'; }
      btn.onclick=()=>buyFish(sp.id);
      listEl.appendChild(div);
    });
    const cap = document.createElement('div');
    cap.className='tiny';
    cap.innerHTML = `<div style="height:1px;background:#1a2946;margin:8px 0"></div>Capacity: <b>${t.fish.length}</b>/<b>${totalCapacity(t)}</b> in <b>${t.name}</b>`;
    listEl.appendChild(cap);
  }

  if(activeTab==='tanks'){
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
      listEl.appendChild(div);
    });

    const upHead = document.createElement('div'); upHead.className='tiny';
    upHead.innerHTML = `<div style="height:1px;background:#1a2946;margin:8px 0"></div><b>Upgrade Active Tank</b>`;
    listEl.appendChild(upHead);

    getUpgradesForActive().forEach(u=>{
      const afford = state.coins>=u.cost;
      const div = document.createElement('div'); div.className='card';
      div.innerHTML = `
        <div>
          <div class="title">${u.name}</div>
          <div class="muted">Capacity <b>${u.capacity}</b> • Growth bonus <b>${Math.round((u.growthBonus-1)*100)}%</b> • Cost <span class="price">${fmt(u.cost)}</span></div>
        </div>
        <div><button ${afford?'':'disabled'}>Upgrade</button></div>`;
      const btn = div.querySelector('button');
      if(!afford){ btn.classList.add('cant-afford'); btn.title='Not enough coins'; }
      btn.onclick=()=>upgradeTankType(state.activeTankUid, u.id);
      listEl.appendChild(div);
    });

    const add = document.createElement('div'); add.className='card';
    const affordTank = state.coins>=2500;
    add.innerHTML = `
      <div>
        <div class="title">Add Parallel Tank</div>
        <div class="muted">Adds a new Starter Glass tank that runs in parallel. Cost <span class="price">${fmt(2500)}</span></div>
      </div>
      <div><button ${affordTank?'':'disabled'}>Buy</button></div>`;
    const addBtn = add.querySelector('button');
    if(!affordTank){ addBtn.classList.add('cant-afford'); addBtn.title='Not enough coins'; }
    addBtn.onclick=()=>addParallelTank(2500);
    listEl.appendChild(add);
  }

  if(activeTab==='items'){
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
      listEl.appendChild(div);
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
      listEl.appendChild(auto);

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
      listEl.appendChild(auto);

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
      listEl.appendChild(controls);

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
      listEl.appendChild(debugCard);

      debugCard.querySelector('#debugSpeed').onchange = (e)=>{
        debugSpeedMultiplier = parseInt(e.target.value,10)||1;
        log(`⚡ Debug speed set to ${debugSpeedMultiplier}x. Fish will grow ${debugSpeedMultiplier}x faster!`);
        renderShop(); // Refresh to update badge
      };
    }
  }

  if(activeTab==='backgrounds'){
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
      listEl.appendChild(card);
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
      const baseSize = 12 + f.size * 46;
      const scale = baseSize / 24; // Normalize based on average sprite size

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

document.addEventListener('keydown',(e)=>{
  if(e.key==='s'||e.key==='S') sellMatureFish();
  if(e.key==='1') setTab('fish');
  if(e.key==='2') setTab('tanks');
  if(e.key==='3') setTab('items');
  if(e.key==='4') setTab('backgrounds');
  if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='s'){ e.preventDefault(); save(); }
});
function setTab(tab){
  activeTab=tab;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  const btn=document.querySelector(`.tab[data-tab="${tab}"]`); if(btn) btn.classList.add('active');
  renderShop();
}
tankSelectEl.addEventListener('change', ()=>{ state.activeTankUid = Number(tankSelectEl.value); refreshStats(); applyTankBackground(); renderShop(); updateAmbientForActiveTank(); });

/* ---- Sim Loop, FPS cap & Automations ---- */
let lastFrame=Date.now();
let lastDrawMs=0;
let autoTimer=0;
function tick(){
  const now=Date.now(); const dt=(now-lastFrame)/1000; lastFrame=now;
  simulateAll(Math.min(dt,0.05));

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

  const t=currentTank(); if(t) for(const f of t.fish) renderSprite(f);

  drawForeground();
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
      if(sold){ state.coins += coins; if(t.uid===state.activeTankUid){ refreshStats(); renderShop(); } log(`${t.name}: Auto-sold ${sold} mature fish for ${fmt(coins)}.`); }
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
    audio.gain.gain.value = state.settings.volume ?? 0.4;
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

  // ADSR envelope (Attack, Decay, Sustain, Release)
  const attack = 0.1;
  const decay = 0.2;
  const sustain = 0.4;
  const release = 0.5;

  noteGain.gain.setValueAtTime(0, startTime);
  noteGain.gain.linearRampToValueAtTime(0.3, startTime + attack);
  noteGain.gain.linearRampToValueAtTime(sustain, startTime + attack + decay);
  noteGain.gain.setValueAtTime(sustain, startTime + duration - release);
  noteGain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(noteGain);
  noteGain.connect(gainNode);

  osc.start(startTime);
  osc.stop(startTime + duration);

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
  audioToggle.checked = !!state.settings.audio;
  audioVol.value = state.settings.volume ?? 0.4;
  fpsCapSel.value = String(state.settings.fpsCap ?? 60);
  vizIntensity.value = state.settings.intensity ?? 1.0;
}
audioToggle.onchange = ()=>{
  state.settings.audio = audioToggle.checked;
  if(state.settings.audio){
    if(initAudio()){
      audio.enabled = true;
      audio.ctx.resume();
      audio.gain.gain.value = state.settings.volume ?? 0.4;
      updateAmbientForActiveTank();
      log('Ambient audio enabled.');
    }
  } else {
    audio.enabled = false;
    if(audio.ctx) audio.ctx.suspend();
    if(audio.current.stop) audio.current.stop();
    log('Ambient audio disabled.');
  }
  save();
};
audioVol.oninput = ()=>{
  const v = Number(audioVol.value||0);
  state.settings.volume = v;
  if(audio.gain) audio.gain.gain.value = v;
};
fpsCapSel.onchange = ()=>{
  state.settings.fpsCap = parseInt(fpsCapSel.value,10)||0;
  log(`FPS cap set to ${state.settings.fpsCap||'Unlimited'}.`);
};
vizIntensity.oninput = ()=>{
  state.settings.intensity = Number(vizIntensity.value||1);
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
function init(){
  preloadSprites(); // Load PNG sprites
  load(); ensureActive();
  resize(); refreshTankSelect(); applyTankBackground(); refreshStats(); renderShop();
  makePlants();
  syncSettingsUIFromState();
  if(state.settings.audio){ if(initAudio()){ audio.enabled=true; audio.ctx.resume(); updateAmbientForActiveTank(); } }
  applyOfflineProgressAll();
  requestAnimationFrame(()=>{ lastFrame=Date.now(); tick(); });
}
window.addEventListener('load', init);
