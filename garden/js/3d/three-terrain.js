/* ==================== FILE: js/3d/three-terrain.js ==================== */
// ===== 3D TERRAIN — Единый ландшафт со сглаживанием =====
let terrainMesh = null;
let gridLinesMesh = null;
let terrainGeometry = null;

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
    const plotWidth = bbox.w / state.scale;
    const plotHeight = bbox.h / state.scale;

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

    // Единая плоскость с множеством сегментов
    const segmentsPerBlock = 8;
    const totalSegments = gridSize * segmentsPerBlock;
    terrainGeometry = new THREE.PlaneGeometry(
        plotWidth,
        plotHeight,
        totalSegments,
        totalSegments
    );
    terrainGeometry.rotateX(-Math.PI / 2);

    const terrainMaterial = new THREE.MeshLambertMaterial({
        color: 0x7cb342,
        side: THREE.DoubleSide
    });
    terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = false;
    terrainMesh.userData.isTerrain = true;

    updateSmoothTerrainHeights();
    threeScene.add(terrainMesh);

    buildGridLines();

    // Также создаём невидимые блоки для raycast (чтобы можно было кликать по блокам)
    buildInvisibleBlockMeshes();
}

// ===== Невидимые блоки для кликов =====
function buildInvisibleBlockMeshes() {
    blockMeshes.forEach(mesh => {
        threeScene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    });
    blockMeshes = [];

    const gridSize = state.terrainBlocks.gridSize || 3;
    const plot = state.objects.find(o => o.type === 'plot');
    if (!plot) return;
    const bbox = getObjBBox(plot);
    const plotWidth = bbox.w / state.scale;
    const plotHeight = bbox.h / state.scale;
    const blockSizeX = plotWidth / gridSize;
    const blockSizeZ = plotHeight / gridSize;

    state.terrainBlocks.blocks.forEach((block, idx) => {
        const geometry = new THREE.PlaneGeometry(blockSizeX, blockSizeZ);
        geometry.rotateX(-Math.PI / 2);
        const material = new THREE.MeshBasicMaterial({ 
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        const centerX = (block.x + 0.5) * blockSizeX - plotWidth / 2;
        const centerZ = (block.y + 0.5) * blockSizeZ - plotHeight / 2;
        const centerY = getSmoothHeightAt(centerX, centerZ) + 0.05;
        mesh.position.set(centerX, centerY, centerZ);
        mesh.userData = { blockIndex: idx, block: block };
        mesh.renderOrder = 998;
        threeScene.add(mesh);
        blockMeshes.push(mesh);
    });
}

// ===== Piecewise интерполяция с плавным переходом на внешних границах =====
function getSmoothHeightAt(worldX, worldZ) {
    const gridSize = state.terrainBlocks.gridSize || 3;
    const plot = state.objects.find(o => o.type === 'plot');
    if (!plot || !state.terrainBlocks) return 0;
    const bbox = getObjBBox(plot);
    const plotWidth = bbox.w / state.scale;
    const plotHeight = bbox.h / state.scale;
    const blockSizeX = plotWidth / gridSize;
    const blockSizeZ = plotHeight / gridSize;

    const relX = worldX + plotWidth / 2;
    const relZ = worldZ + plotHeight / 2;
    
    // Находим блок, в котором находится точка
    let blockX = Math.floor(relX / blockSizeX);
    let blockZ = Math.floor(relZ / blockSizeZ);
    
    // Ограничиваем индексы границами
    blockX = Math.max(0, Math.min(gridSize - 1, blockX));
    blockZ = Math.max(0, Math.min(gridSize - 1, blockZ));
    
    const currentBlock = state.terrainBlocks.blocks.find(b => b.x === blockX && b.y === blockZ);
    if (!currentBlock) return 0;
    
    // Позиция внутри блока (0..1)
    const localX = (relX / blockSizeX) - blockX;
    const localZ = (relZ / blockSizeZ) - blockZ;
    
    // Ограничиваем localX/localZ диапазоном [0, 1]
    const clampedLocalX = Math.max(0, Math.min(1, localX));
    const clampedLocalZ = Math.max(0, Math.min(1, localZ));
    
    // Базовая высота — высота текущего блока
    const currentHeight = currentBlock.height;
    
    // Зона плавного перехода у границ (10% от размера блока)
    const edgeWidth = 0.1;
    
    // Определяем веса для всех 4 блоков (текущий + 3 соседа)
    let weightCurrent = 1;
    let weightNeighborX = 0;
    let weightNeighborZ = 0;
    let weightDiagonal = 0;
    
    let neighborXHeight = 0;
    let neighborZHeight = 0;
    let diagonalHeight = 0;
    
    // Определяем направление соседей
    let neighborXDir = 0;
    let neighborZDir = 0;
    
    // Проверяем границы по X
    if (clampedLocalX < edgeWidth) {
        if (blockX > 0) {
            // Внутренняя граница — сосед слева
            const neighbor = state.terrainBlocks.blocks.find(b => b.x === blockX - 1 && b.y === blockZ);
            if (neighbor) {
                const t = clampedLocalX / edgeWidth;
                weightCurrent = t;
                weightNeighborX = 1 - t;
                neighborXHeight = neighbor.height;
                neighborXDir = -1;
            }
        } else {
            // ★ НОВОЕ: Внешняя граница (левый край участка) — плавный переход к 0
            const t = clampedLocalX / edgeWidth;
            weightCurrent = t;
            weightNeighborX = 1 - t;
            neighborXHeight = 0; // Высота за пределами участка = 0
            neighborXDir = -1;
        }
    } else if (clampedLocalX > 1 - edgeWidth) {
        if (blockX < gridSize - 1) {
            // Внутренняя граница — сосед справа
            const neighbor = state.terrainBlocks.blocks.find(b => b.x === blockX + 1 && b.y === blockZ);
            if (neighbor) {
                const t = (1 - clampedLocalX) / edgeWidth;
                weightCurrent = t;
                weightNeighborX = 1 - t;
                neighborXHeight = neighbor.height;
                neighborXDir = 1;
            }
        } else {
            // ★ НОВОЕ: Внешняя граница (правый край участка) — плавный переход к 0
            const t = (1 - clampedLocalX) / edgeWidth;
            weightCurrent = t;
            weightNeighborX = 1 - t;
            neighborXHeight = 0; // Высота за пределами участка = 0
            neighborXDir = 1;
        }
    }
    
    // Проверяем границы по Z
    if (clampedLocalZ < edgeWidth) {
        if (blockZ > 0) {
            // Внутренняя граница — сосед сверху
            const neighbor = state.terrainBlocks.blocks.find(b => b.x === blockX && b.y === blockZ - 1);
            if (neighbor) {
                const t = clampedLocalZ / edgeWidth;
                const weightZ = t;
                weightDiagonal = weightNeighborX * (1 - weightZ);
                weightNeighborX = weightNeighborX * weightZ;
                weightNeighborZ = weightCurrent * (1 - weightZ);
                weightCurrent = weightCurrent * weightZ;
                neighborZHeight = neighbor.height;
                neighborZDir = -1;
            }
        } else {
            // ★ НОВОЕ: Внешняя граница (верхний край участка) — плавный переход к 0
            const t = clampedLocalZ / edgeWidth;
            const weightZ = t;
            weightDiagonal = weightNeighborX * (1 - weightZ);
            weightNeighborX = weightNeighborX * weightZ;
            weightNeighborZ = weightCurrent * (1 - weightZ);
            weightCurrent = weightCurrent * weightZ;
            neighborZHeight = 0; // Высота за пределами участка = 0
            neighborZDir = -1;
        }
    } else if (clampedLocalZ > 1 - edgeWidth) {
        if (blockZ < gridSize - 1) {
            // Внутренняя граница — сосед снизу
            const neighbor = state.terrainBlocks.blocks.find(b => b.x === blockX && b.y === blockZ + 1);
            if (neighbor) {
                const t = (1 - clampedLocalZ) / edgeWidth;
                const weightZ = t;
                weightDiagonal = weightNeighborX * (1 - weightZ);
                weightNeighborX = weightNeighborX * weightZ;
                weightNeighborZ = weightCurrent * (1 - weightZ);
                weightCurrent = weightCurrent * weightZ;
                neighborZHeight = neighbor.height;
                neighborZDir = 1;
            }
        } else {
            // ★ НОВОЕ: Внешняя граница (нижний край участка) — плавный переход к 0
            const t = (1 - clampedLocalZ) / edgeWidth;
            const weightZ = t;
            weightDiagonal = weightNeighborX * (1 - weightZ);
            weightNeighborX = weightNeighborX * weightZ;
            weightNeighborZ = weightCurrent * (1 - weightZ);
            weightCurrent = weightCurrent * weightZ;
            neighborZHeight = 0; // Высота за пределами участка = 0
            neighborZDir = 1;
        }
    }
    
    // Получаем высоту диагонального соседа
    if (neighborXDir !== 0 && neighborZDir !== 0) {
        const diagX = blockX + neighborXDir;
        const diagZ = blockZ + neighborZDir;
        // Проверяем, что диагональный сосед в пределах участка
        if (diagX >= 0 && diagX < gridSize && diagZ >= 0 && diagZ < gridSize) {
            const diagonal = state.terrainBlocks.blocks.find(b => b.x === diagX && b.y === diagZ);
            if (diagonal) diagonalHeight = diagonal.height;
        } else {
            diagonalHeight = 0; // За пределами участка
        }
    }
    
    // Финальная интерполяция с учётом всех 4 блоков
    const height = currentHeight * weightCurrent +
                   neighborXHeight * weightNeighborX +
                   neighborZHeight * weightNeighborZ +
                   diagonalHeight * weightDiagonal;
    
    return height;
}
// ===== Обновление высот вершин =====
function updateSmoothTerrainHeights() {
    if (!terrainGeometry || !terrainMesh) return;
    const positions = terrainGeometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const height = getSmoothHeightAt(x, z);
        positions.setY(i, height);
    }
    positions.needsUpdate = true;
    terrainGeometry.computeVertexNormals();

    // Обновляем позиции невидимых блоков
    blockMeshes.forEach((mesh, idx) => {
        const block = state.terrainBlocks.blocks[idx];
        if (!block) return;
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
        const centerY = getSmoothHeightAt(centerX, centerZ) + 0.05;
        mesh.position.set(centerX, centerY, centerZ);
    });

    updateGridLines();
}

// ===== Линии сетки =====
function buildGridLines() {
    const gridSize = state.terrainBlocks.gridSize || 3;
    const plot = state.objects.find(o => o.type === 'plot');
    if (!plot) return;
    const bbox = getObjBBox(plot);
    const plotWidth = bbox.w / state.scale;
    const plotHeight = bbox.h / state.scale;

    const vertices = [];
    const offset = 0.03;

    // Вертикальные линии
    for (let i = 0; i <= gridSize; i++) {
        const x = (i / gridSize) * plotWidth - plotWidth / 2;
        for (let j = 0; j < gridSize * 8; j++) {
            const z1 = (j / (gridSize * 8)) * plotHeight - plotHeight / 2;
            const z2 = ((j + 1) / (gridSize * 8)) * plotHeight - plotHeight / 2;
            const h1 = getSmoothHeightAt(x, z1) + offset;
            const h2 = getSmoothHeightAt(x, z2) + offset;
            vertices.push(x, h1, z1);
            vertices.push(x, h2, z2);
        }
    }

    // Горизонтальные линии
    for (let j = 0; j <= gridSize; j++) {
        const z = (j / gridSize) * plotHeight - plotHeight / 2;
        for (let i = 0; i < gridSize * 8; i++) {
            const x1 = (i / (gridSize * 8)) * plotWidth - plotWidth / 2;
            const x2 = ((i + 1) / (gridSize * 8)) * plotWidth - plotWidth / 2;
            const h1 = getSmoothHeightAt(x1, z) + offset;
            const h2 = getSmoothHeightAt(x2, z) + offset;
            vertices.push(x1, h1, z);
            vertices.push(x2, h2, z);
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    const material = new THREE.LineBasicMaterial({
        color: 0x5d4037,
        opacity: 0.4,
        transparent: true
    });
    gridLinesMesh = new THREE.LineSegments(geometry, material);
    threeScene.add(gridLinesMesh);
}

function updateGridLines() {
    if (!gridLinesMesh) return;
    threeScene.remove(gridLinesMesh);
    gridLinesMesh.geometry.dispose();
    gridLinesMesh.material.dispose();
    buildGridLines();
}

// ===== Определение индекса блока =====
function getBlockIndexAtCoords(worldX, worldZ) {
    const gridSize = state.terrainBlocks.gridSize || 3;
    const plot = state.objects.find(o => o.type === 'plot');
    if (!plot) return -1;
    const bbox = getObjBBox(plot);
    const plotWidth = bbox.w / state.scale;
    const plotHeight = bbox.h / state.scale;
    const relX = worldX + plotWidth / 2;
    const relZ = worldZ + plotHeight / 2;
    const blockX = Math.floor((relX / plotWidth) * gridSize);
    const blockZ = Math.floor((relZ / plotHeight) * gridSize);
    if (blockX < 0 || blockX >= gridSize || blockZ < 0 || blockZ >= gridSize) {
        return -1;
    }
    return blockZ * gridSize + blockX;
}

function getBlockCenter(blockIndex) {
    const gridSize = state.terrainBlocks.gridSize || 3;
    const plot = state.objects.find(o => o.type === 'plot');
    if (!plot) return null;
    const bbox = getObjBBox(plot);
    const plotWidth = bbox.w / state.scale;
    const plotHeight = bbox.h / state.scale;
    const blockSizeX = plotWidth / gridSize;
    const blockSizeZ = plotHeight / gridSize;
    const blockX = blockIndex % gridSize;
    const blockZ = Math.floor(blockIndex / gridSize);
    const centerX = (blockX + 0.5) * blockSizeX - plotWidth / 2;
    const centerZ = (blockZ + 0.5) * blockSizeZ - plotHeight / 2;
    const centerY = getSmoothHeightAt(centerX, centerZ);
    return new THREE.Vector3(centerX, centerY, centerZ);
}

function rebuildTerrain() {
    if (terrainMesh) {
        threeScene.remove(terrainMesh);
        terrainMesh.geometry.dispose();
        terrainMesh.material.dispose();
        terrainMesh = null;
    }
    if (gridLinesMesh) {
        threeScene.remove(gridLinesMesh);
        gridLinesMesh.geometry.dispose();
        gridLinesMesh.material.dispose();
        gridLinesMesh = null;
    }
    terrainGeometry = null;
    buildTerrain();
    // Восстанавливаем выделение
    if (selectedBlocks.length > 0) {
        selectBlocks(selectedBlocks);
    }
}

// ===== Обновление позиций 3D-объектов при изменении рельефа =====
function updateThreeObjectsHeight() {
    if (!threeScene) return;
    
    threeScene.children.forEach(obj => {
        if (obj.userData && obj.userData.isTerrainObject) {
            const worldX = obj.userData.worldX;
            const worldZ = obj.userData.worldZ;
            const yOffset = obj.userData.yOffset || 0;
            const newHeight = getSmoothHeightAt(worldX, worldZ) + yOffset;
            obj.position.y = newHeight;
        }
    });
}

window.getSmoothHeightAt = getSmoothHeightAt;
window.buildTerrain = buildTerrain;
window.updateSmoothTerrainHeights = updateSmoothTerrainHeights;
window.rebuildTerrain = rebuildTerrain;