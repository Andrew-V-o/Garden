// ===== ИНСТРУМЕНТЫ И ОБЪЕКТЫ =====

const FIGURE_POINTS_LIMIT = 100;

function setTool(tool) {
  if (state.drawing && (state.drawing.type === 'poly' || state.drawing.type === 'path')) {
    finishPolyOrPath();
  }

  state.tool = tool;
  state.plantingMode = false;

  document.querySelectorAll('.tool-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tool === tool);
  });
  document.querySelectorAll('.obj-btn').forEach(b => b.classList.remove('active'));

  // Подсветка активной кнопки объекта
  const objBtn = document.querySelector(`.obj-btn[data-obj="${tool}"]`);
  if (objBtn) objBtn.classList.add('active');

  state.drawing = null;
  previewLayer.innerHTML = '';
  closePlantPopup();
  closeTreePopup();
  closeDecorPopup();
  updateHint();
  renderPlantingsPanel();

  if (tool === 'move') svg.style.cursor = 'grab';
  else if (tool === 'select') svg.style.cursor = 'default';
  else svg.style.cursor = 'crosshair';
}

function selectPlot() {
  if (state.drawing && (state.drawing.type === 'poly' || state.drawing.type === 'path')) {
    finishPolyOrPath();
  }

  const plot = state.objects.find(o => o.type === 'plot');
  if (plot) {
    state.selectedId = plot.id;
    state.tool = 'select';
    state.plantingMode = false;
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === 'select');
    });
    document.querySelectorAll('.obj-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('.obj-btn[data-obj="plot"]').classList.add('active');
    closePlantPopup();
    updateHint();
    render();
  }
}

function toggleBedSubmenu(e) {
  e.stopPropagation();
  
  if (state.drawing && (state.drawing.type === 'poly' || state.drawing.type === 'path')) {
    finishPolyOrPath();
  }
  
  state.bedSubmenuOpen = !state.bedSubmenuOpen;
  const submenu = document.getElementById('bedSubmenu');
  const btn = document.querySelector('.obj-btn[data-obj="bed"]');
  submenu.classList.toggle('open', state.bedSubmenuOpen);
  btn.classList.toggle('open', state.bedSubmenuOpen);
  
  if (state.bedSubmenuOpen) {
    setBedShape('rect');
  }
}

function setBedShape(shape) {
  state.bedShape = shape;
  state.tool = 'bed';
  state.plantingMode = false;
  state.drawing = null;
  previewLayer.innerHTML = '';
  closePlantPopup();
  updateFinishButton();

  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.obj-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.obj-btn[data-obj="bed"]').classList.add('active');
  document.querySelectorAll('.submenu-item').forEach(b => {
    b.classList.toggle('active', b.dataset.bed === shape);
  });

  svg.style.cursor = 'crosshair';
  updateHint();
  renderPlantingsPanel();
}

function setCanvasSizeMeters(wM, hM) {
  wM = Math.max(5, Math.min(500, Math.round(wM)));
  hM = Math.max(5, Math.min(500, Math.round(hM)));

  state.canvasWidthM = wM;
  state.canvasHeightM = hM;

  const plot = state.objects.find(o => o.type === 'plot');
  if (plot) {
    const pad = getCanvasPadding();
    const w = wM * state.scale;
    const h = hM * state.scale;
    const newPoints = generateRectPoints(pad, pad, w, h);
    plot.points = newPoints;
    plot.basePoints = newPoints.map(p => p.slice());
    plot.morphModified = false;
    plot.originalPointCount = undefined;
  }

  resetViewBox();
  updateSvgViewBox();
  updateCanvasInfo();
  render();
}

function fitPlotToCanvas() {
  const plot = state.objects.find(o => o.type === 'plot');
  if (!plot) return;

  const pad = getCanvasPadding();
  const w = state.canvasWidthM * state.scale;
  const h = state.canvasHeightM * state.scale;
  const newPoints = generateRectPoints(pad, pad, w, h);
  
  plot.points = newPoints;
  plot.basePoints = newPoints.map(p => p.slice());
  plot.morphModified = false;
  plot.originalPointCount = undefined;

  resetViewBox();
  updateSvgViewBox();
  render();
}

