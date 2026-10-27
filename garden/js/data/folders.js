// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ПАПКАМИ РАСТЕНИЙ =====

function createFolder(name) {
  const folder = { id: nextFolderId++, name: name, color: '#4a7c59' };
  folders.push(folder);
  state.expandedFolders.add(folder.id);
  saveFolders();
  renderPlantList();
}

function deleteFolder(folderId) {
  if (!confirm('Удалить папку? Растения останутся без папки.')) return;
  folders = folders.filter(f => f.id !== folderId);
  plants.forEach(p => { if (p.folderId === folderId) p.folderId = null; });
  state.expandedFolders.delete(folderId);
  saveFolders();
  renderPlantList();
}

function renameFolder(folderId, newName) {
  const folder = folders.find(f => f.id === folderId);
  if (folder) { folder.name = newName; saveFolders(); renderPlantList(); }
}

function toggleFolder(folderId) {
  if (state.expandedFolders.has(folderId)) state.expandedFolders.delete(folderId);
  else state.expandedFolders.add(folderId);
  renderPlantList();
}

function saveFolders() {
  localStorage.setItem('plantFolders', JSON.stringify(folders));
  localStorage.setItem('nextFolderId', nextFolderId.toString());
}

function loadFolders() {
  const saved = localStorage.getItem('plantFolders');
  if (saved) {
    try {
      folders = JSON.parse(saved);
      nextFolderId = parseInt(localStorage.getItem('nextFolderId') || '1');
    } catch (e) { folders = []; }
  }
}

// ===== ФУНКЦИИ ДЛЯ РАБОТЫ С ПАПКАМИ ДЕРЕВЬЕВ =====

function createTreeFolder(name) {
  const folder = { id: nextTreeFolderId++, name: name, color: '#2e7d32' };
  treeFolders.push(folder);
  state.expandedTreeFolders.add(folder.id);
  saveTreeFolders();
  renderTreeList();
}

function deleteTreeFolder(folderId) {
  if (!confirm('Удалить папку? Деревья останутся без папки.')) return;
  treeFolders = treeFolders.filter(f => f.id !== folderId);
  trees.forEach(t => { if (t.folderId === folderId) t.folderId = null; });
  state.expandedTreeFolders.delete(folderId);
  saveTreeFolders();
  renderTreeList();
}

function renameTreeFolder(folderId, newName) {
  const folder = treeFolders.find(f => f.id === folderId);
  if (folder) { folder.name = newName; saveTreeFolders(); renderTreeList(); }
}

function toggleTreeFolder(folderId) {
  if (state.expandedTreeFolders.has(folderId)) state.expandedTreeFolders.delete(folderId);
  else state.expandedTreeFolders.add(folderId);
  renderTreeList();
}

function saveTreeFolders() {
  localStorage.setItem('treeFolders', JSON.stringify(treeFolders));
  localStorage.setItem('nextTreeFolderId', nextTreeFolderId.toString());
}

function loadTreeFolders() {
  const saved = localStorage.getItem('treeFolders');
  if (saved) {
    try {
      treeFolders = JSON.parse(saved);
      nextTreeFolderId = parseInt(localStorage.getItem('nextTreeFolderId') || '1');
    } catch (e) { treeFolders = []; }
  }
}

// ===== ЗАГРУЗКА/СОХРАНЕНИЕ КАСТОМНЫХ РАСТЕНИЙ И ДЕРЕВЬЕВ =====

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