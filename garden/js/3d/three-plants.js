// ===== 3D РАСТЕНИЯ И ДЕРЕВЬЯ С ПРИВЯЗКОЙ К РЕЛЬЕФУ =====

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
  const r = treeObj.r / state.scale;
  
  const plot = state.objects.find(o => o.type === 'plot');
  const bbox = getObjBBox(plot);
  
  // Мировые координаты
  const worldX = (treeObj.x - bbox.x) / state.scale - bbox.w / state.scale / 2;
  const worldZ = (treeObj.y - bbox.y) / state.scale - bbox.h / state.scale / 2;
  const worldY = getSmoothHeightAt(worldX, worldZ);
  
  const group = new THREE.Group();
  group.position.set(worldX, worldY, worldZ);
  
  // Ствол
  const trunkHeight = r * 1.5;
  const trunkRadius = r * 0.15;
  const trunkGeo = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 8);
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = trunkHeight / 2;
  trunk.castShadow = true;
  group.add(trunk);
  
  // Крона (разные формы для разных деревьев)
  let crownGeo;
  const shape = tree?.defaultShape || 'oak';
  
  switch (shape) {
    case 'pine':
    case 'spruce':
      crownGeo = new THREE.ConeGeometry(r * 0.7, r * 1.8, 8);
      break;
    case 'willow':
      crownGeo = new THREE.SphereGeometry(r * 0.9, 12, 12);
      crownGeo.scale(1, 0.7, 1);
      break;
    case 'palm':
      crownGeo = new THREE.SphereGeometry(r * 0.8, 12, 8);
      crownGeo.scale(1.3, 0.5, 1.3);
      break;
    default:
      crownGeo = new THREE.SphereGeometry(r * 0.8, 12, 12);
  }
  
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
  
  const plot = state.objects.find(o => o.type === 'plot');
  const bbox = getObjBBox(plot);
  
  const worldX = (planting.x - bbox.x) / state.scale - bbox.w / state.scale / 2;
  const worldZ = (planting.y - bbox.y) / state.scale - bbox.h / state.scale / 2;
  const worldY = getSmoothHeightAt(worldX, worldZ);
  
  const group = new THREE.Group();
  group.position.set(worldX, worldY, worldZ);
  
  // Стебель
  const stemHeight = (plant.height || 50) / 100;
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

// Функция для получения высоты в точке (используется другими модулями)
function getBlockHeightAt(x, y) {
  const plot = state.objects.find(o => o.type === 'plot');
  if (!plot) return 0;
  
  const bbox = getObjBBox(plot);
  const worldX = (x - bbox.x) / state.scale - bbox.w / state.scale / 2;
  const worldZ = (y - bbox.y) / state.scale - bbox.h / state.scale / 2;
  
  return getSmoothHeightAt(worldX, worldZ);
}