function updateSvgViewBox() {
  if (!state.viewBox) resetViewBox();
  svg.setAttribute('viewBox', `${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.w} ${state.viewBox.h}`);
  const bg = document.getElementById('svgBg');
  if (bg) {
    const size = getSvgInternalSize();
    bg.setAttribute('width', size.w);
    bg.setAttribute('height', size.h);
  }
}

function updateCanvasInfo() {
  document.getElementById('zoomInfo').textContent =
    `Окно: ${state.canvasWidthM}×${state.canvasHeightM} м`;
}

function onWheel(e) {
  e.preventDefault();
  if (!state.viewBox) return;

  const pos = getMousePos(e);
  const zoomFactor = e.deltaY > 0 ? 1.15 : 1 / 1.15;

  const vb = state.viewBox;
  const newW = vb.w * zoomFactor;
  const newH = vb.h * zoomFactor;

  const minSize = 200;
  const maxSize = getSvgInternalSize().w * 4;
  if (newW < minSize || newW > maxSize) return;

  const ratioX = (pos.x - vb.x) / vb.w;
  const ratioY = (pos.y - vb.y) / vb.h;

  state.viewBox = {
    x: pos.x - ratioX * newW,
    y: pos.y - ratioY * newH,
    w: newW,
    h: newH
  };

  svg.setAttribute('viewBox', `${state.viewBox.x} ${state.viewBox.y} ${state.viewBox.w} ${state.viewBox.h}`);
}

function resetZoomOnDblClick(e) {
  const target = e.target;
  if (!target.closest('[data-id]') && !target.closest('[data-handle]') && !target.closest('[data-morph-idx]')) {
    resetViewBox();
    updateSvgViewBox();
  }
}

function setMorphPoints(objId, numPoints) {
  const obj = state.objects.find(o => o.id === objId);
  if (!obj || !obj.points) return;
  
  const currentCount = obj.points.length;
  
  if (obj.originalPointCount !== undefined) {
    const base = obj.originalPointCount;
    
    if (numPoints % base !== 0) return;
    
    const multiplier = numPoints / base;
    
    if (multiplier < 1) {
      alert(`Нельзя уменьшить ниже исходного количества точек (${base}).`);
      return;
    }
    
    if (numPoints > FIGURE_POINTS_LIMIT) {
      alert(`Превышен лимит в ${FIGURE_POINTS_LIMIT} точек морфологии.\nМаксимальный множитель: ×${Math.floor(FIGURE_POINTS_LIMIT / base)}`);
      return;
    }
    
    if (numPoints === currentCount) return;
    
    if (numPoints > currentCount) {
      const interpMultiplier = numPoints / currentCount;
      obj.points = interpolateFigurePoints(obj.points, interpMultiplier);
    } else {
      const divisor = currentCount / numPoints;
      obj.points = decimateFigurePoints(obj.points, divisor);
    }
  } else {
    numPoints = Math.max(3, Math.min(64, numPoints));
    if (numPoints === currentCount) return;
    
    if (!obj.basePoints) {
      obj.basePoints = obj.points.map(p => p.slice());
    }
    
    const basePoints = obj.basePoints;
    
    if (numPoints < basePoints.length) {
      obj.points = thinPoints(basePoints, numPoints);
    } else if (numPoints > basePoints.length) {
      obj.points = interpolateToCount(basePoints, numPoints);
    } else {
      obj.points = basePoints.map(p => p.slice());
    }
  }
  
  render();
}

function updateFinishButton() {
  const btn = document.getElementById('finishBtn');
  if (!btn) return;
  if (state.drawing && (state.drawing.type === 'poly' || state.drawing.type === 'path')) {
    btn.style.display = 'block';
  } else {
    btn.style.display = 'none';
  }
}

