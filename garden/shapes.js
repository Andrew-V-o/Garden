// ===== SVG-ФОРМЫ ДЛЯ ЦВЕТОВ =====

function createShapeElement(shape, cx, cy, r, color) {
  let el;
  const ns = 'http://www.w3.org/2000/svg';
  switch (shape) {
    case 'square':
      el = document.createElementNS(ns, 'rect');
      el.setAttribute('x', cx - r); el.setAttribute('y', cy - r);
      el.setAttribute('width', r * 2); el.setAttribute('height', r * 2);
      el.setAttribute('fill', color);
      break;
    case 'diamond':
      el = document.createElementNS(ns, 'polygon');
      el.setAttribute('points', `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`);
      el.setAttribute('fill', color);
      break;
    case 'star': {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const ang = (Math.PI / 5) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.45;
        pts.push(`${cx + Math.cos(ang) * rad},${cy + Math.sin(ang) * rad}`);
      }
      el = document.createElementNS(ns, 'polygon');
      el.setAttribute('points', pts.join(' '));
      el.setAttribute('fill', color);
      break;
    }
    case 'heart': {
      const s = r / 10;
      const d = `M ${cx} ${cy + 4 * s} ` +
        `C ${cx} ${cy + 2 * s}, ${cx - 5 * s} ${cy - 3 * s}, ${cx - 8 * s} ${cy - 3 * s} ` +
        `C ${cx - 12 * s} ${cy - 3 * s}, ${cx - 12 * s} ${cy + 3 * s}, ${cx - 12 * s} ${cy + 3 * s} ` +
        `C ${cx - 12 * s} ${cy + 7 * s}, ${cx - 6 * s} ${cy + 11 * s}, ${cx} ${cy + 14 * s} ` +
        `C ${cx + 6 * s} ${cy + 11 * s}, ${cx + 12 * s} ${cy + 7 * s}, ${cx + 12 * s} ${cy + 3 * s} ` +
        `C ${cx + 12 * s} ${cy + 3 * s}, ${cx + 12 * s} ${cy - 3 * s}, ${cx + 8 * s} ${cy - 3 * s} ` +
        `C ${cx + 5 * s} ${cy - 3 * s}, ${cx} ${cy + 2 * s}, ${cx} ${cy + 4 * s} Z`;
      el = document.createElementNS(ns, 'path');
      el.setAttribute('d', d);
      el.setAttribute('fill', color);
      break;
    }
    case 'flower': {
      const petals = 5;
      let d = '';
      for (let i = 0; i < petals; i++) {
        const ang = (Math.PI * 2 / petals) * i - Math.PI / 2;
        const px = cx + Math.cos(ang) * r * 0.6;
        const py = cy + Math.sin(ang) * r * 0.6;
        d += `M ${cx} ${cy} Q ${cx + Math.cos(ang - 0.4) * r} ${cy + Math.sin(ang - 0.4) * r}, ${px} ${py} ` +
          `Q ${cx + Math.cos(ang + 0.4) * r} ${cy + Math.sin(ang + 0.4) * r}, ${cx} ${cy} `;
      }
      el = document.createElementNS(ns, 'path');
      el.setAttribute('d', d);
      el.setAttribute('fill', color);
      const center = document.createElementNS(ns, 'circle');
      center.setAttribute('cx', cx); center.setAttribute('cy', cy);
      center.setAttribute('r', r * 0.3);
      center.setAttribute('fill', '#ffc107');
      const g = document.createElementNS(ns, 'g');
      g.appendChild(el); g.appendChild(center);
      return g;
    }
    case 'circle':
    default:
      el = document.createElementNS(ns, 'circle');
      el.setAttribute('cx', cx); el.setAttribute('cy', cy);
      el.setAttribute('r', r);
      el.setAttribute('fill', color);
  }
  return el;
}

function getShapeSVGMini(shape, color) {
  switch (shape) {
    case 'square': return `<rect x="2" y="2" width="12" height="12" fill="${color}"/>`;
    case 'diamond': return `<polygon points="8,1 15,8 8,15 1,8" fill="${color}"/>`;
    case 'star': {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const ang = (Math.PI / 5) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? 7 : 3;
        pts.push(`${8 + Math.cos(ang) * rad},${8 + Math.sin(ang) * rad}`);
      }
      return `<polygon points="${pts.join(' ')}" fill="${color}"/>`;
    }
    case 'heart':
      return `<path d="M8 13 C8 11 3 8 3 5 C3 3 5 2 6.5 3 C7.5 3.7 8 4.5 8 5 C8 4.5 8.5 3.7 9.5 3 C11 2 13 3 13 5 C13 8 8 11 8 13 Z" fill="${color}"/>`;
    case 'flower':
      return `<circle cx="8" cy="4" r="3" fill="${color}"/><circle cx="12" cy="8" r="3" fill="${color}"/><circle cx="8" cy="12" r="3" fill="${color}"/><circle cx="4" cy="8" r="3" fill="${color}"/><circle cx="8" cy="8" r="2" fill="#ffc107"/>`;
    default:
      return `<circle cx="8" cy="8" r="7" fill="${color}"/>`;
  }
}