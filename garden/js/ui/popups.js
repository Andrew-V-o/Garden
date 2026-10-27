// ===== POPUP'Ы ДЛЯ ОБЪЕКТОВ НА ХОЛСТЕ =====
// Содержит: showPlantPopup, showTreePopup, showDecorPopup, showMulchPopup, showPathPopup
// и функции закрытия/удаления через popup

// ===== POPUP ДЛЯ РАСТЕНИЯ =====

function showPlantPopup(planting, obj) {
  const popup = document.getElementById('plantPopup');

  const plantSelect = document.getElementById('popupPlant');
  plantSelect.innerHTML = plants.map(p =>
    `<option value="${p.id}" ${planting.plantId === p.id ? 'selected' : ''}>${p.name}</option>`
  ).join('');

  const shapeSelect = document.getElementById('popupShape');
  shapeSelect.innerHTML = SHAPES.map(s =>
    `<option value="${s.id}" ${(planting.shape || 'circle') === s.id ? 'selected' : ''}>${s.name}</option>`
  ).join('');

  const sizeInput = document.getElementById('popupSize');
  sizeInput.value = planting.r || 16;
  document.getElementById('popupSizeVal').textContent = Math.round(planting.r || 16);

  const bloomStartMonthSelect = document.getElementById('popupBloomStartMonth');
  const bloomEndMonthSelect = document.getElementById('popupBloomEndMonth');
  const bloomStartMonthSelect2 = document.getElementById('popupBloomStartMonth2');
  const bloomStartDayInput = document.getElementById('popupBloomStartDay');
  const bloomEndMonthSelect2 = document.getElementById('popupBloomEndMonth2');
  const bloomEndDayInput = document.getElementById('popupBloomEndDay');
  
  fillMonthSelect(bloomStartMonthSelect, true);
  fillMonthSelect(bloomEndMonthSelect, true);
  fillMonthSelect(bloomStartMonthSelect2, false);
  fillMonthSelect(bloomEndMonthSelect2, false);
  
  bloomStartMonthSelect.value = planting.bloomStartMonth || '';
  bloomEndMonthSelect.value = planting.bloomEndMonth || '';
  
  if (planting.bloomStartDate) {
    bloomStartMonthSelect2.value = getMonthFromStr(planting.bloomStartDate);
    bloomStartDayInput.value = getDayFromStr(planting.bloomStartDate);
  } else {
    bloomStartMonthSelect2.value = '';
    bloomStartDayInput.value = '';
  }
  if (planting.bloomEndDate) {
    bloomEndMonthSelect2.value = getMonthFromStr(planting.bloomEndDate);
    bloomEndDayInput.value = getDayFromStr(planting.bloomEndDate);
  } else {
    bloomEndMonthSelect2.value = '';
    bloomEndDayInput.value = '';
  }
  
  if (planting.bloomStartMonth || planting.bloomEndMonth) {
    document.querySelector('input[name="bloomMode"][value="months"]').checked = true;
  } else if (planting.bloomStartDate || planting.bloomEndDate) {
    document.querySelector('input[name="bloomMode"][value="dates"]').checked = true;
  } else {
    document.querySelector('input[name="bloomMode"][value="months"]').checked = true;
  }
  
  toggleBloomMode();

  const pos = getRelativeScreenPos(svg, planting.x, planting.y, canvasWrap);
  const popupWidth = 260;
  const offset = 40;

  let finalX = pos.x + offset;
  let finalY = Math.max(10, pos.y - 30);

  if (finalX + popupWidth > canvasWrap.clientWidth) {
    finalX = pos.x - popupWidth - offset;
  }

  popup.style.left = finalX + 'px';
  popup.style.top = finalY + 'px';
  popup.classList.add('show');

  const closeOnOutsideClick = (e) => {
    if (!popup.contains(e.target)) {
      closePlantPopup();
      document.removeEventListener('mousedown', closeOnOutsideClick);
    }
  };
  setTimeout(() => {
    document.addEventListener('mousedown', closeOnOutsideClick);
  }, 0);

  // Обновляем кнопку задач с правильным контекстом
  const tasksBtn = document.getElementById('plantTasksBtn');
  if (tasksBtn) {
    const taskCount = getTasksCount(planting);
    tasksBtn.textContent = `📋 Задачи (${taskCount.active})`;
    tasksBtn.onclick = () => openTasksForObject('planting', obj.id, planting.id);
  }

  plantSelect.onchange = () => {
    const newPlant = plants.find(p => p.id === plantSelect.value);
    planting.plantId = plantSelect.value;
    if (newPlant) {
      copyBloomDataFromPlant(newPlant, planting);
    }
    render();
  };
  shapeSelect.onchange = () => {
    planting.shape = shapeSelect.value;
    render();
  };
  sizeInput.oninput = () => {
    planting.r = +sizeInput.value;
    document.getElementById('popupSizeVal').textContent = Math.round(planting.r);
    render();
  };
  
  bloomStartMonthSelect.onchange = () => {
    planting.bloomStartMonth = bloomStartMonthSelect.value ? parseInt(bloomStartMonthSelect.value) : null;
    updateEndMonthSelect(bloomStartMonthSelect, bloomEndMonthSelect, true);
    planting.bloomEndMonth = bloomEndMonthSelect.value ? parseInt(bloomEndMonthSelect.value) : null;
  };
  bloomEndMonthSelect.onchange = () => {
    planting.bloomEndMonth = bloomEndMonthSelect.value ? parseInt(bloomEndMonthSelect.value) : null;
  };
  bloomStartMonthSelect2.onchange = () => {
    const m = bloomStartMonthSelect2.value ? parseInt(bloomStartMonthSelect2.value) : null;
    const d = bloomStartDayInput.value ? parseInt(bloomStartDayInput.value) : 1;
    planting.bloomStartDate = m ? makeDateStr(m, d) : null;
  };
  bloomStartDayInput.onchange = () => {
    const m = bloomStartMonthSelect2.value ? parseInt(bloomStartMonthSelect2.value) : null;
    const d = bloomStartDayInput.value ? parseInt(bloomStartDayInput.value) : 1;
    planting.bloomStartDate = m ? makeDateStr(m, d) : null;
  };
  bloomEndMonthSelect2.onchange = () => {
    const m = bloomEndMonthSelect2.value ? parseInt(bloomEndMonthSelect2.value) : null;
    const d = bloomEndDayInput.value ? parseInt(bloomEndDayInput.value) : (m ? (DAYS_IN_MONTH[m] || 31) : null);
    planting.bloomEndDate = m ? makeDateStr(m, d) : null;
  };
  bloomEndDayInput.onchange = () => {
    const m = bloomEndMonthSelect2.value ? parseInt(bloomEndMonthSelect2.value) : null;
    const d = bloomEndDayInput.value ? parseInt(bloomEndDayInput.value) : (m ? (DAYS_IN_MONTH[m] || 31) : null);
    planting.bloomEndDate = m ? makeDateStr(m, d) : null;
  };

  state.selectedPlantingId = planting.id;
  render();
}