function updateHint() {
  const hints = {
    select: '💡 Выберите объект. Кликните по цветку, дереву или декоративному объекту для настройки.',
    move: '✋ Перетаскивайте объекты. Участок физически ограничен границами окна. Колёсико — зум.',
    bed: `💡 Рисование клумбы (${state.bedShape === 'rect' ? 'прямоугольная' : state.bedShape === 'circle' ? 'круглая' : 'фигура'}). ${state.bedShape === 'poly' ? 'Кликайте для точек. Нажмите "✓ Завершить" или Enter для подтверждения.' : 'Зажмите мышь и тяните.'}`,
    path: '💡 Рисуйте дорожки. Кликайте для точек. Нажмите "✓ Завершить" или Enter.',
    tree: '🌳 Выберите дерево в левой панели и кликните на холст, чтобы посадить.',
    water: '💧 Кликните на холст, чтобы разместить водоём.',
    stone: '🪨 Кликните на холст, чтобы разместить камни.',
    mulch: '🟫 Кликните на холст, чтобы разместить мульчу.',
  };
  let hint = hints[state.tool] || '';
  if (state.plantingMode && state.selectedPlant) {
    const p = plants.find(x => x.id === state.selectedPlant);
    hint = `🌱 Режим посадки: кликайте внутри клумбы, чтобы разместить "${p ? p.name : ''}"`;
  } else if (state.plantingMode) {
    hint = '🌱 Выберите растение в левой панели';
  }
  if (state.selectedId) {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.type === 'plot') {
      hint = '🏡 Участок выделен. Его нельзя увеличить или вытащить за пределы окна. В панели справа измените размер окна и нажмите "Под размер окна".';
    }
  }
  document.getElementById('hintBar').textContent = hint;
}

