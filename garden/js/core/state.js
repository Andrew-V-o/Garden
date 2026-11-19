// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let plants = [...DEFAULT_PLANTS];
let trees = [...DEFAULT_TREES];
let folders = [];
let treeFolders = [];
let customPlantCounter = 1;
let customTreeCounter = 1;
let nextFolderId = 1;
let nextTreeFolderId = 1;
let nextTaskId = 1;

const state = {
  taskHighlightMode: false,
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
  pendingDrag: null,
  canvasWidthM: 50,
  canvasHeightM: 50,
  viewBox: null,
  bloomFilter: null,
  expandedFolders: new Set(),
  expandedTreeFolders: new Set(),
  collapsedSections: { plants: false, trees: false },
  // Размерная сетка
  showGrid: false,
  gridSize: 1,
  gridColor: '#000000',
  gridOpacity: 0.5,
  // История undo/redo
  history: [],
  historyIndex: -1,
  currentSnapGuides: [],
  // ↓↓↓ ДОБАВИТЬ ЭТИ ДВА ПОЛЯ ↓↓↓
  terrainBlocks: {
    gridSize: 10,
    blocks: []
  },
  viewMode: '2d' // '2d' или '3d'
};

let svg, objectsLayer, handlesLayer, previewLayer, canvasWrap, plotLayer;

// ===== БАЗОВЫЕ ФУНКЦИИ =====
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

// ===== УТИЛИТЫ ДАТ =====
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
    if (fStart <= fEnd) return pStart <= fEnd && pEnd >= fStart;
    else return pStart >= fStart || pEnd <= fEnd;
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
    if (fStart <= fEnd) return pStartMonth <= fEnd && pEndMonth >= fStart;
    else return pStartMonth >= fStart || pEndMonth <= fEnd;
  }
  if (filterByDates && hasMonths) {
    const fStartMonth = getMonthFromStr(filter.start.date);
    const fEndMonth = getMonthFromStr(filter.end.date || filter.start.date);
    const pStart = bloomObj.bloomStartMonth;
    const pEnd = bloomObj.bloomEndMonth;
    if (!fStartMonth || !fEndMonth) return false;
    if (fStartMonth <= fEndMonth) return pStart <= fEndMonth && pEnd >= fStartMonth;
    else return pStart >= fStartMonth || pEnd <= fEndMonth;
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
  planting.height = plant.height || 50;
  planting.flowerSize = plant.flowerSize || 'medium';
  planting.flowerCount = plant.flowerCount || 'medium';
}