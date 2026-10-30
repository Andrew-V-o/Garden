// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====

function initApp() {
  initDomRefs();
  loadCustomPlants();
  fitCanvasToScreen();
  createDefaultPlot();
  updateSvgViewBox();
  renderPlantList();
  render();
  updateHint();
  updateCanvasInfo();

  // Привязка обработчиков событий
  svg.addEventListener('mousedown', onMouseDown);
  svg.addEventListener('mousemove', onMouseMove);
  svg.addEventListener('mouseup', onMouseUp);
  svg.addEventListener('dblclick', onDblClick);
  document.addEventListener('keydown', onKeyDown);
  
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.obj-group')) {
      state.bedSubmenuOpen = false;
      document.getElementById('bedSubmenu').classList.remove('open');
      document.querySelector('.obj-btn[data-obj="bed"]').classList.remove('open');
    }
  });

  // Загрузка сохранённого проекта
  const saved = localStorage.getItem('gardenProject');
  if (saved) {
    try {
      const raw = JSON.parse(saved);
      
      // Проверяем, есть ли реальные данные (не пустой проект)
      const hasData = Array.isArray(raw) 
        ? raw.length > 0 
        : (raw.objects && raw.objects.length > 1); // >1 потому что участок всегда есть
      
      if (hasData) {
        if (confirm('Найден сохранённый проект. Загрузить?\n\n[OK] — загрузить\n[Отмена] — начать с чистого листа')) {
          if (Array.isArray(raw)) {
            migrateOldProject(raw);
          } else {
            state.objects = raw.objects || [];
            state.nextId = raw.nextId || 1;
            state.nextPlantingId = raw.nextPlantingId || 1;
            
            if (raw.canvasWidthM) state.canvasWidthM = raw.canvasWidthM;
            if (raw.canvasHeightM) state.canvasHeightM = raw.canvasHeightM;
            if (raw.scale) state.scale = raw.scale;
            
            if (!state.objects.find(o => o.type === 'plot')) {
              createDefaultPlot();
            }
            
            // Миграция старых посадок
            state.objects.forEach(o => {
              if (o.plants) {
                o.plants.forEach(pl => {
                  if (!pl.shape) pl.shape = 'circle';
                  if (!pl.r) pl.r = state.scale * 0.4;
                  if (pl.bloomStartMonth === undefined && pl.bloomStartDate === undefined) {
                    const plant = plants.find(p => p.id === pl.plantId);
                    if (plant) copyBloomDataFromPlant(plant, pl);
                  }
                });
              }
              // Миграция старых типов объектов
              if (o.type === 'rect' || o.type === 'circle' || o.type === 'poly' || o.type === 'morph') {
                migrateObjToBed(o);
              }
            });
            
            if (raw.plants) {
              plants = [...DEFAULT_PLANTS, ...raw.plants];
              saveCustomPlants();
              renderPlantList();
            }
          }
          updateSvgViewBox();
          updateCanvasInfo();
          render();
        } else {
          // Пользователь отказался — очищаем localStorage, чтобы не спрашивать снова
          if (confirm('Очистить сохранение, чтобы не спрашивать при следующей загрузке?')) {
            localStorage.removeItem('gardenProject');
          }
        }
      }
    } catch (e) {
      console.error('Ошибка загрузки проекта:', e);
    }
  }
  
  // Инициализация истории undo/redo
  initHistory();
}

document.addEventListener('DOMContentLoaded', initApp);