function onMouseDown(e) {
  if (e.button !== 0) return;
  const pos = getMousePos(e);

  const handleTarget = e.target.closest('[data-handle]');
  if (handleTarget && state.selectedId && state.tool === 'select') {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj) {
      state.dragging = {
        type: 'resize',
        handle: handleTarget.dataset.handle,
        startBBox: getObjBBox(obj),
        startX: pos.x,
        startY: pos.y,
      };
      return;
    }
  }

  const morphTarget = e.target.closest('[data-morph-idx]');
  if (morphTarget && state.selectedId && state.tool === 'select') {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.points) {
      state.dragging = {
        type: 'morph',
        idx: parseInt(morphTarget.dataset.morphIdx),
        startX: pos.x,
        startY: pos.y,
      };
      return;
    }
  }

  if (state.tool === 'move') {
    for (let i = state.objects.length - 1; i >= 0; i--) {
      const obj = state.objects[i];
      if (obj.type === 'plot') continue; 
      if (obj.plants) {
        for (let j = obj.plants.length - 1; j >= 0; j--) {
          const pl = obj.plants[j];
          const dx = pos.x - pl.x, dy = pos.y - pl.y;
          if (dx * dx + dy * dy <= (pl.r || 16) * (pl.r || 16)) {
            state.dragging = {
              type: 'planting',
              objId: obj.id,
              plantingId: pl.id,
              offsetX: dx,
              offsetY: dy
            };
            svg.style.cursor = 'grabbing';
            return;
          }
        }
      }
    }
    for (let i = state.objects.length - 1; i >= 0; i--) {
      const obj = state.objects[i];
      if (obj.type === 'plot') continue;
      if (pointInObject(obj, pos.x, pos.y)) {
        state.dragging = {
          type: 'object',
          objId: obj.id,
          startX: pos.x,
          startY: pos.y,
          startPos: (obj.type === 'tree' || obj.type === 'decor') ? { x: obj.x, y: obj.y, w: obj.w, h: obj.h } : null,
          startPoints: obj.points ? JSON.parse(JSON.stringify(obj.points)) : null,
          startBasePoints: obj.basePoints ? JSON.parse(JSON.stringify(obj.basePoints)) : null,
          startPlants: obj.plants ? JSON.parse(JSON.stringify(obj.plants)) : null,
          startBBox: obj.type === 'plot' ? getObjBBox(obj) : null
        };
        svg.style.cursor = 'grabbing';
        return;
      }
    }
    return;
  }

  if (state.tool === 'select' && state.plantingMode && state.selectedId && state.selectedPlant) {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.type === 'bed' && pointInObject(obj, pos.x, pos.y)) {
      obj.plants = obj.plants || [];
      const plant = plants.find(p => p.id === state.selectedPlant);
      const planting = {
        id: state.nextPlantingId++,
        plantId: state.selectedPlant,
        x: pos.x, y: pos.y,
        r: state.scale * 0.4,
        shape: plant?.defaultShape || 'circle',
        bloomStartMonth: plant?.bloomStartMonth || null,
        bloomEndMonth: plant?.bloomEndMonth || null,
        bloomStartDate: plant?.bloomStartDate || null,
        bloomEndDate: plant?.bloomEndDate || null,
      };
      obj.plants.push(planting);
      state.selectedPlantingId = planting.id;
      render();
      return;
    }
  }

  // Посадка дерева
  if (state.tool === 'tree' && state.selectedTree) {
    const tree = trees.find(t => t.id === state.selectedTree);
    if (tree) {
      addObject({
        type: 'tree',
        treeId: tree.id,
        x: snapToGrid(pos.x),
        y: snapToGrid(pos.y),
        r: state.scale * 1.2,
        fill: tree.color,
        shape: tree.defaultShape || 'oak',
        name: tree.name
      });
      return;
    }
  }

  // Размещение декоративных объектов (водоём, камни, мульча)
  if ((state.tool === 'water' || state.tool === 'stone' || state.tool === 'mulch')) {
    const decorDefaults = {
      water: { name: 'Водоём', fill: '#29b6f6', w: state.scale * 3, h: state.scale * 2 },
      stone: { name: 'Камни', fill: '#9e9e9e', w: state.scale * 2, h: state.scale * 1.5 },
      mulch: { name: 'Мульча', fill: '#795548', w: state.scale * 2.5, h: state.scale * 2 }
    };
    const d = decorDefaults[state.tool];
    addObject({
      type: 'decor',
      decorType: state.tool,
      x: snapToGrid(pos.x),
      y: snapToGrid(pos.y),
      w: d.w,
      h: d.h,
      fill: d.fill,
      name: d.name
    });
    // Возвращаемся в режим выбора
    setTool('select');
    return;
  }

  if (state.tool === 'select') {
    // Сначала проверяем посадки растений
    for (let i = state.objects.length - 1; i >= 0; i--) {
      const obj = state.objects[i];
      if (obj.plants) {
        for (let j = obj.plants.length - 1; j >= 0; j--) {
          const pl = obj.plants[j];
          const dx = pos.x - pl.x, dy = pos.y - pl.y;
          if (dx * dx + dy * dy <= (pl.r || 16) * (pl.r || 16)) {
            showPlantPopup(pl, obj);
            return;
          }
        }
      }
    }

    // Проверяем деревья
    for (let i = state.objects.length - 1; i >= 0; i--) {
      const obj = state.objects[i];
      if (obj.type === 'tree') {
        const dx = pos.x - obj.x, dy = pos.y - obj.y;
        if (dx * dx + dy * dy <= obj.r * obj.r) {
          showTreePopup(obj);
          return;
        }
      }
    }

    // Проверяем декоративные объекты
    for (let i = state.objects.length - 1; i >= 0; i--) {
      const obj = state.objects[i];
      if (obj.type === 'decor') {
        if (pos.x >= obj.x - obj.w/2 && pos.x <= obj.x + obj.w/2 &&
            pos.y >= obj.y - obj.h/2 && pos.y <= obj.y + obj.h/2) {
          showDecorPopup(obj);
          return;
        }
      }
    }

    // Проверяем другие объекты
    for (let i = state.objects.length - 1; i >= 0; i--) {
      const obj = state.objects[i];
      if (pointInObject(obj, pos.x, pos.y)) {
        state.selectedId = obj.id;
        state.plantingMode = obj.type === 'bed';
        state.selectedPlantingId = null;
        document.querySelectorAll('.obj-btn').forEach(b => b.classList.remove('active'));
        if (obj.type === 'plot') {
          document.querySelector('.obj-btn[data-obj="plot"]').classList.add('active');
        }
        render();
        return;
      }
    }

    state.selectedId = null;
    state.plantingMode = false;
    state.selectedPlantingId = null;
    closePlantPopup();
    closeTreePopup();
    closeDecorPopup();
    document.querySelectorAll('.obj-btn').forEach(b => b.classList.remove('active'));
    render();
    return;
  }

  if (state.tool === 'bed') {
    if (state.bedShape === 'rect' || state.bedShape === 'circle') {
      state.drawing = {
        type: state.bedShape,
        x1: snapToGrid(pos.x), y1: snapToGrid(pos.y)
      };
    } else if (state.bedShape === 'poly') {
      if (!state.drawing) {
        state.drawing = { type: 'poly', points: [[snapToGrid(pos.x), snapToGrid(pos.y)]] };
      } else {
        state.drawing.points.push([snapToGrid(pos.x), snapToGrid(pos.y)]);
      }
      renderPreview();
      updateFinishButton();
    }
    return;
  }

  if (state.tool === 'path') {
    if (!state.drawing) {
      state.drawing = { type: 'path', points: [[pos.x, pos.y]] };
    } else {
      state.drawing.points.push([pos.x, pos.y]);
    }
    renderPreview();
    updateFinishButton();
    return;
  }
}

