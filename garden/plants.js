// ===== РАСТЕНИЯ И ДЕРЕВЬЯ =====

let currentSettingsPlantId = null;
let currentTreeSettingsId = null;
let currentContextMenu = null;
let currentTreeContextMenu = null;

// Состояние сворачивания разделов
state.collapsedSections = { plants: false, trees: false };

// Вспомогательная функция для точного перевода SVG-координат в CSS-пиксели
function getRelativeScreenPos(svg, objX, objY, canvasWrap) {
  const pt = svg.createSVGPoint();
  pt.x = objX;
  pt.y = objY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  
  const screenPt = pt.matrixTransform(ctm);
  const wrapRect = canvasWrap.getBoundingClientRect();
  
  return {
    x: screenPt.x - wrapRect.left + canvasWrap.scrollLeft,
    y: screenPt.y - wrapRect.top + canvasWrap.scrollTop
  };
}

function loadCustomPlants() {
  const saved = localStorage.getItem('customPlants');
  if (saved) {
    try {
      const customs = JSON.parse(saved);
      plants = [...DEFAULT_PLANTS, ...customs];
      customPlantCounter = customs.length + 1;
    } catch (e) { }
  }
  loadFolders();
}

function saveCustomPlants() {
  localStorage.setItem('customPlants', JSON.stringify(plants.filter(p => p.custom)));
}

function loadCustomTrees() {
  const saved = localStorage.getItem('customTrees');
  if (saved) {
    try {
      const customs = JSON.parse(saved);
      trees = [...DEFAULT_TREES, ...customs];
      customTreeCounter = customs.length + 1;
    } catch (e) { }
  }
  loadTreeFolders();
}

function saveCustomTrees() {
  localStorage.setItem('customTrees', JSON.stringify(trees.filter(t => t.custom)));
}

// ===== СВОРАЧИВАНИЕ РАЗДЕЛОВ =====

function toggleSection(section) {
  state.collapsedSections[section] = !state.collapsedSections[section];
  const content = document.getElementById(section === 'plants' ? 'plantsSection' : 'treesSection');
  const arrow = document.getElementById(section === 'plants' ? 'plantsArrow' : 'treesArrow');
  
  if (state.collapsedSections[section]) {
    content.style.display = 'none';
    arrow.textContent = '▶';
  } else {
    content.style.display = 'block';
    arrow.textContent = '▼';
  }
}

// ===== ОБЩИЕ ФУНКЦИИ =====

function fillMonthSelect(selectEl, includeNoneOption = false, selectedMonth = null) {
  let html = '';
  if (includeNoneOption) {
    html += `<option value="">Не цветёт</option>`;
  }
  MONTHS.forEach((m, i) => {
    const val = i + 1;
    html += `<option value="${val}" ${selectedMonth === val ? 'selected' : ''}>${m}</option>`;
  });
  selectEl.innerHTML = html;
}

function updateEndMonthSelect(startSelect, endSelect, includeNoneOption = false) {
  const startMonth = startSelect.value ? parseInt(startSelect.value) : null;
  const currentEndMonth = endSelect.value ? parseInt(endSelect.value) : null;
  
  let html = '';
  if (includeNoneOption) {
    html += `<option value="">Не цветёт</option>`;
  }
  
  MONTHS.forEach((m, i) => {
    const val = i + 1;
    if (!startMonth || val >= startMonth) {
      html += `<option value="${val}" ${currentEndMonth === val ? 'selected' : ''}>${m}</option>`;
    }
  });
  
  endSelect.innerHTML = html;
  
  if (currentEndMonth && startMonth && currentEndMonth < startMonth) {
    const firstOption = endSelect.querySelector('option[value]');
    if (firstOption) {
      endSelect.value = firstOption.value;
    }
  }
}

function updateShapePreview(context) {
  const shape = document.getElementById(`${context}PlantShape`).value;
  const color = document.getElementById(`${context}PlantColor`).value;
  const previewEl = document.getElementById(`${context}ShapePreview`);
  
  if (previewEl) {
    previewEl.innerHTML = `<svg viewBox="0 0 16 16" style="width:40px;height:40px;">${getShapeSVGMini(shape, color)}</svg>`;
  }
}

function updateTreeShapePreview(context) {
  const shape = document.getElementById(`${context}TreeShape`).value;
  const color = document.getElementById(`${context}TreeColor`).value;
  const previewEl = document.getElementById(`${context}TreePreview`);
  
  if (previewEl) {
    previewEl.innerHTML = `<svg viewBox="0 0 16 16" style="width:40px;height:40px;">${getShapeSVGMini(shape, color)}</svg>`;
  }
}

// ===== РАСТЕНИЯ =====

function createPlantItem(p) {
  const el = document.createElement('div');
  el.className = 'plant-item' + (state.selectedPlant === p.id ? ' selected' : '');
  el.dataset.id = p.id;
  
  const shape = p.defaultShape || 'circle';
  
  el.innerHTML = `
    <button class="plant-settings-btn" title="Настройки вида" data-settings="${p.id}">⚙</button>
    <svg class="plant-shape-icon" viewBox="0 0 16 16" style="width:24px;height:24px;margin:0 auto 4px;display:block;">
      ${getShapeSVGMini(shape, p.color)}
    </svg>
    ${p.name}
    <button class="plant-del" title="Удалить">×</button>
  `;
  el.onclick = (e) => {
    if (e.target.classList.contains('plant-del')) {
      e.stopPropagation();
      deletePlant(p.id);
      return;
    }
    if (e.target.classList.contains('plant-settings-btn')) {
      e.stopPropagation();
      openPlantSettings(p.id);
      return;
    }
    selectPlant(p.id);
  };
  return el;
}

