// ===== РЕНДЕР МУЛЬЧИ С ТЕКСТУРАМИ =====

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
        const r1 = prand(i, 1); const r2 = prand(i, 2); const r3 = prand(i, 3); const r4 = prand(i, 4);
        const w = 5 + r1() * 12; const h = 3 + r2() * 6; const rot = r3() * 360;
        const color = barkColors[Math.floor(r4() * barkColors.length)];
        const bark = document.createElementNS(ns, 'path');
        const jag = 0.25;
        const d = `M ${-w/2 + r1()*w*jag} ${-h/2} L ${-w/4 + r2()*w*jag} ${-h/2 + r3()*h*0.2} L ${0} ${-h/2 + r4()*h*0.15} L ${w/4 - r1()*w*jag} ${-h/2 + r2()*h*0.2} L ${w/2 - r3()*w*jag} ${-h/2} L ${w/2} ${-h/4 + r4()*h*0.2} L ${w/2 - r1()*w*0.1} ${0} L ${w/2} ${h/4 - r2()*h*0.2} L ${w/2 - r3()*w*jag} ${h/2} L ${w/4} ${h/2 - r4()*h*0.15} L ${0} ${h/2} L ${-w/4} ${h/2 - r1()*h*0.2} L ${-w/2 + r2()*w*jag} ${h/2} L ${-w/2} ${h/4} L ${-w/2 + r3()*w*0.1} ${0} L ${-w/2} ${-h/4} Z`;
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
            grain.setAttribute('x1', -w/2 + 1); grain.setAttribute('y1', gy);
            grain.setAttribute('x2', w/2 - 1); grain.setAttribute('y2', gy + (gr() - 0.5) * 2);
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
        const r1 = prand(i, 1); const r2 = prand(i, 2); const r3 = prand(i, 3);
        const size = 8 + r1() * 12; const rot = r2() * 360;
        const color = leafColors[Math.floor(r3() * leafColors.length)];
        const shade = Math.floor(r1() * 30) - 15;
        const leafColor = adjustColor(color, shade);
        drawOakLeafGroup(g, ns, pos.x, pos.y, size, rot, leafColor, prand(i, 10));
      }
      for (let i = 0; i < density * 0.5; i++) {
        const pos = nextPos(i + 10000);
        const r1 = prand(i + 10000, 1); const r2 = prand(i + 10000, 2);
        const color = leafColors[Math.floor(r1() * leafColors.length)];
        const size = 2 + r2() * 4; const rot = r1() * 360;
        const fragment = document.createElementNS(ns, 'ellipse');
        fragment.setAttribute('cx', pos.x); fragment.setAttribute('cy', pos.y);
        fragment.setAttribute('rx', size); fragment.setAttribute('ry', size * 0.4);
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
        const r1 = prand(i, 1); const r2 = prand(i, 2); const r3 = prand(i, 3);
        const size = 8 + r1() * 12; const rot = r2() * 360;
        const color = leafColors[Math.floor(r3() * leafColors.length)];
        const shade = Math.floor(r1() * 30) - 15;
        const leafColor = adjustColor(color, shade);
        drawRedOakLeafGroup(g, ns, pos.x, pos.y, size, rot, leafColor, prand(i, 10));
      }
      for (let i = 0; i < density * 0.5; i++) {
        const pos = nextPos(i + 10000);
        const r1 = prand(i + 10000, 1); const r2 = prand(i + 10000, 2);
        const color = leafColors[Math.floor(r1() * leafColors.length)];
        const size = 2 + r2() * 4; const rot = r1() * 360;
        const fragment = document.createElementNS(ns, 'ellipse');
        fragment.setAttribute('cx', pos.x); fragment.setAttribute('cy', pos.y);
        fragment.setAttribute('rx', size); fragment.setAttribute('ry', size * 0.4);
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
        const r1 = prand(i, 1); const r2 = prand(i, 2);
        const len = 2.5 + r1() * 4; const angle = r2() * Math.PI * 2;
        const color = needleColors[Math.floor(r1() * needleColors.length)];
        const x1 = pos.x - Math.cos(angle) * len * 0.4; const y1 = pos.y - Math.sin(angle) * len * 0.4;
        const x2 = pos.x + Math.cos(angle) * len * 0.6; const y2 = pos.y + Math.sin(angle) * len * 0.6;
        const needle = document.createElementNS(ns, 'path');
        needle.setAttribute('d', `M ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)}`);
        needle.setAttribute('stroke', color); needle.setAttribute('stroke-width', '1.0');
        needle.setAttribute('stroke-linecap', 'round'); needle.setAttribute('pointer-events', 'none');
        g.appendChild(needle);
      }
      for (let i = 0; i < density * 0.6; i++) {
        const pos = nextPos(i + 20000);
        const r1 = prand(i + 20000, 1); const r2 = prand(i + 20000, 2);
        const len = 6 + r1() * 12; const angle = r2() * Math.PI * 2;
        const twig = document.createElementNS(ns, 'line');
        twig.setAttribute('x1', pos.x - Math.cos(angle) * len/2); twig.setAttribute('y1', pos.y - Math.sin(angle) * len/2);
        twig.setAttribute('x2', pos.x + Math.cos(angle) * len/2); twig.setAttribute('y2', pos.y + Math.sin(angle) * len/2);
        twig.setAttribute('stroke', '#5D4037'); twig.setAttribute('stroke-width', '1.0');
        twig.setAttribute('stroke-linecap', 'round'); twig.setAttribute('pointer-events', 'none');
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
          branch.setAttribute('x1', bx); branch.setAttribute('y1', by);
          branch.setAttribute('x2', bx + Math.cos(brAngle) * brLen); branch.setAttribute('y2', by + Math.sin(brAngle) * brLen);
          branch.setAttribute('stroke', '#4E342E'); branch.setAttribute('stroke-width', '0.6');
          branch.setAttribute('stroke-linecap', 'round'); branch.setAttribute('pointer-events', 'none');
          g.appendChild(branch);
        }
      }
      for (let i = 0; i < density * 0.5; i++) {
        const pos = nextPos(i + 30000);
        const r1 = prand(i + 30000, 1);
        const pad = document.createElementNS(ns, 'circle');
        pad.setAttribute('cx', pos.x); pad.setAttribute('cy', pos.y);
        pad.setAttribute('r', 0.8 + r1() * 1.0); pad.setAttribute('fill', '#1B0F0A');
        pad.setAttribute('pointer-events', 'none');
        g.appendChild(pad);
      }
      break;
    }
    case 'pine_needles': {
      const needleColors = ['#A1887F', '#8D6E63', '#BCAAA4', '#795548', '#D7CCC8', '#B09080'];
      for (let i = 0; i < density * 2.5; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1); const r2 = prand(i, 2);
        const bundleAngle = r1() * Math.PI * 2;
        const needlesInBundle = 3 + Math.floor(r2() * 3);
        const base = document.createElementNS(ns, 'circle');
        base.setAttribute('cx', pos.x); base.setAttribute('cy', pos.y);
        base.setAttribute('r', 1.2 + r1() * 0.6); base.setAttribute('fill', '#8B4513');
        base.setAttribute('pointer-events', 'none');
        g.appendChild(base);
        const sheath = document.createElementNS(ns, 'ellipse');
        sheath.setAttribute('cx', pos.x); sheath.setAttribute('cy', pos.y);
        sheath.setAttribute('rx', 1.5); sheath.setAttribute('ry', 1);
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
          const x1 = pos.x; const y1 = pos.y;
          const x2 = pos.x + Math.cos(angle) * len; const y2 = pos.y + Math.sin(angle) * len;
          const cpx = (x1 + x2) / 2 + Math.cos(angle + Math.PI/2) * (nr() - 0.5) * 3;
          const cpy = (y1 + y2) / 2 + Math.sin(angle + Math.PI/2) * (nr() - 0.5) * 3;
          const needle = document.createElementNS(ns, 'path');
          needle.setAttribute('d', `M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`);
          needle.setAttribute('stroke', color); needle.setAttribute('stroke-width', '0.9');
          needle.setAttribute('stroke-linecap', 'round'); needle.setAttribute('fill', 'none');
          needle.setAttribute('pointer-events', 'none');
          g.appendChild(needle);
        }
      }
      for (let i = 0; i < density * 0.3; i++) {
        const pos = nextPos(i + 20000);
        const r1 = prand(i + 20000, 1); const r2 = prand(i + 20000, 2);
        const size = 1 + r1() * 3; const rot = r2() * 360;
        const chip = document.createElementNS(ns, 'rect');
        chip.setAttribute('x', -size); chip.setAttribute('y', -size/2);
        chip.setAttribute('width', size * 2); chip.setAttribute('height', size);
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
          const r1 = prand(i + layer * 10000, 1); const r2 = prand(i + layer * 10000, 2); const r3 = prand(i + layer * 10000, 3);
          const w = 3 + r1() * 7; const h = 2 + r2() * 5; const rot = r3() * 360;
          const color = barkColors[Math.floor(r1() * barkColors.length)];
          const scale = document.createElementNS(ns, 'path');
          const d = `M 0 ${-h/2} Q ${w*0.5} ${-h*0.4} ${w/2} 0 Q ${w*0.4} ${h*0.4} 0 ${h/2} Q ${-w*0.4} ${h*0.3} ${-w/2} 0 Q ${-w*0.4} ${-h*0.3} 0 ${-h/2} Z`;
          scale.setAttribute('d', d); scale.setAttribute('fill', color);
          scale.setAttribute('stroke', adjustColor(color, -20)); scale.setAttribute('stroke-width', '0.3');
          scale.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
          scale.setAttribute('pointer-events', 'none');
          g.appendChild(scale);
          if (r2() > 0.5) {
            const shadow = document.createElementNS(ns, 'path');
            const sd = `M ${-w/2 + 1} ${h/2 - 1} Q 0 ${h/2 + 1} ${w/2 - 1} ${h/2 - 1}`;
            shadow.setAttribute('d', sd); shadow.setAttribute('stroke', '#000000');
            shadow.setAttribute('stroke-width', '0.4'); shadow.setAttribute('fill', 'none');
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
        const r1 = prand(i, 1); const r2 = prand(i, 2); const r3 = prand(i, 3); const r4 = prand(i, 4);
        const w = 10 + r1() * 16; const h = 6 + r2() * 12; const rot = r3() * 360;
        const color = barkColors[Math.floor(r4() * barkColors.length)];
        const plate = document.createElementNS(ns, 'path');
        const jag = 0.15;
        const d = `M ${-w/2 + r1()*w*jag} ${-h/2 + r2()*h*jag} L ${-w/4} ${-h/2} L ${w/4 - r3()*w*jag} ${-h/2 + r4()*h*jag} L ${w/2} ${-h/4} L ${w/2 - r1()*w*jag} ${h/4} L ${w/4} ${h/2} L ${-w/4 + r2()*w*jag} ${h/2 - r3()*h*jag} L ${-w/2} ${h/4} Z`;
        plate.setAttribute('d', d); plate.setAttribute('fill', color);
        plate.setAttribute('stroke', adjustColor(color, -40)); plate.setAttribute('stroke-width', '0.7');
        plate.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
        plate.setAttribute('pointer-events', 'none');
        g.appendChild(plate);
        const highlight = document.createElementNS(ns, 'path');
        highlight.setAttribute('d', `M ${-w/2 + 2} ${-h/2 + 1} L ${w/2 - 2} ${-h/2 + 1}`);
        highlight.setAttribute('stroke', adjustColor(color, 25)); highlight.setAttribute('stroke-width', '0.5');
        highlight.setAttribute('fill', 'none');
        highlight.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
        highlight.setAttribute('pointer-events', 'none');
        g.appendChild(highlight);
        const crackCount = 2 + Math.floor(r1() * 3);
        for (let j = 0; j < crackCount; j++) {
          const cr = prand(i, 100 + j);
          const crack = document.createElementNS(ns, 'path');
          const cx = -w/2 + cr() * w; const cy = -h/2 + cr() * h;
          const len = 3 + cr() * (w * 0.5); const angle = cr() * Math.PI;
          const cd = `M ${cx} ${cy} Q ${cx + Math.cos(angle) * len/2 + (cr()-0.5)*2} ${cy + Math.sin(angle) * len/2 + (cr()-0.5)*2} ${cx + Math.cos(angle) * len} ${cy + Math.sin(angle) * len}`;
          crack.setAttribute('d', cd); crack.setAttribute('stroke', adjustColor(color, -50));
          crack.setAttribute('stroke-width', '0.6'); crack.setAttribute('fill', 'none');
          crack.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
          crack.setAttribute('pointer-events', 'none');
          g.appendChild(crack);
        }
      }
      for (let i = 0; i < density * 0.3; i++) {
        const pos = nextPos(i + 20000);
        const r1 = prand(i + 20000, 1);
        const dot = document.createElementNS(ns, 'circle');
        dot.setAttribute('cx', pos.x); dot.setAttribute('cy', pos.y);
        dot.setAttribute('r', 1 + r1() * 2); dot.setAttribute('fill', '#1B0F0A');
        dot.setAttribute('opacity', '0.6'); dot.setAttribute('pointer-events', 'none');
        g.appendChild(dot);
      }
      break;
    }
    case 'woodchips': {
      const chipColors = ['#BCAAA4', '#A1887F', '#D7CCC8', '#8D6E63', '#EFEBE9', '#C9B8A8'];
      for (let i = 0; i < density * 2.0; i++) {
        const pos = nextPos(i);
        const r1 = prand(i, 1); const r2 = prand(i, 2); const r3 = prand(i, 3); const r4 = prand(i, 4);
        const w = 2 + r1() * 8; const h = 1 + r2() * 4; const rot = r3() * 360;
        const color = chipColors[Math.floor(r4() * chipColors.length)];
        const chip = document.createElementNS(ns, 'path');
        const isPointed = r1() > 0.5;
        let d;
        if (isPointed) { d = `M ${-w/2} 0 L ${-w/4} ${-h/2} L ${w/4} ${-h/2 + r2()*h*0.3} L ${w/2} 0 L ${w/4} ${h/2} L ${-w/4} ${h/2 - r3()*h*0.3} Z`; }
        else { d = `M ${-w/2} ${-h/2 + r1()*h*0.2} L ${w/2 - r2()*w*0.1} ${-h/2} L ${w/2} ${h/2 - r3()*h*0.2} L ${-w/2 + r4()*w*0.1} ${h/2} Z`; }
        chip.setAttribute('d', d); chip.setAttribute('fill', color);
        chip.setAttribute('stroke', adjustColor(color, -25)); chip.setAttribute('stroke-width', '0.3');
        chip.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
        chip.setAttribute('pointer-events', 'none');
        g.appendChild(chip);
        const grainCount = 1 + Math.floor(r1() * 2);
        for (let j = 0; j < grainCount; j++) {
          const gr = prand(i, 100 + j);
          const grain = document.createElementNS(ns, 'line');
          const gy = -h/2 + gr() * h;
          grain.setAttribute('x1', -w/2 + 1); grain.setAttribute('y1', gy);
          grain.setAttribute('x2', w/2 - 1); grain.setAttribute('y2', gy + (gr() - 0.5));
          grain.setAttribute('stroke', adjustColor(color, -15)); grain.setAttribute('stroke-width', '0.2');
          grain.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
          grain.setAttribute('pointer-events', 'none');
          g.appendChild(grain);
        }
        if (r4() > 0.7) {
          const barkEdge = document.createElementNS(ns, 'line');
          barkEdge.setAttribute('x1', -w/2); barkEdge.setAttribute('y1', -h/2);
          barkEdge.setAttribute('x2', -w/2); barkEdge.setAttribute('y2', h/2);
          barkEdge.setAttribute('stroke', '#5D4037'); barkEdge.setAttribute('stroke-width', '0.8');
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
        const r1 = prand(i, 1); const r2 = prand(i, 2); const r3 = prand(i, 3);
        const len = 12 + r1() * 18;
        const baseAngle = -Math.PI/2 + (r2() - 0.5) * Math.PI * 0.8;
        const angle = baseAngle + (r3() - 0.5) * 0.3;
        const color = strawColors[Math.floor(r1() * strawColors.length)];
        const x1 = pos.x - Math.cos(angle) * len/2; const y1 = pos.y - Math.sin(angle) * len/2;
        const x2 = pos.x + Math.cos(angle) * len/2; const y2 = pos.y + Math.sin(angle) * len/2;
        const bend = (r2() - 0.5) * len * 0.3;
        const cpx = pos.x + Math.cos(angle + Math.PI/2) * bend;
        const cpy = pos.y + Math.sin(angle + Math.PI/2) * bend;
        const straw = document.createElementNS(ns, 'path');
        straw.setAttribute('d', `M ${x1} ${y1} Q ${cpx} ${cpy} ${x2} ${y2}`);
        straw.setAttribute('stroke', color); straw.setAttribute('stroke-width', '1.3');
        straw.setAttribute('stroke-linecap', 'round'); straw.setAttribute('fill', 'none');
        straw.setAttribute('pointer-events', 'none');
        g.appendChild(straw);
        const nodeCount = 1 + Math.floor(r1() * 2);
        for (let j = 0; j < nodeCount; j++) {
          const nr = prand(i, 100 + j);
          const t = 0.2 + nr() * 0.6;
          const nodeX = x1 + (x2 - x1) * t + (cpx - pos.x) * 2 * t * (1-t);
          const nodeY = y1 + (y2 - y1) * t + (cpy - pos.y) * 2 * t * (1-t);
          const node = document.createElementNS(ns, 'ellipse');
          node.setAttribute('cx', nodeX); node.setAttribute('cy', nodeY);
          node.setAttribute('rx', '1.3'); node.setAttribute('ry', '0.8');
          node.setAttribute('fill', adjustColor(color, -30));
          node.setAttribute('transform', `rotate(${angle * 180 / Math.PI} ${nodeX} ${nodeY})`);
          node.setAttribute('pointer-events', 'none');
          g.appendChild(node);
        }
        if (r3() > 0.7) {
          const tipX = x2; const tipY = y2;
          const bristles = 3 + Math.floor(r1() * 3);
          for (let j = 0; j < bristles; j++) {
            const br = prand(i, 200 + j);
            const brAngle = angle + (j - bristles/2) * 0.2;
            const brLen = 2 + br() * 3;
            const bristle = document.createElementNS(ns, 'line');
            bristle.setAttribute('x1', tipX); bristle.setAttribute('y1', tipY);
            bristle.setAttribute('x2', tipX + Math.cos(brAngle) * brLen); bristle.setAttribute('y2', tipY + Math.sin(brAngle) * brLen);
            bristle.setAttribute('stroke', adjustColor(color, -10)); bristle.setAttribute('stroke-width', '0.5');
            bristle.setAttribute('stroke-linecap', 'round'); bristle.setAttribute('pointer-events', 'none');
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
        const r1 = prand(i, 1); const r2 = prand(i, 2); const r3 = prand(i, 3); const r4 = prand(i, 4);
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
            const px = pos.x + Math.cos(a) * rr; const py = pos.y + Math.sin(a) * rr;
            d += (j === 0 ? 'M' : 'L') + ` ${px.toFixed(2)} ${py.toFixed(2)} `;
          }
          d += 'Z';
          stone.setAttribute('d', d); stone.setAttribute('fill', color);
          stone.setAttribute('stroke', adjustColor(color, -30)); stone.setAttribute('stroke-width', '0.3');
          stone.setAttribute('pointer-events', 'none');
          g.appendChild(stone);
        } else {
          const stone = document.createElementNS(ns, 'ellipse');
          stone.setAttribute('cx', pos.x); stone.setAttribute('cy', pos.y);
          stone.setAttribute('rx', r * (0.7 + r1() * 0.6)); stone.setAttribute('ry', r * (0.6 + r2() * 0.5));
          stone.setAttribute('fill', color); stone.setAttribute('stroke', adjustColor(color, -25));
          stone.setAttribute('stroke-width', '0.3');
          stone.setAttribute('transform', `rotate(${r3() * 360} ${pos.x} ${pos.y})`);
          stone.setAttribute('pointer-events', 'none');
          g.appendChild(stone);
        }
        if (r4() > 0.4) {
          const highlight = document.createElementNS(ns, 'circle');
          highlight.setAttribute('cx', pos.x - r * 0.25); highlight.setAttribute('cy', pos.y - r * 0.25);
          highlight.setAttribute('r', r * 0.25); highlight.setAttribute('fill', adjustColor(color, 40));
          highlight.setAttribute('opacity', '0.5'); highlight.setAttribute('pointer-events', 'none');
          g.appendChild(highlight);
        }
        if (r1() > 0.6) {
          const shadow = document.createElementNS(ns, 'ellipse');
          shadow.setAttribute('cx', pos.x + r * 0.2); shadow.setAttribute('cy', pos.y + r * 0.3);
          shadow.setAttribute('rx', r * 0.8); shadow.setAttribute('ry', r * 0.3);
          shadow.setAttribute('fill', '#000000'); shadow.setAttribute('opacity', '0.15');
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
        const r1 = prand(i, 1); const r2 = prand(i, 2); const r3 = prand(i, 3);
        const rx = 5 + r1() * 7; const ry = 8 + r2() * 12; const rot = r3() * 360;
        const color = coneColors[Math.floor(r1() * coneColors.length)];
        const coneGroup = document.createElementNS(ns, 'g');
        coneGroup.setAttribute('transform', `translate(${pos.x} ${pos.y}) rotate(${rot})`);
        coneGroup.setAttribute('pointer-events', 'none');
        const coneBody = document.createElementNS(ns, 'ellipse');
        coneBody.setAttribute('cx', 0); coneBody.setAttribute('cy', 0);
        coneBody.setAttribute('rx', rx); coneBody.setAttribute('ry', ry);
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
            const sd = `M 0 ${-scaleH/2} Q ${scaleW*0.55} ${-scaleH*0.35} ${scaleW/2} 0 Q ${scaleW*0.55} ${scaleH*0.35} 0 ${scaleH/2} Q ${-scaleW*0.55} ${scaleH*0.35} ${-scaleW/2} 0 Q ${-scaleW*0.55} ${-scaleH*0.35} 0 ${-scaleH/2} Z`;
            const scaleColor = adjustColor(color, Math.floor(cr() * 35) - 12);
            scale.setAttribute('d', sd); scale.setAttribute('fill', scaleColor);
            scale.setAttribute('stroke', adjustColor(color, -40)); scale.setAttribute('stroke-width', '0.5');
            scale.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
            coneGroup.appendChild(scale);
            const groove = document.createElementNS(ns, 'line');
            groove.setAttribute('x1', -scaleW * 0.3); groove.setAttribute('y1', 0);
            groove.setAttribute('x2', scaleW * 0.3); groove.setAttribute('y2', 0);
            groove.setAttribute('stroke', adjustColor(color, -50)); groove.setAttribute('stroke-width', '0.3');
            groove.setAttribute('transform', `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
            coneGroup.appendChild(groove);
            if (cr() > 0.4) {
              const shine = document.createElementNS(ns, 'ellipse');
              shine.setAttribute('cx', sx - scaleW * 0.1); shine.setAttribute('cy', sy - scaleH * 0.2);
              shine.setAttribute('rx', scaleW * 0.15); shine.setAttribute('ry', scaleH * 0.12);
              shine.setAttribute('fill', adjustColor(scaleColor, 35)); shine.setAttribute('opacity', '0.6');
              coneGroup.appendChild(shine);
            }
          }
        }
        const shadow = document.createElementNS(ns, 'ellipse');
        shadow.setAttribute('cx', 2); shadow.setAttribute('cy', ry * 0.4);
        shadow.setAttribute('rx', rx * 0.8); shadow.setAttribute('ry', ry * 0.2);
        shadow.setAttribute('fill', '#000000'); shadow.setAttribute('opacity', '0.2');
        coneGroup.appendChild(shadow);
        g.appendChild(coneGroup);
      }
      for (let i = 0; i < density * 0.8; i++) {
        const pos = nextPos(i + 20000);
        const r1 = prand(i + 20000, 1); const r2 = prand(i + 20000, 2);
        const len = 3 + r1() * 7; const angle = r2() * Math.PI * 2;
        const needle = document.createElementNS(ns, 'line');
        needle.setAttribute('x1', pos.x - Math.cos(angle) * len/2); needle.setAttribute('y1', pos.y - Math.sin(angle) * len/2);
        needle.setAttribute('x2', pos.x + Math.cos(angle) * len/2); needle.setAttribute('y2', pos.y + Math.sin(angle) * len/2);
        needle.setAttribute('stroke', '#8D6E63'); needle.setAttribute('stroke-width', '0.7');
        needle.setAttribute('stroke-linecap', 'round'); needle.setAttribute('pointer-events', 'none');
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
    hitArea.setAttribute('cx', mx); hitArea.setAttribute('cy', my);
    hitArea.setAttribute('rx', mw / 2); hitArea.setAttribute('ry', mh / 2);
  } else {
    hitArea.setAttribute('x', mx - mw / 2); hitArea.setAttribute('y', my - mh / 2);
    hitArea.setAttribute('width', mw); hitArea.setAttribute('height', mh);
  }
  hitArea.setAttribute('fill', 'transparent');
  hitArea.setAttribute('pointer-events', 'all');
  hitArea.setAttribute('data-id', mulch.id);
  hitArea.style.cursor = 'pointer';
  objectsLayer.appendChild(hitArea);
  
  if (isSelected) {
    const outline = document.createElementNS(ns, mulch.shape === 'circle' ? 'ellipse' : 'rect');
    if (mulch.shape === 'circle') {
      outline.setAttribute('cx', mx); outline.setAttribute('cy', my);
      outline.setAttribute('rx', mw / 2); outline.setAttribute('ry', mh / 2);
    } else {
      outline.setAttribute('x', mx - mw / 2); outline.setAttribute('y', my - mh / 2);
      outline.setAttribute('width', mw); outline.setAttribute('height', mh);
    }
    outline.setAttribute('fill', 'none');
    outline.setAttribute('stroke', '#ff6b00');
    outline.setAttribute('stroke-width', '2');
    outline.setAttribute('stroke-dasharray', '5,5');
    outline.setAttribute('pointer-events', 'none');
    objectsLayer.appendChild(outline);
  }
}