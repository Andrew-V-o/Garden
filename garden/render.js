// ===== РЕНДЕРИНГ =====

function renderGrid() {
  if (!state.showGrid) return;
  
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
    line.setAttribute('x1', x);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', x);
    line.setAttribute('y2', endY);
    line.setAttribute('stroke', state.gridColor);
    line.setAttribute('stroke-width', '0.5');
    line.setAttribute('opacity', state.gridOpacity);
    gridLayer.appendChild(line);
  }
  
  for (let y = startY; y <= endY; y += gridSizePx) {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', y);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', y);
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

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ТЕКСТУР =====

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

// ===== ЛИСТ ДУБА =====
function drawOakLeafGroup(g, ns, x, y, size, rot, color, rand) {
  const leafG = document.createElementNS(ns, 'g');
  leafG.setAttribute('transform', `translate(${x} ${y}) rotate(${rot})`);
  
  const bodyRx = size * 0.32;
  const bodyRy = size * 0.65;
  
  const body = document.createElementNS(ns, 'ellipse');
  body.setAttribute('cx', 0);
  body.setAttribute('cy', 0);
  body.setAttribute('rx', bodyRx);
  body.setAttribute('ry', bodyRy);
  body.setAttribute('fill', color);
  leafG.appendChild(body);
  
  const lobeCount = 4 + Math.floor(rand() * 2);
  for (let i = 0; i < lobeCount; i++) {
    const t = (i + 0.5) / lobeCount;
    const ly = -bodyRy * 0.85 + t * bodyRy * 1.7;
    const env = Math.sin(t * Math.PI);
    const lobeR = size * 0.22 * env * (0.7 + rand() * 0.4);
    const lobeX = bodyRx * 0.7 * env + lobeR * 0.3;
    
    if (lobeR < 1) continue;
    
    const lobeR1 = document.createElementNS(ns, 'circle');
    lobeR1.setAttribute('cx', lobeX);
    lobeR1.setAttribute('cy', ly);
    lobeR1.setAttribute('r', lobeR);
    lobeR1.setAttribute('fill', color);
    leafG.appendChild(lobeR1);
    
    const lobeL1 = document.createElementNS(ns, 'circle');
    lobeL1.setAttribute('cx', -lobeX);
    lobeL1.setAttribute('cy', ly);
    lobeL1.setAttribute('r', lobeR);
    lobeL1.setAttribute('fill', color);
    leafG.appendChild(lobeL1);
  }
  
  const outline = document.createElementNS(ns, 'ellipse');
  outline.setAttribute('cx', 0);
  outline.setAttribute('cy', 0);
  outline.setAttribute('rx', bodyRx + 0.3);
  outline.setAttribute('ry', bodyRy + 0.3);
  outline.setAttribute('fill', 'none');
  outline.setAttribute('stroke', adjustColor(color, -40));
  outline.setAttribute('stroke-width', '0.4');
  leafG.appendChild(outline);
  
  const mainVein = document.createElementNS(ns, 'line');
  mainVein.setAttribute('x1', 0);
  mainVein.setAttribute('y1', -bodyRy * 0.9);
  mainVein.setAttribute('x2', 0);
  mainVein.setAttribute('y2', bodyRy * 0.9);
  mainVein.setAttribute('stroke', adjustColor(color, -50));
  mainVein.setAttribute('stroke-width', '0.7');
  leafG.appendChild(mainVein);
  
  for (let i = 0; i < lobeCount; i++) {
    const t = (i + 0.5) / lobeCount;
    const vy = -bodyRy * 0.8 + t * bodyRy * 1.6;
    const env = Math.sin(t * Math.PI);
    const vLen = bodyRx * 1.5 * env;
    
    if (vLen < 2) continue;
    
    const vR = document.createElementNS(ns, 'line');
    vR.setAttribute('x1', 0);
    vR.setAttribute('y1', vy);
    vR.setAttribute('x2', vLen);
    vR.setAttribute('y2', vy - vLen * 0.25);
    vR.setAttribute('stroke', adjustColor(color, -35));
    vR.setAttribute('stroke-width', '0.35');
    leafG.appendChild(vR);
    
    const vL = document.createElementNS(ns, 'line');
    vL.setAttribute('x1', 0);
    vL.setAttribute('y1', vy);
    vL.setAttribute('x2', -vLen);
    vL.setAttribute('y2', vy - vLen * 0.25);
    vL.setAttribute('stroke', adjustColor(color, -35));
    vL.setAttribute('stroke-width', '0.35');
    leafG.appendChild(vL);
  }
  
  g.appendChild(leafG);
}

// ===== ЛИСТ КРАСНОГО ДУБА =====
function drawRedOakLeafGroup(g, ns, x, y, size, rot, color, rand) {
  const leafG = document.createElementNS(ns, 'g');
  leafG.setAttribute('transform', `translate(${x} ${y}) rotate(${rot})`);
  
  const bodyRx = size * 0.3;
  const bodyRy = size * 0.7;
  
  const body = document.createElementNS(ns, 'ellipse');
  body.setAttribute('cx', 0);
  body.setAttribute('cy', 0);
  body.setAttribute('rx', bodyRx);
  body.setAttribute('ry', bodyRy);
  body.setAttribute('fill', color);
  leafG.appendChild(body);
  
  const lobeCount = 5 + Math.floor(rand() * 2);
  for (let i = 0; i < lobeCount; i++) {
    const t = (i + 0.5) / lobeCount;
    const ly = -bodyRy * 0.88 + t * bodyRy * 1.76;
    const env = Math.sin(t * Math.PI);
    const lobeRx = size * 0.18 * env * (0.7 + rand() * 0.4);
    const lobeRy = size * 0.12 * env * (0.7 + rand() * 0.3);
    const lobeX = bodyRx * 0.8 * env + lobeRx * 0.4;
    
    if (lobeRx < 0.8) continue;
    
    const lobeR1 = document.createElementNS(ns, 'ellipse');
    lobeR1.setAttribute('cx', lobeX);
    lobeR1.setAttribute('cy', ly);
    lobeR1.setAttribute('rx', lobeRx);
    lobeR1.setAttribute('ry', lobeRy);
    lobeR1.setAttribute('fill', color);
    leafG.appendChild(lobeR1);
    
    const lobeL1 = document.createElementNS(ns, 'ellipse');
    lobeL1.setAttribute('cx', -lobeX);
    lobeL1.setAttribute('cy', ly);
    lobeL1.setAttribute('rx', lobeRx);
    lobeL1.setAttribute('ry', lobeRy);
    lobeL1.setAttribute('fill', color);
    leafG.appendChild(lobeL1);
  }
  
  const outline = document.createElementNS(ns, 'ellipse');
  outline.setAttribute('cx', 0);
  outline.setAttribute('cy', 0);
  outline.setAttribute('rx', bodyRx + 0.3);
  outline.setAttribute('ry', bodyRy + 0.3);
  outline.setAttribute('fill', 'none');
  outline.setAttribute('stroke', adjustColor(color, -35));
  outline.setAttribute('stroke-width', '0.4');
  leafG.appendChild(outline);
  
  const mainVein = document.createElementNS(ns, 'line');
  mainVein.setAttribute('x1', 0);
  mainVein.setAttribute('y1', -bodyRy * 0.92);
  mainVein.setAttribute('x2', 0);
  mainVein.setAttribute('y2', bodyRy * 0.92);
  mainVein.setAttribute('stroke', adjustColor(color, -45));
  mainVein.setAttribute('stroke-width', '0.7');
  leafG.appendChild(mainVein);
  
  for (let i = 0; i < lobeCount; i++) {
    const t = (i + 0.5) / lobeCount;
    const vy = -bodyRy * 0.85 + t * bodyRy * 1.7;
    const env = Math.sin(t * Math.PI);
    const vLen = bodyRx * 1.8 * env;
    
    if (vLen < 2) continue;
    
    const vR = document.createElementNS(ns, 'line');
    vR.setAttribute('x1', 0);
    vR.setAttribute('y1', vy);
    vR.setAttribute('x2', vLen);
    vR.setAttribute('y2', vy - vLen * 0.35);
    vR.setAttribute('stroke', adjustColor(color, -30));
    vR.setAttribute('stroke-width', '0.3');
    leafG.appendChild(vR);
    
    const vL = document.createElementNS(ns, 'line');
    vL.setAttribute('x1', 0);
    vL.setAttribute('y1', vy);
    vL.setAttribute('x2', -vLen);
    vL.setAttribute('y2', vy - vLen * 0.35);
    vL.setAttribute('stroke', adjustColor(color, -30));
    vL.setAttribute('stroke-width', '0.3');
    leafG.appendChild(vL);
  }
  
  g.appendChild(leafG);
}