function closePlantPopup() {
  document.getElementById('plantPopup').classList.remove('show');
}

function deletePlantingFromPopup() {
  if (state.selectedPlantingId) {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.plants) {
      obj.plants = obj.plants.filter(p => p.id !== state.selectedPlantingId);
      state.selectedPlantingId = null;
      closePlantPopup();
      render();
    }
  }
}

// ===== POPUP ДЛЯ ДЕРЕВА =====

function showTreePopup(treeObj) {
  const popup = document.getElementById('treePopup');
  const tree = trees.find(t => t.id === treeObj.treeId);
  
  document.getElementById('treePopupType').textContent = tree ? tree.name : 'Неизвестно';
  
  const sizeInput = document.getElementById('treePopupSize');
  sizeInput.value = treeObj.r || 24;
  document.getElementById('treePopupSizeVal').textContent = Math.round(treeObj.r || 24);
  
  const pos = getRelativeScreenPos(svg, treeObj.x, treeObj.y, canvasWrap);
  const popupWidth = 260;
  const offset = 40;

  let finalX = pos.x + offset;
  let finalY = Math.max(10, pos.y - 30);

  if (finalX + popupWidth > canvasWrap.clientWidth) {
    finalX = pos.x - popupWidth - offset;
  }

  popup.style.left = finalX + 'px';
  popup.style.top = finalY + 'px';
  popup.classList.add('show');

  const closeOnOutsideClick = (e) => {
    if (!popup.contains(e.target)) {
      closeTreePopup();
      document.removeEventListener('mousedown', closeOnOutsideClick);
    }
  };
  setTimeout(() => {
    document.addEventListener('mousedown', closeOnOutsideClick);
  }, 0);

  // Обновляем кнопку задач с правильным контекстом
  const tasksBtn = document.getElementById('treeTasksBtn');
  if (tasksBtn) {
    const taskCount = getTasksCount(treeObj);
    tasksBtn.textContent = `📋 Задачи (${taskCount.active})`;
    tasksBtn.onclick = () => openTasksForObject('object', treeObj.id);
  }
  
  sizeInput.oninput = () => {
    treeObj.r = +sizeInput.value;
    document.getElementById('treePopupSizeVal').textContent = Math.round(treeObj.r);
    render();
  };
  
  state.selectedId = treeObj.id;
  render();
}