function renderPlantList() {
  const list = document.getElementById('plantList');
  list.innerHTML = '';
  
  const addFolderBtn = document.createElement('div');
  addFolderBtn.className = 'add-folder-btn';
  addFolderBtn.textContent = '📁 Новая папка';
  addFolderBtn.onclick = () => {
    const name = prompt('Название папки:');
    if (name && name.trim()) {
      createFolder(name.trim());
    }
  };
  list.appendChild(addFolderBtn);
  
  if (folders.length > 0) {
    const foldersSectionHeader = document.createElement('div');
    foldersSectionHeader.className = 'section-header';
    foldersSectionHeader.textContent = '📁 Папки';
    list.appendChild(foldersSectionHeader);
    
    folders.forEach(folder => {
      const folderPlants = plants.filter(p => p.folderId === folder.id);
      const isExpanded = state.expandedFolders.has(folder.id);
      
      const folderEl = document.createElement('div');
      folderEl.className = 'folder-container';
      
      const folderHeader = document.createElement('div');
      folderHeader.className = 'folder-header';
      folderHeader.innerHTML = `
        <span class="folder-arrow">${isExpanded ? '▼' : '▶'}</span>
        <span class="folder-icon">📁</span>
        <span class="folder-name">${folder.name}</span>
        <span class="folder-count">(${folderPlants.length})</span>
        <button class="folder-delete-btn" title="Удалить папку">×</button>
      `;
      
      folderHeader.onclick = (e) => {
        if (e.target.classList.contains('folder-delete-btn')) {
          e.stopPropagation();
          deleteFolder(folder.id);
        } else {
          toggleFolder(folder.id);
        }
      };
      
      folderHeader.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showFolderContextMenu(e, folder.id);
      };
      
      folderEl.appendChild(folderHeader);
      
      if (isExpanded) {
        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';
        
        if (folderPlants.length === 0) {
          const emptyMsg = document.createElement('div');
          emptyMsg.style.cssText = 'font-size:11px;color:#999;padding:8px;text-align:center;grid-column:span 2;';
          emptyMsg.textContent = 'Папка пуста';
          folderContent.appendChild(emptyMsg);
        } else {
          folderPlants.forEach(p => {
            folderContent.appendChild(createPlantItem(p));
          });
        }
        
        const addPlantBtn = document.createElement('div');
        addPlantBtn.className = 'add-plant-btn folder-add-btn';
        addPlantBtn.textContent = '➕ Добавить цветок';
        addPlantBtn.onclick = (e) => {
          e.stopPropagation();
          openPlantModalInFolder(folder.id);
        };
        folderContent.appendChild(addPlantBtn);
        
        folderEl.appendChild(folderContent);
      }
      
      list.appendChild(folderEl);
    });
  }
  
  const noFolderPlants = plants.filter(p => !p.folderId);
  if (noFolderPlants.length > 0) {
    const plantsSectionHeader = document.createElement('div');
    plantsSectionHeader.className = 'section-header';
    plantsSectionHeader.textContent = '🌸 Отдельные растения';
    list.appendChild(plantsSectionHeader);
    
    noFolderPlants.forEach(p => {
      list.appendChild(createPlantItem(p));
    });
  }
  
  const addBtn = document.createElement('div');
  addBtn.className = 'add-plant-btn';
  addBtn.textContent = '➕ Свой цветок';
  addBtn.onclick = openPlantModal;
  list.appendChild(addBtn);
  
  document.addEventListener('click', () => {
    hideContextMenu();
  });
}

function showFolderContextMenu(e, folderId) {
  hideContextMenu();
  
  const folder = folders.find(f => f.id === folderId);
  if (!folder) return;
  
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  
  menu.innerHTML = `
    <div class="context-menu-item" data-action="rename">✏️ Переименовать</div>
    <div class="context-menu-item" data-action="delete">🗑️ Удалить папку</div>
  `;
  
  menu.onclick = (ev) => {
    const action = ev.target.dataset.action;
    if (action === 'rename') {
      const newName = prompt('Новое название папки:', folder.name);
      if (newName && newName.trim()) {
        renameFolder(folderId, newName.trim());
      }
    } else if (action === 'delete') {
      deleteFolder(folderId);
    }
    hideContextMenu();
  };
  
  document.body.appendChild(menu);
  currentContextMenu = menu;
}

function hideContextMenu() {
  if (currentContextMenu) {
    currentContextMenu.remove();
    currentContextMenu = null;
  }
}