// ===== РЕНДЕР МУЛЬЧИ С ТЕКСТУРАМИ =====

function renderMulchTexture(g, mulch, mx, my, mw, mh, rand) {
  const ns = 'http://www.w3.org/2000/svg';
  const skin = mulch.skin || 'bark';
  const shape = mulch.shape || 'rect';
  
  const area = mw * mh;
  const baseDensity = Math.max(20, Math.min(200, Math.floor(area / 80)));
  const densityMultiplier = mulch.densityMultiplier != null ? mulch.densityMultiplier : 1.0;
  const density = Math.max(5, Math.floor(baseDensity * densityMultiplier));
  
  const seed = mulch.id * 1000 + 42;
  
  function nextPos(i) {
    const pr = particleRand(seed, i);
    if (shape === 'circle') {
      const angle = pr() * Math.PI * 2;
      const r = Math.sqrt(pr()) * Math.min(mw, mh) / 2;
      return { x: mx + Math.cos(angle) * r, y: my + Math.sin(angle) * r };
    } else {
      return { x: mx - mw/2 + pr() * mw, y: my - mh/2 + pr() * mh };
    }
  }
  
  function prand(i, subIndex) {
    return particleRand(seed, i * 10000 + (subIndex || 0));
  }
  
  switch (skin) {
    
    case 'bark': {
      const barkColors = ['#6D4C41', '#5D4037', '#795548', '#4E342E', '#8D6E63', '#3E2723'];
      
      for (let i = 0; i < density * 1.2; i++) {
        const pos = nextPos(i);
        const x = pos.x, y = pos.y;
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        const r3 = prand(i, 3);
        const r4 = prand(i, 4);
        
        const w = 5 + r1() * 12;
        const h = 3 + r2() * 6;
        const rot = r3() * 360;
        const color = barkColors[Math.floor(r4() * barkColors.length)];
        
        const bark = document.createElementNS(ns, 'path');
        const jag = 0.25;
        const d = `M ${-w/2 + r1()*w*jag} ${-h/2}
                   L ${-w/4 + r2()*w*jag} ${-h/2 + r3()*h*0.2}
                   L ${0} ${-h/2 + r4()*h*0.15}
                   L ${w/4 - r1()*w*jag} ${-h/2 + r2()*h*0.2}
                   L ${w/2 - r3()*w*jag} ${-h/2}
                   L ${w/2} ${-h/4 + r4()*h*0.2}
                   L ${w/2 - r1()*w*0.1} ${0}
                   L ${w/2} ${h/4 - r2()*h*0.2}
                   L ${w/2 - r3()*w*jag} ${h/2}
                   L ${w/4} ${h/2 - r4()*h*0.15}
                   L ${0} ${h/2}
                   L ${-w/4} ${h/2 - r1()*h*0.2}
                   L ${-w/2 + r2()*w*jag} ${h/2}
                   L ${-w/2} ${h/4}
                   L ${-w/2 + r3()*w*0.1} ${0}
                   L ${-w/2} ${-h/4}
                   Z`;
        bark.setAttribute('d', d);
        bark.setAttribute('fill', color);
        bark.setAttribute('stroke', adjustColor(color, -35));
        bark.setAttribute('stroke-width', '0.4');
        bark.setAttribute('transform', `translate(${x} ${y}) rotate(${rot})`);
        bark.setAttribute('pointer-events', 'none');
        g.appendChild(bark);
        
        if (r4() > 0.4) {
          const grainCount = 1 + Math.floor(r1() * 3);
          for (let j = 0; j < grainCount; j++) {
            const gr = prand(i, 100 + j);
            const grain = document.createElementNS(ns, 'line');
            const gy = -h/2 + gr() * h;
            grain.setAttribute('x1', -w/2 + 1);
            grain.setAttribute('y1', gy);
            grain.setAttribute('x2', w/2 - 1);
            grain.setAttribute('y2', gy + (gr() - 0.5) * 2);
            grain.setAttribute('stroke', adjustColor(color, -20));
            grain.setAttribute('stroke-width', '0.3');
            grain.setAttribute('transform', `translate(${x} ${y}) rotate(${rot})`);
            grain.setAttribute('pointer-events', 'none');
            g.appendChild(grain);
          }
        }
      }
      break;
    }
    
    case 'oak_leaves': {
      const leafColors = ['#B8860B', '#A0722A', '#8B6914', '#9B7B3A', '#7A5C28', '#C49A2A', '#6B4E1D', '#D4A84A', '#AA8030'];
      
      for (let i = 0; i < density * 1.2; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        const r3 = prand(i, 3);
        
        const size = 8 + r1() * 12;
        const rot = r2() * 360;
        const color = leafColors[Math.floor(r3() * leafColors.length)];
        const shade = Math.floor(r1() * 30) - 15;
        const leafColor = adjustColor(color, shade);
        
        drawOakLeafGroup(g, ns, pos.x, pos.y, size, rot, leafColor, prand(i, 10));
      }
      
      for (let i = 0; i < density * 0.5; i++) {
        const pos = nextPos(i + 10000);
        const r1 = prand(i + 10000, 1);
        const r2 = prand(i + 10000, 2);
        const color = leafColors[Math.floor(r1() * leafColors.length)];
        const size = 2 + r2() * 4;
        const rot = r1() * 360;
        
        const fragment = document.createElementNS(ns, 'ellipse');
        fragment.setAttribute('cx', pos.x);
        fragment.setAttribute('cy', pos.y);
        fragment.setAttribute('rx', size);
        fragment.setAttribute('ry', size * 0.4);
        fragment.setAttribute('fill', adjustColor(color, -20));
        fragment.setAttribute('transform', `rotate(${rot} ${pos.x} ${pos.y})`);
        fragment.setAttribute('pointer-events', 'none');
        g.appendChild(fragment);
      }
      break;
    }
    
    case 'red_oak_leaves': {
      const leafColors = ['#8B2500', '#A52A2A', '#B22222', '#CD3333', '#8B3A3A', '#A0522D', '#9B1B1B', '#7A1F1F', '#C04040'];
      
      for (let i = 0; i < density * 1.2; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        const r3 = prand(i, 3);
        
        const size = 8 + r1() * 12;
        const rot = r2() * 360;
        const color = leafColors[Math.floor(r3() * leafColors.length)];
        const shade = Math.floor(r1() * 30) - 15;
        const leafColor = adjustColor(color, shade);
        
        drawRedOakLeafGroup(g, ns, pos.x, pos.y, size, rot, leafColor, prand(i, 10));
      }
      
      for (let i = 0; i < density * 0.5; i++) {
        const pos = nextPos(i + 10000);
        const r1 = prand(i + 10000, 1);
        const r2 = prand(i + 10000, 2);
        const color = leafColors[Math.floor(r1() * leafColors.length)];
        const size = 2 + r2() * 4;
        const rot = r1() * 360;
        
        const fragment = document.createElementNS(ns, 'ellipse');
        fragment.setAttribute('cx', pos.x);
        fragment.setAttribute('cy', pos.y);
        fragment.setAttribute('rx', size);
        fragment.setAttribute('ry', size * 0.4);
        fragment.setAttribute('fill', adjustColor(color, -20));
        fragment.setAttribute('transform', `rotate(${rot} ${pos.x} ${pos.y})`);
        fragment.setAttribute('pointer-events', 'none');
        g.appendChild(fragment);
      }
      break;
    }
    
    case 'spruce_needles': {
      const needleColors = ['#2C1810', '#3E2723', '#4E342E', '#1B0F0A', '#33261E', '#261A12'];
      
      for (let i = 0; i < density * 8; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        
        const len = 2.5 + r1() * 4;
        const angle = r2() * Math.PI * 2;
        const color = needleColors[Math.floor(r1() * needleColors.length)];
        
        const x1 = pos.x - Math.cos(angle) * len * 0.4;
        const y1 = pos.y - Math.sin(angle) * len * 0.4;
        const x2 = pos.x + Math.cos(angle) * len * 0.6;
        const y2 = pos.y + Math.sin(angle) * len * 0.6;
        
        const needle = document.createElementNS(ns, 'path');
        needle.setAttribute('d', `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`);
        needle.setAttribute('stroke', color);
        needle.setAttribute('stroke-width', '1.0');
        needle.setAttribute('stroke-linecap', 'round');
        needle.setAttribute('pointer-events', 'none');
        g.appendChild(needle);
      }
      
      for (let i = 0; i < density * 0.6; i++) {
        const pos = nextPos(i + 20000);
        const r1 = prand(i + 20000, 1);
        const r2 = prand(i + 20000, 2);
        
        const len = 6 + r1() * 12;
        const angle = r2() * Math.PI * 2;
        
        const twig = document.createElementNS(ns, 'line');
        twig.setAttribute('x1', pos.x - Math.cos(angle) * len/2);
        twig.setAttribute('y1', pos.y - Math.sin(angle) * len/2);
        twig.setAttribute('x2', pos.x + Math.cos(angle) * len/2);
        twig.setAttribute('y2', pos.y + Math.sin(angle) * len/2);
        twig.setAttribute('stroke', '#5D4037');
        twig.setAttribute('stroke-width', '1.0');
        twig.setAttribute('stroke-linecap', 'round');
        twig.setAttribute('pointer-events', 'none');
        g.appendChild(twig);
        
        const branches = 2 + Math.floor(r1() * 3);
        for (let j = 0; j < branches; j++) {
          const br = prand(i + 20000, 100 + j);
          const t = 0.2 + br() * 0.6;
          const bx = pos.x - Math.cos(angle) * len/2 + Math.cos(angle) * len * t;
          const by = pos.y - Math.sin(angle) * len/2 + Math.sin(angle) * len * t;
          const brAngle = angle + (br() > 0.5 ? 1 : -1) * (Math.PI/3 + br() * Math.PI/6);
          const brLen = 2 + br() * 4;
          
          const branch = document.createElementNS(ns, 'line');
          branch.setAttribute('x1', bx);
          branch.setAttribute('y1', by);
          branch.setAttribute('x2', bx + Math.cos(brAngle) * brLen);
          branch.setAttribute('y2', by + Math.sin(brAngle) * brLen);
          branch.setAttribute('stroke', '#4E342E');
          branch.setAttribute('stroke-width', '0.6');
          branch.setAttribute('stroke-linecap', 'round');
          branch.setAttribute('pointer-events', 'none');
          g.appendChild(branch);
        }
      }
      
      for (let i = 0; i < density * 0.5; i++) {
        const pos = nextPos(i + 30000);
        const r1 = prand(i + 30000, 1);
        const pad = document.createElementNS(ns, 'circle');
        pad.setAttribute('cx', pos.x);
        pad.setAttribute('cy', pos.y);
        pad.setAttribute('r', 0.8 + r1() * 1.0);
        pad.setAttribute('fill', '#1B0F0A');
        pad.setAttribute('pointer-events', 'none');
        g.appendChild(pad);
      }
      break;
    }
    
    case 'pine_needles': {
      const needleColors = ['#A1887F', '#8D6E63', '#BCAAA4', '#795548', '#D7CCC8', '#B09080'];
      
      for (let i = 0; i < density * 2.5; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        
        const bundleAngle = r1() * Math.PI * 2;
        const needlesInBundle = 3 + Math.floor(r2() * 3);
        
        const base = document.createElementNS(ns, 'circle');
        base.setAttribute('cx', pos.x);
        base.setAttribute('cy', pos.y);
        base.setAttribute('r', 1.2 + r1() * 0.6);
        base.setAttribute('fill', '#8B4513');
        base.setAttribute('pointer-events', 'none');
        g.appendChild(base);
        
        const sheath = document.createElementNS(ns, 'ellipse');
        sheath.setAttribute('cx', pos.x);
        sheath.setAttribute('cy', pos.y);
        sheath.setAttribute('rx', 1.5);
        sheath.setAttribute('ry', 1);
        sheath.setAttribute('fill', '#6D4C41');
        sheath.setAttribute('transform', `rotate(${bundleAngle * 180 / Math.PI} ${pos.x} ${pos.y})`);
        sheath.setAttribute('pointer-events', 'none');
        g.appendChild(sheath);
        
        for (let j = 0; j < needlesInBundle; j++) {
          const nr = prand(i, 100 + j);
          const len = 10 + nr() * 14;
          const spread = (j - needlesInBundle/2) * 0.2;
          const angle = bundleAngle + spread;
          const color = needleColors[Math.floor(nr() * needleColors.length)];
          
          const x1 = pos.x;
          const y1 = pos.y;
          const x2 = pos.x + Math.cos(angle) * len;
          const y2 = pos.y + Math.sin(angle) * len;
          const cpx = (x1 + x2) / 2 + Math.cos(angle + Math.PI/2) * (nr() - 0.5) * 3;
          const cpy = (y1 + y2) / 2 + Math.sin(angle + Math.PI/2) * (nr() - 0.5) * 3;
          
          const needle = document.createElementNS(ns, 'path');
          needle.setAttribute('d', `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
          needle.setAttribute('stroke', color);
          needle.setAttribute('stroke-width', '0.9');
          needle.setAttribute('stroke-linecap', 'round');
          needle.setAttribute('fill', 'none');
          needle.setAttribute('pointer-events', 'none');
          g.appendChild(needle);
        }
      }
      
      for (let i = 0; i < density * 0.3; i++) {
        const pos = nextPos(i + 20000);
        const r1 = prand(i + 20000, 1);
        const r2 = prand(i + 20000, 2);
        const size = 1 + r1() * 3;
        const rot = r2() * 360;
        
        const chip = document.createElementNS(ns, 'rect');
        chip.setAttribute('x', -size);
        chip.setAttribute('y', -size/2);
        chip.setAttribute('width', size * 2);
        chip.setAttribute('height', size);
        chip.setAttribute('fill', '#6D4C41');
        chip.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
        chip.setAttribute('pointer-events', 'none');
        g.appendChild(chip);
      }
      break;
    }
    
    case 'spruce_bark': {
      const barkColors = ['#3E2723', '#2C1810', '#4E342E', '#1B0F0A', '#33261E', '#2A1A12'];
      
      for (let layer = 0; layer < 2; layer++) {
        for (let i = 0; i < density * 0.8; i++) {
          const pos = nextPos(i + layer * 10000);
          const r1 = prand(i + layer * 10000, 1);
          const r2 = prand(i + layer * 10000, 2);
          const r3 = prand(i + layer * 10000, 3);
          
          const w = 3 + r1() * 7;
          const h = 2 + r2() * 5;
          const rot = r3() * 360;
          const color = barkColors[Math.floor(r1() * barkColors.length)];
          
          const scale = document.createElementNS(ns, 'path');
          const d = `M 0 ${-h/2} 
                     Q ${w*0.5} ${-h*0.4} ${w/2} 0 
                     Q ${w*0.4} ${h*0.4} 0 ${h/2} 
                     Q ${-w*0.4} ${h*0.3} ${-w/2} 0 
                     Q ${-w*0.4} ${-h*0.3} 0 ${-h/2} Z`;
          scale.setAttribute('d', d);
          scale.setAttribute('fill', color);
          scale.setAttribute('stroke', adjustColor(color, -20));
          scale.setAttribute('stroke-width', '0.3');
          scale.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
          scale.setAttribute('pointer-events', 'none');
          g.appendChild(scale);
          
          if (r2() > 0.5) {
            const shadow = document.createElementNS(ns, 'path');
            const sd = `M ${-w/2 + 1} ${h/2 - 1} Q 0 ${h/2 + 1} ${w/2 - 1} ${h/2 - 1}`;
            shadow.setAttribute('d', sd);
            shadow.setAttribute('stroke', '#000000');
            shadow.setAttribute('stroke-width', '0.4');
            shadow.setAttribute('fill', 'none');
            shadow.setAttribute('opacity', '0.3');
            shadow.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
            shadow.setAttribute('pointer-events', 'none');
            g.appendChild(shadow);
          }
        }
      }
      break;
    }
    
    case 'pine_bark': {
      const barkColors = ['#6D4C41', '#5D4037', '#795548', '#8D6E63', '#A1887F', '#8B5A3C'];
      
      for (let i = 0; i < density * 0.5; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        const r3 = prand(i, 3);
        const r4 = prand(i, 4);
        
        const w = 10 + r1() * 16;
        const h = 6 + r2() * 12;
        const rot = r3() * 360;
        const color = barkColors[Math.floor(r4() * barkColors.length)];
        
        const plate = document.createElementNS(ns, 'path');
        const jag = 0.15;
        const d = `M ${-w/2 + r1()*w*jag} ${-h/2 + r2()*h*jag}
                   L ${-w/4} ${-h/2}
                   L ${w/4 - r3()*w*jag} ${-h/2 + r4()*h*jag}
                   L ${w/2} ${-h/4}
                   L ${w/2 - r1()*w*jag} ${h/4}
                   L ${w/4} ${h/2}
                   L ${-w/4 + r2()*w*jag} ${h/2 - r3()*h*jag}
                   L ${-w/2} ${h/4}
                   Z`;
        plate.setAttribute('d', d);
        plate.setAttribute('fill', color);
        plate.setAttribute('stroke', adjustColor(color, -40));
        plate.setAttribute('stroke-width', '0.7');
        plate.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
        plate.setAttribute('pointer-events', 'none');
        g.appendChild(plate);
        
        const highlight = document.createElementNS(ns, 'path');
        highlight.setAttribute('d', `M ${-w/2 + 2} ${-h/2 + 1} L ${w/2 - 2} ${-h/2 + 1}`);
        highlight.setAttribute('stroke', adjustColor(color, 25));
        highlight.setAttribute('stroke-width', '0.5');
        highlight.setAttribute('fill', 'none');
        highlight.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
        highlight.setAttribute('pointer-events', 'none');
        g.appendChild(highlight);
        
        const crackCount = 2 + Math.floor(r1() * 3);
        for (let j = 0; j < crackCount; j++) {
          const cr = prand(i, 100 + j);
          const crack = document.createElementNS(ns, 'path');
          const cx = -w/2 + cr() * w;
          const cy = -h/2 + cr() * h;
          const len = 3 + cr() * (w * 0.5);
          const angle = cr() * Math.PI;
          const cd = `M ${cx} ${cy} 
                      Q ${cx + Math.cos(angle) * len/2 + (cr()-0.5)*2} ${cy + Math.sin(angle) * len/2 + (cr()-0.5)*2} 
                      ${cx + Math.cos(angle) * len} ${cy + Math.sin(angle) * len}`;
          crack.setAttribute('d', cd);
          crack.setAttribute('stroke', adjustColor(color, -50));
          crack.setAttribute('stroke-width', '0.6');
          crack.setAttribute('fill', 'none');
          crack.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
          crack.setAttribute('pointer-events', 'none');
          g.appendChild(crack);
        }
      }
      
      for (let i = 0; i < density * 0.3; i++) {
        const pos = nextPos(i + 20000);
        const r1 = prand(i + 20000, 1);
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', pos.x);
        dot.setAttribute('cy', pos.y);
        dot.setAttribute('r', 1 + r1() * 2);
        dot.setAttribute('fill', '#1B0F0A');
        dot.setAttribute('opacity', '0.6');
        dot.setAttribute('pointer-events', 'none');
        g.appendChild(dot);
      }
      break;
    }
    
    case 'woodchips': {
      const chipColors = ['#BCAAA4', '#A1887F', '#D7CCC8', '#8D6E63', '#EFEBE9', '#C9B8A8'];
      
      for (let i = 0; i < density * 2.0; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        const r3 = prand(i, 3);
        const r4 = prand(i, 4);
        
        const w = 2 + r1() * 8;
        const h = 1 + r2() * 4;
        const rot = r3() * 360;
        const color = chipColors[Math.floor(r4() * chipColors.length)];
        
        const chip = document.createElementNS(ns, 'path');
        const isPointed = r1() > 0.5;
        let d;
        if (isPointed) {
          d = `M ${-w/2} 0 L ${-w/4} ${-h/2} L ${w/4} ${-h/2 + r2()*h*0.3} L ${w/2} 0 L ${w/4} ${h/2} L ${-w/4} ${h/2 - r3()*h*0.3} Z`;
        } else {
          d = `M ${-w/2} ${-h/2 + r1()*h*0.2} L ${w/2 - r2()*w*0.1} ${-h/2} L ${w/2} ${h/2 - r3()*h*0.2} L ${-w/2 + r4()*w*0.1} ${h/2} Z`;
        }
        chip.setAttribute('d', d);
        chip.setAttribute('fill', color);
        chip.setAttribute('stroke', adjustColor(color, -25));
        chip.setAttribute('stroke-width', '0.3');
        chip.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
        chip.setAttribute('pointer-events', 'none');
        g.appendChild(chip);
        
        const grainCount = 1 + Math.floor(r1() * 2);
        for (let j = 0; j < grainCount; j++) {
          const gr = prand(i, 100 + j);
          const grain = document.createElementNS(ns, 'line');
          const gy = -h/2 + gr() * h;
          grain.setAttribute('x1', -w/2 + 1);
          grain.setAttribute('y1', gy);
          grain.setAttribute('x2', w/2 - 1);
          grain.setAttribute('y2', gy + (gr() - 0.5));
          grain.setAttribute('stroke', adjustColor(color, -15));
          grain.setAttribute('stroke-width', '0.2');
          grain.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
          grain.setAttribute('pointer-events', 'none');
          g.appendChild(grain);
        }
        
        if (r4() > 0.7) {
          const barkEdge = document.createElementNS(ns, 'line');
          barkEdge.setAttribute('x1', -w/2);
          barkEdge.setAttribute('y1', -h/2);
          barkEdge.setAttribute('x2', -w/2);
          barkEdge.setAttribute('y2', h/2);
          barkEdge.setAttribute('stroke', '#5D4037');
          barkEdge.setAttribute('stroke-width', '0.8');
          barkEdge.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
          barkEdge.setAttribute('pointer-events', 'none');
          g.appendChild(barkEdge);
        }
      }
      break;
    }
    
    case 'straw': {
      const strawColors = ['#F9A825', '#FBC02D', '#F57F17', '#FF8F00', '#FFB300', '#E8A020', '#D4A017'];
      
      for (let i = 0; i < density * 2.5; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        const r3 = prand(i, 3);
        
        const len = 12 + r1() * 18;
        const baseAngle = -Math.PI/2 + (r2() - 0.5) * Math.PI * 0.8;
        const angle = baseAngle + (r3() - 0.5) * 0.3;
        const color = strawColors[Math.floor(r1() * strawColors.length)];
        
        const x1 = pos.x - Math.cos(angle) * len/2;
        const y1 = pos.y - Math.sin(angle) * len/2;
        const x2 = pos.x + Math.cos(angle) * len/2;
        const y2 = pos.y + Math.sin(angle) * len/2;
        const bend = (r2() - 0.5) * len * 0.3;
        const cpx = pos.x + Math.cos(angle + Math.PI/2) * bend;
        const cpy = pos.y + Math.sin(angle + Math.PI/2) * bend;
        
        const straw = document.createElementNS(ns, 'path');
        straw.setAttribute('d', `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`);
        straw.setAttribute('stroke', color);
        straw.setAttribute('stroke-width', '1.3');
        straw.setAttribute('stroke-linecap', 'round');
        straw.setAttribute('fill', 'none');
        straw.setAttribute('pointer-events', 'none');
        g.appendChild(straw);
        
        const nodeCount = 1 + Math.floor(r1() * 2);
        for (let j = 0; j < nodeCount; j++) {
          const nr = prand(i, 100 + j);
          const t = 0.2 + nr() * 0.6;
          const nodeX = x1 + (x2 - x1) * t + (cpx - pos.x) * 2 * t * (1-t);
          const nodeY = y1 + (y2 - y1) * t + (cpy - pos.y) * 2 * t * (1-t);
          const node = document.createElementNS(ns, 'ellipse');
          node.setAttribute('cx', nodeX);
          node.setAttribute('cy', nodeY);
          node.setAttribute('rx', '1.3');
          node.setAttribute('ry', '0.8');
          node.setAttribute('fill', adjustColor(color, -30));
          node.setAttribute('transform', `rotate(${angle * 180 / Math.PI} ${nodeX} ${nodeY})`);
          node.setAttribute('pointer-events', 'none');
          g.appendChild(node);
        }
        
        if (r3() > 0.7) {
          const tipX = x2;
          const tipY = y2;
          const bristles = 3 + Math.floor(r1() * 3);
          for (let j = 0; j < bristles; j++) {
            const br = prand(i, 200 + j);
            const brAngle = angle + (j - bristles/2) * 0.2;
            const brLen = 2 + br() * 3;
            const bristle = document.createElementNS(ns, 'line');
            bristle.setAttribute('x1', tipX);
            bristle.setAttribute('y1', tipY);
            bristle.setAttribute('x2', tipX + Math.cos(brAngle) * brLen);
            bristle.setAttribute('y2', tipY + Math.sin(brAngle) * brLen);
            bristle.setAttribute('stroke', adjustColor(color, -10));
            bristle.setAttribute('stroke-width', '0.5');
            bristle.setAttribute('stroke-linecap', 'round');
            bristle.setAttribute('pointer-events', 'none');
            g.appendChild(bristle);
          }
        }
      }
      break;
    }
    
    case 'gravel': {
      const gravelColors = ['#9E9E9E', '#757575', '#BDBDBD', '#616161', '#424242', '#A8A8A8', '#8A8A8A'];
      
      for (let i = 0; i < density * 2.5; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        const r3 = prand(i, 3);
        const r4 = prand(i, 4);
        
        const r = 1.5 + r1() * 4.5;
        const color = gravelColors[Math.floor(r2() * gravelColors.length)];
        const isAngular = r3() > 0.5;
        
        if (isAngular) {
          const stone = document.createElementNS(ns, 'path');
          const points = 5 + Math.floor(r4() * 3);
          let d = '';
          for (let j = 0; j < points; j++) {
            const pr = prand(i, 100 + j);
            const a = (j / points) * Math.PI * 2;
            const rr = r * (0.6 + pr() * 0.5);
            const px = pos.x + Math.cos(a) * rr;
            const py = pos.y + Math.sin(a) * rr;
            d += (j === 0 ? 'M' : 'L') + ` ${px.toFixed(2)} ${py.toFixed(2)} `;
          }
          d += 'Z';
          stone.setAttribute('d', d);
          stone.setAttribute('fill', color);
          stone.setAttribute('stroke', adjustColor(color, -30));
          stone.setAttribute('stroke-width', '0.3');
          stone.setAttribute('pointer-events', 'none');
          g.appendChild(stone);
        } else {
          const stone = document.createElementNS(ns, 'ellipse');
          stone.setAttribute('cx', pos.x);
          stone.setAttribute('cy', pos.y);
          stone.setAttribute('rx', r * (0.7 + r1() * 0.6));
          stone.setAttribute('ry', r * (0.6 + r2() * 0.5));
          stone.setAttribute('fill', color);
          stone.setAttribute('stroke', adjustColor(color, -25));
          stone.setAttribute('stroke-width', '0.3');
          stone.setAttribute('transform', `rotate(${r3() * 360} ${pos.x} ${pos.y})`);
          stone.setAttribute('pointer-events', 'none');
          g.appendChild(stone);
        }
        
        if (r4() > 0.4) {
          const highlight = document.createElementNS(ns, 'circle');
          highlight.setAttribute('cx', pos.x - r * 0.25);
          highlight.setAttribute('cy', pos.y - r * 0.25);
          highlight.setAttribute('r', r * 0.25);
          highlight.setAttribute('fill', adjustColor(color, 40));
          highlight.setAttribute('opacity', '0.5');
          highlight.setAttribute('pointer-events', 'none');
          g.appendChild(highlight);
        }
        
        if (r1() > 0.6) {
          const shadow = document.createElementNS(ns, 'ellipse');
          shadow.setAttribute('cx', pos.x + r * 0.2);
          shadow.setAttribute('cy', pos.y + r * 0.3);
          shadow.setAttribute('rx', r * 0.8);
          shadow.setAttribute('ry', r * 0.3);
          shadow.setAttribute('fill', '#000000');
          shadow.setAttribute('opacity', '0.15');
          shadow.setAttribute('pointer-events', 'none');
          g.appendChild(shadow);
        }
      }
      break;
    }
    
    case 'pine_cones': {
      const coneColors = ['#5D4037', '#4E342E', '#6D4C41', '#3E2723', '#795548'];
      
      for (let i = 0; i < density * 0.4; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1);
        const r2 = prand(i, 2);
        const r3 = prand(i, 3);
        
        const rx = 5 + r1() * 7;
        const ry = 8 + r2() * 12;
        const rot = r3() * 360;
        const color = coneColors[Math.floor(r1() * coneColors.length)];
        
        const coneGroup = document.createElementNS(ns, 'g');
        coneGroup.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
        coneGroup.setAttribute('pointer-events', 'none');
        
        const coneBody = document.createElementNS(ns, 'ellipse');
        coneBody.setAttribute('cx', 0);
        coneBody.setAttribute('cy', 0);
        coneBody.setAttribute('rx', rx);
        coneBody.setAttribute('ry', ry);
        coneBody.setAttribute('fill', adjustColor(color, -25));
        coneBody.setAttribute('stroke', adjustColor(color, -45));
        coneBody.setAttribute('stroke-width', '0.8');
        coneGroup.appendChild(coneBody);
        
        const scalesRows = 6 + Math.floor(r1() * 4);
        for (let row = 0; row < scalesRows; row++) {
          const rr = prand(i, 100 + row);
          const t = (row + 0.5) / scalesRows;
          const sy = -ry * 0.85 + t * ry * 1.7;
          const rowWidth = rx * Math.sin(t * Math.PI) * 1.9;
          const scalesInRow = Math.max(2, Math.floor(rowWidth / 3.5));
          const rowOffset = (row % 2 === 0) ? 0 : (rowWidth / scalesInRow) * 0.5;
          
          for (let col = 0; col < scalesInRow; col++) {
            const cr = prand(i, 1000 + row * 100 + col);
            const sx = -rowWidth/2 + rowOffset + (col + 0.5) * (rowWidth / scalesInRow);
            const scaleW = (rowWidth / scalesInRow) * 0.85;
            const scaleH = (ry / scalesRows) * 0.85;
            
            if (scaleW < 1 || scaleH < 1) continue;
            
            const scale = document.createElementNS(ns, 'path');
            const sd = `M 0 ${-scaleH/2} 
                        Q ${scaleW*0.55} ${-scaleH*0.35} ${scaleW/2} 0 
                        Q ${scaleW*0.55} ${scaleH*0.35} 0 ${scaleH/2} 
                        Q ${-scaleW*0.55} ${scaleH*0.35} ${-scaleW/2} 0 
                        Q ${-scaleW*0.55} ${-scaleH*0.35} 0 ${-scaleH/2} Z`;
            
            const scaleColor = adjustColor(color, Math.floor(cr() * 35) - 12);
            scale.setAttribute('d', sd);
            scale.setAttribute('fill', scaleColor);
            scale.setAttribute('stroke', adjustColor(color, -40));
            scale.setAttribute('stroke-width', '0.5');
            scale.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
            coneGroup.appendChild(scale);
            
            const groove = document.createElementNS(ns, 'line');
            groove.setAttribute('x1', -scaleW * 0.3);
            groove.setAttribute('y1', 0);
            groove.setAttribute('x2', scaleW * 0.3);
            groove.setAttribute('y2', 0);
            groove.setAttribute('stroke', adjustColor(color, -50));
            groove.setAttribute('stroke-width', '0.3');
            groove.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
            coneGroup.appendChild(groove);
            
            if (cr() > 0.4) {
              const shine = document.createElementNS(ns, 'ellipse');
              shine.setAttribute('cx', sx - scaleW * 0.1);
              shine.setAttribute('cy', sy - scaleH * 0.2);
              shine.setAttribute('rx', scaleW * 0.15);
              shine.setAttribute('ry', scaleH * 0.12);
              shine.setAttribute('fill', adjustColor(scaleColor, 35));
              shine.setAttribute('opacity', '0.6');
              coneGroup.appendChild(shine);
            }
          }
        }
        
        const shadow = document.createElementNS(ns, 'ellipse');
        shadow.setAttribute('cx', 2);
        shadow.setAttribute('cy', ry * 0.4);
        shadow.setAttribute('rx', rx * 0.8);
        shadow.setAttribute('ry', ry * 0.2);
        shadow.setAttribute('fill', '#000000');
        shadow.setAttribute('opacity', '0.2');
        coneGroup.appendChild(shadow);
        
        g.appendChild(coneGroup);
      }
      
      for (let i = 0; i < density * 0.8; i++) {
        const pos = nextPos(i + 20000);
        const r1 = prand(i + 20000, 1);
        const r2 = prand(i + 20000, 2);
        
        const len = 3 + r1() * 7;
        const angle = r2() * Math.PI * 2;
        
        const needle = document.createElementNS(ns, 'line');
        needle.setAttribute('x1', pos.x - Math.cos(angle) * len/2);
        needle.setAttribute('y1', pos.y - Math.sin(angle) * len/2);
        needle.setAttribute('x2', pos.x + Math.cos(angle) * len/2);
        needle.setAttribute('y2', pos.y + Math.sin(angle) * len/2);
        needle.setAttribute('stroke', '#8D6E63');
        needle.setAttribute('stroke-width', '0.7');
        needle.setAttribute('stroke-linecap', 'round');
        needle.setAttribute('pointer-events', 'none');
        g.appendChild(needle);
      }
      break;
    }
  }
}

function renderMulch(mulch) {
  const ns = 'http://www.w3.org/2000/svg';
  const bed = state.objects.find(o => o.id === mulch.bedId);
  if (!bed) return;
  
  const isSelected = state.selectedId === mulch.id;
  const clipId = `clip-mulch-${mulch.id}`;
  
  const seed = mulch.id * 1000 + 42;
  const rand = mulchRandom(seed);
  
  const defs = document.createElementNS(ns, 'defs');
  const clipPath = document.createElementNS(ns, 'clipPath');
  clipPath.setAttribute('id', clipId);
  const clipPoly = document.createElementNS(ns, 'polygon');
  clipPoly.setAttribute('points', bed.points.map(p => p.join(',')).join(' '));
  clipPath.appendChild(clipPoly);
  defs.appendChild(clipPath);
  objectsLayer.appendChild(defs);
  
  const g = document.createElementNS(ns, 'g');
  g.setAttribute('clip-path', `url(#${clipId})`);
  g.setAttribute('data-id', mulch.id);
  g.style.cursor = 'pointer';
  
  const mx = mulch.x;
  const my = mulch.y;
  const mw = mulch.w;
  const mh = mulch.h;
  
  renderMulchTexture(g, mulch, mx, my, mw, mh, rand);
  
  objectsLayer.appendChild(g);
  
  const hitArea = document.createElementNS(ns, mulch.shape === 'circle' ? 'ellipse' : 'rect');
  if (mulch.shape === 'circle') {
    hitArea.setAttribute('cx', mx);
    hitArea.setAttribute('cy', my);
    hitArea.setAttribute('rx', mw / 2);
    hitArea.setAttribute('ry', mh / 2);
  } else {
    hitArea.setAttribute('x', mx - mw / 2);
    hitArea.setAttribute('y', my - mh / 2);
    hitArea.setAttribute('width', mw);
    hitArea.setAttribute('height', mh);
  }
  hitArea.setAttribute('fill', 'transparent');
  hitArea.setAttribute('pointer-events', 'all');
  hitArea.setAttribute('data-id', mulch.id);
  hitArea.style.cursor = 'pointer';
  objectsLayer.appendChild(hitArea);
  
  if (isSelected) {
    const outline = document.createElementNS(ns, mulch.shape === 'circle' ? 'ellipse' : 'rect');
    if (mulch.shape === 'circle') {
      outline.setAttribute('cx', mx);
      outline.setAttribute('cy', my);
      outline.setAttribute('rx', mw / 2);
      outline.setAttribute('ry', mh / 2);
    } else {
      outline.setAttribute('x', mx - mw / 2);
      outline.setAttribute('y', my - mh / 2);
      outline.setAttribute('width', mw);
      outline.setAttribute('height', mh);
    }
    outline.setAttribute('fill', 'none');
    outline.setAttribute('stroke', '#ff6b00');
    outline.setAttribute('stroke-width', '2');
    outline.setAttribute('stroke-dasharray', '5,5');
    outline.setAttribute('pointer-events', 'none');
    objectsLayer.appendChild(outline);
  }
}

// ===== РЕНДЕР ДОРОЖКИ (по сегментам как прямоугольники) =====

function renderPathTexture(g, pathObj) {
  const ns = 'http://www.w3.org/2000/svg';
  const skin = pathObj.skin || 'gravel';
  const width = 30;
  const baseColor = pathObj.fill || '#b8a88a';
  
  if (pathObj.points.length < 2) return;
  
  const densityMultiplier = pathObj.densityMultiplier != null ? pathObj.densityMultiplier : 1.0;
  const seed = pathObj.id * 1000 + 99;
  
  let globalParticleIndex = 0;
  
  for (let segIdx = 0; segIdx < pathObj.points.length - 1; segIdx++) {
    const p1 = pathObj.points[segIdx];
    const p2 = pathObj.points[segIdx + 1];
    
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const segLength = Math.sqrt(dx * dx + dy * dy);
    
    if (segLength < 1) continue;
    
    const nx = -dy / segLength;
    const ny = dx / segLength;
    
    const area = segLength * width;
    const baseDensity = Math.max(10, Math.floor(area / 15));
    const density = Math.max(3, Math.floor(baseDensity * densityMultiplier));
    
    for (let i = 0; i < density; i++) {
      const pr = particleRand(seed, globalParticleIndex);
      
      const tAlong = pr();
      const tAcross = pr();
      
      const alongX = p1[0] + tAlong * dx;
      const alongY = p1[1] + tAlong * dy;
      
      const offset = (tAcross - 0.5) * width;
      const px = alongX + nx * offset;
      const py = alongY + ny * offset;
      
      const prParticle = particleRand(seed, globalParticleIndex * 10000);
      drawPathParticle(g, ns, skin, px, py, prParticle, baseColor);
      
      globalParticleIndex++;
    }
  }
}

function drawPathParticle(g, ns, skin, px, py, pr, baseColor) {
  switch (skin) {
    case 'gravel': {
      const r = 1.0 + pr() * 2.0;
      const shade = Math.floor(pr() * 50) - 25;
      const color = adjustColor(baseColor, shade);
      const stone = document.createElementNS(ns, 'ellipse');
      stone.setAttribute('cx', px);
      stone.setAttribute('cy', py);
      stone.setAttribute('rx', r * (0.7 + pr() * 0.5));
      stone.setAttribute('ry', r * (0.6 + pr() * 0.4));
      stone.setAttribute('fill', color);
      stone.setAttribute('stroke', adjustColor(color, -25));
      stone.setAttribute('stroke-width', '0.3');
      stone.setAttribute('transform', `rotate(${pr() * 360} ${px} ${py})`);
      stone.setAttribute('pointer-events', 'none');
      g.appendChild(stone);
      break;
    }
    case 'sand': {
      const r = 0.3 + pr() * 0.8;
      const shade = Math.floor(pr() * 30) - 10;
      const color = adjustColor(baseColor, shade);
      const grain = document.createElementNS(ns, 'circle');
      grain.setAttribute('cx', px);
      grain.setAttribute('cy', py);
      grain.setAttribute('r', r);
      grain.setAttribute('fill', color);
      grain.setAttribute('pointer-events', 'none');
      g.appendChild(grain);
      if (pr() > 0.4) {
        const g2 = document.createElementNS(ns, 'circle');
        g2.setAttribute('cx', px + (pr() - 0.5) * 2);
        g2.setAttribute('cy', py + (pr() - 0.5) * 2);
        g2.setAttribute('r', 0.3 + pr() * 0.6);
        g2.setAttribute('fill', adjustColor(baseColor, Math.floor(pr() * 20) - 5));
        g2.setAttribute('pointer-events', 'none');
        g.appendChild(g2);
      }
      break;
    }
    case 'cobblestone': {
      const w = 3 + pr() * 5;
      const h = 2.5 + pr() * 4;
      const rot = pr() * 360;
      const shade = Math.floor(pr() * 40) - 20;
      const color = adjustColor(baseColor, shade);
      const tile = document.createElementNS(ns, 'rect');
      tile.setAttribute('x', px - w/2);
      tile.setAttribute('y', py - h/2);
      tile.setAttribute('width', w);
      tile.setAttribute('height', h);
      tile.setAttribute('rx', 0.5);
      tile.setAttribute('fill', color);
      tile.setAttribute('stroke', adjustColor(color, -35));
      tile.setAttribute('stroke-width', '0.4');
      tile.setAttribute('transform', `rotate(${rot} ${px} ${py})`);
      tile.setAttribute('pointer-events', 'none');
      g.appendChild(tile);
      break;
    }
    case 'crushed_stone': {
      const r = 1.5 + pr() * 2.5;
      const shade = Math.floor(pr() * 40) - 25;
      const color = adjustColor(baseColor, shade);
      const points = 4 + Math.floor(pr() * 3);
      let d = '';
      for (let j = 0; j < points; j++) {
        const a = (j / points) * Math.PI * 2;
        const rr = r * (0.5 + pr() * 0.6);
        const x = px + Math.cos(a) * rr;
        const y = py + Math.sin(a) * rr;
        d += (j === 0 ? 'M' : 'L') + ` ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      d += 'Z';
      const stone = document.createElementNS(ns, 'path');
      stone.setAttribute('d', d);
      stone.setAttribute('fill', color);
      stone.setAttribute('stroke', adjustColor(color, -30));
      stone.setAttribute('stroke-width', '0.3');
      stone.setAttribute('pointer-events', 'none');
      g.appendChild(stone);
      break;
    }
    case 'bark_path': {
      const w = 2 + pr() * 5;
      const h = 1.5 + pr() * 2.5;
      const rot = pr() * 360;
      const shade = Math.floor(pr() * 30) - 15;
      const color = adjustColor(baseColor, shade);
      const bark = document.createElementNS(ns, 'ellipse');
      bark.setAttribute('cx', px);
      bark.setAttribute('cy', py);
      bark.setAttribute('rx', w/2);
      bark.setAttribute('ry', h/2);
      bark.setAttribute('fill', color);
      bark.setAttribute('stroke', adjustColor(color, -30));
      bark.setAttribute('stroke-width', '0.3');
      bark.setAttribute('transform', `rotate(${rot} ${px} ${py})`);
      bark.setAttribute('pointer-events', 'none');
      g.appendChild(bark);
      if (pr() > 0.5) {
        const grain = document.createElementNS(ns, 'line');
        grain.setAttribute('x1', px - w/2 + 1);
        grain.setAttribute('y1', py);
        grain.setAttribute('x2', px + w/2 - 1);
        grain.setAttribute('y2', py + (pr() - 0.5));
        grain.setAttribute('stroke', adjustColor(color, -20));
        grain.setAttribute('stroke-width', '0.2');
        grain.setAttribute('transform', `rotate(${rot} ${px} ${py})`);
        grain.setAttribute('pointer-events', 'none');
        g.appendChild(grain);
      }
      break;
    }
    case 'soil': {
      const r = 1.0 + pr() * 2.0;
      const shade = Math.floor(pr() * 30) - 20;
      const color = adjustColor(baseColor, shade);
      const points = 5 + Math.floor(pr() * 3);
      let d = '';
      for (let j = 0; j < points; j++) {
        const a = (j / points) * Math.PI * 2;
        const rr = r * (0.6 + pr() * 0.5);
        const x = px + Math.cos(a) * rr;
        const y = py + Math.sin(a) * rr;
        d += (j === 0 ? 'M' : 'L') + ` ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      d += 'Z';
      const clod = document.createElementNS(ns, 'path');
      clod.setAttribute('d', d);
      clod.setAttribute('fill', color);
      clod.setAttribute('pointer-events', 'none');
      g.appendChild(clod);
      if (pr() > 0.5) {
        const speck = document.createElementNS(ns, 'circle');
        speck.setAttribute('cx', px + (pr() - 0.5) * r);
        speck.setAttribute('cy', py + (pr() - 0.5) * r);
        speck.setAttribute('r', 0.3 + pr() * 0.4);
        speck.setAttribute('fill', adjustColor(baseColor, 20));
        speck.setAttribute('pointer-events', 'none');
        g.appendChild(speck);
      }
      break;
    }
  }
}

function renderPath(obj) {
  const ns = 'http://www.w3.org/2000/svg';
  const isSelected = obj.id === state.selectedId;
  
  const g = document.createElementNS(ns, 'g');
  g.setAttribute('data-id', obj.id);
  g.style.cursor = 'pointer';
  
  renderPathTexture(g, obj);
  
  let d = `M ${obj.points[0][0]} ${obj.points[0][1]}`;
  for (let i = 1; i < obj.points.length; i++) d += ` L ${obj.points[i][0]} ${obj.points[i][1]}`;
  
  const hitPath = document.createElementNS(ns, 'path');
  hitPath.setAttribute('d', d);
  hitPath.setAttribute('fill', 'none');
  hitPath.setAttribute('stroke', 'transparent');
  hitPath.setAttribute('stroke-width', '30');
  hitPath.setAttribute('stroke-linecap', 'round');
  hitPath.setAttribute('stroke-linejoin', 'round');
  hitPath.setAttribute('pointer-events', 'stroke');
  g.appendChild(hitPath);
  
  if (isSelected) {
    const outline = document.createElementNS(ns, 'path');
    outline.setAttribute('d', d);
    outline.setAttribute('fill', 'none');
    outline.setAttribute('stroke', '#ff6b00');
    outline.setAttribute('stroke-width', '34');
    outline.setAttribute('stroke-linecap', 'round');
    outline.setAttribute('stroke-linejoin', 'round');
    outline.setAttribute('opacity', '0.25');
    outline.setAttribute('pointer-events', 'none');
    g.appendChild(outline);
  }
  
  objectsLayer.appendChild(g);
}

// ===== МАРКЕРЫ ЗАДАЧ =====

function renderTaskMarkers(obj, x, y, size) {
  if (!obj.tasks || obj.tasks.length === 0) return;
  
  const ns = 'http://www.w3.org/2000/svg';
  const activeTasks = obj.tasks.filter(t => !t.done);
  if (activeTasks.length === 0) return;
  
  const urgentTasks = activeTasks.filter(t => t.priority === 'urgent' || isTaskOverdue(t));
  const topTask = urgentTasks[0] || activeTasks[0];
  const color = getTaskColor(topTask);
  
  const marker = document.createElementNS(ns, 'g');
  marker.setAttribute('pointer-events', 'none');
  
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y - size - 4);
  circle.setAttribute('r', 6);
  circle.setAttribute('fill', color);
  circle.setAttribute('stroke', 'white');
  circle.setAttribute('stroke-width', '1');
  
  if (topTask.highlightType === 'pulse') {
    const anim = document.createElementNS(ns, 'animate');
    anim.setAttribute('attributeName', 'r');
    anim.setAttribute('values', '6;8;6');
    anim.setAttribute('dur', '1.5s');
    anim.setAttribute('repeatCount', 'indefinite');
    circle.appendChild(anim);
    
    const animOp = document.createElementNS(ns, 'animate');
    animOp.setAttribute('attributeName', 'opacity');
    animOp.setAttribute('values', '0.9;0.4;0.9');
    animOp.setAttribute('dur', '1.5s');
    animOp.setAttribute('repeatCount', 'indefinite');
    circle.appendChild(animOp);
  }
  
  marker.appendChild(circle);
  
  const text = document.createElementNS(ns, 'text');
  text.setAttribute('x', x);
  text.setAttribute('y', y - size - 1);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '8');
  text.setAttribute('font-weight', 'bold');
  text.setAttribute('fill', 'white');
  text.textContent = activeTasks.length;
  marker.appendChild(text);
  
  objectsLayer.appendChild(marker);
  
  if (topTask.highlightType === 'glow') {
    const glow = document.createElementNS(ns, 'circle');
    glow.setAttribute('cx', x);
    glow.setAttribute('cy', y);
    glow.setAttribute('r', size + 4);
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', color);
    glow.setAttribute('stroke-width', '2');
    glow.setAttribute('opacity', '0.5');
    glow.setAttribute('pointer-events', 'none');
    objectsLayer.appendChild(glow);
  }
  
  if (topTask.highlightType === 'border') {
    const border = document.createElementNS(ns, 'circle');
    border.setAttribute('cx', x);
    border.setAttribute('cy', y);
    border.setAttribute('r', size + 2);
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', color);
    border.setAttribute('stroke-width', '1.5');
    border.setAttribute('stroke-dasharray', '3,2');
    border.setAttribute('pointer-events', 'none');
    objectsLayer.appendChild(border);
  }
}

function renderPlantingTaskMarkers(pl, x, y, r) {
  if (!pl.tasks || pl.tasks.length === 0) return;
  
  const ns = 'http://www.w3.org/2000/svg';
  const activeTasks = pl.tasks.filter(t => !t.done);
  if (activeTasks.length === 0) return;
  
  const urgentTasks = activeTasks.filter(t => t.priority === 'urgent' || isTaskOverdue(t));
  const topTask = urgentTasks[0] || activeTasks[0];
  const color = getTaskColor(topTask);
  
  const marker = document.createElementNS(ns, 'g');
  marker.setAttribute('pointer-events', 'none');
  
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y - r - 10);
  circle.setAttribute('r', 5);
  circle.setAttribute('fill', color);
  circle.setAttribute('stroke', 'white');
  circle.setAttribute('stroke-width', '1');
  
  if (topTask.highlightType === 'pulse') {
    const anim = document.createElementNS(ns, 'animate');
    anim.setAttribute('attributeName', 'r');
    anim.setAttribute('values', '5;7;5');
    anim.setAttribute('dur', '1.5s');
    anim.setAttribute('repeatCount', 'indefinite');
    circle.appendChild(anim);
  }
  
  marker.appendChild(circle);
  
  const text = document.createElementNS(ns, 'text');
  text.setAttribute('x', x);
  text.setAttribute('y', y - r - 8);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '7');
  text.setAttribute('font-weight', 'bold');
  text.setAttribute('fill', 'white');
  text.textContent = activeTasks.length;
  marker.appendChild(text);
  
  objectsLayer.appendChild(marker);
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
    const decorNames = { water: ' Водоём' };
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

function updateMulchDensity(id, value) {
  const obj = state.objects.find(o => o.id === id);
  if (!obj || obj.type !== 'mulch') return;
  obj.densityMultiplier = Math.max(0.2, Math.min(3.0, value));
  const label = document.getElementById('mulchDensityVal');
  if (label) label.textContent = '×' + obj.densityMultiplier.toFixed(1);
  render();
}

function updatePathDensity(id, value) {
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