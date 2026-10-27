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
      stone.setAttribute('cx', px); stone.setAttribute('cy', py);
      stone.setAttribute('rx', r * (0.7 + pr() * 0.5)); stone.setAttribute('ry', r * (0.6 + pr() * 0.4));
      stone.setAttribute('fill', color); stone.setAttribute('stroke', adjustColor(color, -25));
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
      grain.setAttribute('cx', px); grain.setAttribute('cy', py);
      grain.setAttribute('r', r); grain.setAttribute('fill', color);
      grain.setAttribute('pointer-events', 'none');
      g.appendChild(grain);
      if (pr() > 0.4) {
        const g2 = document.createElementNS(ns, 'circle');
        g2.setAttribute('cx', px + (pr() - 0.5) * 2); g2.setAttribute('cy', py + (pr() - 0.5) * 2);
        g2.setAttribute('r', 0.3 + pr() * 0.6);
        g2.setAttribute('fill', adjustColor(baseColor, Math.floor(pr() * 20) - 5));
        g2.setAttribute('pointer-events', 'none');
        g.appendChild(g2);
      }
      break;
    }
    case 'cobblestone': {
      const w = 3 + pr() * 5; const h = 2.5 + pr() * 4;
      const rot = pr() * 360;
      const shade = Math.floor(pr() * 40) - 20;
      const color = adjustColor(baseColor, shade);
      const tile = document.createElementNS(ns, 'rect');
      tile.setAttribute('x', px - w/2); tile.setAttribute('y', py - h/2);
      tile.setAttribute('width', w); tile.setAttribute('height', h);
      tile.setAttribute('rx', 0.5); tile.setAttribute('fill', color);
      tile.setAttribute('stroke', adjustColor(color, -35)); tile.setAttribute('stroke-width', '0.4');
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
        const x = px + Math.cos(a) * rr; const y = py + Math.sin(a) * rr;
        d += (j === 0 ? 'M' : 'L') + ` ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      d += 'Z';
      const stone = document.createElementNS(ns, 'path');
      stone.setAttribute('d', d); stone.setAttribute('fill', color);
      stone.setAttribute('stroke', adjustColor(color, -30)); stone.setAttribute('stroke-width', '0.3');
      stone.setAttribute('pointer-events', 'none');
      g.appendChild(stone);
      break;
    }
    case 'bark_path': {
      const w = 2 + pr() * 5; const h = 1.5 + pr() * 2.5;
      const rot = pr() * 360;
      const shade = Math.floor(pr() * 30) - 15;
      const color = adjustColor(baseColor, shade);
      const bark = document.createElementNS(ns, 'ellipse');
      bark.setAttribute('cx', px); bark.setAttribute('cy', py);
      bark.setAttribute('rx', w/2); bark.setAttribute('ry', h/2);
      bark.setAttribute('fill', color); bark.setAttribute('stroke', adjustColor(color, -30));
      bark.setAttribute('stroke-width', '0.3');
      bark.setAttribute('transform', `rotate(${rot} ${px} ${py})`);
      bark.setAttribute('pointer-events', 'none');
      g.appendChild(bark);
      if (pr() > 0.5) {
        const grain = document.createElementNS(ns, 'line');
        grain.setAttribute('x1', px - w/2 + 1); grain.setAttribute('y1', py);
        grain.setAttribute('x2', px + w/2 - 1); grain.setAttribute('y2', py + (pr() - 0.5));
        grain.setAttribute('stroke', adjustColor(color, -20)); grain.setAttribute('stroke-width', '0.2');
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
        const x = px + Math.cos(a) * rr; const y = py + Math.sin(a) * rr;
        d += (j === 0 ? 'M' : 'L') + ` ${x.toFixed(1)} ${y.toFixed(1)} `;
      }
      d += 'Z';
      const clod = document.createElementNS(ns, 'path');
      clod.setAttribute('d', d); clod.setAttribute('fill', color);
      clod.setAttribute('pointer-events', 'none');
      g.appendChild(clod);
      if (pr() > 0.5) {
        const speck = document.createElementNS(ns, 'circle');
        speck.setAttribute('cx', px + (pr() - 0.5) * r); speck.setAttribute('cy', py + (pr() - 0.5) * r);
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