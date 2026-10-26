// ===== КОНСТАНТЫ =====
const DEFAULT_PLANTS = [
  { id: 'rose', name: 'Розы', color: '#e91e63', custom: false, bloomStartMonth: 6, bloomEndMonth: 9, defaultShape: 'circle', folderId: null },
  { id: 'tulip', name: 'Тюльпаны', color: '#ff5722', custom: false, bloomStartMonth: 4, bloomEndMonth: 5, defaultShape: 'drop', folderId: null },
  { id: 'lavender', name: 'Лаванда', color: '#9c27b0', custom: false, bloomStartMonth: 6, bloomEndMonth: 8, defaultShape: 'oval', folderId: null },
  { id: 'sunflower', name: 'Подсолнухи', color: '#ffc107', custom: false, bloomStartMonth: 7, bloomEndMonth: 9, defaultShape: 'flower', folderId: null },
  { id: 'daisy', name: 'Ромашки', color: '#ffffff', custom: false, bloomStartMonth: 5, bloomEndMonth: 9, defaultShape: 'flower', folderId: null },
  { id: 'peony', name: 'Пионы', color: '#f06292', custom: false, bloomStartMonth: 5, bloomEndMonth: 6, defaultShape: 'circle', folderId: null },
  { id: 'hosta', name: 'Хосты', color: '#4caf50', custom: false, bloomStartMonth: 7, bloomEndMonth: 8, defaultShape: 'leaf', folderId: null },
  { id: 'fern', name: 'Папоротник', color: '#2e7d32', custom: false, bloomStartMonth: 5, bloomEndMonth: 9, defaultShape: 'leaf', folderId: null },
  { id: 'grass', name: 'Газон', color: '#8bc34a', custom: false, bloomStartMonth: 4, bloomEndMonth: 10, defaultShape: 'leaf', folderId: null },
];

const DEFAULT_TREES = [
  { id: 'oak', name: 'Дуб', color: '#2e7d32', custom: false, defaultShape: 'oak', folderId: null },
  { id: 'pine', name: 'Сосна', color: '#1b5e20', custom: false, defaultShape: 'pine', folderId: null },
  { id: 'birch', name: 'Берёза', color: '#4caf50', custom: false, defaultShape: 'birch', folderId: null },
  { id: 'maple', name: 'Клён', color: '#ff9800', custom: false, defaultShape: 'maple', folderId: null },
  { id: 'willow', name: 'Ива', color: '#689f38', custom: false, defaultShape: 'willow', folderId: null },
  { id: 'spruce', name: 'Ель', color: '#004d40', custom: false, defaultShape: 'spruce', folderId: null },
  { id: 'palm', name: 'Пальма', color: '#558b2f', custom: false, defaultShape: 'palm', folderId: null },
  { id: 'cherry', name: 'Сакура', color: '#f48fb1', custom: false, defaultShape: 'cherry', folderId: null },
];

const MULCH_SKINS = [
  { id: 'bark', name: 'Кора (смешанная)', baseColor: '#795548' },
  { id: 'oak_leaves', name: 'Листья дуба', baseColor: '#8d6e63' },
  { id: 'red_oak_leaves', name: 'Листья краснолистного дуба', baseColor: '#a1524a' },
  { id: 'spruce_needles', name: 'Иголки ели', baseColor: '#4e342e' },
  { id: 'pine_needles', name: 'Иголки сосны', baseColor: '#a1887f' },
  { id: 'spruce_bark', name: 'Кора ели', baseColor: '#3e2723' },
  { id: 'pine_bark', name: 'Кора сосны', baseColor: '#6d4c41' },
  { id: 'woodchips', name: 'Щепа', baseColor: '#bcaaa4' },
  { id: 'straw', name: 'Солома', baseColor: '#f9a825' },
  { id: 'gravel', name: 'Гравий', baseColor: '#9e9e9e' },
  { id: 'pine_cones', name: 'Сосновые шишки', baseColor: '#5d4037' },
];

const PATH_SKINS = [
  { id: 'gravel', name: 'Гравий' },
  { id: 'sand', name: 'Песок' },
  { id: 'cobblestone', name: 'Брусчатка' },
  { id: 'crushed_stone', name: 'Щебень' },
  { id: 'bark_path', name: 'Кора' },
  { id: 'soil', name: 'Грунтовая' },
];

const TREE_SHAPES = [
  { id: 'oak', name: 'Дуб' },
  { id: 'pine', name: 'Сосна' },
  { id: 'birch', name: 'Берёза' },
  { id: 'maple', name: 'Клён' },
  { id: 'willow', name: 'Ива' },
  { id: 'spruce', name: 'Ель' },
  { id: 'palm', name: 'Пальма' },
  { id: 'cherry', name: 'Сакура' },
];

const COLOR_PRESETS = [
  '#e91e63','#f06292','#ff5722','#ff9800','#ffc107','#ffeb3b',
  '#8bc34a','#4caf50','#2e7d32','#009688','#00bcd4','#29b6f6',
  '#2196f3','#3f51b5','#673ab7','#9c27b0','#ffffff','#f5f5f5',
  '#795548','#9e9e9e','#607d8b','#000000'
];