function closeTreePopup() {
  document.getElementById('treePopup').classList.remove('show');
}

function deleteTreeFromPopup() {
  if (state.selectedId) {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.type === 'tree') {
      deleteObject(state.selectedId);
      state.selectedId = null;
      closeTreePopup();
      render();
    }
  }
}

// ===== POPUP ДЛЯ ДЕКОРАТИВНЫХ ОБЪЕКТОВ =====

function showDecorPopup(decorObj) {
  const popup = document.getElementById('decorPopup');
  
  const titles = {
    water: '💧 Настройка водоёма',
    stone: ' Настройка камней'
  };
  document.getElementById('decorPopupTitle').textContent = titles[decorObj.decorType] || '⚙️ Настройка объекта';
  
  const sizeInput = document.getElementById('decorPopupSize');
  const avgSize = Math.round((decorObj.w + decorObj.h) / 2);
  sizeInput.value = avgSize;
  document.getElementById('decorPopupSizeVal').textContent = Math.round(avgSize);
  
  const colorInput = document.getElementById('decorPopupColor');
  colorInput.value = decorObj.fill;
  
  const pos = getRelativeScreenPos(svg, decorObj.x, decorObj.y, canvasWrap);
  const popupWidth = 260;
  const offset = Math.max(decorObj.w, decorObj.h) / 2 + 20;

  let finalX = pos.x + offset;
  let finalY = Math.max(10, pos.y - 30);

  if (finalX + popupWidth > canvasWrap.clientWidth) {
    finalX = pos.x - offset - popupWidth;
  }

  popup.style.left = finalX + 'px';
  popup.style.top = finalY + 'px';
  popup.classList.add('show');

  const closeOnOutsideClick = (e) => {
    if (!popup.contains(e.target)) {
      closeDecorPopup();
      document.removeEventListener('mousedown', closeOnOutsideClick);
    }
  };
  setTimeout(() => {
    document.addEventListener('mousedown', closeOnOutsideClick);
  }, 0);

  sizeInput.oninput = () => {
    const val = +sizeInput.value;
    document.getElementById('decorPopupSizeVal').textContent = Math.round(val);
    const ratio = val / avgSize;
    decorObj.w *= ratio;
    decorObj.h *= ratio;
    render();
  };
  
  colorInput.oninput = () => {
    decorObj.fill = colorInput.value;
    render();
  };
  
  state.selectedId = decorObj.id;
  render();
}

function closeDecorPopup() {
  document.getElementById('decorPopup').classList.remove('show');
}

function deleteDecorFromPopup() {
  if (state.selectedId) {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.type === 'decor') {
      deleteObject(state.selectedId);
      state.selectedId = null;
      closeDecorPopup();
      render();
    }
  }
}

// ===== POPUP ДЛЯ МУЛЬЧИ =====

