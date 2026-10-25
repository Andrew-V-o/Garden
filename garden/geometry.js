// ===== ГЕОМЕТРИЧЕСКИЕ ФУНКЦИИ =====

function getMousePos(e) {
  const pt = svg.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const inv = ctm.inverse();
  const transformed = pt.matrixTransform(inv);
  return { x: transformed.x, y: transformed.y };
}

function snapToGrid(v) {
  return Math.round(v / state.scale) * state.scale;
}

function getObjBBox(obj) {
  if (obj.type === 'tree') {
    return { x: obj.x - obj.r, y: obj.y - obj.r, w: obj.r * 2, h: obj.r * 2 };
  }
  if (obj.type === 'decor') {
    return { x: obj.x - obj.w / 2, y: obj.y - obj.h / 2, w: obj.w, h: obj.h };
  }
  if (obj.type === 'mulch') {
    // Мульча имеет собственные координаты и размеры
    return { x: obj.x - obj.w / 2, y: obj.y - obj.h / 2, w: obj.w, h: obj.h };
  }
  if (obj.points && obj.points.length > 0) {
    const xs = obj.points.map(p => p[0]);
    const ys = obj.points.map(p => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    const w = Math.max(...xs) - x;
    const h = Math.max(...ys) - y;
    return { x, y, w: Math.max(w, 1), h: Math.max(h, 1) };
  }
  return null;
}

function pointInObject(obj, x, y) {
  if (obj.type === 'tree') {
    const dx = x - obj.x, dy = y - obj.y;
    return dx * dx + dy * dy <= obj.r * obj.r;
  }
  if (obj.type === 'decor') {
    return x >= obj.x - obj.w / 2 && x <= obj.x + obj.w / 2 &&
           y >= obj.y - obj.h / 2 && y <= obj.y + obj.h / 2;
  }
  if (obj.type === 'mulch') {
    // Проверяем попадание в прямоугольник мульчи
    return x >= obj.x - obj.w / 2 && x <= obj.x + obj.w / 2 &&
           y >= obj.y - obj.h / 2 && y <= obj.y + obj.h / 2;
  }
  if (obj.type === 'path') {
    for (let i = 0; i < obj.points.length - 1; i++) {
      const p = closestPointOnSegment(x, y, obj.points[i], obj.points[i + 1]);
      const d = Math.hypot(p.x - x, p.y - y);
      if (d < 20) return true;
    }
    return false;
  }
  if (obj.points && obj.points.length >= 3) {
    return pointInPolygon(x, y, obj.points);
  }
  return false;
}

function pointInPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const xi = pts[i][0], yi = pts[i][1];
    const xj = pts[j][0], yj = pts[j][1];
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Найти клумбу под точкой
function findBedAtPoint(x, y) {
  for (let i = state.objects.length - 1; i >= 0; i--) {
    const obj = state.objects[i];
    if (obj.type === 'bed' && pointInPolygon(x, y, obj.points)) {
      return obj;
    }
  }
  return null;
}

function resizeObjToBBox(obj, newBBox) {
  const oldBBox = getObjBBox(obj);
  if (!oldBBox || oldBBox.w < 1 || oldBBox.h < 1) return;
  const sx = newBBox.w / oldBBox.w;
  const sy = newBBox.h / oldBBox.h;

  if (obj.type === 'tree') {
    obj.x = newBBox.x + newBBox.w / 2;
    obj.y = newBBox.y + newBBox.h / 2;
    obj.r = Math.min(newBBox.w, newBBox.h) / 2;
  } else if (obj.type === 'decor') {
    obj.x = newBBox.x + newBBox.w / 2;
    obj.y = newBBox.y + newBBox.h / 2;
    obj.w = newBBox.w;
    obj.h = newBBox.h;
  } else if (obj.type === 'mulch') {
    // Мульча ресайзится как прямоугольник
    obj.x = newBBox.x + newBBox.w / 2;
    obj.y = newBBox.y + newBBox.h / 2;
    obj.w = newBBox.w;
    obj.h = newBBox.h;
  } else if (obj.points) {
    obj.points = obj.points.map(p => [
      newBBox.x + (p[0] - oldBBox.x) * sx,
      newBBox.y + (p[1] - oldBBox.y) * sy
    ]);
  }

  if (obj.plants) {
    obj.plants.forEach(pl => {
      pl.x = newBBox.x + (pl.x - oldBBox.x) * sx;
      pl.y = newBBox.y + (pl.y - oldBBox.y) * sy;
    });
  }
}

function computeNewBBox(oldBBox, handle, dx, dy) {
  let { x, y, w, h } = oldBBox;
  const minSize = 20;
  if (handle.includes('w')) { x += dx; w -= dx; }
  if (handle.includes('e')) { w += dx; }
  if (handle.includes('n')) { y += dy; h -= dy; }
  if (handle.includes('s')) { h += dy; }
  if (w < minSize) {
    if (handle.includes('w')) x = oldBBox.x + oldBBox.w - minSize;
    w = minSize;
  }
  if (h < minSize) {
    if (handle.includes('n')) y = oldBBox.y + oldBBox.h - minSize;
    h = minSize;
  }
  return { x, y, w, h };
}

function closestPointOnSegment(px, py, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return { x: a[0], y: a[1] };
  let t = ((px - a[0]) * dx + (py - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return { x: a[0] + t * dx, y: a[1] + t * dy };
}

function polygonArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    a += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];
  }
  return a / 2;
}

