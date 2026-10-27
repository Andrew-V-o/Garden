// ===== КОНСТАНТЫ =====

const DEFAULT_PLANTS = [
  { id: 'rose', name: 'Розы', color: '#e91e63', custom: false, bloomStartMonth: 6, bloomEndMonth: 9, defaultShape: 'circle', folderId: null, height: 80, flowerSize: 'large', flowerCount: 'medium' },
  { id: 'tulip', name: 'Тюльпаны', color: '#ff5722', custom: false, bloomStartMonth: 4, bloomEndMonth: 5, defaultShape: 'drop', folderId: null, height: 30, flowerSize: 'medium', flowerCount: 'few' },
  { id: 'lavender', name: 'Лаванда', color: '#9c27b0', custom: false, bloomStartMonth: 6, bloomEndMonth: 8, defaultShape: 'oval', folderId: null, height: 60, flowerSize: 'small', flowerCount: 'many' },
  { id: 'sunflower', name: 'Подсолнухи', color: '#ffc107', custom: false, bloomStartMonth: 7, bloomEndMonth: 9, defaultShape: 'flower', folderId: null, height: 150, flowerSize: 'large', flowerCount: 'few' },
  { id: 'daisy', name: 'Ромашки', color: '#ffffff', custom: false, bloomStartMonth: 5, bloomEndMonth: 9, defaultShape: 'flower', folderId: null, height: 40, flowerSize: 'small', flowerCount: 'many' },
  { id: 'peony', name: 'Пионы', color: '#f06292', custom: false, bloomStartMonth: 5, bloomEndMonth: 6, defaultShape: 'circle', folderId: null, height: 70, flowerSize: 'large', flowerCount: 'medium' },
  { id: 'hosta', name: 'Хосты', color: '#4caf50', custom: false, bloomStartMonth: 7, bloomEndMonth: 8, defaultShape: 'leaf', folderId: null, height: 50, flowerSize: 'small', flowerCount: 'few' },
  { id: 'fern', name: 'Папоротник', color: '#2e7d32', custom: false, bloomStartMonth: 5, bloomEndMonth: 9, defaultShape: 'leaf', folderId: null, height: 60, flowerSize: 'small', flowerCount: 'few' },
  { id: 'grass', name: 'Газон', color: '#8bc34a', custom: false, bloomStartMonth: 4, bloomEndMonth: 10, defaultShape: 'leaf', folderId: null, height: 10, flowerSize: 'small', flowerCount: 'many' },
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

// ===== НОВЫЕ КОНСТАНТЫ ДЛЯ РАСТЕНИЙ =====

const FLOWER_SIZES = [
  { id: 'small', name: 'Маленькие', icon: '🔹' },
  { id: 'medium', name: 'Средние', icon: '🔷' },
  { id: 'large', name: 'Большие', icon: '🔶' },
];

const FLOWER_COUNTS = [
  { id: 'few', name: '1-5', icon: '🌸' },
  { id: 'medium', name: '6-15', icon: '🌺' },
  { id: 'many', name: 'Больше 15', icon: '💐' },
];

// ===== СКИНЫ МУЛЬЧИ =====

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

// ===== СКИНЫ ДОРОЖЕК =====

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

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====

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
  // Размерная сетка
  showGrid: false,
  gridSize: 1,
  gridColor: '#d4cfc0',
  gridOpacity: 0.5,
  // История undo/redo
  history: [],
  historyIndex: -1,
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
  planting.height = plant.height || 50;
  planting.flowerSize = plant.flowerSize || 'medium';
  planting.flowerCount = plant.flowerCount || 'medium';
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ПАПКАМИ РАСТЕНИЙ =====

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

// ===== СИСТЕМА ЗАДАЧ-НАПОМИНАЛОК =====

const TASK_PRIORITIES = [
  { id: 'low', name: '🟢 Низкий', color: '#4caf50', glowColor: 'rgba(76,175,80,0.5)' },
  { id: 'medium', name: '🟡 Средний', color: '#ff9800', glowColor: 'rgba(255,152,0,0.5)' },
  { id: 'high', name: '🟠 Высокий', color: '#ff5722', glowColor: 'rgba(255,87,34,0.6)' },
  { id: 'urgent', name: '🔴 Срочный', color: '#d32f2f', glowColor: 'rgba(211,47,47,0.8)' },
];

const TASK_HIGHLIGHT_TYPES = [
  { id: 'marker', name: '📌 Маркер' },
  { id: 'glow', name: '✨ Свечение' },
  { id: 'border', name: '🔲 Рамка' },
  { id: 'pulse', name: '💓 Пульсация' },
  { id: 'flag', name: '🚩 Флажок' },
];

let nextTaskId = 1;

function createTask(text, deadline, priority, highlightType, highlightColor) {
  return {
    id: nextTaskId++,
    text: text,
    deadline: deadline || null,
    priority: priority || 'medium',
    highlightType: highlightType || 'marker',
    highlightColor: highlightColor || null,
    done: false,
    createdAt: new Date().toISOString()
  };
}

function getPriorityData(priorityId) {
  return TASK_PRIORITIES.find(p => p.id === priorityId) || TASK_PRIORITIES[1];
}

function getTaskColor(task) {
  if (task.highlightColor) return task.highlightColor;
  return getPriorityData(task.priority).color;
}

function isTaskOverdue(task) {
  if (!task.deadline || task.done) return false;
  return new Date(task.deadline) < new Date();
}

function getTasksCount(obj) {
  if (!obj.tasks) return { total: 0, active: 0, overdue: 0 };
  const total = obj.tasks.length;
  const active = obj.tasks.filter(t => !t.done).length;
  const overdue = obj.tasks.filter(t => isTaskOverdue(t)).length;
  return { total, active, overdue };
}

function getAllTasks() {
  const all = [];
  state.objects.forEach(obj => {
    if (obj.tasks && obj.tasks.length > 0) {
      obj.tasks.forEach(task => {
        all.push({ ...task, objectId: obj.id, objectType: obj.type });
      });
    }
    if (obj.plants) {
      obj.plants.forEach(pl => {
        if (pl.tasks && pl.tasks.length > 0) {
          pl.tasks.forEach(task => {
            all.push({ ...task, objectId: obj.id, plantingId: pl.id, objectType: 'planting' });
          });
        }
      });
    }
  });
  return all;
}

// ===== СИСТЕМА ИСТОРИИ (UNDO/REDO) =====

const MAX_HISTORY = 50;

function saveState() {
  const stateSnapshot = JSON.parse(JSON.stringify(state.objects));
  
  // Проверяем, не идентично ли последнее состояние текущему
  if (state.history.length > 0 && state.historyIndex >= 0) {
    const lastState = JSON.stringify(state.history[state.historyIndex]);
    const currentState = JSON.stringify(stateSnapshot);
    if (lastState === currentState) return; // Не сохраняем дубликат
  }
  
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  state.history.push(stateSnapshot);
  
  if (state.history.length > MAX_HISTORY) {
    state.history.shift();
  }
  
  state.historyIndex = state.history.length - 1;
  
  updateHistoryButtons();
}

function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    state.objects = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
    state.selectedId = null;
    state.selectedPlantingId = null;
    closePlantPopup();
    closeTreePopup();
    closeDecorPopup();
    closeMulchPopup();
    closePathPopup();
    render();
    updateHistoryButtons();
  }
}

function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    state.objects = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
    state.selectedId = null;
    state.selectedPlantingId = null;
    closePlantPopup();
    closeTreePopup();
    closeDecorPopup();
    closeMulchPopup();
    closePathPopup();
    render();
    updateHistoryButtons();
  }
}

function updateHistoryButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  
  if (undoBtn) {
    undoBtn.style.opacity = state.historyIndex > 0 ? '1' : '0.3';
    undoBtn.style.cursor = state.historyIndex > 0 ? 'pointer' : 'not-allowed';
  }
  
  if (redoBtn) {
    redoBtn.style.opacity = state.historyIndex < state.history.length - 1 ? '1' : '0.3';
    redoBtn.style.cursor = state.historyIndex < state.history.length - 1 ? 'pointer' : 'not-allowed';
  }
}

// ===== ИНИЦИАЛИЗАЦИЯ ИСТОРИИ =====

function initHistory() {
  state.history = [];
  state.historyIndex = -1;
  saveState();
}