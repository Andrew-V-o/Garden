// ===== РАСТЕНИЯ: СПИСОК, МОДАЛКА, POPUP =====

function loadCustomPlants() {
  const saved = localStorage.getItem('customPlants');
  if (saved) {
    try {
      const customs = JSON.parse(saved);
      plants = [...DEFAULT_PLANTS, ...customs];
      customPlantCounter = customs.length + 1;
    } catch (e) { }
  }
}

function saveCustomPlants() {
  localStorage.setItem('customPlants', JSON.stringify(plants.filter(p => p.custom)));
}

// Заполнить select месяцами
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

function renderPlantList() {
  const list = document.getElementById('plantList');
  list.innerHTML = '';
  plants.forEach(p => {
    const el = document.createElement('div');
    el.className = 'plant-item' + (state.selectedPlant === p.id ? ' selected' : '');
    el.dataset.id = p.id;
    el.innerHTML = `
      <div class="plant-dot" style="background:${p.color}${p.color === '#ffffff' ? ';border:1px solid #ccc' : ''}"></div>
      ${p.name}
      <button class="plant-del" title="Удалить">×</button>
    `;
    el.onclick = (e) => {
      if (e.target.classList.contains('plant-del')) {
        e.stopPropagation();
        deletePlant(p.id);
        return;
      }
      selectPlant(p.id);
    };
    list.appendChild(el);
  });
  const addBtn = document.createElement('div');
  addBtn.className = 'add-plant-btn';
  addBtn.textContent = '➕ Свой цветок';
  addBtn.onclick = openPlantModal;
  list.appendChild(addBtn);
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

// ===== ПЕРЕКЛЮЧЕНИЕ РЕЖИМОВ С КОНВЕРТАЦИЕЙ =====

function toggleBloomMode() {
  const mode = document.querySelector('input[name="bloomMode"]:checked').value;
  document.getElementById('bloomMonthsSection').style.display = mode === 'months' ? 'flex' : 'none';
  document.getElementById('bloomDatesSection').style.display = mode === 'dates' ? 'flex' : 'none';
  
  const plant = plants.find(p => {
    const obj = state.objects.find(o => o.id === state.selectedId);
    return obj && obj.plants && obj.plants.find(pl => pl.id === state.selectedPlantingId)?.plantId === p.id;
  });
  
  if (!plant) return;
  
  if (mode === 'months') {
    // Конвертируем даты в месяцы
    if (plant.bloomStartDate) {
      plant.bloomStartMonth = getMonthFromStr(plant.bloomStartDate);
      plant.bloomStartDate = null;
    }
    if (plant.bloomEndDate) {
      plant.bloomEndMonth = getMonthFromStr(plant.bloomEndDate);
      plant.bloomEndDate = null;
    }
    saveCustomPlants();
    
    const s = document.getElementById('popupBloomStartMonth');
    const e = document.getElementById('popupBloomEndMonth');
    s.value = plant.bloomStartMonth || '';
    e.value = plant.bloomEndMonth || '';
  } else {
    // Конвертируем месяцы в даты
    if (plant.bloomStartMonth) {
      plant.bloomStartDate = monthToStartDate(plant.bloomStartMonth);
      plant.bloomStartMonth = null;
    }
    if (plant.bloomEndMonth) {
      plant.bloomEndDate = monthToEndDate(plant.bloomEndMonth);
      plant.bloomEndMonth = null;
    }
    saveCustomPlants();
    
    const sm = document.getElementById('popupBloomStartMonth2');
    const sd = document.getElementById('popupBloomStartDay');
    const em = document.getElementById('popupBloomEndMonth2');
    const ed = document.getElementById('popupBloomEndDay');
    
    if (plant.bloomStartDate) {
      sm.value = getMonthFromStr(plant.bloomStartDate);
      sd.value = getDayFromStr(plant.bloomStartDate);
    }
    if (plant.bloomEndDate) {
      em.value = getMonthFromStr(plant.bloomEndDate);
      ed.value = getDayFromStr(plant.bloomEndDate);
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
  
  // Конвертация при переключении
  const startMonthSelect = document.getElementById('bloomFilterStartMonth');
  const endMonthSelect = document.getElementById('bloomFilterEndMonth');
  const startMonthSelect2 = document.getElementById('bloomFilterStartMonth2');
  const startDayInput = document.getElementById('bloomFilterStartDay');
  const endMonthSelect2 = document.getElementById('bloomFilterEndMonth2');
  const endDayInput = document.getElementById('bloomFilterEndDay');
  
  if (mode === 'months') {
    // Из дат в месяцы
    const startDate = startMonthSelect2.value ? makeDateStr(parseInt(startMonthSelect2.value), parseInt(startDayInput.value) || 1) : null;
    const endDate = endMonthSelect2.value ? makeDateStr(parseInt(endMonthSelect2.value), parseInt(endDayInput.value) || 1) : null;
    
    if (startDate) startMonthSelect.value = getMonthFromStr(startDate);
    if (endDate) endMonthSelect.value = getMonthFromStr(endDate);
    
    startDayInput.value = '';
    endDayInput.value = '';
  } else {
    // Из месяцев в даты
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
  document.getElementById('colorPreview').style.background = '#ff69b4';
  document.getElementById('newPlantBloomStartDay').value = '';
  document.getElementById('newPlantBloomEndDay').value = '';
  document.getElementById('newPlantName').focus();
  renderColorPresets();
  
  fillMonthSelect(document.getElementById('newPlantBloomStartMonth'), true, 5);
  fillMonthSelect(document.getElementById('newPlantBloomEndMonth'), true, 9);
  fillMonthSelect(document.getElementById('newPlantBloomStartMonth2'), false, 5);
  fillMonthSelect(document.getElementById('newPlantBloomEndMonth2'), false, 9);
  
  document.querySelector('input[name="newBloomMode"][value="months"]').checked = true;
  toggleNewBloomMode();
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
      document.getElementById('colorPreview').style.background = c;
    };
    wrap.appendChild(el);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('newPlantColor').addEventListener('input', (e) => {
    document.getElementById('colorPreview').style.background = e.target.value;
  });
});

function saveNewPlant() {
  const name = document.getElementById('newPlantName').value.trim();
  const color = document.getElementById('newPlantColor').value;
  const mode = document.querySelector('input[name="newBloomMode"]:checked').value;
  
  if (!name) { alert('Введите название'); return; }
  
  const plant = { 
    id: 'custom_' + (customPlantCounter++),
    name, color, custom: true
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
  const plant = plants.find(p => p.id === planting.plantId);

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
  
  // Заполняем селекты месяцев
  fillMonthSelect(bloomStartMonthSelect, true);
  fillMonthSelect(bloomEndMonthSelect, true);
  fillMonthSelect(bloomStartMonthSelect2, false);
  fillMonthSelect(bloomEndMonthSelect2, false);
  
  if (plant) {
    bloomStartMonthSelect.value = plant.bloomStartMonth || '';
    bloomEndMonthSelect.value = plant.bloomEndMonth || '';
    
    if (plant.bloomStartDate) {
      bloomStartMonthSelect2.value = getMonthFromStr(plant.bloomStartDate);
      bloomStartDayInput.value = getDayFromStr(plant.bloomStartDate);
    } else {
      bloomStartMonthSelect2.value = '';
      bloomStartDayInput.value = '';
    }
    if (plant.bloomEndDate) {
      bloomEndMonthSelect2.value = getMonthFromStr(plant.bloomEndDate);
      bloomEndDayInput.value = getDayFromStr(plant.bloomEndDate);
    } else {
      bloomEndMonthSelect2.value = '';
      bloomEndDayInput.value = '';
    }
    
    if (plant.bloomStartMonth || plant.bloomEndMonth) {
      document.querySelector('input[name="bloomMode"][value="months"]').checked = true;
    } else if (plant.bloomStartDate || plant.bloomEndDate) {
      document.querySelector('input[name="bloomMode"][value="dates"]').checked = true;
    } else {
      document.querySelector('input[name="bloomMode"][value="months"]').checked = true;
    }
  } else {
    bloomStartMonthSelect.value = '';
    bloomEndMonthSelect.value = '';
    bloomStartMonthSelect2.value = '';
    bloomStartDayInput.value = '';
    bloomEndMonthSelect2.value = '';
    bloomEndDayInput.value = '';
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
    planting.plantId = plantSelect.value;
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
    const p = plants.find(x => x.id === planting.plantId);
    if (p) {
      p.bloomStartMonth = bloomStartMonthSelect.value ? parseInt(bloomStartMonthSelect.value) : null;
      saveCustomPlants();
    }
  };
  bloomEndMonthSelect.onchange = () => {
    const p = plants.find(x => x.id === planting.plantId);
    if (p) {
      p.bloomEndMonth = bloomEndMonthSelect.value ? parseInt(bloomEndMonthSelect.value) : null;
      saveCustomPlants();
    }
  };
  bloomStartMonthSelect2.onchange = () => {
    const p = plants.find(x => x.id === planting.plantId);
    if (p) {
      const m = bloomStartMonthSelect2.value ? parseInt(bloomStartMonthSelect2.value) : null;
      const d = bloomStartDayInput.value ? parseInt(bloomStartDayInput.value) : 1;
      p.bloomStartDate = m ? makeDateStr(m, d) : null;
      saveCustomPlants();
    }
  };
  bloomStartDayInput.onchange = () => {
    const p = plants.find(x => x.id === planting.plantId);
    if (p) {
      const m = bloomStartMonthSelect2.value ? parseInt(bloomStartMonthSelect2.value) : null;
      const d = bloomStartDayInput.value ? parseInt(bloomStartDayInput.value) : 1;
      p.bloomStartDate = m ? makeDateStr(m, d) : null;
      saveCustomPlants();
    }
  };
  bloomEndMonthSelect2.onchange = () => {
    const p = plants.find(x => x.id === planting.plantId);
    if (p) {
      const m = bloomEndMonthSelect2.value ? parseInt(bloomEndMonthSelect2.value) : null;
      const d = bloomEndDayInput.value ? parseInt(bloomEndDayInput.value) : (m ? (DAYS_IN_MONTH[m] || 31) : null);
      p.bloomEndDate = m ? makeDateStr(m, d) : null;
      saveCustomPlants();
    }
  };
  bloomEndDayInput.onchange = () => {
    const p = plants.find(x => x.id === planting.plantId);
    if (p) {
      const m = bloomEndMonthSelect2.value ? parseInt(bloomEndMonthSelect2.value) : null;
      const d = bloomEndDayInput.value ? parseInt(bloomEndDayInput.value) : (m ? (DAYS_IN_MONTH[m] || 31) : null);
      p.bloomEndDate = m ? makeDateStr(m, d) : null;
      saveCustomPlants();
    }
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