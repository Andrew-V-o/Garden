// ===== РАЗМЕРНАЯ СЕТКА =====
// Содержит ТОЛЬКО: toggleGrid, showGridPopup, closeGridPopup, renderGrid

function toggleGrid() {
  state.showGrid = !state.showGrid;
  const btn = document.getElementById('gridBtn');
  if (btn) {
    btn.classList.toggle('active', state.showGrid);
  }
  if (state.showGrid) {
    showGridPopup();
  } else {
    closeGridPopup();
  }
  render();
}

function showGridPopup() {
  const popup = document.getElementById('gridPopup');
  document.getElementById('gridSize').value = state.gridSize;
  document.getElementById('gridColor').value = state.gridColor;
  document.getElementById('gridOpacity').value = state.gridOpacity;
  const gridBtn = document.getElementById('gridBtn');
  if (gridBtn) {
    const rect = gridBtn.getBoundingClientRect();
    popup.style.left = rect.left + 'px';
    popup.style.top = (rect.bottom + 5) + 'px';
  }
  popup.classList.add('show');
  document.getElementById('gridSize').onchange = (e) => {
    state.gridSize = parseFloat(e.target.value) || 1;
    render();
  };
  document.getElementById('gridColor').oninput = (e) => {
    state.gridColor = e.target.value;
    render();
  };
  document.getElementById('gridOpacity').oninput = (e) => {
    state.gridOpacity = parseFloat(e.target.value) || 0.5;
    render();
  };
}

function closeGridPopup() {
  const popup = document.getElementById('gridPopup');
  if (popup) popup.classList.remove('show');
}

function renderGrid() {
  if (!state.showGrid) {
    const gridLayer = document.getElementById('gridLayer');
    if (gridLayer) gridLayer.remove();
    return;
  }
  const ns = 'http://www.w3.org/2000/svg';
  const gridSizePx = state.gridSize * state.scale;
  let gridLayer = document.getElementById('gridLayer');
  if (!gridLayer) {
    gridLayer = document.createElementNS(ns, 'g');
    gridLayer.setAttribute('id', 'gridLayer');
    gridLayer.setAttribute('pointer-events', 'none');
    svg.insertBefore(gridLayer, plotLayer);
  } else {
    gridLayer.innerHTML = '';
  }
  const vb = state.viewBox || { x: 0, y: 0, w: getSvgInternalSize().w, h: getSvgInternalSize().h };
  const startX = Math.floor(vb.x / gridSizePx) * gridSizePx;
  const startY = Math.floor(vb.y / gridSizePx) * gridSizePx;
  const endX = vb.x + vb.w;
  const endY = vb.y + vb.h;
  for (let x = startX; x <= endX; x += gridSizePx) {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', x); line.setAttribute('y1', startY);
    line.setAttribute('x2', x); line.setAttribute('y2', endY);
    line.setAttribute('stroke', state.gridColor);
    line.setAttribute('stroke-width', '0.5');
    line.setAttribute('opacity', state.gridOpacity);
    gridLayer.appendChild(line);
  }
  for (let y = startY; y <= endY; y += gridSizePx) {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', startX); line.setAttribute('y1', y);
    line.setAttribute('x2', endX); line.setAttribute('y2', y);
    line.setAttribute('stroke', state.gridColor);
    line.setAttribute('stroke-width', '0.5');
    line.setAttribute('opacity', state.gridOpacity);
    gridLayer.appendChild(line);
  }
  const labelInterval = gridSizePx < 50 ? 5 : 1;
  const fontSize = Math.max(8, Math.min(12, gridSizePx / 3));
  for (let x = startX; x <= endX; x += gridSizePx * labelInterval) {
    const meters = Math.round(x / state.scale);
    if (meters >= 0) {
      const text = document.createElementNS(ns, 'text');
      text.setAttribute('x', x + 2);
      text.setAttribute('y', startY + fontSize + 2);
      text.setAttribute('font-size', fontSize);
      text.setAttribute('fill', state.gridColor);
      text.setAttribute('opacity', state.gridOpacity * 0.8);
      text.textContent = meters + 'м';
      gridLayer.appendChild(text);
    }
  }
  for (let y = startY; y <= endY; y += gridSizePx * labelInterval) {
    const meters = Math.round(y / state.scale);
    if (meters >= 0) {
      const text = document.createElementNS(ns, 'text');
      text.setAttribute('x', startX + 2);
      text.setAttribute('y', y - 2);
      text.setAttribute('font-size', fontSize);
      text.setAttribute('fill', state.gridColor);
      text.setAttribute('opacity', state.gridOpacity * 0.8);
      text.textContent = meters + 'м';
      gridLayer.appendChild(text);
    }
  }
}