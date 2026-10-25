// ===== ФУНКЦИИ ОТРИСОВКИ ФИГУР =====

function getShapeSVGMini(shape, color) {
  switch (shape) {
    case 'circle':
      return `<circle cx="8" cy="8" r="7" fill="${color}"/>`;
    
    case 'square':
      return `<rect x="2" y="2" width="12" height="12" fill="${color}"/>`;
    
    case 'diamond':
      return `<polygon points="8,1 15,8 8,15 1,8" fill="${color}"/>`;
    
    case 'triangle':
      return `<polygon points="8,1 15,14 1,14" fill="${color}"/>`;
    
    case 'oval':
      return `<ellipse cx="8" cy="8" rx="7" ry="5" fill="${color}"/>`;
    
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
    
    case 'cross':
      return `<path d="M6 2 L10 2 L10 6 L14 6 L14 10 L10 10 L10 14 L6 14 L6 10 L2 10 L2 6 L6 6 Z" fill="${color}"/>`;
    
    case 'moon':
      return `<path d="M10 2 A6 6 0 1 0 10 14 A4 4 0 1 1 10 2 Z" fill="${color}"/>`;
    
    case 'drop':
      return `<path d="M8 1 C8 1 2 7 2 10 A6 6 0 0 0 14 10 C14 7 8 1 8 1 Z" fill="${color}"/>`;
    
    case 'leaf':
      return `<path d="M2 14 C2 14 4 2 12 2 C12 2 14 10 6 14 C4 15 3 14 2 14 Z" fill="${color}"/>`;
    
    default:
      return `<circle cx="8" cy="8" r="7" fill="${color}"/>`;
  }
}

function createShapeElement(shape, x, y, r, color) {
  const ns = 'http://www.w3.org/2000/svg';
  const s = r * 2;
  
  switch (shape) {
    case 'square': {
      const el = document.createElementNS(ns, 'rect');
      el.setAttribute('x', x - r);
      el.setAttribute('y', y - r);
      el.setAttribute('width', s);
      el.setAttribute('height', s);
      el.setAttribute('fill', color);
      return el;
    }
    case 'diamond': {
      const el = document.createElementNS(ns, 'polygon');
      el.setAttribute('points', `${x},${y-r} ${x+r},${y} ${x},${y+r} ${x-r},${y}`);
      el.setAttribute('fill', color);
      return el;
    }
    case 'triangle': {
      const el = document.createElementNS(ns, 'polygon');
      el.setAttribute('points', `${x},${y-r} ${x+r},${y+r} ${x-r},${y+r}`);
      el.setAttribute('fill', color);
      return el;
    }
    case 'oval': {
      const el = document.createElementNS(ns, 'ellipse');
      el.setAttribute('cx', x);
      el.setAttribute('cy', y);
      el.setAttribute('rx', r);
      el.setAttribute('ry', r * 0.7);
      el.setAttribute('fill', color);
      return el;
    }
    case 'star': {
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const ang = (Math.PI / 5) * i - Math.PI / 2;
        const rad = i % 2 === 0 ? r : r * 0.4;
        pts.push(`${x + Math.cos(ang) * rad},${y + Math.sin(ang) * rad}`);
      }
      const el = document.createElementNS(ns, 'polygon');
      el.setAttribute('points', pts.join(' '));
      el.setAttribute('fill', color);
      return el;
    }
    case 'heart': {
      const el = document.createElementNS(ns, 'path');
      const hr = r * 0.9;
      el.setAttribute('d', `M${x} ${y+hr} C${x} ${y+hr*0.6} ${x-hr} ${y-hr*0.2} ${x-hr} ${y-hr*0.6} C${x-hr} ${y-hr} ${x-hr*0.5} ${y-hr*1.1} ${x-hr*0.2} ${y-hr*0.7} C${x} ${y-hr*0.4} ${x} ${y-hr*0.2} ${x} ${y-hr*0.1} C${x} ${y-hr*0.2} ${x} ${y-hr*0.4} ${x+hr*0.2} ${y-hr*0.7} C${x+hr*0.5} ${y-hr*1.1} ${x+hr} ${y-hr} ${x+hr} ${y-hr*0.6} C${x+hr} ${y-hr*0.2} ${x} ${y+hr*0.6} ${x} ${y+hr} Z`);
      el.setAttribute('fill', color);
      return el;
    }
    case 'flower': {
      const g = document.createElementNS(ns, 'g');
      const pr = r * 0.5;
      const offsets = [[0, -r*0.6], [r*0.6, 0], [0, r*0.6], [-r*0.6, 0]];
      offsets.forEach(([dx, dy]) => {
        const c = document.createElementNS(ns, 'circle');
        c.setAttribute('cx', x + dx);
        c.setAttribute('cy', y + dy);
        c.setAttribute('r', pr);
        c.setAttribute('fill', color);
        g.appendChild(c);
      });
      const center = document.createElementNS(ns, 'circle');
      center.setAttribute('cx', x);
      center.setAttribute('cy', y);
      center.setAttribute('r', pr * 0.7);
      center.setAttribute('fill', '#ffc107');
      g.appendChild(center);
      return g;
    }
    case 'cross': {
      const el = document.createElementNS(ns, 'path');
      const t = r * 0.35;
      el.setAttribute('d', `M${x-t} ${y-r} L${x+t} ${y-r} L${x+t} ${y-t} L${x+r} ${y-t} L${x+r} ${y+t} L${x+t} ${y+t} L${x+t} ${y+r} L${x-t} ${y+r} L${x-t} ${y+t} L${x-r} ${y+t} L${x-r} ${y-t} L${x-t} ${y-t} Z`);
      el.setAttribute('fill', color);
      return el;
    }
    case 'moon': {
      const el = document.createElementNS(ns, 'path');
      el.setAttribute('d', `M${x+r*0.2} ${y-r} A${r} ${r} 0 1 0 ${x+r*0.2} ${y+r} A${r*0.7} ${r*0.7} 0 1 1 ${x+r*0.2} ${y-r} Z`);
      el.setAttribute('fill', color);
      return el;
    }
    case 'drop': {
      const el = document.createElementNS(ns, 'path');
      el.setAttribute('d', `M${x} ${y-r} C${x} ${y-r} ${x-r} ${y-r*0.2} ${x-r} ${y+r*0.2} A${r} ${r} 0 0 0 ${x+r} ${y+r*0.2} C${x+r} ${y-r*0.2} ${x} ${y-r} ${x} ${y-r} Z`);
      el.setAttribute('fill', color);
      return el;
    }
    case 'leaf': {
      const el = document.createElementNS(ns, 'path');
      el.setAttribute('d', `M${x-r} ${y+r} C${x-r} ${y+r} ${x-r*0.7} ${y-r} ${x+r} ${y-r} C${x+r} ${y-r} ${x+r*0.8} ${y+r*0.5} ${x} ${y+r} C${x-r*0.3} ${y+r*1.1} ${x-r*0.8} ${y+r} ${x-r} ${y+r} Z`);
      el.setAttribute('fill', color);
      return el;
    }
    default: {
      const el = document.createElementNS(ns, 'circle');
      el.setAttribute('cx', x);
      el.setAttribute('cy', y);
      el.setAttribute('r', r);
      el.setAttribute('fill', color);
      return el;
    }
  }
}