function selectPlant(id) {
  if (state.selectedPlant === id) {
    state.selectedPlant = null;
    document.querySelectorAll('.plant-item').forEach(el => el.classList.remove('selected'));
    return;
  }
  state.selectedPlant = id;
  state.selectedTree = null;
  document.querySelectorAll('.plant-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
  
  if (state.selectedId) {
    const obj = state.objects.find(o => o.id === state.selectedId);
    if (obj && obj.type === 'bed') {
      state.plantingMode = true;
      updateHint();
      renderPlantingsPanel();
    }
  }
}

function deletePlant(id) {
  const plant = plants.find(p => p.id === id);
  if (!plant) return;
  if (!confirm(`Удалить "${plant.name}"? Все посадки этого типа будут удалены.`)) return;

  plants = plants.filter(p => p.id !== id);
  state.objects.forEach(obj => {
    if (obj.plants) {
      obj.plants = obj.plants.filter(pl => pl.plantId !== id);
    }
  });
  if (state.selectedPlant === id) state.selectedPlant = null;
  saveCustomPlants();
  renderPlantList();
  render();
}

function openPlantSettings(plantId) {
  const plant = plants.find(p => p.id === plantId);
  if (!plant) return;
  
  currentSettingsPlantId = plantId;
  
  document.getElementById('settingsPlantName').value = plant.name;
  document.getElementById('settingsPlantColor').value = plant.color;
  document.getElementById('settingsPlantShape').value = plant.defaultShape || 'circle';
  
  const folderSelect = document.getElementById('settingsPlantFolder');
  folderSelect.innerHTML = '<option value="">Без папки</option>';
  folders.forEach(f => {
    folderSelect.innerHTML += `<option value="${f.id}" ${plant.folderId === f.id ? 'selected' : ''}>${f.name}</option>`;
  });
  
  const startSelect = document.getElementById('settingsBloomStartMonth');
  const endSelect = document.getElementById('settingsBloomEndMonth');
  
  fillMonthSelect(startSelect, true, plant.bloomStartMonth);
  fillMonthSelect(endSelect, true, plant.bloomEndMonth);
  fillMonthSelect(document.getElementById('settingsBloomStartMonth2'), false, plant.bloomStartMonth);
  fillMonthSelect(document.getElementById('settingsBloomEndMonth2'), false, plant.bloomEndMonth);
  
  if (plant.bloomStartDate) {
    document.getElementById('settingsBloomStartDay').value = getDayFromStr(plant.bloomStartDate);
  } else {
    document.getElementById('settingsBloomStartDay').value = '';
  }
  if (plant.bloomEndDate) {
    document.getElementById('settingsBloomEndDay').value = getDayFromStr(plant.bloomEndDate);
  } else {
    document.getElementById('settingsBloomEndDay').value = '';
  }
  
  if (plant.bloomStartMonth || plant.bloomEndMonth) {
    document.querySelector('input[name="settingsBloomMode"][value="months"]').checked = true;
  } else if (plant.bloomStartDate || plant.bloomEndDate) {
    document.querySelector('input[name="settingsBloomMode"][value="dates"]').checked = true;
  } else {
    document.querySelector('input[name="settingsBloomMode"][value="months"]').checked = true;
  }
  
  toggleSettingsBloomMode();
  
  const deleteBtn = document.getElementById('settingsDeleteBtn');
  deleteBtn.style.display = plant.custom ? 'block' : 'none';
  
  document.getElementById('plantSettingsModal').classList.add('show');
  
  updateShapePreview('settings');
}

function closePlantSettings() {
  document.getElementById('plantSettingsModal').classList.remove('show');
  currentSettingsPlantId = null;
}

function toggleSettingsBloomMode() {
  const mode = document.querySelector('input[name="settingsBloomMode"]:checked').value;
  document.getElementById('settingsBloomMonthsSection').style.display = mode === 'months' ? 'flex' : 'none';
  document.getElementById('settingsBloomDatesSection').style.display = mode === 'dates' ? 'flex' : 'none';
  
  const plant = plants.find(p => p.id === currentSettingsPlantId);
  if (!plant) return;
  
  const startSelect = document.getElementById('settingsBloomStartMonth');
  const endSelect = document.getElementById('settingsBloomEndMonth');
  
  if (mode === 'months') {
    if (plant.bloomStartDate) {
      plant.bloomStartMonth = getMonthFromStr(plant.bloomStartDate);
      plant.bloomStartDate = null;
    }
    if (plant.bloomEndDate) {
      plant.bloomEndMonth = getMonthFromStr(plant.bloomEndDate);
      plant.bloomEndDate = null;
    }
    
    startSelect.value = plant.bloomStartMonth || '';
    updateEndMonthSelect(startSelect, endSelect, true);
    endSelect.value = plant.bloomEndMonth || '';
  } else {
    if (plant.bloomStartMonth) {
      plant.bloomStartDate = monthToStartDate(plant.bloomStartMonth);
      plant.bloomStartMonth = null;
    }
    if (plant.bloomEndMonth) {
      plant.bloomEndDate = monthToEndDate(plant.bloomEndMonth);
      plant.bloomEndMonth = null;
    }
    
    if (plant.bloomStartDate) {
      document.getElementById('settingsBloomStartMonth2').value = getMonthFromStr(plant.bloomStartDate);
      document.getElementById('settingsBloomStartDay').value = getDayFromStr(plant.bloomStartDate);
    }
    if (plant.bloomEndDate) {
      document.getElementById('settingsBloomEndMonth2').value = getMonthFromStr(plant.bloomEndDate);
      document.getElementById('settingsBloomEndDay').value = getDayFromStr(plant.bloomEndDate);
    }
  }
}

function savePlantSettings() {
  const plant = plants.find(p => p.id === currentSettingsPlantId);
  if (!plant) return;
  
  const name = document.getElementById('settingsPlantName').value.trim();
  const color = document.getElementById('settingsPlantColor').value;
  const mode = document.querySelector('input[name="settingsBloomMode"]:checked').value;
  const shape = document.getElementById('settingsPlantShape').value;
  const folderId = document.getElementById('settingsPlantFolder').value ? parseInt(document.getElementById('settingsPlantFolder').value) : null;
  
  if (!name) { alert('Введите название'); return; }
  
  plant.name = name;
  plant.color = color;
  plant.defaultShape = shape;
  plant.folderId = folderId;
  
  if (mode === 'months') {
    plant.bloomStartMonth = document.getElementById('settingsBloomStartMonth').value ? parseInt(document.getElementById('settingsBloomStartMonth').value) : null;
    plant.bloomEndMonth = document.getElementById('settingsBloomEndMonth').value ? parseInt(document.getElementById('settingsBloomEndMonth').value) : null;
    plant.bloomStartDate = null;
    plant.bloomEndDate = null;
  } else {
    const sm = document.getElementById('settingsBloomStartMonth2').value ? parseInt(document.getElementById('settingsBloomStartMonth2').value) : null;
    const sd = document.getElementById('settingsBloomStartDay').value ? parseInt(document.getElementById('settingsBloomStartDay').value) : 1;
    const em = document.getElementById('settingsBloomEndMonth2').value ? parseInt(document.getElementById('settingsBloomEndMonth2').value) : null;
    const ed = document.getElementById('settingsBloomEndDay').value ? parseInt(document.getElementById('settingsBloomEndDay').value) : null;
    
    plant.bloomStartDate = sm ? makeDateStr(sm, sd) : null;
    plant.bloomEndDate = em ? makeDateStr(em, ed || (DAYS_IN_MONTH[em] || 31)) : null;
    plant.bloomStartMonth = null;
    plant.bloomEndMonth = null;
  }
  
  saveCustomPlants();
  renderPlantList();
  closePlantSettings();
  render();
}

function deletePlantFromSettings() {
  if (!currentSettingsPlantId) return;
  deletePlant(currentSettingsPlantId);
  closePlantSettings();
}

function toggleBloomMode() {
  const mode = document.querySelector('input[name="bloomMode"]:checked').value;
  document.getElementById('bloomMonthsSection').style.display = mode === 'months' ? 'flex' : 'none';
  document.getElementById('bloomDatesSection').style.display = mode === 'dates' ? 'flex' : 'none';
  
  const obj = state.objects.find(o => o.id === state.selectedId);
  const planting = obj?.plants?.find(p => p.id === state.selectedPlantingId);
  if (!planting) return;
  
  const bloomStartMonthSelect = document.getElementById('popupBloomStartMonth');
  const bloomEndMonthSelect = document.getElementById('popupBloomEndMonth');
  
  if (mode === 'months') {
    if (planting.bloomStartDate) {
      planting.bloomStartMonth = getMonthFromStr(planting.bloomStartDate);
      planting.bloomStartDate = null;
    }
    if (planting.bloomEndDate) {
      planting.bloomEndMonth = getMonthFromStr(planting.bloomEndDate);
      planting.bloomEndDate = null;
    }
    
    bloomStartMonthSelect.value = planting.bloomStartMonth || '';
    updateEndMonthSelect(bloomStartMonthSelect, bloomEndMonthSelect, true);
    bloomEndMonthSelect.value = planting.bloomEndMonth || '';
  } else {
    if (planting.bloomStartMonth) {
      planting.bloomStartDate = monthToStartDate(planting.bloomStartMonth);
      planting.bloomStartMonth = null;
    }
    if (planting.bloomEndMonth) {
      planting.bloomEndDate = monthToEndDate(planting.bloomEndMonth);
      planting.bloomEndMonth = null;
    }
    
    if (planting.bloomStartDate) {
      document.getElementById('popupBloomStartMonth2').value = getMonthFromStr(planting.bloomStartDate);
      document.getElementById('popupBloomStartDay').value = getDayFromStr(planting.bloomStartDate);
    }
    if (planting.bloomEndDate) {
      document.getElementById('popupBloomEndMonth2').value = getMonthFromStr(planting.bloomEndDate);
      document.getElementById('popupBloomEndDay').value = getDayFromStr(planting.bloomEndDate);
    }
  }
}

function toggleNewBloomMode() {
  const mode = document.querySelector('input[name="newBloomMode"]:checked').value;
  document.getElementById('newBloomMonthsSection').style.display = mode === 'months' ? 'flex' : 'none';
  document.getElementById('newBloomDatesSection').style.display = mode === 'dates' ? 'flex' : 'none';
}

function toggleFilterBloomMode() {
  const mode = document.querySelector('input[name="filterBloomMode"]:checked').value;
  document.getElementById('filterBloomMonthsSection').style.display = mode === 'months' ? 'block' : 'none';
  document.getElementById('filterBloomDatesSection').style.display = mode === 'dates' ? 'block' : 'none';
  
  const startMonthSelect = document.getElementById('bloomFilterStartMonth');
  const endMonthSelect = document.getElementById('bloomFilterEndMonth');
  const startMonthSelect2 = document.getElementById('bloomFilterStartMonth2');
  const startDayInput = document.getElementById('bloomFilterStartDay');
  const endMonthSelect2 = document.getElementById('bloomFilterEndMonth2');
  const endDayInput = document.getElementById('bloomFilterEndDay');
  
  if (mode === 'months') {
    const sm = startMonthSelect2.value ? parseInt(startMonthSelect2.value) : null;
    const em = endMonthSelect2.value ? parseInt(endMonthSelect2.value) : null;
    
    if (sm) startMonthSelect.value = sm;
    if (em) endMonthSelect.value = em;
    
    startMonthSelect.onchange = () => {
      updateEndMonthSelect(startMonthSelect, endMonthSelect, true);
    };
    
    startDayInput.value = '';
    endDayInput.value = '';
  } else {
    const sm = startMonthSelect.value ? parseInt(startMonthSelect.value) : null;
    const em = endMonthSelect.value ? parseInt(endMonthSelect.value) : null;
    
    if (sm) {
      startMonthSelect2.value = sm;
      startDayInput.value = 1;
    }
    if (em) {
      endMonthSelect2.value = em;
      endDayInput.value = DAYS_IN_MONTH[em] || 31;
    }
  }
}

function openPlantModal() {
  document.getElementById('plantModal').classList.add('show');
  document.getElementById('newPlantName').value = '';
  document.getElementById('newPlantColor').value = '#ff69b4';
  document.getElementById('newPlantBloomStartDay').value = '';
  document.getElementById('newPlantBloomEndDay').value = '';
  document.getElementById('newPlantShape').value = 'circle';
  document.getElementById('newPlantName').focus();
  renderColorPresets();
  
  const folderSelect = document.getElementById('newPlantFolder');
  folderSelect.innerHTML = '<option value="">Без папки</option>';
  folders.forEach(f => {
    folderSelect.innerHTML += `<option value="${f.id}">${f.name}</option>`;
  });
  
  const startSelect = document.getElementById('newPlantBloomStartMonth');
  const endSelect = document.getElementById('newPlantBloomEndMonth');
  
  fillMonthSelect(startSelect, true, 5);
  fillMonthSelect(endSelect, true, 9);
  
  startSelect.onchange = () => {
    updateEndMonthSelect(startSelect, endSelect, true);
  };
  
  fillMonthSelect(document.getElementById('newPlantBloomStartMonth2'), false, 5);
  fillMonthSelect(document.getElementById('newPlantBloomEndMonth2'), false, 9);
  
  document.querySelector('input[name="newBloomMode"][value="months"]').checked = true;
  toggleNewBloomMode();
  
  updateShapePreview('new');
}

function closePlantModal() {
  document.getElementById('plantModal').classList.remove('show');
}

function renderColorPresets() {
  const wrap = document.getElementById('colorPresets');
  wrap.innerHTML = '';
  COLOR_PRESETS.forEach(c => {
    const el = document.createElement('div');
    el.className = 'preset';
    el.style.background = c;
    if (c === '#ffffff') el.style.border = '2px solid #ccc';
    el.onclick = () => {
      document.getElementById('newPlantColor').value = c;
      updateShapePreview('new');
    };
    wrap.appendChild(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('settingsPlantColor').addEventListener('input', (e) => {
    updateShapePreview('settings');
  });
  document.getElementById('settingsTreeColor').addEventListener('input', (e) => {
    updateTreeShapePreview('settings');
  });
});

function saveNewPlant() {
  const name = document.getElementById('newPlantName').value.trim();
  const color = document.getElementById('newPlantColor').value;
  const mode = document.querySelector('input[name="newBloomMode"]:checked').value;
  const shape = document.getElementById('newPlantShape').value;
  const folderId = document.getElementById('newPlantFolder').value ? parseInt(document.getElementById('newPlantFolder').value) : null;
  
  if (!name) { alert('Введите название'); return; }
  
  const plant = { 
    id: 'custom_' + (customPlantCounter++),
    name, color, custom: true,
    defaultShape: shape,
    folderId: folderId
  };
  
  if (mode === 'months') {
    plant.bloomStartMonth = document.getElementById('newPlantBloomStartMonth').value ? parseInt(document.getElementById('newPlantBloomStartMonth').value) : null;
    plant.bloomEndMonth = document.getElementById('newPlantBloomEndMonth').value ? parseInt(document.getElementById('newPlantBloomEndMonth').value) : null;
    plant.bloomStartDate = null;
    plant.bloomEndDate = null;
  } else {
    const sm = document.getElementById('newPlantBloomStartMonth2').value ? parseInt(document.getElementById('newPlantBloomStartMonth2').value) : null;
    const sd = document.getElementById('newPlantBloomStartDay').value ? parseInt(document.getElementById('newPlantBloomStartDay').value) : 1;
    const em = document.getElementById('newPlantBloomEndMonth2').value ? parseInt(document.getElementById('newPlantBloomEndMonth2').value) : null;
    const ed = document.getElementById('newPlantBloomEndDay').value ? parseInt(document.getElementById('newPlantBloomEndDay').value) : null;
    
    plant.bloomStartDate = sm ? makeDateStr(sm, sd) : null;
    plant.bloomEndDate = em ? makeDateStr(em, ed || (DAYS_IN_MONTH[em] || 31)) : null;
    plant.bloomStartMonth = null;
    plant.bloomEndMonth = null;
  }
  
  plants.push(plant);
  saveCustomPlants();
  renderPlantList();
  closePlantModal();
  selectPlant(plant.id);
}

function openPlantModalInFolder(folderId) {
  openPlantModal();
  setTimeout(() => {
    const folderSelect = document.getElementById('newPlantFolder');
    if (folderSelect) {
      folderSelect.value = folderId.toString();
    }
  }, 0);
}

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

// ===== ДЕРЕВЬЯ =====

function createTreeItem(t) {
  const el = document.createElement('div');
  el.className = 'tree-item' + (state.selectedTree === t.id ? ' selected' : '');
  el.dataset.id = t.id;
  
  const shape = t.defaultShape || 'oak';
  
  el.innerHTML = `
    <button class="tree-settings-btn" title="Настройки вида" data-settings="${t.id}">⚙</button>
    <svg class="tree-shape-icon" viewBox="0 0 16 16" style="width:24px;height:24px;margin:0 auto 4px;display:block;">
      ${getShapeSVGMini(shape, t.color)}
    </svg>
    ${t.name}
    <button class="tree-del" title="Удалить">×</button>
  `;
  el.onclick = (e) => {
    if (e.target.classList.contains('tree-del')) {
      e.stopPropagation();
      deleteTree(t.id);
      return;
    }
    if (e.target.classList.contains('tree-settings-btn')) {
      e.stopPropagation();
      openTreeSettings(t.id);
      return;
    }
    selectTree(t.id);
  };
  return el;
}

function renderTreeList() {
  const list = document.getElementById('treeList');
  list.innerHTML = '';
  
  const addFolderBtn = document.createElement('div');
  addFolderBtn.className = 'add-folder-btn';
  addFolderBtn.textContent = '📁 Новая папка';
  addFolderBtn.onclick = () => {
    const name = prompt('Название папки:');
    if (name && name.trim()) {
      createTreeFolder(name.trim());
    }
  };
  list.appendChild(addFolderBtn);
  
  if (treeFolders.length > 0) {
    const foldersSectionHeader = document.createElement('div');
    foldersSectionHeader.className = 'section-header';
    foldersSectionHeader.textContent = '📁 Папки';
    list.appendChild(foldersSectionHeader);
    
    treeFolders.forEach(folder => {
      const folderTrees = trees.filter(t => t.folderId === folder.id);
      const isExpanded = state.expandedTreeFolders.has(folder.id);
      
      const folderEl = document.createElement('div');
      folderEl.className = 'folder-container';
      
      const folderHeader = document.createElement('div');
      folderHeader.className = 'folder-header';
      folderHeader.innerHTML = `
        <span class="folder-arrow">${isExpanded ? '▼' : '▶'}</span>
        <span class="folder-icon">📁</span>
        <span class="folder-name">${folder.name}</span>
        <span class="folder-count">(${folderTrees.length})</span>
        <button class="folder-delete-btn" title="Удалить папку">×</button>
      `;
      
      folderHeader.onclick = (e) => {
        if (e.target.classList.contains('folder-delete-btn')) {
          e.stopPropagation();
          deleteTreeFolder(folder.id);
        } else {
          toggleTreeFolder(folder.id);
        }
      };
      
      folderHeader.oncontextmenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        showTreeFolderContextMenu(e, folder.id);
      };
      
      folderEl.appendChild(folderHeader);
      
      if (isExpanded) {
        const folderContent = document.createElement('div');
        folderContent.className = 'folder-content';
        
        if (folderTrees.length === 0) {
          const emptyMsg = document.createElement('div');
          emptyMsg.style.cssText = 'font-size:11px;color:#999;padding:8px;text-align:center;grid-column:span 2;';
          emptyMsg.textContent = 'Папка пуста';
          folderContent.appendChild(emptyMsg);
        } else {
          folderTrees.forEach(t => {
            folderContent.appendChild(createTreeItem(t));
          });
        }
        
        const addTreeBtn = document.createElement('div');
        addTreeBtn.className = 'add-tree-btn folder-add-btn';
        addTreeBtn.textContent = '➕ Добавить дерево';
        addTreeBtn.onclick = (e) => {
          e.stopPropagation();
          openTreeModalInFolder(folder.id);
        };
        folderContent.appendChild(addTreeBtn);
        
        folderEl.appendChild(folderContent);
      }
      
      list.appendChild(folderEl);
    });
  }
  
  const noFolderTrees = trees.filter(t => !t.folderId);
  if (noFolderTrees.length > 0) {
    const treesSectionHeader = document.createElement('div');
    treesSectionHeader.className = 'section-header';
    treesSectionHeader.textContent = '🌳 Отдельные деревья';
    list.appendChild(treesSectionHeader);
    
    noFolderTrees.forEach(t => {
      list.appendChild(createTreeItem(t));
    });
  }
  
  const addBtn = document.createElement('div');
  addBtn.className = 'add-tree-btn';
  addBtn.textContent = '➕ Свое дерево';
  addBtn.onclick = openTreeModal;
  list.appendChild(addBtn);
  
  document.addEventListener('click', () => {
    hideTreeContextMenu();
  });
}

function showTreeFolderContextMenu(e, folderId) {
  hideTreeContextMenu();
  
  const folder = treeFolders.find(f => f.id === folderId);
  if (!folder) return;
  
  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = e.pageX + 'px';
  menu.style.top = e.pageY + 'px';
  
  menu.innerHTML = `
    <div class="context-menu-item" data-action="rename">✏️ Переименовать</div>
    <div class="context-menu-item" data-action="delete">🗑️ Удалить папку</div>
  `;
  
  menu.onclick = (ev) => {
    const action = ev.target.dataset.action;
    if (action === 'rename') {
      const newName = prompt('Новое название папки:', folder.name);
      if (newName && newName.trim()) {
        renameTreeFolder(folderId, newName.trim());
      }
    } else if (action === 'delete') {
      deleteTreeFolder(folderId);
    }
    hideTreeContextMenu();
  };
  
  document.body.appendChild(menu);
  currentTreeContextMenu = menu;
}

function hideTreeContextMenu() {
  if (currentTreeContextMenu) {
    currentTreeContextMenu.remove();
    currentTreeContextMenu = null;
  }
}

function selectTree(id) {
  if (state.selectedTree === id) {
    state.selectedTree = null;
    document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('selected'));
    state.tool = 'select';
    document.querySelectorAll('.tool-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.tool === 'select');
    });
    updateHint();
    return;
  }
  
  state.selectedTree = id;
  state.selectedPlant = null;
  document.querySelectorAll('.tree-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
  document.querySelectorAll('.plant-item').forEach(el => el.classList.remove('selected'));
  
  state.tool = 'tree';
  document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
  updateHint();
}

function deleteTree(id) {
  const tree = trees.find(t => t.id === id);
  if (!tree) return;
  if (!confirm(`Удалить "${tree.name}"? Все посаженные деревья этого типа будут удалены.`)) return;

  trees = trees.filter(t => t.id !== id);
  state.objects = state.objects.filter(o => !(o.type === 'tree' && o.treeId === id));
  if (state.selectedTree === id) state.selectedTree = null;
  saveCustomTrees();
  renderTreeList();
  render();
}

function openTreeModal() {
  document.getElementById('treeModal').classList.add('show');
  document.getElementById('newTreeName').value = '';
  document.getElementById('newTreeColor').value = '#2e7d32';
  document.getElementById('newTreeShape').value = 'oak';
  document.getElementById('newTreeName').focus();
  renderTreeColorPresets();
  
  const folderSelect = document.getElementById('newTreeFolder');
  folderSelect.innerHTML = '<option value="">Без папки</option>';
  treeFolders.forEach(f => {
    folderSelect.innerHTML += `<option value="${f.id}">${f.name}</option>`;
  });
  
  updateTreeShapePreview('new');
}

function closeTreeModal() {
  document.getElementById('treeModal').classList.remove('show');
}

function renderTreeColorPresets() {
  const wrap = document.getElementById('treeColorPresets');
  wrap.innerHTML = '';
  COLOR_PRESETS.forEach(c => {
    const el = document.createElement('div');
    el.className = 'preset';
    el.style.background = c;
    if (c === '#ffffff') el.style.border = '2px solid #ccc';
    el.onclick = () => {
      document.getElementById('newTreeColor').value = c;
      updateTreeShapePreview('new');
    };
    wrap.appendChild(el);
  });
}

function saveNewTree() {
  const name = document.getElementById('newTreeName').value.trim();
  const color = document.getElementById('newTreeColor').value;
  const shape = document.getElementById('newTreeShape').value;
  const folderId = document.getElementById('newTreeFolder').value ? parseInt(document.getElementById('newTreeFolder').value) : null;
  
  if (!name) { alert('Введите название'); return; }
  
  const tree = { 
    id: 'custom_tree_' + (customTreeCounter++),
    name, color, custom: true,
    defaultShape: shape,
    folderId: folderId
  };
  
  trees.push(tree);
  saveCustomTrees();
  renderTreeList();
  closeTreeModal();
  selectTree(tree.id);
}

function openTreeModalInFolder(folderId) {
  openTreeModal();
  setTimeout(() => {
    const folderSelect = document.getElementById('newTreeFolder');
    if (folderSelect) {
      folderSelect.value = folderId.toString();
    }
  }, 0);
}

function openTreeSettings(treeId) {
  const tree = trees.find(t => t.id === treeId);
  if (!tree) return;
  
  currentTreeSettingsId = treeId;
  
  document.getElementById('settingsTreeName').value = tree.name;
  document.getElementById('settingsTreeColor').value = tree.color;
  document.getElementById('settingsTreeShape').value = tree.defaultShape || 'oak';
  
  const folderSelect = document.getElementById('settingsTreeFolder');
  folderSelect.innerHTML = '<option value="">Без папки</option>';
  treeFolders.forEach(f => {
    folderSelect.innerHTML += `<option value="${f.id}" ${tree.folderId === f.id ? 'selected' : ''}>${f.name}</option>`;
  });
  
  const deleteBtn = document.getElementById('settingsTreeDeleteBtn');
  deleteBtn.style.display = tree.custom ? 'block' : 'none';
  
  document.getElementById('treeSettingsModal').classList.add('show');
  
  updateTreeShapePreview('settings');
}

function closeTreeSettings() {
  document.getElementById('treeSettingsModal').classList.remove('show');
  currentTreeSettingsId = null;
}

function saveTreeSettings() {
  const tree = trees.find(t => t.id === currentTreeSettingsId);
  if (!tree) return;
  
  const name = document.getElementById('settingsTreeName').value.trim();
  const color = document.getElementById('settingsTreeColor').value;
  const shape = document.getElementById('settingsTreeShape').value;
  const folderId = document.getElementById('settingsTreeFolder').value ? parseInt(document.getElementById('settingsTreeFolder').value) : null;
  
  if (!name) { alert('Введите название'); return; }
  
  tree.name = name;
  tree.color = color;
  tree.defaultShape = shape;
  tree.folderId = folderId;
  
  saveCustomTrees();
  renderTreeList();
  closeTreeSettings();
  render();
}

function deleteTreeFromSettings() {
  if (!currentTreeSettingsId) return;
  deleteTree(currentTreeSettingsId);
  closeTreeSettings();
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
    stone: '🪨 Настройка камней',
    mulch: '🟫 Настройка мульчи'
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
  
  const shapeSelect = document.getElementById('mulchPopupShape');
  shapeSelect.value = mulchObj.shape || 'rect';
  
  const colorInput = document.getElementById('mulchPopupColor');
  colorInput.value = mulchObj.fill;
  
  const bed = state.objects.find(o => o.id === mulchObj.bedId);
  const pos = bed ? getRelativeScreenPos(svg, bed.points[0][0], bed.points[0][1], canvasWrap) : { x: 100, y: 100 };
  
  const popupWidth = 260;
  let finalX = pos.x + 40;
  let finalY = Math.max(10, pos.y - 30);
  
  if (finalX + popupWidth > canvasWrap.clientWidth) {
    finalX = pos.x - popupWidth - 40;
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
  
  shapeSelect.onchange = () => {
    mulchObj.shape = shapeSelect.value;
    render();
  };
  
  colorInput.oninput = () => {
    mulchObj.fill = colorInput.value;
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

// ===== КАРТА ЦВЕТЕНИЯ =====

function openBloomMap() {
  document.getElementById('bloomMapModal').classList.add('show');
  
  const startMonthSelect = document.getElementById('bloomFilterStartMonth');
  const endMonthSelect = document.getElementById('bloomFilterEndMonth');
  const startMonthSelect2 = document.getElementById('bloomFilterStartMonth2');
  const startDayInput = document.getElementById('bloomFilterStartDay');
  const endMonthSelect2 = document.getElementById('bloomFilterEndMonth2');
  const endDayInput = document.getElementById('bloomFilterEndDay');
  
  fillMonthSelect(startMonthSelect, true);
  fillMonthSelect(endMonthSelect, true);
  fillMonthSelect(startMonthSelect2, false);
  fillMonthSelect(endMonthSelect2, false);
  
  if (state.bloomFilter) {
    if (state.bloomFilter.start.month) {
      document.querySelector('input[name="filterBloomMode"][value="months"]').checked = true;
      startMonthSelect.value = state.bloomFilter.start.month;
      endMonthSelect.value = state.bloomFilter.end.month || '';
      startMonthSelect2.value = '';
      startDayInput.value = '';
      endMonthSelect2.value = '';
      endDayInput.value = '';
    } else if (state.bloomFilter.start.date) {
      document.querySelector('input[name="filterBloomMode"][value="dates"]').checked = true;
      startMonthSelect.value = '';
      endMonthSelect.value = '';
      startMonthSelect2.value = getMonthFromStr(state.bloomFilter.start.date) || '';
      startDayInput.value = getDayFromStr(state.bloomFilter.start.date) || '';
      endMonthSelect2.value = getMonthFromStr(state.bloomFilter.end.date) || '';
      endDayInput.value = getDayFromStr(state.bloomFilter.end.date) || '';
    }
  } else {
    document.querySelector('input[name="filterBloomMode"][value="months"]').checked = true;
    startMonthSelect.value = '';
    endMonthSelect.value = '';
    startMonthSelect2.value = '';
    startDayInput.value = '';
    endMonthSelect2.value = '';
    endDayInput.value = '';
  }
  
  toggleFilterBloomMode();
}

function closeBloomMap() {
  document.getElementById('bloomMapModal').classList.remove('show');
}

function clearBloomFilter() {
  state.bloomFilter = null;
  closeBloomMap();
  render();
}

function applyBloomFilter() {
  const mode = document.querySelector('input[name="filterBloomMode"]:checked').value;
  
  if (mode === 'months') {
    const startMonth = document.getElementById('bloomFilterStartMonth').value ? parseInt(document.getElementById('bloomFilterStartMonth').value) : null;
    const endMonth = document.getElementById('bloomFilterEndMonth').value ? parseInt(document.getElementById('bloomFilterEndMonth').value) : null;
    
    if (!startMonth && !endMonth) {
      state.bloomFilter = null;
    } else {
      state.bloomFilter = {
        start: { month: startMonth },
        end: { month: endMonth || startMonth }
      };
    }
  } else {
    const sm = document.getElementById('bloomFilterStartMonth2').value ? parseInt(document.getElementById('bloomFilterStartMonth2').value) : null;
    const sd = document.getElementById('bloomFilterStartDay').value ? parseInt(document.getElementById('bloomFilterStartDay').value) : 1;
    const em = document.getElementById('bloomFilterEndMonth2').value ? parseInt(document.getElementById('bloomFilterEndMonth2').value) : null;
    const ed = document.getElementById('bloomFilterEndDay').value ? parseInt(document.getElementById('bloomFilterEndDay').value) : null;
    
    const startDate = sm ? makeDateStr(sm, sd) : null;
    const endDate = em ? makeDateStr(em, ed || (DAYS_IN_MONTH[em] || 31)) : null;
    
    if (!startDate && !endDate) {
      state.bloomFilter = null;
    } else {
      state.bloomFilter = {
        start: { date: startDate },
        end: { date: endDate || startDate }
      };
    }
  }
  
  closeBloomMap();
  render();
}