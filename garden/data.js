// ===== КОНСТАНТЫ =====
const DEFAULT_PLANTS = [
  { id: 'rose', name: 'Розы', color: '#e91e63', custom: false, bloomStartMonth: 6, bloomEndMonth: 9 },
  { id: 'tulip', name: 'Тюльпаны', color: '#ff5722', custom: false, bloomStartMonth: 4, bloomEndMonth: 5 },
  { id: 'lavender', name: 'Лаванда', color: '#9c27b0', custom: false, bloomStartMonth: 6, bloomEndMonth: 8 },
  { id: 'sunflower', name: 'Подсолнухи', color: '#ffc107', custom: false, bloomStartMonth: 7, bloomEndMonth: 9 },
  { id: 'daisy', name: 'Ромашки', color: '#ffffff', custom: false, bloomStartMonth: 5, bloomEndMonth: 9 },
  { id: 'peony', name: 'Пионы', color: '#f06292', custom: false, bloomStartMonth: 5, bloomEndMonth: 6 },
  { id: 'hosta', name: 'Хосты', color: '#4caf50', custom: false, bloomStartMonth: 7, bloomEndMonth: 8 },
  { id: 'fern', name: 'Папоротник', color: '#2e7d32', custom: false, bloomStartMonth: 5, bloomEndMonth: 9 },
  { id: 'grass', name: 'Газон', color: '#8bc34a', custom: false, bloomStartMonth: 4, bloomEndMonth: 10 },
  { id: 'mulch', name: 'Мульча', color: '#795548', custom: false },
  { id: 'stone', name: 'Камни', color: '#9e9e9e', custom: false },
  { id: 'water', name: 'Водоём', color: '#29b6f6', custom: false },
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
  { id: 'star', name: 'Звезда' },
  { id: 'heart', name: 'Сердце' },
  { id: 'flower', name: 'Цветок' },
];

const MONTHS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
];

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const CANVAS_PAD_M = 1;

let plants = [...DEFAULT_PLANTS];
let customPlantCounter = 1;

const state = {
  tool: 'select',
  bedShape: 'rect',
  bedSubmenuOpen: false,
  selectedPlant: null,
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

// ===== РАБОТА С ДАТАМИ БЕЗ ГОДА =====

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

// ===== ЛОГИКА ПРОВЕРКИ ЦВЕТЕНИЯ =====
// Принимает любой объект с полями цветения (вид растения ИЛИ посадка)

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

// Скопировать даты цветения из вида растения в посадку
function copyBloomDataFromPlant(plant, planting) {
  if (!plant || !planting) return;
  planting.bloomStartMonth = plant.bloomStartMonth || null;
  planting.bloomEndMonth = plant.bloomEndMonth || null;
  planting.bloomStartDate = plant.bloomStartDate || null;
  planting.bloomEndDate = plant.bloomEndDate || null;
}