function onMouseMove(e) {
  const pos = getMousePos(e);

  if (state.dragging) {
    const d = state.dragging;
    if (d.type === 'planting') {
      const obj = state.objects.find(o => o.id === d.objId);
      if (obj && obj.plants) {
        const pl = obj.plants.find(p => p.id === d.plantingId);
        if (pl) {
          pl.x = pos.x - d.offsetX;
          pl.y = pos.y - d.offsetY;
          render();
        }
      }
    } else if (d.type === 'object') {
      const obj = state.objects.find(o => o.id === d.objId);
      if (obj) {
        const dx = pos.x - d.startX;
        const dy = pos.y - d.startY;

        if (obj.type === 'plot') {
          const vb = state.viewBox || { x: 0, y: 0, w: getSvgInternalSize().w, h: getSvgInternalSize().h };
          const bbox = d.startBBox;
          
          let newX = bbox.x + dx;
          let newY = bbox.y + dy;

          if (bbox.w <= vb.w) {
            if (newX < vb.x) newX = vb.x;
            if (newX + bbox.w > vb.x + vb.w) newX = vb.x + vb.w - bbox.w;
          } else {
            const minX = vb.x + vb.w - bbox.w;
            const maxX = vb.x;
            if (newX > maxX) newX = maxX;
            if (newX < minX) newX = minX;
          }

          if (bbox.h <= vb.h) {
            if (newY < vb.y) newY = vb.y;
            if (newY + bbox.h > vb.y + vb.h) newY = vb.y + vb.h - bbox.h;
          } else {
            const minY = vb.y + vb.h - bbox.h;
            const maxY = vb.y;
            if (newY > maxY) newY = maxY;
            if (newY < minY) newY = minY;
          }

          const clampDx = newX - bbox.x;
          const clampDy = newY - bbox.y;

          obj.points = d.startPoints.map(p => [p[0] + clampDx, p[1] + clampDy]);
          if (obj.basePoints && d.startBasePoints) {
            obj.basePoints = d.startBasePoints.map(p => [p[0] + clampDx, p[1] + clampDy]);
          }
          if (obj.plants && d.startPlants) {
            obj.plants = d.startPlants.map(pl => ({
              ...pl,
              x: pl.x + clampDx,
              y: pl.y + clampDy
            }));
          }
        } else if (obj.type === 'tree' && d.startPos) {
          obj.x = d.startPos.x + dx;
          obj.y = d.startPos.y + dy;
        } else if (obj.type === 'decor' && d.startPos) {
          obj.x = d.startPos.x + dx;
          obj.y = d.startPos.y + dy;
        } else if (obj.points && d.startPoints) {
          obj.points = d.startPoints.map(p => [p[0] + dx, p[1] + dy]);
          if (obj.basePoints && d.startBasePoints) {
            obj.basePoints = d.startBasePoints.map(p => [p[0] + dx, p[1] + dy]);
          }
        }
        if (obj.plants && d.startPlants && obj.type !== 'plot') {
          obj.plants = d.startPlants.map(pl => ({
            ...pl,
            x: pl.x + dx,
            y: pl.y + dy
          }));
        }
        render();
      }
    } else if (d.type === 'resize') {
      const obj = state.objects.find(o => o.id === state.selectedId);
      if (obj) {
        let newBBox = computeNewBBox(d.startBBox, d.handle, pos.x - d.startX, pos.y - d.startY);
        
        if (obj.type === 'plot') {
          const vb = state.viewBox || { x: 0, y: 0, w: getSvgInternalSize().w, h: getSvgInternalSize().h };
          
          newBBox.w = Math.min(newBBox.w, vb.w);
          newBBox.h = Math.min(newBBox.h, vb.h);
          
          if (newBBox.x < vb.x) newBBox.x = vb.x;
          if (newBBox.y < vb.y) newBBox.y = vb.y;
          if (newBBox.x + newBBox.w > vb.x + vb.w) newBBox.x = vb.x + vb.w - newBBox.w;
          if (newBBox.y + newBBox.h > vb.y + vb.h) newBBox.y = vb.y + vb.h - newBBox.h;
        }
        
        resizeObjToBBox(obj, newBBox);
        render();
      }
    } else if (d.type === 'morph') {
      const obj = state.objects.find(o => o.id === state.selectedId);
      if (obj && obj.points) {
        let targetX = pos.x;
        let targetY = pos.y;
        
        if (obj.type === 'plot') {
          const vb = state.viewBox || { x: 0, y: 0, w: getSvgInternalSize().w, h: getSvgInternalSize().h };
          targetX = Math.max(vb.x, Math.min(pos.x, vb.x + vb.w));
          targetY = Math.max(vb.y, Math.min(pos.y, vb.y + vb.h));
        }

        obj.points[d.idx] = [targetX, targetY];
        
        if (!obj.basePoints) {
          obj.basePoints = obj.points.map(p => p.slice());
        }
        
        if (obj.basePoints.length === obj.points.length) {
          obj.basePoints[d.idx] = [targetX, targetY];
        } else {
          obj.basePoints = obj.points.map(p => p.slice());
        }
        
        obj.morphModified = true;
        if (!obj.originalPointCount) {
          obj.originalPointCount = obj.basePoints.length;
        }
        
        render();
      }
    }
    return;
  }

  if (!state.drawing) return;

  if ((state.drawing.type === 'rect' || state.drawing.type === 'circle') && state.drawing.x1 !== undefined) {
    state.drawing.x2 = snapToGrid(pos.x);
    state.drawing.y2 = snapToGrid(pos.y);
    renderPreview();
  } else if (state.drawing.type === 'poly' || state.drawing.type === 'path') {
    renderPreview();
  }
}