const SHAPES = [
  { id: 'circle', name: 'Круг' },
  { id: 'square', name: 'Квадрат' },
  { id: 'diamond', name: 'Ромб' },
  { id: 'triangle', name: 'Треугольник' },
  { id: 'oval', name: 'Овал' },
  { id: 'star', name: 'Звезда' },
  { id: 'heart', name: 'Сердце' },
  { id: 'flower', name: 'Цветок' },
  { id: 'cross', name: 'Крест' },
  { id: 'moon', name: 'Полумесяц' },
  { id: 'drop', name: 'Капля' },
  { id: 'leaf', name: 'Лист' },
];

const MONTHS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
];

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const CANVAS_PAD_M = 1;

let plants = [...DEFAULT_PLANTS];
let trees = [...DEFAULT_TREES];
let folders = [];
let treeFolders = [];
let customPlantCounter = 1;
let customTreeCounter = 1;
let nextFolderId = 1;
let nextTreeFolderId = 1;

const state = {
  tool: 'select',
  bedShape: 'rect',
  bedSubmenuOpen: false,
  selectedPlant: null,
  selectedTree: null,
  plantingMode: false,
  selectedId: null,
  selectedPlantingId: null,
  objects: [],
  nextId: 1,
  nextPlantingId: 1,
  drawing: null,
  scale: 20,
  dragging: null,
  canvasWidthM: 50,
  canvasHeightM: 50,
  viewBox: null,
  bloomFilter: null,
  expandedFolders: new Set(),
  expandedTreeFolders: new Set(),
};

let svg, objectsLayer, handlesLayer, previewLayer, canvasWrap, plotLayer;

function initDomRefs() {
  svg = document.getElementById('canvas');
  objectsLayer = document.getElementById('objects');
  handlesLayer = document.getElementById('handles');
  previewLayer = document.getElementById('preview');
  canvasWrap = document.getElementById('canvasWrap');
  plotLayer = document.getElementById('plotLayer');
}

function getCanvasPadding() {
  return CANVAS_PAD_M * state.scale;
}

function getSvgInternalSize() {
  return {
    w: (state.canvasWidthM + CANVAS_PAD_M * 2) * state.scale,
    h: (state.canvasHeightM + CANVAS_PAD_M * 2) * state.scale
  };
}

function resetViewBox() {
  const size = getSvgInternalSize();
  state.viewBox = { x: 0, y: 0, w: size.w, h: size.h };
}

function fitCanvasToScreen() {
  const wrapRect = canvasWrap.getBoundingClientRect();
  const availW = wrapRect.width - 20;
  const availH = wrapRect.height - 20;

  const maxWM = Math.floor(availW / state.scale) - CANVAS_PAD_M * 2;
  const maxHM = Math.floor(availH / state.scale) - CANVAS_PAD_M * 2;

  const sizeM = Math.max(10, Math.min(maxWM, maxHM));
  state.canvasWidthM = sizeM;
  state.canvasHeightM = sizeM;
}

