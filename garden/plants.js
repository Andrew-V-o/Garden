// ===== РАСТЕНИЯ: СПИСОК, МОДАЛКА, POPUP =====

let currentSettingsPlantId = null;
let currentContextMenu = null;

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
  
  // Кнопка создания папки
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
  
  // === СЕКЦИЯ ПАПОК ===
  if (folders.length > 0) {
    const foldersSectionHeader = document.createElement('div');
    foldersSectionHeader.className = 'section-header';
    foldersSectionHeader.textContent = ' Папки';
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
        
        // Кнопка добавления нового цветка в папку
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
  
  // === СЕКЦИЯ ОТДЕЛЬНЫХ РАСТЕНИЙ ===
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
  
  // Кнопка добавления нового растения (без папки)
  const addBtn = document.createElement('div');
  addBtn.className = 'add-plant-btn';
  addBtn.textContent = '➕ Свой цветок';
  addBtn.onclick = openPlantModal;
  list.appendChild(addBtn);
  
  document.addEventListener('click', () => {
    hideContextMenu();
  });
}

// Открыть модалку создания нового растения с уже выбранной папкой
function openPlantModalInFolder(folderId) {
  openPlantModal();
  // После открытия модалки устанавливаем выбранную папку
  setTimeout(() => {
    const folderSelect = document.getElementById('newPlantFolder');
    if (folderSelect) {
      folderSelect.value = folderId.toString();
    }
  }, 0);
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
  document.querySelectorAll('.plant-item').forEach(el => {
    el.classList.toggle('selected', el.dataset.id === id);
  });
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

  const svgRect = svg.getBoundingClientRect();
  const wrapRect = canvasWrap.getBoundingClientRect();
  const x = planting.x + svgRect.left - wrapRect.left + canvasWrap.scrollLeft;
  const y = planting.y + svgRect.top - wrapRect.top + canvasWrap.scrollTop;

  popup.style.left = (x + 20) + 'px';
  popup.style.top = (y - 50) + 'px';
  popup.classList.add('show');

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

document.addEventListener('click', (e) => {
  const popup = document.getElementById('plantPopup');
  if (popup.classList.contains('show') && !popup.contains(e.target)) {
    const target = e.target.closest('[data-planting-id]');
    if (!target) {
      closePlantPopup();
    }
  }
});

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