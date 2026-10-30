// ===== 3D РАСТЕНИЯ И ДЕРЕВЬЯ =====

function buildThreePlants() {
  state.objects.forEach(obj => {
    if (obj.type === 'tree') {
      buildThreeTree(obj);
    } else if (obj.type === 'bed' && obj.plants) {
      obj.plants.forEach(pl => buildThreePlant(pl, obj));
    }
  });
}

function buildThreeTree(treeObj) {
  const tree = trees.find(t => t.id === treeObj.treeId);
  const color = new THREE.Color(tree ? tree.color : '#2e7d32');
  const r = treeObj.r / state.scale; // радиус в метрах
  
  const group = new THREE.Group();
  group.position.set(
    (treeObj.x - getObjBBox(state.objects.find(o => o.type === 'plot')).x) / state.scale - 25,
    getBlockHeightAt(treeObj.x, treeObj.y),
    (treeObj.y - getObjBBox(state.objects.find(o => o.type === 'plot')).y) / state.scale - 25
  );
  
  // Ствол
  const trunkHeight = r * 1.5;
  const trunkRadius = r * 0.15;
  const trunkGeo = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 8);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  group.add(trunk);
  
  // Крона (зависит от типа дерева)
  const crownGeo = new THREE.SphereGeometry(r * 0.8, 12, 12);
  const crownMat = new THREE.MeshLambertMaterial({ color: color });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.y = trunkHeight + r * 0.6;
  crown.castShadow = true;
  group.add(crown);
  
  threeScene.add(group);
}

function buildThreePlant(planting, bedObj) {
  const plant = plants.find(p => p.id === planting.plantId);
  if (!plant) return;
  
  const color = new THREE.Color(plant.color);
  const r = planting.r / state.scale;
  
  const group = new THREE.Group();
  const plot = state.objects.find(o => o.type === 'plot');
  const bbox = getObjBBox(plot);
  
  group.position.set(
    (planting.x - bbox.x) / state.scale - bbox.w / state.scale / 2,
    getBlockHeightAt(planting.x, planting.y) + 0.1,
    (planting.y - bbox.y) / state.scale - bbox.h / state.scale / 2
  );
  
  // Стебель
  const stemHeight = (plant.height || 50) / 100; // см -> м
  const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, stemHeight, 6);
  const stemMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.y = stemHeight / 2;
  group.add(stem);
  
  // Цветок
  const flowerSize = r * 0.5;
  const flowerGeo = new THREE.SphereGeometry(flowerSize, 8, 8);
  const flowerMat = new THREE.MeshLambertMaterial({ color: color });
  const flower = new THREE.Mesh(flowerGeo, flowerMat);
  flower.position.y = stemHeight + flowerSize;
  flower.castShadow = true;
  group.add(flower);
  
  threeScene.add(group);
}

function getBlockHeightAt(x, y) {
  const plot = state.objects.find(o => o.type === 'plot');
  if (!plot || !state.terrainBlocks) return 0;
  
  const bbox = getObjBBox(plot);
  const plotWidth = bbox.w / state.scale;
  const plotHeight = bbox.h / state.scale;
  const gridSize = state.terrainBlocks.gridSize || 3;
  
  const relX = (x - bbox.x) / state.scale;
  const relY = (y - bbox.y) / state.scale;
  
  const blockX = Math.floor(relX / plotWidth * gridSize);
  const blockY = Math.floor(relY / plotHeight * gridSize);
  
  const block = state.terrainBlocks.blocks.find(b => b.x === blockX && b.y === blockY);
  return block ? block.height : 0;
}