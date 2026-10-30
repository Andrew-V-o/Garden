// ===== ПРАВАЯ ПАНЕЛЬ СВОЙСТВ И СТАТИСТИКА =====

function renderSectionsList() {
  const list = document.getElementById('sectionsList');
  const beds = state.objects.filter(o => o.type === 'bed');
  if (beds.length === 0) {
    list.innerHTML = '<div class="empty-hint">Нарисуйте клумбу через панель объектов</div>';
    return;
  }
  list.innerHTML = '';
  beds.forEach(obj => {
    const plantsCount = (obj.plants || []).length;
    const el = document.createElement('div');
    el.className = 'section-item' + (obj.id === state.selectedId ? ' selected' : '');
    el.innerHTML = `
      <div class="section-color" style="background:${obj.fill}"></div>
      <div class="section-info">
        <b>${obj.name}</b>
        <span>🌱 ${plantsCount} посадок</span>
      </div>
      <button class="del-btn" title="Удалить">×</button>
    `;
    el.onclick = (e) => {
      if (e.target.classList.contains('del-btn')) {
        deleteObject(obj.id);
      } else {
        state.selectedId = obj.id;
        state.plantingMode = true;
        state.selectedPlantingId = null;
        state.tool = 'select';
        document.querySelectorAll('.tool-btn').forEach(b => {
          b.classList.toggle('active', b.dataset.tool === 'select');
        });
        document.querySelectorAll('.obj-btn').forEach(b => b.classList.remove('active'));
        render();
      }
    };
    list.appendChild(el);
  });
}

function renderPlantingsPanel() {
  const panel = document.getElementById('plantingsPanel');
  const obj = state.objects.find(o => o.id === state.selectedId);
  if (!obj || obj.type !== 'bed') {
    panel.innerHTML = '<div class="empty-hint">Выберите клумбу, чтобы добавить растения</div>';
    return;
  }
  const plantings = obj.plants || [];
  if (plantings.length === 0) {
    panel.innerHTML = `<div class="empty-hint">В этой клумбе пока нет посадок.<br>Выберите растение слева и кликайте внутри клумбы.</div>`;
    return;
  }
  let html = '<div class="planting-list">';
  plantings.forEach(pl => {
    const plant = plants.find(p => p.id === pl.plantId);
    const color = plant ? plant.color : '#999';
    const name = plant ? plant.name : 'Неизвестно';
    const sel = pl.id === state.selectedPlantingId ? ' selected' : '';
    html += `
      <div class="planting-row${sel}" data-pid="${pl.id}">
        <svg class="mini-dot" viewBox="0 0 16 16">${getShapeSVGMini(pl.shape || 'circle', color)}</svg>
        <span class="name">${name}</span>
        <button class="mini-del" data-del="${pl.id}" title="Удалить">×</button>
      </div>
    `;
  });
  html += '</div>';
  html += `<div class="planting-actions"><button onclick="clearPlantings()">🗑️ Очистить все</button></div>`;
  panel.innerHTML = html;

  panel.querySelectorAll('.planting-row').forEach(row => {
    row.onclick = (e) => {
      if (e.target.classList.contains('mini-del')) {
        deletePlanting(parseInt(e.target.dataset.del));
        return;
      }
      const pid = parseInt(row.dataset.pid);
      state.selectedPlantingId = pid;
      
      // ← Добавлен вызов popup при клике по строке в правой панели
      const currentObj = state.objects.find(o => o.id === state.selectedId);
      const planting = currentObj?.plants?.find(p => p.id === pid);
      if (planting && currentObj) {
        showPlantPopup(planting, currentObj);
      }
      
      render();
    };
  });
}

function clearPlantings() {
  saveState();
  const obj = state.objects.find(o => o.id === state.selectedId);
  if (obj && obj.plants) {
    if (!confirm('Удалить все посадки из этой клумбы?')) return;
    obj.plants = [];
    state.selectedPlantingId = null;
    render();
  }
}