function onMouseUp(e) {
  if (state.dragging) {
    state.dragging = null;
    if (state.tool === 'move') svg.style.cursor = 'grab';
    return;
  }
  if (!state.drawing) return;

  if (state.tool === 'bed') {
    if (state.drawing.type === 'rect' || state.drawing.type === 'circle') {
      if (state.drawing.x2 === undefined) { state.drawing = null; return; }
      const x = Math.min(state.drawing.x1, state.drawing.x2);
      const y = Math.min(state.drawing.y1, state.drawing.y2);
      const w = Math.abs(state.drawing.x2 - state.drawing.x1);
      const h = Math.abs(state.drawing.y2 - state.drawing.y1);
      if (w > 5 && h > 5) {
        let points;
        if (state.drawing.type === 'rect') {
          points = generateRectPoints(x, y, w, h);
        } else {
          const cx = x + w / 2, cy = y + h / 2;
          const r = Math.min(w, h) / 2;
          points = generateCirclePoints(cx, cy, r, 16);
        }
        addObject({
          type: 'bed', points,
          fill: document.getElementById('fillColor').value,
          name: state.drawing.type === 'rect' ? 'Клумба' : 'Круглая клумба',
          plants: []
        });
        setTool('select');
      }
      state.drawing = null;
      previewLayer.innerHTML = '';
    }
    return;
  }
}

