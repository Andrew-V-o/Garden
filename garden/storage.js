// ===== СОХРАНЕНИЕ / ЗАГРУЗКА =====

function saveProject() {
  const data = {
    objects: state.objects,
    plants: plants.filter(p => p.custom),
    nextId: state.nextId,
    nextPlantingId: state.nextPlantingId,
    canvasWidthM: state.canvasWidthM,
    canvasHeightM: state.canvasHeightM,
    scale: state.scale,
    version: 6,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'garden-project.json';
  a.click();
  URL.revokeObjectURL(url);
  localStorage.setItem('gardenProject', JSON.stringify(data));
  alert('✅ Проект сохранён!');
}

function loadProject() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target.result);
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

          state.objects.forEach(o => {
            if (o.type === 'rect' || o.type === 'circle' || o.type === 'poly' || o.type === 'morph') {
              migrateObjToBed(o);
            }
            if (o.plants) o.plants.forEach(pl => {
              if (!pl.shape) pl.shape = 'circle';
              if (!pl.r) pl.r = state.scale * 0.4;
            });
          });

          if (raw.plants) {
            plants = [...DEFAULT_PLANTS, ...raw.plants];
            saveCustomPlants();
          }
        }
        state.selectedId = null;
        state.selectedPlantingId = null;
        updateSvgViewBox();
        updateCanvasInfo();
        renderPlantList();
        render();
      } catch (err) {
        alert('❌ Ошибка: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

function migrateObjToBed(o) {
  if (o.type === 'rect') {
    o.points = generateRectPoints(o.x, o.y, o.w, o.h);
    delete o.x; delete o.y; delete o.w; delete o.h;
  } else if (o.type === 'circle') {
    o.points = generateCirclePoints(o.cx, o.cy, o.r);
    delete o.cx; delete o.cy; delete o.r;
  } else if (o.type === 'poly' || o.type === 'morph') {
    o.points = o.points || [];
  }
  o.type = 'bed';
  if (!o.plants) o.plants = [];
  if (o._oldPlant) {
    let cx, cy;
    if (o.points.length > 0) {
      const xs = o.points.map(p => p[0]), ys = o.points.map(p => p[1]);
      cx = (Math.min(...xs) + Math.max(...xs)) / 2;
      cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    }
    o.plants.push({
      id: state.nextPlantingId++,
      plantId: o._oldPlant,
      x: cx, y: cy,
      r: state.scale * 0.4,
      shape: 'circle',
    });
    delete o._oldPlant;
  }
}

function migrateOldProject(objects) {
  state.objects = [];
  state.nextId = 1;
  state.nextPlantingId = 1;

  createDefaultPlot();

  objects.forEach(o => {
    const newObj = { ...o };
    if (o.plant && o.type !== 'path' && o.type !== 'tree') {
      newObj._oldPlant = o.plant;
      delete newObj.plant;
    }
    if (newObj.type === 'rect' || newObj.type === 'circle' || newObj.type === 'poly' || newObj.type === 'morph') {
      migrateObjToBed(newObj);
    }
    if (!newObj.plants) newObj.plants = [];
    newObj.plants = newObj.plants.map(pl => ({
      ...pl,
      shape: pl.shape || 'circle',
      r: pl.r || state.scale * 0.4,
    }));
    state.objects.push(newObj);
    state.nextId = Math.max(state.nextId, newObj.id + 1);
  });
}

function createDefaultPlot() {
  const pad = getCanvasPadding();
  const w = state.canvasWidthM * state.scale;
  const h = state.canvasHeightM * state.scale;
  const plot = {
    id: state.nextId++,
    type: 'plot',
    // Участок со сдвигом на величину отступа — подписи сетки не обрезаются
    points: generateRectPoints(pad, pad, w, h),
    fill: '#c8e6a0',
    name: 'Участок',
  };
  state.objects.unshift(plot);
}

function clearAll() {
  if (!confirm('Удалить все объекты? Участок будет восстановлен.')) return;
  state.nextId = 1;
  state.nextPlantingId = 1;
  state.objects = [];
  state.selectedId = null;
  state.selectedPlantingId = null;
  createDefaultPlot();
  updateSvgViewBox();
  updateCanvasInfo();
  render();
}

function exportPNG() {
  const clone = svg.cloneNode(true);
  const size = getSvgInternalSize();
  clone.setAttribute('width', size.w);
  clone.setAttribute('height', size.h);
  const prev = clone.querySelector('#preview');
  const hnd = clone.querySelector('#handles');
  if (prev) prev.innerHTML = '';
  if (hnd) hnd.innerHTML = '';
  const xml = new XMLSerializer().serializeToString(clone);
  const svg64 = btoa(unescape(encodeURIComponent(xml)));
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const a = document.createElement('a');
    a.download = 'garden-plan.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = 'data:image/svg+xml;base64,' + svg64;
}

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
            if (o.plants) o.plants.forEach(pl => {
              if (!pl.shape) pl.shape = 'circle';
              if (!pl.r) pl.r = state.scale * 0.4;
            });
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
    } catch (e) { }
  }
}

document.addEventListener('DOMContentLoaded', initApp);