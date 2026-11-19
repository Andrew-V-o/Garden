// ===== 3D ОБЪЕКТЫ (ДОРОЖКИ, МУЛЬЧА, ВОДОЁМЫ) =====

function buildThreeObjects() {
  state.objects.forEach(obj => {
    if (obj.type === 'path') buildThreePath(obj);
    else if (obj.type === 'mulch') buildThreeMulch(obj);
    else if (obj.type === 'decor') buildThreeDecor(obj);
  });
}

function buildThreePath(pathObj) {
    const points = pathObj.points;
    if (points.length < 2) return;
    const plot = state.objects.find(o => o.type === 'plot');
    const bbox = getObjBBox(plot);
    
    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];
        const x1 = (p1[0] - bbox.x) / state.scale - bbox.w / state.scale / 2;
        const z1 = (p1[1] - bbox.y) / state.scale - bbox.h / state.scale / 2;
        const x2 = (p2[0] - bbox.x) / state.scale - bbox.w / state.scale / 2;
        const z2 = (p2[1] - bbox.y) / state.scale - bbox.h / state.scale / 2;
        
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        const midY = getSmoothHeightAt(midX, midZ);
        
        const dx = x2 - x1;
        const dz = z2 - z1;
        const length = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);
        
        const geo = new THREE.BoxGeometry(1.5, 0.05, length);
        const mat = new THREE.MeshLambertMaterial({ color: 0xb8a88a });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(midX, midY + 0.025, midZ);
        mesh.rotation.y = angle;
        mesh.receiveShadow = true;
        
        // ★ НОВОЕ: сохраняем координаты
        mesh.userData = {
            isTerrainObject: true,
            worldX: midX,
            worldZ: midZ,
            objectType: 'path',
            objectId: pathObj.id,
            yOffset: 0.025
        };
        
        threeScene.add(mesh);
    }
}

function buildThreeMulch(mulchObj) {
    const bed = state.objects.find(o => o.id === mulchObj.bedId);
    if (!bed) return;
    const plot = state.objects.find(o => o.type === 'plot');
    const bbox = getObjBBox(plot);
    
    const x = (mulchObj.x - bbox.x) / state.scale - bbox.w / state.scale / 2;
    const z = (mulchObj.y - bbox.y) / state.scale - bbox.h / state.scale / 2;
    const w = mulchObj.w / state.scale;
    const h = mulchObj.h / state.scale;
    const y = getSmoothHeightAt(x, z);
    
    const geo = new THREE.BoxGeometry(w, 0.1, h);
    const skinData = MULCH_SKINS.find(s => s.id === mulchObj.skin);
    const color = skinData ? new THREE.Color(skinData.baseColor) : new THREE.Color(0x795548);
    const mat = new THREE.MeshLambertMaterial({ color: color });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y + 0.05, z);
    mesh.receiveShadow = true;
    
    // ★ НОВОЕ: сохраняем координаты
    mesh.userData = {
        isTerrainObject: true,
        worldX: x,
        worldZ: z,
        objectType: 'mulch',
        objectId: mulchObj.id,
        yOffset: 0.05
    };
    
    threeScene.add(mesh);
}

function buildThreeDecor(decorObj) {
    const plot = state.objects.find(o => o.type === 'plot');
    const bbox = getObjBBox(plot);
    
    const x = (decorObj.x - bbox.x) / state.scale - bbox.w / state.scale / 2;
    const z = (decorObj.y - bbox.y) / state.scale - bbox.h / state.scale / 2;
    const w = decorObj.w / state.scale;
    const h = decorObj.h / state.scale;
    const y = getSmoothHeightAt(x, z);
    
    if (decorObj.decorType === 'water') {
        const geo = new THREE.CylinderGeometry(w / 2, w / 2, 0.3, 32);
        const mat = new THREE.MeshLambertMaterial({
            color: 0x29b6f6,
            transparent: true,
            opacity: 0.7
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y + 0.15, z);
        mesh.scale.z = h / w;
        
        // ★ НОВОЕ: сохраняем координаты
        mesh.userData = {
            isTerrainObject: true,
            worldX: x,
            worldZ: z,
            objectType: 'decor',
            objectId: decorObj.id,
            yOffset: 0.15
        };
        
        threeScene.add(mesh);
    }
}

window.buildThreeObjects = buildThreeObjects;
window.buildThreePath = buildThreePath;
window.buildThreeMulch = buildThreeMulch;
window.buildThreeDecor = buildThreeDecor;