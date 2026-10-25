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
  addBtn.textContent = ' Свой цветок';
  addBtn.onclick = openPlantModal;
  list.appendChild(addBtn);
}

// Отмена выбора при повторном клике на то же растение
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

// ===== МОДАЛКА ДОБАВЛЕНИЯ =====
function openPlantModal() {
  document.getElementById('plantModal').classList.add('show');
  document.getElementById('newPlantName').value = '';
  document.getElementById('newPlantColor').value = '#ff69b4';
  document.getElementById('colorPreview').style.background = '#ff69b4';
  document.getElementById('newPlantName').focus();
  renderColorPresets();
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
  if (!name) { alert('Введите название'); return; }
  const id = 'custom_' + (customPlantCounter++);
  plants.push({ id, name, color, custom: true });
  saveCustomPlants();
  renderPlantList();
  closePlantModal();
  selectPlant(id);
}

// ===== POPUP НАСТРОЙКИ ЦВЕТКА =====
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