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

function renderBedPolygon(obj) {
  const isSelected = obj.id === state.selectedId;
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  el.setAttribute('points', obj.points.map(p => p.join(',')).join(' '));
  el.setAttribute('fill', obj.fill);
  el.setAttribute('stroke', isSelected ? '#ff6b00' : '#333');
  el.setAttribute('stroke-width', isSelected ? 3 : 1.5);
  el.setAttribute('data-id', obj.id);
  el.style.cursor = 'pointer';
  objectsLayer.appendChild(el);
}

function renderMulch(mulch) {
  const ns = 'http://www.w3.org/2000/svg';
  const bed = state.objects.find(o => o.id === mulch.bedId);
  if (!bed) return;
  
  const isSelected = state.selectedId === mulch.id;
  const clipId = `clip-mulch-${mulch.id}`;
  
  // Создаём clipPath по форме клумбы
  const defs = document.createElementNS(ns, 'defs');
  const clipPath = document.createElementNS(ns, 'clipPath');
  clipPath.setAttribute('id', clipId);
  const clipPoly = document.createElementNS(ns, 'polygon');
  clipPoly.setAttribute('points', bed.points.map(p => p.join(',')).join(' '));
  clipPath.appendChild(clipPoly);
  defs.appendChild(clipPath);
  objectsLayer.appendChild(defs);
  
  // Группа с clip-path — мульча обрезается по форме клумбы
  const g = document.createElementNS(ns, 'g');
  g.setAttribute('clip-path', `url(#${clipId})`);
  g.setAttribute('data-id', mulch.id);
  g.style.cursor = 'pointer';
  
  // Координаты мульчи (собственные, не клумбы)
  const mx = mulch.x;
  const my = mulch.y;
  const mw = mulch.w;
  const mh = mulch.h;
  
  if (mulch.shape === 'rect') {
    const rect = document.createElementNS(ns, 'rect');
    rect.setAttribute('x', mx - mw / 2);
    rect.setAttribute('y', my - mh / 2);
    rect.setAttribute('width', mw);
    rect.setAttribute('height', mh);
    rect.setAttribute('fill', mulch.fill);
    g.appendChild(rect);
  } else {
    // Круглая мульча — эллипс с собственными размерами
    const ellipse = document.createElementNS(ns, 'ellipse');
    ellipse.setAttribute('cx', mx);
    ellipse.setAttribute('cy', my);
    ellipse.setAttribute('rx', mw / 2);
    ellipse.setAttribute('ry', mh / 2);
    ellipse.setAttribute('fill', mulch.fill);
    g.appendChild(ellipse);
  }
  
  // Текстура мульчи (мелкие точки) — только в пределах мульчи
  const dotCount = Math.floor((mw * mh) / 300);
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', mx - mw / 2 + Math.random() * mw);
    dot.setAttribute('cy', my - mh / 2 + Math.random() * mh);
    dot.setAttribute('r', 1 + Math.random() * 1.5);
    dot.setAttribute('fill', 'rgba(0,0,0,0.2)');
    dot.setAttribute('pointer-events', 'none');
    g.appendChild(dot);
  }
  
  objectsLayer.appendChild(g);
  
  // Обводка для выделенной мульчи (поверх clipPath, чтобы было видно)
  if (isSelected) {
    const outline = document.createElementNS(ns, 'rect');
    outline.setAttribute('x', mx - mw / 2);
    outline.setAttribute('y', my - mh / 2);
    outline.setAttribute('width', mw);
    outline.setAttribute('height', mh);
    outline.setAttribute('fill', 'none');
    outline.setAttribute('stroke', '#ff6b00');
    outline.setAttribute('stroke-width', '2');
    outline.setAttribute('stroke-dasharray', '5,5');
    outline.setAttribute('pointer-events', 'none');
    objectsLayer.appendChild(outline);
  }
}

