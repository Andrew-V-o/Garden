// ===== КОНСТАНТЫ =====
const DEFAULT_PLANTS = [
  { id: 'rose', name: 'Розы', color: '#e91e63', custom: false },
  { id: 'tulip', name: 'Тюльпаны', color: '#ff5722', custom: false },
  { id: 'lavender', name: 'Лаванда', color: '#9c27b0', custom: false },
  { id: 'sunflower', name: 'Подсолнухи', color: '#ffc107', custom: false },
  { id: 'daisy', name: 'Ромашки', color: '#ffffff', custom: false },
  { id: 'peony', name: 'Пионы', color: '#f06292', custom: false },
  { id: 'hosta', name: 'Хосты', color: '#4caf50', custom: false },
  { id: 'fern', name: 'Папоротник', color: '#2e7d32', custom: false },
  { id: 'grass', name: 'Газон', color: '#8bc34a', custom: false },
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

const CANVAS_PAD_M = 1;

// ===== СОСТОЯНИЕ =====
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
  viewBox: null, // { x, y, w, h } — текущий viewBox (для зума)
};

// ===== ССЫЛКИ НА DOM =====
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

// Сбросить viewBox к полному размеру холста (сброс зума)
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