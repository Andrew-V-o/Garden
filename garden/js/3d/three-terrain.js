// ===== 3D TERRAIN =====

function buildTerrain() {
  if (!state.terrainBlocks) {
    state.terrainBlocks = {
      gridSize: 3,
      blocks: []
    };
  }
  
  const gridSize = state.terrainBlocks.gridSize || 3;
  const plot = state.objects.find(o => o.type === 'plot');
  if (!plot) return;
  
  const bbox = getObjBBox(plot);
  const plotWidth = bbox.w / state.scale; // в метрах
  const plotHeight = bbox.h / state.scale;
  
  const blockSizeX = plotWidth / gridSize;
  const blockSizeZ = plotHeight / gridSize;
  
  // Инициализируем блоки если нужно
  if (state.terrainBlocks.blocks.length === 0) {
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        state.terrainBlocks.blocks.push({
          x: i, y: j,
          height: 0,
          tiltX: 0,
          tiltZ: 0
        });
      }
    }
  }
  
  // Создаём mesh для каждого блока
  state.terrainBlocks.blocks.forEach((block, idx) => {
    const geometry = new THREE.BoxGeometry(blockSizeX, 1, blockSizeZ);
    const material = new THREE.MeshLambertMaterial({ 
      color: 0x7cb342,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(geometry, material);
    
    // Позиция в центре блока
    const centerX = (block.x + 0.5) * blockSizeX - plotWidth / 2;
    const centerZ = (block.y + 0.5) * blockSizeZ - plotHeight / 2;
    
    mesh.position.set(centerX, block.height / 2, centerZ);
    mesh.scale.y = Math.max(0.1, block.height);
    mesh.rotation.x = THREE.MathUtils.degToRad(block.tiltX || 0);
    mesh.rotation.z = THREE.MathUtils.degToRad(block.tiltZ || 0);
    
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { blockIndex: idx, block: block };
    
    threeScene.add(mesh);
    blockMeshes.push(mesh);
    
    // Добавляем верхнюю травяную поверхность
    const topGeometry = new THREE.BoxGeometry(blockSizeX * 0.98, 0.1, blockSizeZ * 0.98);
    const topMaterial = new THREE.MeshLambertMaterial({ color: 0x8bc34a });
    const topMesh = new THREE.Mesh(topGeometry, topMaterial);
    topMesh.position.set(0, 0.5, 0);
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    mesh.add(topMesh);
  });
  
  // Добавляем основание (землю под блоками)
  const baseGeometry = new THREE.BoxGeometry(plotWidth, 0.5, plotHeight);
  const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
  const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
  baseMesh.position.set(0, -0.25, 0);
  baseMesh.receiveShadow = true;
  threeScene.add(baseMesh);
}

function updateBlockMesh(blockIndex) {
  const mesh = blockMeshes[blockIndex];
  if (!mesh) return;
  
  const block = state.terrainBlocks.blocks[blockIndex];
  const gridSize = state.terrainBlocks.gridSize || 3;
  const plot = state.objects.find(o => o.type === 'plot');
  if (!plot) return;
  
  const bbox = getObjBBox(plot);
  const plotWidth = bbox.w / state.scale;
  const plotHeight = bbox.h / state.scale;
  const blockSizeX = plotWidth / gridSize;
  const blockSizeZ = plotHeight / gridSize;
  
  const centerX = (block.x + 0.5) * blockSizeX - plotWidth / 2;
  const centerZ = (block.y + 0.5) * blockSizeZ - plotHeight / 2;
  
  mesh.position.set(centerX, block.height / 2, centerZ);
  mesh.scale.y = Math.max(0.1, block.height);
  mesh.rotation.x = THREE.MathUtils.degToRad(block.tiltX || 0);
  mesh.rotation.z = THREE.MathUtils.degToRad(block.tiltZ || 0);
}

function rebuildTerrain() {
  // Удаляем старые блоки
  blockMeshes.forEach(mesh => {
    threeScene.remove(mesh);
    if (mesh.geometry) mesh.geometry.dispose();
    if (mesh.material) mesh.material.dispose();
  });
  blockMeshes = [];
  
  // Перестраиваем
  buildTerrain();
}