// ===== ОСНОВНАЯ ОТРИСОВКА =====

// Вспомогательные функции для текстур
function adjustColor(hex, amount) {
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
}

function mulchRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function particleRand(seed, index) {
  let s = seed + index * 7919;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

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
    
    renderPlantingTaskMarkers(pl, pl.x, pl.y, r);
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
  
  renderTaskMarkers(obj, obj.x, obj.y, obj.r);
  
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

  renderGrid();
  renderPlot();
  
  state.objects.filter(o => o.type === 'bed').forEach(obj => {
    renderBedPolygon(obj);
  });
  
  state.objects.filter(o => o.type === 'mulch').forEach(obj => {
    renderMulch(obj);
  });
  
  state.objects.filter(o => o.type === 'bed').forEach(obj => {
    renderBedPlants(obj);
  });
  
  state.objects.filter(o => o.type === 'tree').forEach(obj => {
    renderTree(obj);
  });
  
  state.objects.filter(o => o.type === 'path').forEach(obj => {
    renderPath(obj);
  });
  
  state.objects.filter(o => o.type === 'decor').forEach(obj => {
    renderDecorObject(obj);
  });
  
  if (state.selectedId && state.tool === 'select') {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj) {
      if (obj.type !== 'path') {
        drawResizeHandles(obj);
      }
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