function showMulchPopup(mulchObj) {
  const popup = document.getElementById('mulchPopup');
  
  const skinOptions = MULCH_SKINS.map(s => 
    `<option value="${s.id}" ${(mulchObj.skin || 'bark') === s.id ? 'selected' : ''}>${s.name}</option>`
  ).join('');
  
  const densityVal = mulchObj.densityMultiplier != null ? mulchObj.densityMultiplier : 1.0;
  
  popup.innerHTML = `
    <h4>🟫 Настройка мульчи</h4>
    <div class="popup-row">
      <span>Скин:</span>
      <select id="mulchPopupSkin" style="flex:1;padding:4px 6px;border:1px solid #ccc;border-radius:4px;font-size:12px;">
        ${skinOptions}
      </select>
    </div>
    <div class="popup-row">
      <span>Форма:</span>
      <select id="mulchPopupShape">
        <option value="rect" ${mulchObj.shape === 'rect' ? 'selected' : ''}>Прямоугольник</option>
        <option value="circle" ${mulchObj.shape === 'circle' ? 'selected' : ''}>Круг</option>
      </select>
    </div>
    <div class="popup-row" style="flex-direction:column;align-items:stretch;gap:4px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span>Плотность частиц:</span>
        <span id="mulchPopupDensityVal" style="font-size:11px;color:#555;">×${densityVal.toFixed(1)}</span>
      </div>
      <input type="range" id="mulchPopupDensity" min="0.2" max="3.0" step="0.1" value="${densityVal}" style="width:100%;">
    </div>
    <div class="popup-row">
      <span>Ширина (м):</span>
      <input type="number" id="mulchPopupWidth" value="${(mulchObj.w / state.scale).toFixed(1)}" min="0.5" max="100" step="0.5" style="width:70px;padding:4px;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div class="popup-row">
      <span>Высота (м):</span>
      <input type="number" id="mulchPopupHeight" value="${(mulchObj.h / state.scale).toFixed(1)}" min="0.5" max="100" step="0.5" style="width:70px;padding:4px;border:1px solid #ccc;border-radius:4px;">
    </div>
    <div class="popup-buttons">
      <button class="delete-btn" onclick="deleteMulchFromPopup()">🗑️ Удалить</button>
      <button class="close-btn" onclick="closeMulchPopup()">✖ Закрыть</button>
    </div>
  `;
  
  const pos = getRelativeScreenPos(svg, mulchObj.x, mulchObj.y, canvasWrap);
  const popupWidth = 260;
  const offset = Math.max(mulchObj.w, mulchObj.h) / 2 + 20;

  let finalX = pos.x + offset;
  let finalY = Math.max(10, pos.y - 40);

  if (finalX + popupWidth > canvasWrap.clientWidth) {
    finalX = pos.x - offset - popupWidth;
  }

  popup.style.left = finalX + 'px';
  popup.style.top = finalY + 'px';
  popup.classList.add('show');

  const closeOnOutsideClick = (e) => {
    if (!popup.contains(e.target)) {
      closeMulchPopup();
      document.removeEventListener('mousedown', closeOnOutsideClick);
    }
  };
  setTimeout(() => {
    document.addEventListener('mousedown', closeOnOutsideClick);
  }, 0);

  document.getElementById('mulchPopupSkin').onchange = (e) => {
    mulchObj.skin = e.target.value;
    const skinData = MULCH_SKINS.find(s => s.id === e.target.value);
    if (skinData) {
      mulchObj.fill = skinData.baseColor;
    }
    render();
  };
  
  document.getElementById('mulchPopupShape').onchange = (e) => {
    mulchObj.shape = e.target.value;
    render();
  };
  
  document.getElementById('mulchPopupDensity').oninput = (e) => {
    const val = parseFloat(e.target.value);
    mulchObj.densityMultiplier = val;
    document.getElementById('mulchPopupDensityVal').textContent = '×' + val.toFixed(1);
    render();
  };
  
  document.getElementById('mulchPopupWidth').onchange = (e) => {
    const val = Math.max(0.5, Math.min(100, parseFloat(e.target.value) || 1));
    mulchObj.w = val * state.scale;
    e.target.value = val;
    render();
  };
  
  document.getElementById('mulchPopupHeight').onchange = (e) => {
    const val = Math.max(0.5, Math.min(100, parseFloat(e.target.value) || 1));
    mulchObj.h = val * state.scale;
    e.target.value = val;
    render();
  };
  
  state.selectedId = mulchObj.id;
  render();
}

