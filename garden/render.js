// ===== РЕНДЕРИНГ =====

function renderPlot() {
  plotLayer.innerHTML = '';
  const plot = state.objects.find(o => o.type === 'plot');
  if (!plot) return;

  const isSelected = state.selectedId === plot.id;

  const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  poly.setAttribute('points', plot.points.map(p => p.join(',')).join(' '));
  poly.setAttribute('fill', plot.fill || '#c8e6a0');
  poly.setAttribute('stroke', isSelected ? '#ff6b00' : '#5d4037');
  poly.setAttribute('stroke-width', isSelected ? 4 : 3);
  poly.setAttribute('data-id', plot.id);
  poly.style.cursor = 'pointer';
  plotLayer.appendChild(poly);

  const bbox = getObjBBox(plot);
  if (!bbox) return;

  const outerGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  outerGroup.setAttribute('pointer-events', 'none');

  const startX = Math.floor(bbox.x / state.scale) * state.scale;
  const startY = Math.floor(bbox.y / state.scale) * state.scale;

  for (let x = startX; x <= bbox.x + bbox.w + 0.1; x += state.scale) {
    const m = Math.round((x - bbox.x) / state.scale);

    const textTop = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textTop.setAttribute('x', x);
    textTop.setAttribute('y', bbox.y - 4);
    textTop.setAttribute('text-anchor', 'middle');
    textTop.setAttribute('font-size', '10');
    textTop.setAttribute('fill', '#5d4037');
    textTop.textContent = m + 'м';
    outerGroup.appendChild(textTop);

    const textBottom = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textBottom.setAttribute('x', x);
    textBottom.setAttribute('y', bbox.y + bbox.h + 12);
    textBottom.setAttribute('text-anchor', 'middle');
    textBottom.setAttribute('font-size', '10');
    textBottom.setAttribute('fill', '#5d4037');
    textBottom.textContent = m + 'м';
    outerGroup.appendChild(textBottom);
  }

  for (let y = startY; y <= bbox.y + bbox.h + 0.1; y += state.scale) {
    const m = Math.round((y - bbox.y) / state.scale);

    const textLeft = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textLeft.setAttribute('x', bbox.x - 4);
    textLeft.setAttribute('y', y + 4);
    textLeft.setAttribute('text-anchor', 'end');
    textLeft.setAttribute('font-size', '10');
    textLeft.setAttribute('fill', '#5d4037');
    textLeft.textContent = m + 'м';
    outerGroup.appendChild(textLeft);

    const textRight = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textRight.setAttribute('x', bbox.x + bbox.w + 4);
    textRight.setAttribute('y', y + 4);
    textRight.setAttribute('text-anchor', 'start');
    textRight.setAttribute('font-size', '10');
    textRight.setAttribute('fill', '#5d4037');
    textRight.textContent = m + 'м';
    outerGroup.appendChild(textRight);
  }

  plotLayer.appendChild(outerGroup);
}