function generateRectPoints(x, y, w, h) {
  const pts = [];
  for (let i = 0; i < 5; i++) pts.push([x + w * i / 4, y]);
  for (let i = 1; i < 4; i++) pts.push([x + w, y + h * i / 4]);
  for (let i = 4; i >= 0; i--) pts.push([x + w * i / 4, y + h]);
  for (let i = 3; i >= 1; i--) pts.push([x, y + h * i / 4]);
  return pts;
}

function generateCirclePoints(cx, cy, r, numPoints = 16) {
  const pts = [];
  for (let i = 0; i < numPoints; i++) {
    const ang = (Math.PI * 2 / numPoints) * i - Math.PI / 2;
    pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
  }
  return pts;
}

function redistributePointsAlongPolygon(points, numPoints) {
  if (points.length < 2) return points.slice();
  
  let totalLength = 0;
  const segments = [];
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j][0] - points[i][0];
    const dy = points[j][1] - points[i][1];
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push({ start: points[i], end: points[j], length: len });
    totalLength += len;
  }
  
  if (totalLength === 0) return points.slice();
  
  const newPoints = [];
  for (let i = 0; i < numPoints; i++) {
    const targetDist = (i / numPoints) * totalLength;
    let accumulated = 0;
    let found = false;
    
    for (let segIdx = 0; segIdx < segments.length; segIdx++) {
      const seg = segments[segIdx];
      if (accumulated + seg.length > targetDist) {
        const t = (targetDist - accumulated) / seg.length;
        const x = seg.start[0] + t * (seg.end[0] - seg.start[0]);
        const y = seg.start[1] + t * (seg.end[1] - seg.start[1]);
        newPoints.push([x, y]);
        found = true;
        break;
      }
      accumulated += seg.length;
    }
    
    if (!found) {
      newPoints.push(points[points.length - 1].slice());
    }
  }
  
  return newPoints;
}

function thinPoints(points, numPoints) {
  if (points.length <= numPoints) return points.slice();
  
  const step = points.length / numPoints;
  const newPoints = [];
  for (let i = 0; i < numPoints; i++) {
    const idx = Math.floor(i * step) % points.length;
    newPoints.push(points[idx].slice());
  }
  return newPoints;
}

function interpolateFigurePoints(points, multiplier) {
  if (points.length < 3 || multiplier < 1) return points.slice();
  
  const newPoints = [];
  const oldCount = points.length;
  
  for (let i = 0; i < oldCount; i++) {
    const j = (i + 1) % oldCount;
    const p1 = points[i];
    const p2 = points[j];
    
    for (let k = 0; k < multiplier; k++) {
      const t = k / multiplier;
      newPoints.push([
        p1[0] + t * (p2[0] - p1[0]),
        p1[1] + t * (p2[1] - p1[1])
      ]);
    }
  }
  
  return newPoints;
}

function decimateFigurePoints(points, divisor) {
  if (points.length < 3 || divisor < 2) return points.slice();
  if (points.length % divisor !== 0) return points.slice();
  
  const newPoints = [];
  for (let i = 0; i < points.length; i += divisor) {
    newPoints.push(points[i].slice());
  }
  return newPoints;
}

function interpolateToCount(points, targetCount) {
  if (points.length < 2) return points.slice();
  if (targetCount <= points.length) return thinPoints(points, targetCount);
  
  const oldCount = points.length;
  const multiplier = targetCount / oldCount;
  
  if (Number.isInteger(multiplier)) {
    return interpolateFigurePoints(points, multiplier);
  }
  
  return redistributePointsAlongPolygon(points, targetCount);
}