function closeMulchPopup() {
  document.getElementById('mulchPopup').classList.remove('show');
}

function deleteMulchFromPopup() {
  if (state.selectedId) {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.type === 'mulch') {
      deleteObject(state.selectedId);
      state.selectedId = null;
      closeMulchPopup();
      render();
    }
  }
}

// ===== POPUP ДЛЯ ДОРОЖКИ =====

function showPathPopup(pathObj) {
  const popup = document.getElementById('pathPopup');
  
  const skinOptions = PATH_SKINS.map(s => 
    `<option value="${s.id}" ${(pathObj.skin || 'gravel') === s.id ? 'selected' : ''}>${s.name}</option>`
  ).join('');
  
  const densityVal = pathObj.densityMultiplier != null ? pathObj.densityMultiplier : 1.0;
  
  popup.innerHTML = `
    <h4>️ Настройка дорожки</h4>
    <div class="popup-row">
      <span>Скин:</span>
      <select id="pathPopupSkin" style="flex:1;padding:4px 6px;border:1px solid #ccc;border-radius:4px;font-size:12px;">
        ${skinOptions}
      </select>
    </div>
    <div class="popup-row" style="flex-direction:column;align-items:stretch;gap:4px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span>Плотность частиц:</span>
        <span id="pathPopupDensityVal" style="font-size:11px;color:#555;">×${densityVal.toFixed(1)}</span>
      </div>
      <input type="range" id="pathPopupDensity" min="0.2" max="3.0" step="0.1" value="${densityVal}" style="width:100%;">
    </div>
    <div class="popup-row">
      <span>Цвет:</span>
      <input type="color" id="pathPopupColor" value="${pathObj.fill}">
    </div>
    <div class="popup-buttons">
      <button class="delete-btn" onclick="deletePathFromPopup()">🗑️ Удалить</button>
      <button class="close-btn" onclick="closePathPopup()">✖ Закрыть</button>
    </div>
  `;
  
  const pos = getRelativeScreenPos(svg, pathObj.points[0][0], pathObj.points[0][1], canvasWrap);
  const popupWidth = 260;
  const offset = 40;

  let finalX = pos.x + offset;
  let finalY = Math.max(10, pos.y - 30);

  if (finalX + popupWidth > canvasWrap.clientWidth) {
    finalX = pos.x - popupWidth - offset;
  }

  popup.style.left = finalX + 'px';
  popup.style.top = finalY + 'px';
  popup.classList.add('show');

  const closeOnOutsideClick = (e) => {
    if (!popup.contains(e.target)) {
      closePathPopup();
      document.removeEventListener('mousedown', closeOnOutsideClick);
    }
  };
  setTimeout(() => {
    document.addEventListener('mousedown', closeOnOutsideClick);
  }, 0);

  document.getElementById('pathPopupSkin').onchange = (e) => {
    pathObj.skin = e.target.value;
    render();
  };
  
  document.getElementById('pathPopupDensity').oninput = (e) => {
    const val = parseFloat(e.target.value);
    pathObj.densityMultiplier = val;
    document.getElementById('pathPopupDensityVal').textContent = '×' + val.toFixed(1);
    render();
  };
  
  document.getElementById('pathPopupColor').oninput = (e) => {
    pathObj.fill = e.target.value;
    render();
  };
  
  state.selectedId = pathObj.id;
  render();
}

function closePathPopup() {
  document.getElementById('pathPopup').classList.remove('show');
}

function deletePathFromPopup() {
  if (state.selectedId) {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.type === 'path') {
      deleteObject(state.selectedId);
      state.selectedId = null;
      closePathPopup();
      render();
    }
  }
}