function renderBedPlants(obj) {
  if (!obj.plants || obj.plants.length === 0) return;
  
  obj.plants.forEach(pl => {
    const plant = plants.find(p => p.id === pl.plantId);
    const color = plant ? plant.color : '#999';
    const shape = pl.shape || 'circle';
    const r = pl.r || state.scale * 0.4;
    const isSelectedPlanting = pl.id === state.selectedPlantingId;
    
    const isBlooming = isPlantBlooming(pl, state.bloomFilter);

    const shapeEl = createShapeElement(shape, pl.x, pl.y, r, color);
    if (shapeEl.tagName === 'g') {
      shapeEl.setAttribute('stroke', isSelectedPlanting ? '#ff6b00' : 'white');
      shapeEl.setAttribute('stroke-width', isSelectedPlanting ? 2 : 1.5);
      shapeEl.style.cursor = state.tool === 'move' ? 'grab' : 'pointer';
      shapeEl.setAttribute('data-planting-id', pl.id);
      if (state.bloomFilter) {
        shapeEl.classList.add(isBlooming ? 'planting-blooming' : 'planting-not-blooming');
      }
      objectsLayer.appendChild(shapeEl);
    } else {
      shapeEl.setAttribute('stroke', isSelectedPlanting ? '#ff6b00' : 'white');
      shapeEl.setAttribute('stroke-width', isSelectedPlanting ? 2 : 1.5);
      shapeEl.style.cursor = state.tool === 'move' ? 'grab' : 'pointer';
      shapeEl.setAttribute('data-planting-id', pl.id);
      if (state.bloomFilter) {
        shapeEl.classList.add(isBlooming ? 'planting-blooming' : 'planting-not-blooming');
      }
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

function renderTree(obj) {
  const isSelected = obj.id === state.selectedId;
  const shape = obj.shape || 'oak';
  const color = obj.fill || '#2e7d32';
  
  const treeEl = createShapeElement(shape, obj.x, obj.y, obj.r, color);
  treeEl.setAttribute('data-id', obj.id);
  treeEl.style.cursor = 'pointer';
  objectsLayer.appendChild(treeEl);
  
  if (isSelected) {
    const outline = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outline.setAttribute('cx', obj.x);
    outline.setAttribute('cy', obj.y);
    outline.setAttribute('r', obj.r + 3);
    outline.setAttribute('fill', 'none');
    outline.setAttribute('stroke', '#ff6b00');
    outline.setAttribute('stroke-width', '2');
    outline.setAttribute('pointer-events', 'none');
    objectsLayer.appendChild(outline);
  }
}

function renderPath(obj) {
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
}

function renderDecorObject(obj) {
  const ns = 'http://www.w3.org/2000/svg';
  const isSelected = obj.id === state.selectedId;
  const g = document.createElementNS(ns, 'g');
  g.setAttribute('data-id', obj.id);
  g.style.cursor = 'pointer';
  
  const x = obj.x - obj.w / 2;
  const y = obj.y - obj.h / 2;
  const w = obj.w;
  const h = obj.h;
  
  if (obj.decorType === 'water') {
    const ellipse = document.createElementNS(ns, 'ellipse');
    ellipse.setAttribute('cx', obj.x);
    ellipse.setAttribute('cy', obj.y);
    ellipse.setAttribute('rx', w / 2);
    ellipse.setAttribute('ry', h / 2);
    ellipse.setAttribute('fill', obj.fill);
    ellipse.setAttribute('stroke', isSelected ? '#ff6b00' : '#0277bd');
    ellipse.setAttribute('stroke-width', isSelected ? 3 : 1.5);
    g.appendChild(ellipse);
    
    const waveCount = Math.max(2, Math.floor(h / 15));
    for (let i = 1; i < waveCount; i++) {
      const waveY = y + (h / waveCount) * i;
      const wave = document.createElementNS(ns, 'path');
      const amplitude = h / 10;
      let d = `M ${x + 5} ${waveY}`;
      for (let wx = x + 5; wx < x + w - 5; wx += 10) {
        d += ` Q ${wx + 2.5} ${waveY - amplitude} ${wx + 5} ${waveY} Q ${wx + 7.5} ${waveY + amplitude} ${wx + 10} ${waveY}`;
      }
      wave.setAttribute('d', d);
      wave.setAttribute('fill', 'none');
      wave.setAttribute('stroke', 'rgba(255,255,255,0.5)');
      wave.setAttribute('stroke-width', '1.5');
      wave.setAttribute('pointer-events', 'none');
      g.appendChild(wave);
    }
  } else if (obj.decorType === 'stone') {
    const stones = [
      { cx: -0.25, cy: -0.15, rx: 0.35, ry: 0.3 },
      { cx: 0.2, cy: -0.2, rx: 0.3, ry: 0.25 },
      { cx: 0, cy: 0.2, rx: 0.4, ry: 0.3 }
    ];
    stones.forEach(s => {
      const stone = document.createElementNS(ns, 'ellipse');
      stone.setAttribute('cx', obj.x + s.cx * w);
      stone.setAttribute('cy', obj.y + s.cy * h);
      stone.setAttribute('rx', s.rx * w / 2);
      stone.setAttribute('ry', s.ry * h / 2);
      stone.setAttribute('fill', obj.fill);
      stone.setAttribute('stroke', isSelected ? '#ff6b00' : '#424242');
      stone.setAttribute('stroke-width', isSelected ? 2 : 1);
      g.appendChild(stone);
    });
  }
  
  const text = document.createElementNS(ns, 'text');
  text.setAttribute('x', obj.x);
  text.setAttribute('y', obj.y + h / 2 + 14);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '11');
  text.setAttribute('font-weight', '600');
  text.setAttribute('fill', '#2d3a2e');
  text.setAttribute('pointer-events', 'none');
  text.textContent = obj.name;
  g.appendChild(text);
  
  objectsLayer.appendChild(g);
}

function render() {
  objectsLayer.innerHTML = '';
  handlesLayer.innerHTML = '';

  renderPlot();
  
  // Слой 1: Клумбы (полигоны)
  state.objects.filter(o => o.type === 'bed').forEach(obj => {
    renderBedPolygon(obj);
  });
  
  // Слой 2: Мульча (с clipPath по форме клумбы)
  state.objects.filter(o => o.type === 'mulch').forEach(obj => {
    renderMulch(obj);
  });
  
  // Слой 3: Растения на клумбах (поверх мульчи)
  state.objects.filter(o => o.type === 'bed').forEach(obj => {
    renderBedPlants(obj);
  });
  
  // Слой 4: Деревья
  state.objects.filter(o => o.type === 'tree').forEach(obj => {
    renderTree(obj);
  });
  
  // Слой 5: Дорожки
  state.objects.filter(o => o.type === 'path').forEach(obj => {
    renderPath(obj);
  });
  
  // Слой 6: Декор (водоёмы, камни)
  state.objects.filter(o => o.type === 'decor').forEach(obj => {
    renderDecorObject(obj);
  });
  
  // Handles для выделенного объекта
  if (state.selectedId && state.tool === 'select') {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj) {
      // Ресайз-handles для всех объектов кроме path и мульчи
      // Мульча тоже может ресайзиться через белые квадраты
      if (obj.type !== 'path') {
        drawResizeHandles(obj);
      }
      // Морфинг-handles только для объектов с points (клумбы, участок)
      if (obj.points && obj.type !== 'path' && obj.type !== 'mulch') {
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
        <span><b>🏡 Текущий размер участка:</b> ${plotWM}×${plotHM} м</span>
        <span>Точек морфологии: ${obj.points.length}</span>
        ${obj.morphModified ? '<span style="color:#d4a017;">⚠ Форма изменена</span>' : ''}
      </div>
    `;
    
    if (isFigureMode) {
      const baseCount = obj.originalPointCount;
      const currentCount = obj.points.length;
      
      const decimateButtons = [2, 3, 4, 5].map(div => {
        const targetPoints = currentCount / div;
        const canDecimate = Number.isInteger(targetPoints) && targetPoints >= baseCount;
        return `
          <button onclick="setMorphPoints(${obj.id}, ${Math.round(targetPoints)})" 
                  ${!canDecimate ? 'disabled' : ''}
                  style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;background:${canDecimate ? 'white' : '#f0f0f0'};color:${canDecimate ? '#333' : '#bbb'};border-radius:4px;cursor:${canDecimate ? 'pointer' : 'not-allowed'};font-size:12px;">
            ÷${div}
          </button>
        `;
      }).join('');
      
      const atBase = currentCount === baseCount;
      const resetBtn = `
        <button onclick="setMorphPoints(${obj.id}, ${baseCount})" 
                ${atBase ? 'disabled' : ''}
                style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #d4a017;background:${atBase ? '#f0f0f0' : 'white'};color:${atBase ? '#bbb' : '#8a6d00'};border-radius:4px;cursor:${atBase ? 'not-allowed' : 'pointer'};font-size:12px;font-weight:600;">
          ×1
        </button>
      `;
      
      const increaseButtons = [2, 3, 4, 5].map(mult => {
        const targetPoints = currentCount * mult;
        const canIncrease = targetPoints <= FIGURE_POINTS_LIMIT;
        return `
          <button onclick="setMorphPoints(${obj.id}, ${targetPoints})" 
                  ${!canIncrease ? 'disabled' : ''}
                  style="flex:1;min-width:50px;padding:6px 4px;border:2px solid #ccc;background:${canIncrease ? 'white' : '#f0f0f0'};color:${canIncrease ? '#333' : '#bbb'};border-radius:4px;cursor:${canIncrease ? 'pointer' : 'not-allowed'};font-size:12px;">
            ×${mult}
          </button>
        `;
      }).join('');
      
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Уменьшить количество точек:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${decimateButtons}</div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Вернуться к исходному:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${resetBtn}</div>
        </div>
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Увеличить количество точек (лимит ${FIGURE_POINTS_LIMIT}):</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">${increaseButtons}</div>
        </div>
      `;
    } else {
      html += `
        <div class="prop-row" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:4px;">
          <span style="font-size:12px;color:#555;">Количество точек:</span>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${[4, 8, 12, 16, 24, 32].map(n => `
              <button onclick="setMorphPoints(${obj.id}, ${n})" 
                      style="flex:1;min-width:40px;padding:6px 4px;border:2px solid ${obj.points.length === n ? '#4a7c59' : '#ccc'};background:${obj.points.length === n ? '#4a7c59' : 'white'};color:${obj.points.length === n ? 'white' : '#333'};border-radius:4px;cursor:pointer;font-size:12px;font-weight:${obj.points.length === n ? '600' : '400'};">
                ${n}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
    
    html += `
      <button onclick="fitPlotToCanvas()" style="
        width: 100%; background: #4a7c59; color: white; border: none;
        padding: 10px; border-radius: 6px; cursor: pointer;
        font-size: 13px; font-weight: 600; margin-top: 8px;
      ">Под размер окна</button>
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
        <span>Форма:</span>
        <select onchange="updateProp(${obj.id}, 'shape', this.value)">
          <option value="rect" ${obj.shape === 'rect' ? 'selected' : ''}>Прямоугольник</option>
          <option value="circle" ${obj.shape === 'circle' ? 'selected' : ''}>Круг</option>
        </select>
      </div>
      <div class="prop-row">
        <span>Цвет:</span>
        <input type="color" value="${obj.fill}" onchange="updateProp(${obj.id}, 'fill', this.value)">
      </div>
      <div class="prop-row">
        <span>Ширина (м):</span>
        <input type="number" value="${Math.round(obj.w / state.scale)}" min="0.5" max="100" step="0.5" onchange="updateMulchSize(${obj.id}, 'w', +this.value)">
      </div>
      <div class="prop-row">
        <span>Высота (м):</span>
        <input type="number" value="${Math.round(obj.h / state.scale)}" min="0.5" max="100" step="0.5" onchange="updateMulchSize(${obj.id}, 'h', +this.value)">
      </div>
    `;
  } else if (obj.type === 'tree') {
    const tree = trees.find(t => t.id === obj.treeId);
    html += `
      <div class="prop-row">
        <span>Тип дерева:</span>
        <span style="font-weight:600;">${tree ? tree.name : 'Неизвестно'}</span>
      </div>
      <div class="prop-row">
        <span>Размер:</span>
        <input type="number" value="${Math.round(obj.r)}" min="10" max="200" onchange="updateProp(${obj.id}, 'r', +this.value)">
      </div>
    `;
  } else if (obj.type === 'decor') {
    const decorNames = { water: '💧 Водоём', stone: '🪨 Камни' };
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

  panel.innerHTML = html;
}

function updateProp(id, key, value) {
  const obj = state.objects.find(o => o.id === id);
  if (!obj) return;
  obj[key] = value;
  render();
}

function updateDecorSize(id, dim, valueM) {
  const obj = state.objects.find(o => o.id === id);
  if (!obj || obj.type !== 'decor') return;
  const value = Math.max(1, Math.min(100, valueM)) * state.scale;
  obj[dim] = value;
  render();
}

function updateMulchSize(id, dim, valueM) {
  const obj = state.objects.find(o => o.id === id);
  if (!obj || obj.type !== 'mulch') return;
  const value = Math.max(0.5, Math.min(100, valueM)) * state.scale;
  obj[dim] = value;
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