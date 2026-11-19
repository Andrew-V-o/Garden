/* ==================== FILE: js/3d/three-plants.js ==================== */
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
    if (!tree) return;

    const r = treeObj.r / state.scale;
    const plot = state.objects.find(o => o.type === 'plot');
    const bbox = getObjBBox(plot);
    
    const worldX = (treeObj.x - bbox.x) / state.scale - bbox.w / state.scale / 2;
    const worldZ = (treeObj.y - bbox.y) / state.scale - bbox.h / state.scale / 2;
    const worldY = getSmoothHeightAt(worldX, worldZ);

    // ★ ЕСЛИ URL УЖЕ ЕСТЬ (например, после успешной генерации или загрузки из кэша), рисуем сразу его
    if (tree.model3dUrl) {
        loadGLTFModel(tree.model3dUrl, worldX, worldY, worldZ, r);
        return;
    }

    // --- СТАНДАРТНАЯ ГЕОМЕТРИЯ (FALLBACK) ---
    const color = new THREE.Color(tree.color || '#2e7d32');
    const group = new THREE.Group();
    group.position.set(worldX, worldY, worldZ);
    
    const trunkHeight = r * 1.5;
    const trunkRadius = r * 0.15;
    const trunkGeo = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.2, trunkHeight, 8);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5d4037 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = trunkHeight / 2;
    trunk.castShadow = true;
    group.add(trunk);
    
    let crownGeo;
    const shape = tree.defaultShape || 'oak';
    switch (shape) {
        case 'pine': case 'spruce': crownGeo = new THREE.ConeGeometry(r * 0.7, r * 1.8, 8); break;
        case 'willow': crownGeo = new THREE.SphereGeometry(r * 0.9, 12, 12); crownGeo.scale(1, 0.7, 1); break;
        case 'palm': crownGeo = new THREE.SphereGeometry(r * 0.8, 12, 8); crownGeo.scale(1.3, 0.5, 1.3); break;
        default: crownGeo = new THREE.SphereGeometry(r * 0.8, 12, 12);
    }
    const crownMat = new THREE.MeshLambertMaterial({ color: color });
    const crown = new THREE.Mesh(crownGeo, crownMat);
    crown.position.y = trunkHeight + r * 0.6;
    crown.castShadow = true;
    group.add(crown);
    
    threeScene.add(group);

    // ★ СОХРАНЯЕМ ССЫЛКУ для возможной фоновой замены
    tree.threeJsGroupRef = {
        group: group,
        x: worldX,
        y: worldY,
        z: worldZ,
        scale: r
    };

    // Запускаем фоновую генерацию, если она еще не идет
    if (!tree.isGenerating) {
        tree.isGenerating = true;
        window.generateAndAssign3DModel(tree.id, tree.name, 'tree', tree.threeJsGroupRef);
    }
}

function buildThreePlant(planting, bedObj) {
    const plant = plants.find(p => p.id === planting.plantId);
    if (!plant) return;

    const r = planting.r / state.scale;
    const plot = state.objects.find(o => o.type === 'plot');
    const bbox = getObjBBox(plot);
    
    const worldX = (planting.x - bbox.x) / state.scale - bbox.w / state.scale / 2;
    const worldZ = (planting.y - bbox.y) / state.scale - bbox.h / state.scale / 2;
    const worldY = getSmoothHeightAt(worldX, worldZ);

    // ★ ЕСЛИ URL УЖЕ ЕСТЬ, рисуем сразу его
    if (plant.model3dUrl) {
        loadGLTFModel(plant.model3dUrl, worldX, worldY, worldZ, r * 0.5);
        return;
    }

    // --- СТАНДАРТНАЯ ГЕОМЕТРИЯ (FALLBACK) ---
    const color = new THREE.Color(plant.color);
    const group = new THREE.Group();
    group.position.set(worldX, worldY, worldZ);
    
    const stemHeight = (plant.height || 50) / 100;
    const stemGeo = new THREE.CylinderGeometry(0.02, 0.02, stemHeight, 6);
    const stemMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.y = stemHeight / 2;
    group.add(stem);
    
    const flowerSize = r * 0.5;
    const flowerGeo = new THREE.SphereGeometry(flowerSize, 8, 8);
    const flowerMat = new THREE.MeshLambertMaterial({ color: color });
    const flower = new THREE.Mesh(flowerGeo, flowerMat);
    flower.position.y = stemHeight + flowerSize;
    flower.castShadow = true;
    group.add(flower);
    
    threeScene.add(group);

    // ★ СОХРАНЯЕМ ССЫЛКУ для возможной фоновой замены
    plant.threeJsGroupRef = {
        group: group,
        x: worldX,
        y: worldY,
        z: worldZ,
        scale: r * 0.5
    };

    // Запускаем фоновую генерацию, если она еще не идет
    if (!plant.isGenerating) {
        plant.isGenerating = true;
        window.generateAndAssign3DModel(plant.id, plant.name, 'plant', plant.threeJsGroupRef);
    }
}

window.buildThreePlants = buildThreePlants;
window.buildThreeTree = buildThreeTree;
window.buildThreePlant = buildThreePlant;