function makeDateStr(month, day) {
  if (!month) return null;
  const d = Math.max(1, Math.min(day || 1, DAYS_IN_MONTH[month] || 31));
  return `${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function getMonthFromStr(dateStr) {
  if (!dateStr) return null;
  return parseInt(dateStr.split('-')[0]);
}

function getDayFromStr(dateStr) {
  if (!dateStr) return null;
  return parseInt(dateStr.split('-')[1]);
}

function compareDates(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function monthToStartDate(month) {
  return makeDateStr(month, 1);
}

function monthToEndDate(month) {
  return makeDateStr(month, DAYS_IN_MONTH[month] || 31);
}

function isPlantBlooming(bloomObj, filter) {
  if (!filter) return true;
  if (!bloomObj) return false;
  
  const hasMonths = bloomObj.bloomStartMonth && bloomObj.bloomEndMonth;
  const hasDates = bloomObj.bloomStartDate && bloomObj.bloomEndDate;
  if (!hasMonths && !hasDates) return false;
  
  const filterByMonths = filter.start.month && !filter.start.date;
  const filterByDates = filter.start.date && !filter.start.month;
  
  if (filterByMonths && hasMonths) {
    const fStart = filter.start.month;
    const fEnd = filter.end.month || fStart;
    const pStart = bloomObj.bloomStartMonth;
    const pEnd = bloomObj.bloomEndMonth;
    
    if (fStart <= fEnd) {
      return pStart <= fEnd && pEnd >= fStart;
    } else {
      return pStart >= fStart || pEnd <= fEnd;
    }
  }
  
  if (filterByDates && hasDates) {
    const fStart = filter.start.date;
    const fEnd = filter.end.date || fStart;
    const pStart = bloomObj.bloomStartDate;
    const pEnd = bloomObj.bloomEndDate;
    
    return compareDates(pStart, fEnd) <= 0 && compareDates(pEnd, fStart) >= 0;
  }
  
  if (filterByMonths && hasDates) {
    const fStart = filter.start.month;
    const fEnd = filter.end.month || fStart;
    const pStartMonth = getMonthFromStr(bloomObj.bloomStartDate);
    const pEndMonth = getMonthFromStr(bloomObj.bloomEndDate);
    
    if (!pStartMonth || !pEndMonth) return false;
    
    if (fStart <= fEnd) {
      return pStartMonth <= fEnd && pEndMonth >= fStart;
    } else {
      return pStartMonth >= fStart || pEndMonth <= fEnd;
    }
  }
  
  if (filterByDates && hasMonths) {
    const fStartMonth = getMonthFromStr(filter.start.date);
    const fEndMonth = getMonthFromStr(filter.end.date || filter.start.date);
    const pStart = bloomObj.bloomStartMonth;
    const pEnd = bloomObj.bloomEndMonth;
    
    if (!fStartMonth || !fEndMonth) return false;
    
    if (fStartMonth <= fEndMonth) {
      return pStart <= fEndMonth && pEnd >= fStartMonth;
    } else {
      return pStart >= fStartMonth || pEnd <= fEndMonth;
    }
  }
  
  return false;
}

function copyBloomDataFromPlant(plant, planting) {
  if (!plant || !planting) return;
  planting.bloomStartMonth = plant.bloomStartMonth || null;
  planting.bloomEndMonth = plant.bloomEndMonth || null;
  planting.bloomStartDate = plant.bloomStartDate || null;
  planting.bloomEndDate = plant.bloomEndDate || null;
  planting.shape = plant.defaultShape || 'circle';
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ПАПКАМИ =====

function createFolder(name) {
  const folder = { id: nextFolderId++, name: name, color: '#4a7c59' };
  folders.push(folder);
  state.expandedFolders.add(folder.id);
  saveFolders();
  renderPlantList();
}

function deleteFolder(folderId) {
  if (!confirm('Удалить папку? Растения останутся без папки.')) return;
  folders = folders.filter(f => f.id !== folderId);
  plants.forEach(p => { if (p.folderId === folderId) p.folderId = null; });
  state.expandedFolders.delete(folderId);
  saveFolders();
  renderPlantList();
}

function renameFolder(folderId, newName) {
  const folder = folders.find(f => f.id === folderId);
  if (folder) { folder.name = newName; saveFolders(); renderPlantList(); }
}

function toggleFolder(folderId) {
  if (state.expandedFolders.has(folderId)) state.expandedFolders.delete(folderId);
  else state.expandedFolders.add(folderId);
  renderPlantList();
}

function saveFolders() {
  localStorage.setItem('plantFolders', JSON.stringify(folders));
  localStorage.setItem('nextFolderId', nextFolderId.toString());
}

function loadFolders() {
  const saved = localStorage.getItem('plantFolders');
  if (saved) {
    try {
      folders = JSON.parse(saved);
      nextFolderId = parseInt(localStorage.getItem('nextFolderId') || '1');
    } catch (e) { folders = []; }
  }
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ПАПКАМИ ДЕРЕВЬЕВ =====

function createTreeFolder(name) {
  const folder = { id: nextTreeFolderId++, name: name, color: '#2e7d32' };
  treeFolders.push(folder);
  state.expandedTreeFolders.add(folder.id);
  saveTreeFolders();
  renderTreeList();
}

function deleteTreeFolder(folderId) {
  if (!confirm('Удалить папку? Деревья останутся без папки.')) return;
  treeFolders = treeFolders.filter(f => f.id !== folderId);
  trees.forEach(t => { if (t.folderId === folderId) t.folderId = null; });
  state.expandedTreeFolders.delete(folderId);
  saveTreeFolders();
  renderTreeList();
}

function renameTreeFolder(folderId, newName) {
  const folder = treeFolders.find(f => f.id === folderId);
  if (folder) { folder.name = newName; saveTreeFolders(); renderTreeList(); }
}

function toggleTreeFolder(folderId) {
  if (state.expandedTreeFolders.has(folderId)) state.expandedTreeFolders.delete(folderId);
  else state.expandedTreeFolders.add(folderId);
  renderTreeList();
}

function saveTreeFolders() {
  localStorage.setItem('treeFolders', JSON.stringify(treeFolders));
  localStorage.setItem('nextTreeFolderId', nextTreeFolderId.toString());
}

function loadTreeFolders() {
  const saved = localStorage.getItem('treeFolders');
  if (saved) {
    try {
      treeFolders = JSON.parse(saved);
      nextTreeFolderId = parseInt(localStorage.getItem('nextTreeFolderId') || '1');
    } catch (e) { treeFolders = []; }
  }
}

// ===== ДЕТЕРМИНИРОВАННЫЙ ГЕНЕРАТОР ДЛЯ ТЕКСТУР =====

function mulchRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function particleRand(seed, index) {
  let s = seed + index * 7919;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}