function render() {
  objectsLayer.innerHTML = '';
  handlesLayer.innerHTML = '';

  renderPlot();

  state.objects.forEach(obj => {
    if (obj.type === 'plot') return;

    if (obj.type === 'tree') {
      const isSelected = obj.id === state.selectedId;
      const shadow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      shadow.setAttribute('cx', obj.x + 5); shadow.setAttribute('cy', obj.y + 5);
      shadow.setAttribute('r', obj.r);
      shadow.setAttribute('fill', 'rgba(0,0,0,0.15)');
      objectsLayer.appendChild(shadow);
      const crown = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      crown.setAttribute('cx', obj.x); crown.setAttribute('cy', obj.y);
      crown.setAttribute('r', obj.r);
      crown.setAttribute('fill', obj.fill);
      crown.setAttribute('stroke', isSelected ? '#ff6b00' : '#1b5e20');
      crown.setAttribute('stroke-width', isSelected ? 3 : 2);
      crown.setAttribute('data-id', obj.id);
      crown.style.cursor = 'pointer';
      objectsLayer.appendChild(crown);
      const trunk = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      trunk.setAttribute('cx', obj.x); trunk.setAttribute('cy', obj.y);
      trunk.setAttribute('r', obj.r * 0.2);
      trunk.setAttribute('fill', '#5d4037');
      objectsLayer.appendChild(trunk);
      return;
    }

    if (obj.type === 'path') {
      const isSelected = obj.id === state.selectedId;
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = `M ${obj.points[0][0]} ${obj.points[0][1]}`;
      for (let i = 1; i < obj.points.length; i++) d += ` L ${obj.points[i][0]} ${obj.points[i][1]}`;
      el.setAttribute('d', d);
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', isSelected ? '#ff6b00' : obj.fill);
      el.setAttribute('stroke-width', '30');
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('stroke-linejoin', 'round');
      el.setAttribute('data-id', obj.id);
      el.style.cursor = 'pointer';
      objectsLayer.appendChild(el);
      return;
    }

    if (obj.type === 'bed') {
      const isSelected = obj.id === state.selectedId;
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      el.setAttribute('points', obj.points.map(p => p.join(',')).join(' '));
      el.setAttribute('fill', obj.fill);
      el.setAttribute('stroke', isSelected ? '#ff6b00' : '#333');
      el.setAttribute('stroke-width', isSelected ? 3 : 1.5);
      el.setAttribute('data-id', obj.id);
      el.style.cursor = 'pointer';
      objectsLayer.appendChild(el);

      if (obj.plants && obj.plants.length > 0) {
        obj.plants.forEach(pl => {
          const plant = plants.find(p => p.id === pl.plantId);
          const color = plant ? plant.color : '#999';
          const shape = pl.shape || 'circle';
          const r = pl.r || state.scale * 0.4;
          const isSelectedPlanting = pl.id === state.selectedPlantingId;

          const shapeEl = createShapeElement(shape, pl.x, pl.y, r, color);
          if (shapeEl.tagName === 'g') {
            shapeEl.setAttribute('stroke', isSelectedPlanting ? '#ff6b00' : 'white');
            shapeEl.setAttribute('stroke-width', isSelectedPlanting ? 2 : 1.5);
            shapeEl.style.cursor = state.tool === 'move' ? 'grab' : 'pointer';
            shapeEl.setAttribute('data-planting-id', pl.id);
            objectsLayer.appendChild(shapeEl);
          } else {
            shapeEl.setAttribute('stroke', isSelectedPlanting ? '#ff6b00' : 'white');
            shapeEl.setAttribute('stroke-width', isSelectedPlanting ? 2 : 1.5);
            shapeEl.style.cursor = state.tool === 'move' ? 'grab' : 'pointer';
            shapeEl.setAttribute('data-planting-id', pl.id);
            objectsLayer.appendChild(shapeEl);
          }

          if (plant) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', pl.x);
            text.setAttribute('y', pl.y + r + 12);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '10');
            text.setAttribute('font-weight', '600');
            text.setAttribute('fill', '#2d3a2e');
            text.setAttribute('pointer-events', 'none');
            text.textContent = plant.name;
            objectsLayer.appendChild(text);
          }
        });
      }
    }
  });

  if (state.selectedId && state.tool === 'select') {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj) {
      if (obj.type !== 'path') {
        drawResizeHandles(obj);
      }
      if (obj.points && obj.type !== 'path') {
        drawMorphHandles(obj);
      }
    }
  }

  renderSectionsList();
  renderPlantingsPanel();
  renderProps();
  renderStats();
}

function drawResizeHandles(obj) {
  const bbox = getObjBBox(obj);
  if (!bbox) return;
  const { x, y, w, h } = bbox;
  const offset = 8;
  const handles = [
    { id: 'nw', cx: x - offset, cy: y - offset },
    { id: 'n',  cx: x + w / 2, cy: y - offset },
    { id: 'ne', cx: x + w + offset, cy: y - offset },
    { id: 'e',  cx: x + w + offset, cy: y + h / 2 },
    { id: 'se', cx: x + w + offset, cy: y + h + offset },
    { id: 's',  cx: x + w / 2, cy: y + h + offset },
    { id: 'sw', cx: x - offset, cy: y + h + offset },
    { id: 'w',  cx: x - offset, cy: y + h / 2 },
  ];
  handles.forEach(h => {
    const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    r.setAttribute('x', h.cx - 5); r.setAttribute('y', h.cy - 5);
    r.setAttribute('width', 10); r.setAttribute('height', 10);
    r.setAttribute('fill', 'white');
    r.setAttribute('stroke', '#ff6b00');
    r.setAttribute('stroke-width', 2);
    r.setAttribute('data-handle', h.id);
    r.style.cursor = getCursorForHandle(h.id);
    handlesLayer.appendChild(r);
  });
}

