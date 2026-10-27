📦 garden-planner/
│
├── 📄 index.html
──  styles.css
│
├── 📂 js/
│   ├──  core/                    ← Базовые модули
│   │   ├──  constants.js         ← Все константы (растения, деревья, скины, формы, месяцы)
│   │   ├── 📄 state.js            ← Объект state и его инициализация
│   │   ├── 📄 geometry.js         ← Геометрия (getMousePos, bbox, pointInObject, resize)
│   │   ── 📄 shapes.js           ← SVG формы (getShapeSVGMini, createShapeElement)
│   │
│   ├──  data/                    ← Работа с данными
│   │   ├── 📄 folders.js          ← Папки растений и деревьев (create/delete/rename/toggle)
│   │   └──  tasks.js            ← Система задач + история undo/redo + утилиты дат
│   │
│   ├── 📂 ui/                      ← UI компоненты
│   │   ├── 📄 plants-ui.js        ← UI растений: списки в sidebar + модалки создания/настройки
│   │   ├── 📄 popups.js           ← Все popup'ы (plant, tree, mulch, path, decor)
│   │   ├── 📄 tasks-ui.js         ← UI задач: панель задач + модалка задачи + маркеры на холсте
│   │   ── 📄 grid.js             ← Размерная сетка (toggle, popup, render)
│   │
│   ├── 📂 render/                  ← Отрисовка
│   │   ├── 📄 render.js           ← Основная отрисовка (plot, bed, tree, decor, handles)
│   │   ├── 📄 render-mulch.js     ← Скины мульчи (все 11 текстур)
│   │   ├── 📄 render-path.js      ← Скины дорожек (все 6 текстур)
│   │   └── 📄 render-props.js     ← Правая панель свойств + статистика + списки секций
│   │
│   ├── 📂 interaction/             ← Взаимодействие
│   │   ── 📄 interaction.js      ← Обработчики событий мыши/клавиатуры, инструменты
│   │
│   └── 📂 storage/                 ← Хранение и инициализация
│       ├──  storage.js          ← Сохранение/загрузка проекта (localStorage, PNG)
│       └── 📄 init.js             ← Инициализация при загрузке DOM
│
── 📂 assets/                      ← Ресурсы (на будущее)
    └── 📂 icons/                   ← Иконки (если понадобятся)