function renderProps() {
  const panel = document.getElementById('propsPanel');
  const obj = state.objects.find(o => o.id === state.selectedId);
  if (!obj) {
    panel.innerHTML = '<div class="empty-hint">Выберите объект для редактирования</div>';
    return;
  }

  let html = '';
  const isFigureMode = obj.originalPointCount !== undefined;

  if (obj.type === 'plot') {
    const bbox = getObjBBox(obj);
    const plotWM = bbox ? Math.round(bbox.w / state.scale) : 0;
    const plotHM = bbox ? Math.round(bbox.h / state.scale) : 0;
    
    html += `
      <div class="prop-row">
        <span>Название:</span>
        <input type="text" value="${obj.name}" onchange="updateProp(${obj.id}, 'name', this.value)">
      </div>
      <div class="prop-row">
        <span>Цвет:</span>
        <input type="color" value="${obj.fill}" onchange="updateProp(${obj.id}, 'fill', this.value)">
      </div>
      <div class="prop-row" style="font-size:11px;color:#777;flex-direction:column;align-items:flex-start;gap:4px;border-top:1px solid #eee;padding-top:8px;margin-top:4px;">
        <span><b>📐 Размеры окна (изменяемые):</b></span>
      </div>
      <div class="prop-row">
        <span>Ширина (м):</span>
        <input type="number" value="${state.canvasWidthM}" min="5" max="500" onchange="setCanvasSizeMeters(+this.value, state.canvasHeightM)" style="width:80px">
      </div>
      <div class="prop-row">
        <span>Высота (м):</span>
        <input type="number" value="${state.canvasHeightM}" min="5" max="500" onchange="setCanvasSizeMeters(state.canvasWidthM, +this.value)" style="width:80px">
      </div>
      <div class="prop-row" style="font-size:11px;color:#777;flex-direction:column;align-items:flex-start;gap:4px;border-top:1px solid #eee;padding-top:8px;margin-top:4px;">
        <span><b>🏡 Текущий размер участка:</b> ${plotWM}×${plotHM} м</span>
        <span>Точек морфологии: ${obj.points.length}</span>
      </div>
    `;
    
    if (isFigureMode) {
      const baseCount = obj.originalPointCount;
      const currentCount = obj.points.length;
      
      const decimateButtons = [2, 3, 4, 5].map(div => {
        const targetPoints = currentCount / div;
        const canDecimate = Number.isInteger(targetPoints) && targetPoints >= baseCount;
        return `<button onclick="setMorphPoints(${obj.id}, ${Math.round(targetPoints)})" ${!canDecimate ? 'disabled' : ''} style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;background:${canDecimate ? 'white' : '#f0f0f0'};color:${canDecimate ? '#333' : '#bbb'};border-radius:4px;cursor:${canDecimate ? 'pointer' : 'not-allowed'};font-size:12px;">÷${div}</button>`;
      }).join('');
      
      const atBase = currentCount === baseCount;
      const resetBtn = `<button onclick="setMorphPoints(${obj.id}, ${baseCount})" ${atBase ? 'disabled' : ''} style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #d4a017;background:${atBase ? '#f0f0f0' : 'white'};color:${atBase ? '#bbb' : '#8a6d00'};border-radius:4px;cursor:${atBase ? 'not-allowed' : 'pointer'};font-size:12px;font-weight:600;">×1</button>`;
      
      const increaseButtons = [2, 3, 4, 5].map(mult => {
        const targetPoints = currentCount * mult;
        const canIncrease = targetPoints <= FIGURE_POINTS_LIMIT;
        return `<button onclick="setMorphPoints(${obj.id}, ${targetPoints})" ${!canIncrease ? 'disabled' : ''} style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;background:${canIncrease ? 'white' : '#f0f0f0'};color:${canIncrease ? '#333' : '#bbb'};border-radius:4px;cursor:${canIncrease ? 'pointer' : 'not-allowed'};font-size:12px;">×${mult}</button>`;
      }).join('');
      
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Уменьшить:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${decimateButtons}</div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Исходное:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${resetBtn}</div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Увеличить (лимит ${FIGURE_POINTS_LIMIT}):</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${increaseButtons}</div>
        </div>
      `;
    } else {
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Количество точек:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${[4, 8, 12, 16, 24, 32].map(n => `
              <button onclick="setMorphPoints(${obj.id}, ${n})" style="flex:1;min-width:40px;padding:6px 4px;border:2px solid ${obj.points.length === n ? '#4a7c59' : '#ccc'};background:${obj.points.length === n ? '#4a7c59' : 'white'};color:${obj.points.length === n ? 'white' : '#333'};border-radius:4px;cursor:pointer;font-size:12px;">${n}</button>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    html += `<button onclick="fitPlotToCanvas()" style="width:100%;background:#4a7c59;color:white;border:none;padding:10px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;margin-top:8px;">Под размер окна</button>`;
  } else if (obj.type === 'bed') {
    html += `
      <div class="prop-row">
        <span>Название:</span>
        <input type="text" value="${obj.name}" onchange="updateProp(${obj.id}, 'name', this.value)">
      </div>
      <div class="prop-row">
        <span>Цвет:</span>
        <input type="color" value="${obj.fill}" onchange="updateProp(${obj.id}, 'fill', this.value)">
      </div>
      <div class="prop-row" style="font-size:11px;color:#777;flex-direction:column;align-items:flex-start;gap:4px;border-top:1px solid #eee;padding-top:8px;margin-top:4px;">
        <span><b>🌱 Клумба:</b></span>
        <span>Точек морфологии: ${obj.points.length}${isFigureMode ? ` (база: ${obj.originalPointCount})` : ''}</span>
      </div>
    `;
    
    if (isFigureMode) {
      const baseCount = obj.originalPointCount;
      const currentCount = obj.points.length;
      
      const decimateButtons = [2, 3, 4, 5].map(div => {
        const targetPoints = currentCount / div;
        const canDecimate = Number.isInteger(targetPoints) && targetPoints >= baseCount;
        return `<button onclick="setMorphPoints(${obj.id}, ${Math.round(targetPoints)})" ${!canDecimate ? 'disabled' : ''} style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;background:${canDecimate ? 'white' : '#f0f0f0'};color:${canDecimate ? '#333' : '#bbb'};border-radius:4px;cursor:${canDecimate ? 'pointer' : 'not-allowed'};font-size:12px;">÷${div}</button>`;
      }).join('');
      
      const atBase = currentCount === baseCount;
      const resetBtn = `<button onclick="setMorphPoints(${obj.id}, ${baseCount})" ${atBase ? 'disabled' : ''} style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #d4a017;background:${atBase ? '#f0f0f0' : 'white'};color:${atBase ? '#bbb' : '#8a6d00'};border-radius:4px;cursor:${atBase ? 'not-allowed' : 'pointer'};font-size:12px;font-weight:600;">×1</button>`;
      
      const increaseButtons = [2, 3, 4, 5].map(mult => {
        const targetPoints = currentCount * mult;
        const canIncrease = targetPoints <= FIGURE_POINTS_LIMIT;
        return `<button onclick="setMorphPoints(${obj.id}, ${targetPoints})" ${!canIncrease ? 'disabled' : ''} style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;background:${canIncrease ? 'white' : '#f0f0f0'};color:${canIncrease ? '#333' : '#bbb'};border-radius:4px;cursor:${canIncrease ? 'pointer' : 'not-allowed'};font-size:12px;">×${mult}</button>`;
      }).join('');
      
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Уменьшить:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${decimateButtons}</div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Исходное:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${resetBtn}</div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Увеличить (лимит ${FIGURE_POINTS_LIMIT}):</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${increaseButtons}</div>
        </div>
      `;
    } else {
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Количество точек:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${[4, 8, 12, 16, 24, 32].map(n => `
              <button onclick="setMorphPoints(${obj.id}, ${n})" style="flex:1;min-width:40px;padding:6px 4px;border:2px solid ${obj.points.length === n ? '#4a7c59' : '#ccc'};background:${obj.points.length === n ? '#4a7c59' : 'white'};color:${obj.points.length === n ? 'white' : '#333'};border-radius:4px;cursor:pointer;font-size:12px;">${n}</button>
            `).join('')}
          </div>
        </div>
      `;
    }
  } else if (obj.type === 'mulch') {
    const bed = state.objects.find(o => o.id === obj.bedId);
    const skinOptions = MULCH_SKINS.map(s => 
      `<option value="${s.id}" ${(obj.skin || 'bark') === s.id ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    const densityVal = obj.densityMultiplier != null ? obj.densityMultiplier : 1.0;
    
    html += `
      <div class="prop-row">
        <span>Тип:</span>
        <span style="font-weight:600;">🟫 Мульча</span>
      </div>
      <div class="prop-row">
        <span>Клумба:</span>
        <span style="font-weight:600;">${bed ? bed.name : 'Не найдена'}</span>
      </div>
      <div class="prop-row">
        <span>Скин:</span>
        <select onchange="updateProp(${obj.id}, 'skin', this.value)">
          ${skinOptions}
        </select>
      </div>
      <div class="prop-row">
        <span>Форма:</span>
        <select onchange="updateProp(${obj.id}, 'shape', this.value)">
          <option value="rect" ${obj.shape === 'rect' ? 'selected' : ''}>Прямоугольник</option>
          <option value="circle" ${obj.shape === 'circle' ? 'selected' : ''}>Круг</option>
        </select>
      </div>
      <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:4px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>Плотность частиц:</span>
          <span id="mulchDensityVal" style="font-size:11px;color:#555;">×${densityVal.toFixed(1)}</span>
        </div>
        <input type="range" min="0.2" max="3.0" step="0.1" value="${densityVal}" 
               oninput="updateMulchDensity(${obj.id}, +this.value)" 
               style="width:100%;">
      </div>
      <div class="prop-row">
        <span>Ширина (м):</span>
        <input type="number" value="${(obj.w / state.scale).toFixed(1)}" min="0.5" max="100" step="0.5" onchange="updateMulchSize(${obj.id}, 'w', +this.value)">
      </div>
      <div class="prop-row">
        <span>Высота (м):</span>
        <input type="number" value="${(obj.h / state.scale).toFixed(1)}" min="0.5" max="100" step="0.5" onchange="updateMulchSize(${obj.id}, 'h', +this.value)">
      </div>
    `;
  } else if (obj.type === 'path') {
    const skinOptions = PATH_SKINS.map(s => 
      `<option value="${s.id}" ${(obj.skin || 'gravel') === s.id ? 'selected' : ''}>${s.name}</option>`
    ).join('');
    const densityVal = obj.densityMultiplier != null ? obj.densityMultiplier : 1.0;
    
    html += `
      <div class="prop-row">
        <span>Тип:</span>
        <span style="font-weight:600;">🛤️ Дорожка</span>
      </div>
      <div class="prop-row">
        <span>Название:</span>
        <input type="text" value="${obj.name}" onchange="updateProp(${obj.id}, 'name', this.value)">
      </div>
      <div class="prop-row">
        <span>Скин:</span>
        <select onchange="updateProp(${obj.id}, 'skin', this.value)">
          ${skinOptions}
        </select>
      </div>
      <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:4px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span>Плотность частиц:</span>
          <span id="pathDensityVal" style="font-size:11px;color:#555;">×${densityVal.toFixed(1)}</span>
        </div>
        <input type="range" min="0.2" max="3.0" step="0.1" value="${densityVal}" 
               oninput="updatePathDensity(${obj.id}, +this.value)" 
               style="width:100%;">
      </div>
      <div class="prop-row">
        <span>Цвет:</span>
        <input type="color" value="${obj.fill}" onchange="updateProp(${obj.id}, 'fill', this.value)">
      </div>
    `;
  } else if (obj.type === 'tree') {
    const tree = trees.find(t => t.id === obj.treeId);
    const taskCount = getTasksCount(obj);
    html += `
      <div class="prop-row">
        <span>Тип дерева:</span>
        <span style="font-weight:600;">${tree ? tree.name : 'Неизвестно'}</span>
      </div>
      <div class="prop-row">
        <span>Размер:</span>
        <input type="number" value="${Math.round(obj.r)}" min="10" max="200" onchange="updateProp(${obj.id}, 'r', +this.value)">
      </div>
      <div class="prop-row" style="border-top:1px solid #eee;padding-top:8px;margin-top:4px;">
        <button onclick="openTasksForObject('object', ${obj.id})" style="flex:1;padding:6px;background:#4a7c59;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;">
          📋 Задачи (${taskCount.active})
        </button>
      </div>
    `;
  } else if (obj.type === 'decor') {
    const decorNames = { water: '💧 Водоём' };
    html += `
      <div class="prop-row">
        <span>Тип:</span>
        <span style="font-weight:600;">${decorNames[obj.decorType] || 'Объект'}</span>
      </div>
      <div class="prop-row">
        <span>Название:</span>
        <input type="text" value="${obj.name}" onchange="updateProp(${obj.id}, 'name', this.value)">
      </div>
      <div class="prop-row">
        <span>Цвет:</span>
        <input type="color" value="${obj.fill}" onchange="updateProp(${obj.id}, 'fill', this.value)">
      </div>
      <div class="prop-row">
        <span>Ширина (м):</span>
        <input type="number" value="${Math.round(obj.w / state.scale)}" min="1" max="100" onchange="updateDecorSize(${obj.id}, 'w', +this.value)">
      </div>
      <div class="prop-row">
        <span>Высота (м):</span>
        <input type="number" value="${Math.round(obj.h / state.scale)}" min="1" max="100" onchange="updateDecorSize(${obj.id}, 'h', +this.value)">
      </div>
    `;
  } else {
    html += `
      <div class="prop-row">
        <span>Название:</span>
        <input type="text" value="${obj.name}" onchange="updateProp(${obj.id}, 'name', this.value)">
      </div>
      <div class="prop-row">
        <span>Цвет:</span>
        <input type="color" value="${obj.fill}" onchange="updateProp(${obj.id}, 'fill', this.value)">
      </div>
    `;
  }

  // Характеристики выбранной посадки растения
  if (obj.type === 'bed' && state.selectedPlantingId) {
    const planting = obj.plants.find(p => p.id === state.selectedPlantingId);
    if (planting) {
      const plant = plants.find(p => p.id === planting.plantId);
      if (plant) {
        const flowerSizeData = FLOWER_SIZES.find(s => s.id === (planting.flowerSize || plant.flowerSize));
        const flowerCountData = FLOWER_COUNTS.find(c => c.id === (planting.flowerCount || plant.flowerCount));
        const height = planting.height || plant.height || 50;
        
        html += `
          <div class="prop-row" style="font-size:11px;color:#777;flex-direction:column;align-items:flex-start;gap:4px;border-top:1px solid #eee;padding-top:8px;margin-top:4px;">
            <span><b>🌱 Характеристики растения:</b></span>
            <span>📏 Высота: ${height} см</span>
            <span>${flowerSizeData ? flowerSizeData.icon : '🔷'} Размер цветов: ${flowerSizeData ? flowerSizeData.name : 'Средние'}</span>
            <span>${flowerCountData ? flowerCountData.icon : '🌺'} Количество: ${flowerCountData ? flowerCountData.name : '6-15'}</span>
          </div>
        `;
      }
    }
  }

  panel.innerHTML = html;
}

function updateProp(id, key, value) {
  saveState();
  const obj = state.objects.find(o => o.id === id);
  if (!obj) return;
  obj[key] = value;
  render();
}

function updateDecorSize(id, dim, valueM) {
  saveState();
  const obj = state.objects.find(o => o.id === id);
  if (!obj || obj.type !== 'decor') return;
  const value = Math.max(1, Math.min(100, valueM)) * state.scale;
  obj[dim] = value;
  render();
}

function updateMulchSize(id, dim, valueM) {
  saveState();
  const obj = state.objects.find(o => o.id === id);
  if (!obj || obj.type !== 'mulch') return;
  const value = Math.max(0.5, Math.min(100, valueM)) * state.scale;
  obj[dim] = value;
  render();
}

function updateMulchDensity(id, value) {
  saveState();
  const obj = state.objects.find(o => o.id === id);
  if (!obj || obj.type !== 'mulch') return;
  obj.densityMultiplier = Math.max(0.2, Math.min(3.0, value));
  const label = document.getElementById('mulchDensityVal');
  if (label) label.textContent = '×' + obj.densityMultiplier.toFixed(1);
  render();
}

function updatePathDensity(id, value) {
  saveState();
  const obj = state.objects.find(o => o.id === id);
  if (!obj || obj.type !== 'path') return;
  obj.densityMultiplier = Math.max(0.2, Math.min(3.0, value));
  const label = document.getElementById('pathDensityVal');
  if (label) label.textContent = '×' + obj.densityMultiplier.toFixed(1);
  render();
}

function renderStats() {
  const beds = state.objects.filter(o => o.type === 'bed');
  let area = 0;
  beds.forEach(o => {
    if (o.points) area += Math.abs(polygonArea(o.points));
  });
  const areaM2 = area / (state.scale * state.scale);
  let plantsCount = 0;
  beds.forEach(o => { plantsCount += (o.plants || []).length; });
  document.getElementById('statSections').textContent = beds.length;
  document.getElementById('statArea').textContent = areaM2.toFixed(1) + ' м²';
  document.getElementById('statPlants').textContent = plantsCount;
}