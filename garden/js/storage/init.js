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
      if (Array.isArray(raw)) {
        if (raw.length > 0 && confirm('Найден старый проект. Загрузить?')) {
          migrateOldProject(raw);
          updateSvgViewBox();
          updateCanvasInfo();
          renderPlantList();
          render();
        }
      } else if (raw.objects && raw.objects.length > 0) {
        if (confirm('Найден сохранённый проект. Загрузить?')) {
          state.objects = raw.objects;
          state.nextId = raw.nextId || 1;
          state.nextPlantingId = raw.nextPlantingId || 1;
          
          if (raw.canvasWidthM) state.canvasWidthM = raw.canvasWidthM;
          if (raw.canvasHeightM) state.canvasHeightM = raw.canvasHeightM;
          if (raw.scale) state.scale = raw.scale;
          
          if (!state.objects.find(o => o.type === 'plot')) {
            createDefaultPlot();
          }
          
          state.objects.forEach(o => {
            if (o.type === 'rect' || o.type === 'circle' || o.type === 'poly' || o.type === 'morph') {
              migrateObjToBed(o);
            }
            if (o.plants) {
              o.plants.forEach(pl => {
                if (!pl.shape) pl.shape = 'circle';
                if (!pl.r) pl.r = state.scale * 0.4;
              });
            }
          });
          
          if (raw.plants) {
            plants = [...DEFAULT_PLANTS, ...raw.plants];
            saveCustomPlants();
            renderPlantList();
          }
          
          updateSvgViewBox();
          updateCanvasInfo();
          render();
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