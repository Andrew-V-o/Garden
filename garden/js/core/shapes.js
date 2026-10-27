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
    // Иконки деревьев
    case 'oak':
      return `<circle cx="8" cy="6" r="5" fill="${color}"/><rect x="7" y="11" width="2" height="4" fill="#5d4037"/>`;
    case 'pine':
      return `<polygon points="8,2 12,10 4,10" fill="${color}"/><rect x="7" y="10" width="2" height="4" fill="#5d4037"/>`;
    case 'birch':
      return `<ellipse cx="8" cy="6" rx="4" ry="5" fill="${color}"/><rect x="7" y="11" width="2" height="4" fill="#f5f5f5"/>`;
    case 'maple':
      return `<path d="M8 2 L10 5 L13 4 L11 7 L14 8 L11 9 L12 12 L8 10 L4 12 L5 9 L2 8 L5 7 L3 4 L6 5 Z" fill="${color}"/><rect x="7" y="10" width="2" height="4" fill="#5d4037"/>`;
    case 'willow':
      return `<ellipse cx="8" cy="7" rx="6" ry="5" fill="${color}"/><rect x="7" y="12" width="2" height="3" fill="#5d4037"/>`;
    case 'spruce':
      return `<polygon points="8,2 11,6 9,6 12,10 4,10 7,6 5,6" fill="${color}"/><rect x="7" y="10" width="2" height="4" fill="#5d4037"/>`;
    case 'palm':
      return `<path d="M8 2 Q12 4 14 6 Q10 5 8 7 Q6 5 2 6 Q4 4 8 2 Z" fill="${color}"/><path d="M8 7 Q10 9 12 10 Q9 9 8 11 Q7 9 4 10 Q6 9 8 7 Z" fill="${color}"/><rect x="7" y="11" width="2" height="4" fill="#8d6e63"/>`;
    case 'cherry':
      return `<circle cx="8" cy="6" r="5" fill="${color}"/><circle cx="6" cy="5" r="1" fill="#fff"/><circle cx="10" cy="7" r="1" fill="#fff"/><rect x="7" y="11" width="2" height="4" fill="#5d4037"/>`;
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
    // Иконки деревьев для холста
    case 'oak': {
      const g = document.createElementNS(ns, 'g');
      const crown = document.createElementNS(ns, 'circle');
      crown.setAttribute('cx', x);
      crown.setAttribute('cy', y - r * 0.3);
      crown.setAttribute('r', r * 0.8);
      crown.setAttribute('fill', color);
      g.appendChild(crown);
      const trunk = document.createElementNS(ns, 'rect');
      trunk.setAttribute('x', x - r * 0.15);
      trunk.setAttribute('y', y + r * 0.4);
      trunk.setAttribute('width', r * 0.3);
      trunk.setAttribute('height', r * 0.6);
      trunk.setAttribute('fill', '#5d4037');
      g.appendChild(trunk);
      return g;
    }
    case 'pine': {
      const g = document.createElementNS(ns, 'g');
      const crown = document.createElementNS(ns, 'polygon');
      crown.setAttribute('points', `${x},${y-r} ${x+r*0.7},${y+r*0.3} ${x-r*0.7},${y+r*0.3}`);
      crown.setAttribute('fill', color);
      g.appendChild(crown);
      const trunk = document.createElementNS(ns, 'rect');
      trunk.setAttribute('x', x - r * 0.1);
      trunk.setAttribute('y', y + r * 0.3);
      trunk.setAttribute('width', r * 0.2);
      trunk.setAttribute('height', r * 0.5);
      trunk.setAttribute('fill', '#5d4037');
      g.appendChild(trunk);
      return g;
    }
    case 'birch': {
      const g = document.createElementNS(ns, 'g');
      const crown = document.createElementNS(ns, 'ellipse');
      crown.setAttribute('cx', x);
      crown.setAttribute('cy', y - r * 0.3);
      crown.setAttribute('rx', r * 0.6);
      crown.setAttribute('ry', r * 0.8);
      crown.setAttribute('fill', color);
      g.appendChild(crown);
      const trunk = document.createElementNS(ns, 'rect');
      trunk.setAttribute('x', x - r * 0.1);
      trunk.setAttribute('y', y + r * 0.4);
      trunk.setAttribute('width', r * 0.2);
      trunk.setAttribute('height', r * 0.6);
      trunk.setAttribute('fill', '#f5f5f5');
      g.appendChild(trunk);
      return g;
    }
    case 'maple': {
      const g = document.createElementNS(ns, 'g');
      const crown = document.createElementNS(ns, 'path');
      const hr = r * 0.8;
      crown.setAttribute('d', `M${x} ${y-hr} L${x+hr*0.4} ${y-hr*0.3} L${x+hr*0.8} ${y-hr*0.5} L${x+hr*0.5} ${y} L${x+hr} ${y+hr*0.2} L${x+hr*0.5} ${y+hr*0.3} L${x+hr*0.6} ${y+hr*0.7} L${x} ${y+hr*0.4} L${x-hr*0.6} ${y+hr*0.7} L${x-hr*0.5} ${y+hr*0.3} L${x-hr} ${y+hr*0.2} L${x-hr*0.5} ${y} L${x-hr*0.8} ${y-hr*0.5} L${x-hr*0.4} ${y-hr*0.3} Z`);
      crown.setAttribute('fill', color);
      g.appendChild(crown);
      const trunk = document.createElementNS(ns, 'rect');
      trunk.setAttribute('x', x - r * 0.1);
      trunk.setAttribute('y', y + r * 0.4);
      trunk.setAttribute('width', r * 0.2);
      trunk.setAttribute('height', r * 0.6);
      trunk.setAttribute('fill', '#5d4037');
      g.appendChild(trunk);
      return g;
    }
    case 'willow': {
      const g = document.createElementNS(ns, 'g');
      const crown = document.createElementNS(ns, 'ellipse');
      crown.setAttribute('cx', x);
      crown.setAttribute('cy', y - r * 0.2);
      crown.setAttribute('rx', r * 0.9);
      crown.setAttribute('ry', r * 0.7);
      crown.setAttribute('fill', color);
      g.appendChild(crown);
      const trunk = document.createElementNS(ns, 'rect');
      trunk.setAttribute('x', x - r * 0.1);
      trunk.setAttribute('y', y + r * 0.4);
      trunk.setAttribute('width', r * 0.2);
      trunk.setAttribute('height', r * 0.6);
      trunk.setAttribute('fill', '#5d4037');
      g.appendChild(trunk);
      return g;
    }
    case 'spruce': {
      const g = document.createElementNS(ns, 'g');
      const crown = document.createElementNS(ns, 'polygon');
      crown.setAttribute('points', `${x},${y-r} ${x+r*0.5},${y-r*0.3} ${x+r*0.3},${y-r*0.3} ${x+r*0.7},${y+r*0.3} ${x-r*0.7},${y+r*0.3} ${x-r*0.3},${y-r*0.3} ${x-r*0.5},${y-r*0.3}`);
      crown.setAttribute('fill', color);
      g.appendChild(crown);
      const trunk = document.createElementNS(ns, 'rect');
      trunk.setAttribute('x', x - r * 0.1);
      trunk.setAttribute('y', y + r * 0.3);
      trunk.setAttribute('width', r * 0.2);
      trunk.setAttribute('height', r * 0.5);
      trunk.setAttribute('fill', '#5d4037');
      g.appendChild(trunk);
      return g;
    }
    case 'palm': {
      const g = document.createElementNS(ns, 'g');
      const frond1 = document.createElementNS(ns, 'path');
      frond1.setAttribute('d', `M${x} ${y-r*0.5} Q${x+r*0.6} ${y-r*0.3} ${x+r*0.8} ${y-r*0.1} Q${x+r*0.4} ${y-r*0.2} ${x} ${y-r*0.3} Q${x-r*0.4} ${y-r*0.2} ${x-r*0.8} ${y-r*0.1} Q${x-r*0.6} ${y-r*0.3} ${x} ${y-r*0.5} Z`);
      frond1.setAttribute('fill', color);
      g.appendChild(frond1);
      const frond2 = document.createElementNS(ns, 'path');
      frond2.setAttribute('d', `M${x} ${y-r*0.2} Q${x+r*0.5} ${y} ${x+r*0.7} ${y+r*0.2} Q${x+r*0.3} ${y+r*0.1} ${x} ${y+r*0.1} Q${x-r*0.3} ${y+r*0.1} ${x-r*0.7} ${y+r*0.2} Q${x-r*0.5} ${y} ${x} ${y-r*0.2} Z`);
      frond2.setAttribute('fill', color);
      g.appendChild(frond2);
      const trunk = document.createElementNS(ns, 'rect');
      trunk.setAttribute('x', x - r * 0.1);
      trunk.setAttribute('y', y + r * 0.1);
      trunk.setAttribute('width', r * 0.2);
      trunk.setAttribute('height', r * 0.9);
      trunk.setAttribute('fill', '#8d6e63');
      g.appendChild(trunk);
      return g;
    }
    case 'cherry': {
      const g = document.createElementNS(ns, 'g');
      const crown = document.createElementNS(ns, 'circle');
      crown.setAttribute('cx', x);
      crown.setAttribute('cy', y - r * 0.3);
      crown.setAttribute('r', r * 0.8);
      crown.setAttribute('fill', color);
      g.appendChild(crown);
      const blossom1 = document.createElementNS(ns, 'circle');
      blossom1.setAttribute('cx', x - r * 0.3);
      blossom1.setAttribute('cy', y - r * 0.4);
      blossom1.setAttribute('r', r * 0.15);
      blossom1.setAttribute('fill', '#fff');
      g.appendChild(blossom1);
      const blossom2 = document.createElementNS(ns, 'circle');
      blossom2.setAttribute('cx', x + r * 0.3);
      blossom2.setAttribute('cy', y - r * 0.2);
      blossom2.setAttribute('r', r * 0.15);
      blossom2.setAttribute('fill', '#fff');
      g.appendChild(blossom2);
      const trunk = document.createElementNS(ns, 'rect');
      trunk.setAttribute('x', x - r * 0.15);
      trunk.setAttribute('y', y + r * 0.4);
      trunk.setAttribute('width', r * 0.3);
      trunk.setAttribute('height', r * 0.6);
      trunk.setAttribute('fill', '#5d4037');
      g.appendChild(trunk);
      return g;
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