function drawMorphHandles(obj) {
  if (!obj.points) return;
  obj.points.forEach((p, idx) => {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]);
    c.setAttribute('r', obj.type === 'plot' ? 6 : 5);
    c.setAttribute('fill', obj.type === 'plot' ? '#5d4037' : '#9c27b0');
    c.setAttribute('stroke', 'white');
    c.setAttribute('stroke-width', 2);
    c.setAttribute('data-morph-idx', idx);
    c.style.cursor = 'move';
    handlesLayer.appendChild(c);
  });
}

function getCursorForHandle(h) {
  const map = {
    nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize',
    n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize'
  };
  return map[h] || 'pointer';
}

function renderPreview() {
  previewLayer.innerHTML = '';
  if (!state.drawing) return;

  if ((state.drawing.type === 'rect' || state.drawing.type === 'circle') && state.drawing.x2 !== undefined) {
    const x = Math.min(state.drawing.x1, state.drawing.x2);
    const y = Math.min(state.drawing.y1, state.drawing.y2);
    const w = Math.abs(state.drawing.x2 - state.drawing.x1);
    const h = Math.abs(state.drawing.y2 - state.drawing.y1);

    if (state.drawing.type === 'rect') {
      const r = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r.setAttribute('x', x); r.setAttribute('y', y);
      r.setAttribute('width', w); r.setAttribute('height', h);
      r.setAttribute('fill', document.getElementById('fillColor').value);
      r.setAttribute('fill-opacity', '0.5');
      r.setAttribute('stroke', '#333');
      r.setAttribute('stroke-width', '2');
      r.setAttribute('stroke-dasharray', '5,5');
      previewLayer.appendChild(r);
    } else {
      const cx = x + w / 2, cy = y + h / 2;
      const rad = Math.min(w, h) / 2;
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', cx); c.setAttribute('cy', cy);
      c.setAttribute('r', rad);
      c.setAttribute('fill', document.getElementById('fillColor').value);
      c.setAttribute('fill-opacity', '0.5');
      c.setAttribute('stroke', '#333');
      c.setAttribute('stroke-width', '2');
      c.setAttribute('stroke-dasharray', '5,5');
      previewLayer.appendChild(c);
    }
  } else if (state.drawing.type === 'poly' || state.drawing.type === 'path') {
    const pts = state.drawing.points;
    if (state.drawing.type === 'poly') {
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', pts.map(p => p.join(',')).join(' '));
      poly.setAttribute('fill', document.getElementById('fillColor').value);
      poly.setAttribute('fill-opacity', '0.5');
      poly.setAttribute('stroke', '#333');
      poly.setAttribute('stroke-width', '2');
      poly.setAttribute('stroke-dasharray', '5,5');
      previewLayer.appendChild(poly);
    } else {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      let d = `M ${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) d += ` L ${pts[i][0]} ${pts[i][1]}`;
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', '#b8a88a');
      path.setAttribute('stroke-width', '30');
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('opacity', '0.6');
      previewLayer.appendChild(path);
    }
    pts.forEach(p => {
      const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      c.setAttribute('cx', p[0]); c.setAttribute('cy', p[1]);
      c.setAttribute('r', 4); c.setAttribute('fill', '#333');
      previewLayer.appendChild(c);
    });
  }
}

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
      state.selectedPlantingId = parseInt(row.dataset.pid);
      render();
    };
  });
}

function clearPlantings() {
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

  // Определяем, показывать ли панель как у фигуры
  // Для фигуры: всегда
  // Для не-фигуры: только если morphModified === true
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
        <span><b>📐 Размеры окна и участка:</b></span>
      </div>
      <div class="prop-row">
        <span>Ширина (м):</span>
        <input type="number" value="${state.canvasWidthM}" min="5" max="500" 
               onchange="setCanvasSizeMeters(+this.value, state.canvasHeightM)" 
               style="width:80px">
      </div>
      <div class="prop-row">
        <span>Высота (м):</span>
        <input type="number" value="${state.canvasHeightM}" min="5" max="500" 
               onchange="setCanvasSizeMeters(state.canvasWidthM, +this.value)" 
               style="width:80px">
      </div>
      <div class="prop-row" style="font-size:11px;color:#777;flex-direction:column;align-items:flex-start;gap:4px;border-top:1px solid #eee;padding-top:8px;margin-top:4px;">
        <span><b>🏡 Участок:</b> ${plotWM}×${plotHM} м</span>
        <span>Точек морфологии: ${obj.points.length}</span>
        ${obj.morphModified ? '<span style="color:#d4a017;"> Форма изменена</span>' : ''}
      </div>
    `;
    
    if (isFigureMode) {
      // Панель как у фигуры
      const baseCount = obj.originalPointCount;
      const currentCount = obj.points.length;
      const currentMultiplier = Math.round(currentCount / baseCount);
      const maxMultiplier = Math.floor(FIGURE_POINTS_LIMIT / baseCount);
      
      const decimateButtons = [2, 3, 4, 5].map(div => {
        const targetPoints = currentCount / div;
        const canDecimate = Number.isInteger(targetPoints) && targetPoints >= baseCount;
        return `
          <button onclick="setMorphPoints(${obj.id}, ${Math.round(targetPoints)})" 
                  ${!canDecimate ? 'disabled' : ''}
                  style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;
                         background:${canDecimate ? 'white' : '#f0f0f0'};
                         color:${canDecimate ? '#333' : '#bbb'};
                         border-radius:4px;cursor:${canDecimate ? 'pointer' : 'not-allowed'};
                         font-size:12px;">
            ÷${div}
          </button>
        `;
      }).join('');
      
      const atBase = currentCount === baseCount;
      const resetBtn = `
        <button onclick="setMorphPoints(${obj.id}, ${baseCount})" 
                ${atBase ? 'disabled' : ''}
                style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #d4a017;
                       background:${atBase ? '#f0f0f0' : 'white'};
                       color:${atBase ? '#bbb' : '#8a6d00'};
                       border-radius:4px;cursor:${atBase ? 'not-allowed' : 'pointer'};
                       font-size:12px;font-weight:600;">
          ×1
        </button>
      `;
      
      const increaseButtons = [2, 3, 4, 5].map(mult => {
        const targetPoints = currentCount * mult;
        const canIncrease = targetPoints <= FIGURE_POINTS_LIMIT;
        return `
          <button onclick="setMorphPoints(${obj.id}, ${targetPoints})" 
                  ${!canIncrease ? 'disabled' : ''}
                  style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;
                         background:${canIncrease ? 'white' : '#f0f0f0'};
                         color:${canIncrease ? '#333' : '#bbb'};
                         border-radius:4px;cursor:${canIncrease ? 'pointer' : 'not-allowed'};
                         font-size:12px;">
            ×${mult}
          </button>
        `;
      }).join('');
      
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Уменьшить количество точек:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${decimateButtons}
          </div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Вернуться к исходному:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${resetBtn}
          </div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Увеличить количество точек (лимит ${FIGURE_POINTS_LIMIT}):</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${increaseButtons}
          </div>
        </div>
        <div class="prop-row" style="font-size:10px;color:#999;flex-direction:column;align-items:flex-start;gap:2px;margin-top:2px;">
          <span>Форма сохраняется при смене количества точек</span>
          <span>Лимит: ${FIGURE_POINTS_LIMIT} точек</span>
        </div>
      `;
    } else {
      // Обычная панель для недеформированного участка
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Количество точек:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${[4, 8, 12, 16, 24, 32].map(n => `
              <button onclick="setMorphPoints(${obj.id}, ${n})" 
                      style="flex:1;min-width:40px;padding:6px 4px;border:2px solid ${obj.points.length === n ? '#4a7c59' : '#ccc'};
                             background:${obj.points.length === n ? '#4a7c59' : 'white'};
                             color:${obj.points.length === n ? 'white' : '#333'};
                             border-radius:4px;cursor:pointer;font-size:12px;font-weight:${obj.points.length === n ? '600' : '400'};">
                ${n}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="prop-row" style="font-size:10px;color:#999;flex-direction:column;align-items:flex-start;gap:2px;margin-top:2px;">
          <span>4 — только углы</span>
          <span>8 — углы + середины сторон</span>
          <span>12, 16 — для сложных форм</span>
          <span>24, 32 — для плавных изгибов</span>
        </div>
      `;
    }
    
    html += `
      <button onclick="fitPlotToCanvas()" style="
        width: 100%;
        background: #4a7c59;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 600;
        margin-top: 8px;
        transition: all 0.15s;
      " onmouseover="this.style.background='#3a6347'" onmouseout="this.style.background='#4a7c59'">
         Под размер окна
      </button>
    `;
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
        ${isFigureMode ? '<span style="color:#4a7c59;">✓ Форма зафиксирована</span>' : '<span>Двойной клик по границе — добавить точку</span>'}
        ${obj.morphModified && !obj.originalPointCount ? '<span style="color:#d4a017;">⚠ Форма изменена</span>' : ''}
      </div>
    `;
    
    if (isFigureMode) {
      // Панель как у фигуры (для настоящей фигуры или деформированной не-фигуры)
      const baseCount = obj.originalPointCount;
      const currentCount = obj.points.length;
      const maxMultiplier = Math.floor(FIGURE_POINTS_LIMIT / baseCount);
      
      const decimateButtons = [2, 3, 4, 5].map(div => {
        const targetPoints = currentCount / div;
        const canDecimate = Number.isInteger(targetPoints) && targetPoints >= baseCount;
        return `
          <button onclick="setMorphPoints(${obj.id}, ${Math.round(targetPoints)})" 
                  ${!canDecimate ? 'disabled' : ''}
                  style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;
                         background:${canDecimate ? 'white' : '#f0f0f0'};
                         color:${canDecimate ? '#333' : '#bbb'};
                         border-radius:4px;cursor:${canDecimate ? 'pointer' : 'not-allowed'};
                         font-size:12px;">
            ÷${div}
          </button>
        `;
      }).join('');
      
      const atBase = currentCount === baseCount;
      const resetBtn = `
        <button onclick="setMorphPoints(${obj.id}, ${baseCount})" 
                ${atBase ? 'disabled' : ''}
                style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #d4a017;
                       background:${atBase ? '#f0f0f0' : 'white'};
                       color:${atBase ? '#bbb' : '#8a6d00'};
                       border-radius:4px;cursor:${atBase ? 'not-allowed' : 'pointer'};
                       font-size:12px;font-weight:600;">
          ×1
        </button>
      `;
      
      const increaseButtons = [2, 3, 4, 5].map(mult => {
        const targetPoints = currentCount * mult;
        const canIncrease = targetPoints <= FIGURE_POINTS_LIMIT;
        return `
          <button onclick="setMorphPoints(${obj.id}, ${targetPoints})" 
                  ${!canIncrease ? 'disabled' : ''}
                  style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;
                         background:${canIncrease ? 'white' : '#f0f0f0'};
                         color:${canIncrease ? '#333' : '#bbb'};
                         border-radius:4px;cursor:${canIncrease ? 'pointer' : 'not-allowed'};
                         font-size:12px;">
            ×${mult}
          </button>
        `;
      }).join('');
      
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Уменьшить количество точек:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${decimateButtons}
          </div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Вернуться к исходному:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${resetBtn}
          </div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Увеличить количество точек (лимит ${FIGURE_POINTS_LIMIT}):</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${increaseButtons}
          </div>
        </div>
        <div class="prop-row" style="font-size:10px;color:#999;flex-direction:column;align-items:flex-start;gap:2px;margin-top:2px;">
          <span>Форма клумбы не изменяется при смене количества точек</span>
          <span>Лимит: ${FIGURE_POINTS_LIMIT} точек</span>
        </div>
      `;
    } else {
      // Обычная панель для недеформированной клумбы
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Количество точек:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${[4, 8, 12, 16, 24, 32].map(n => `
              <button onclick="setMorphPoints(${obj.id}, ${n})" 
                      style="flex:1;min-width:40px;padding:6px 4px;border:2px solid ${obj.points.length === n ? '#4a7c59' : '#ccc'};
                             background:${obj.points.length === n ? '#4a7c59' : 'white'};
                             color:${obj.points.length === n ? 'white' : '#333'};
                             border-radius:4px;cursor:pointer;font-size:12px;font-weight:${obj.points.length === n ? '600' : '400'};">
                ${n}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="prop-row" style="font-size:10px;color:#999;flex-direction:column;align-items:flex-start;gap:2px;margin-top:2px;">
          <span>4 — только углы (прямоугольник)</span>
          <span>8 — углы + середины</span>
          <span>12, 16 — для сложных форм</span>
          <span>24, 32 — для плавных изгибов</span>
        </div>
      `;
    }
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

    if (obj.type === 'tree') {
      html += `
        <div class="prop-row">
          <span>Размер:</span>
          <input type="number" value="${Math.round(obj.r)}" min="10" max="200" onchange="updateProp(${obj.id}, 'r', +this.value)">
        </div>
      `;
    }
  }

  panel.innerHTML = html;
}

function updateProp(id, key, value) {
  const obj = state.objects.find(o => o.id === id);
  if (!obj) return;
  obj[key] = value;
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