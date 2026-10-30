📦 garden/
│
├── 📄 index.html
├── 📄 styles.css
│
└── 📂 js/
    ├── 📂 core/
    │   ├── 📄 constants.js      ← Все константы
    │   ├── 📄 state.js          ← state + terrainBlocks + viewMode
    │   ├── 📄 geometry.js       ← Геометрия + snap + intersection
    │   └── 📄 shapes.js         ← SVG формы
    │
    ├── 📂 data/
    │   ├── 📄 folders.js        ← Папки растений/деревьев
    │   └── 📄 tasks.js          ← Задачи + undo/redo
    │
    ├── 📂 ui/
    │   ├── 📄 plants-ui.js      ← UI растений/деревьев
    │   ├── 📄 popups.js         ← Popup'ы объектов
    │   ├── 📄 tasks-ui.js       ← UI задач + маркеры
    │   └── 📄 grid.js           ← Размерная сетка
    │
    ├── 📂 interaction/
    │   └── 📄 interaction.js    ← Обработчики мыши/клавиатуры
    │
    ├── 📂 render/
    │   ├── 📄 render.js         ← Основной render
    │   ├── 📄 render-mulch.js   ← Скины мульчи
    │   ├── 📄 render-path.js    ← Скины дорожек
    │   └── 📄 render-props.js   ← Правая панель свойств
    │
    ├── 📂 3d/
    │   ├── 📄 three-view.js     ← 3D сцена, камера, свет
    │   ├── 📄 three-terrain.js  ← Terrain из блоков
    │   ├── 📄 three-plants.js   ← 3D растения/деревья
    │   ├── 📄 three-objects.js  ← 3D дорожки/мульча/водоёмы
    │   ├── 📄 three-ui.js       ← UI блоков
    │   └── 📄 three-mode.js     ← Переключение 2D/3D
    │
    └── 📂 storage/
        ├── 📄 storage.js        ← Сохранение/загрузка + terrainBlocks
        └── 📄 init.js           ← Инициализация