function onDblClick(e) {
  resetZoomOnDblClick(e);

  if (state.selectedId && state.tool === 'select') {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.points && obj.type !== 'path') {
      if (obj.type === 'bed' && obj.originalPointCount && obj.points.length >= FIGURE_POINTS_LIMIT) {
        alert(`Достигнут лимит в ${FIGURE_POINTS_LIMIT} точек морфологии.`);
        return;
      }
      
      const pos = getMousePos(e);
      let minDist = Infinity, bestIdx = -1, bestPoint = null;
      for (let i = 0; i < obj.points.length; i++) {
        const j = (i + 1) % obj.points.length;
        const p = closestPointOnSegment(pos.x, pos.y, obj.points[i], obj.points[j]);
        const d = Math.hypot(p.x - pos.x, p.y - pos.y);
        if (d < minDist) {
          minDist = d;
          bestIdx = i;
          bestPoint = p;
        }
      }
      if (minDist < 30) {
        obj.points.splice(bestIdx + 1, 0, [bestPoint.x, bestPoint.y]);
        if (obj.basePoints) {
          if (obj.basePoints.length === obj.points.length - 1) {
            obj.basePoints.splice(bestIdx + 1, 0, [bestPoint.x, bestPoint.y]);
          } else {
            obj.basePoints = obj.points.map(p => p.slice());
          }
        }
        obj.morphModified = true;
        if (!obj.originalPointCount) {
          obj.originalPointCount = obj.basePoints ? obj.basePoints.length : obj.points.length;
        }
        render();
        return;
      }
    }
  }

  if (state.drawing && (state.drawing.type === 'poly' || state.drawing.type === 'path')) {
    finishPolyOrPath();
  }
}

function onKeyDown(e) {
  if (e.key === 'Enter' && state.drawing && (state.drawing.type === 'poly' || state.drawing.type === 'path')) {
    finishPolyOrPath();
  }
  if (e.key === 'Escape') {
    if (state.plantingMode) {
      state.plantingMode = false;
      updateHint();
      renderPlantingsPanel();
    } else {
      state.drawing = null;
      previewLayer.innerHTML = '';
      updateFinishButton();
    }
    closePlantPopup();
    closeTreePopup();
    closeDecorPopup();
  }
  if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedPlantingId) {
    deletePlanting(state.selectedPlantingId);
  } else if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedId) {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.type !== 'plot') {
      deleteObject(state.selectedId);
    }
  }
}

function finishPolyOrPath() {
  if (!state.drawing || state.drawing.points.length < 3) {
    state.drawing = null;
    previewLayer.innerHTML = '';
    updateFinishButton();
    return;
  }
  if (state.drawing.type === 'poly') {
    const points = state.drawing.points;
    addObject({
      type: 'bed',
      points,
      fill: document.getElementById('fillColor').value,
      name: 'Фигура',
      plants: [],
      originalPointCount: points.length
    });
  } else {
    addObject({
      type: 'path', points: state.drawing.points,
      fill: '#b8a88a', name: 'Дорожка'
    });
  }
  state.drawing = null;
  previewLayer.innerHTML = '';
  updateFinishButton();
  setTool('select');
}

function addObject(obj) {
  obj.id = state.nextId++;
  if (obj.type !== 'path' && obj.type !== 'tree' && obj.type !== 'decor' && !obj.originalPointCount) {
    obj.basePoints = obj.points.map(p => p.slice());
    obj.morphModified = false;
  }
  state.objects.push(obj);
  state.selectedId = obj.id;
  render();
}

function deleteObject(id) {
  state.objects = state.objects.filter(o => o.id !== id);
  if (state.selectedId === id) state.selectedId = null;
  render();
}

function deletePlanting(plantingId) {
  const obj = state.objects.find(o => o.id === state.selectedId);
  if (obj && obj.plants) {
    obj.plants = obj.plants.filter(p => p.id !== plantingId);
    if (state.selectedPlantingId === plantingId) state.selectedPlantingId = null;
    render();
  }
}