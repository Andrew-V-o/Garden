// ===== КОНСТАНТЫ РАСТЕНИЙ =====

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

// ===== ХАРАКТЕРИСТИКИ РАСТЕНИЙ =====

const FLOWER_SIZES = [
  { id: 'small', name: 'Маленькие', icon: '🔹' },
  { id: 'medium', name: 'Средние', icon: '🔷' },
  { id: 'large', name: 'Большие', icon: '🔶' },
];

const FLOWER_COUNTS = [
  { id: 'few', name: '1-5', icon: '' },
  { id: 'medium', name: '6-15', icon: '' },
  { id: 'many', name: 'Больше 15', icon: '' },
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

// ===== ФОРМЫ ДЕРЕВЬЕВ =====

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

// ===== ЦВЕТОВЫЕ ПРЕСЕТЫ =====

const COLOR_PRESETS = [
  '#e91e63','#f06292','#ff5722','#ff9800','#ffc107','#ffeb3b',
  '#8bc34a','#4caf50','#2e7d32','#009688','#00bcd4','#29b6f6',
  '#2196f3','#3f51b5','#673ab7','#9c27b0','#ffffff','#f5f5f5',
  '#795548','#9e9e9e','#607d8b','#000000'
];

// ===== ФОРМЫ РАСТЕНИЙ =====

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

// ===== МЕСЯЦЫ И ДНИ =====

const MONTHS = [
  'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн',
  'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'
];

const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const CANVAS_PAD_M = 1;

// ===== ПРИОРИТЕТЫ ЗАДАЧ =====

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

// ===== ЛИМИТЫ =====

const FIGURE_POINTS_LIMIT = 100;
const DRAG_THRESHOLD = 5;
const MAX_HISTORY = 50;