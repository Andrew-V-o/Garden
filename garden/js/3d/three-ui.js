// ===== 3D UI =====

function selectBlock(blockIndex) {
  // Снимаем выделение со старого
  if (selectedBlock !== null && blockMeshes[selectedBlock]) {
    blockMeshes[selectedBlock].material.emissive = new THREE.Color(0x000000);
  }
  
  selectedBlock = blockIndex;
  const block = state.terrainBlocks.blocks[blockIndex];
  
  // Подсвечиваем новый
  if (blockMeshes[blockIndex]) {
    blockMeshes[blockIndex].material.emissive = new THREE.Color(0x444444);
  }
  
  // Показываем панель
  document.getElementById('blockPanel').classList.add('active');
  document.getElementById('blockInfo').textContent = 
    `Блок [${block.x}, ${block.y}]`;
  document.getElementById('blockControls').style.display = 'block';
  
  // Устанавливаем значения
  document.getElementById('blockHeight').value = block.height;
  document.getElementById('blockHeightVal').textContent = block.height.toFixed(1);
  document.getElementById('blockTiltX').value = block.tiltX || 0;
  document.getElementById('blockTiltXVal').textContent = (block.tiltX || 0) + '°';
  document.getElementById('blockTiltZ').value = block.tiltZ || 0;
  document.getElementById('blockTiltZVal').textContent = (block.tiltZ || 0) + '°';
}

function deselectBlock() {
  if (selectedBlock !== null && blockMeshes[selectedBlock]) {
    blockMeshes[selectedBlock].material.emissive = new THREE.Color(0x000000);
  }
  selectedBlock = null;
  document.getElementById('blockPanel').classList.remove('active');
}

function onBlockHeightChange(e) {
  if (selectedBlock === null) return;
  const val = parseFloat(e.target.value);
  document.getElementById('blockHeightVal').textContent = val.toFixed(1);
  state.terrainBlocks.blocks[selectedBlock].height = val;
  updateBlockMesh(selectedBlock);
}

function onBlockTiltXChange(e) {
  if (selectedBlock === null) return;
  const val = parseInt(e.target.value);
  document.getElementById('blockTiltXVal').textContent = val + '°';
  state.terrainBlocks.blocks[selectedBlock].tiltX = val;
  updateBlockMesh(selectedBlock);
}

function onBlockTiltZChange(e) {
  if (selectedBlock === null) return;
  const val = parseInt(e.target.value);
  document.getElementById('blockTiltZVal').textContent = val + '°';
  state.terrainBlocks.blocks[selectedBlock].tiltZ = val;
  updateBlockMesh(selectedBlock);
}

function resetBlock() {
  if (selectedBlock === null) return;
  state.terrainBlocks.blocks[selectedBlock].height = 0;
  state.terrainBlocks.blocks[selectedBlock].tiltX = 0;
  state.terrainBlocks.blocks[selectedBlock].tiltZ = 0;
  updateBlockMesh(selectedBlock);
  selectBlock(selectedBlock); // Обновить UI
}

function applyToAll() {
  if (selectedBlock === null) return;
  const block = state.terrainBlocks.blocks[selectedBlock];
  state.terrainBlocks.blocks.forEach((b, idx) => {
    b.height = block.height;
    b.tiltX = block.tiltX;
    b.tiltZ = block.tiltZ;
    updateBlockMesh(idx);
  });
}

function setGridSize(size) {
  state.terrainBlocks = {
    gridSize: size,
    blocks: []
  };
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      state.terrainBlocks.blocks.push({
        x: i, y: j,
        height: 0,
        tiltX: 0,
        tiltZ: 0
      });
    }
  }
  rebuildTerrain();
  deselectBlock();
}

// Привязка обработчиков
document.addEventListener('DOMContentLoaded', () => {
  const bh = document.getElementById('blockHeight');
  const btx = document.getElementById('blockTiltX');
  const btz = document.getElementById('blockTiltZ');
  if (bh) bh.addEventListener('input', onBlockHeightChange);
  if (btx) btx.addEventListener('input', onBlockTiltXChange);
  if (btz) btz.addEventListener('input', onBlockTiltZChange);
});