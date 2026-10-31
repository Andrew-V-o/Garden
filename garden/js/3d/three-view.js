/* ==================== FILE: js/3d/three-view.js ==================== */
// ===== 3D СЦЕНА, КАМЕРА, СОБЫТИЯ И MARQUEE SELECT =====
let threeScene, threeCamera, threeRenderer, threeControls;
let threeRaycaster, threeMouse;
let selectedBlocks = []; // ★ Массив выбранных блоков (multi-select)
let blockMeshes = [];
let threeInitialized = false;
let selectionWireframe = null;

// Marquee select
let marqueeActive = false;
let marqueeStart = { x: 0, y: 0 };
let marqueeEnd = { x: 0, y: 0 };
let mouseDownPos = { x: 0, y: 0 };
let mouseDownTime = 0;
let isMouseDown = false; // ★ Флаг зажатия ЛКМ

function initThreeScene() {
    if (threeInitialized) return;
    const container = document.getElementById('threeContainer');

    // Сцена
    threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color(0x87ceeb);
    threeScene.fog = new THREE.Fog(0x87ceeb, 100, 500);

    // Камера
    const aspect = container.clientWidth / container.clientHeight;
    threeCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    threeCamera.position.set(30, 40, 50);
    threeCamera.lookAt(0, 0, 0);

    // Рендерер
    threeRenderer = new THREE.WebGLRenderer({ antialias: true });
    threeRenderer.setSize(container.clientWidth, container.clientHeight);
    threeRenderer.shadowMap.enabled = true;
    threeRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(threeRenderer.domElement);

    // OrbitControls — ПКМ для вращения, колесо для зума
    threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
    threeControls.enableDamping = true;
    threeControls.dampingFactor = 0.05;
    threeControls.maxPolarAngle = Math.PI / 2.1;
    threeControls.minDistance = 10;
    threeControls.maxDistance = 200;
    
    // ★ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Полностью отключаем ЛКМ в OrbitControls
    // В Three.js r128 OrbitControls использует Pointer Events API
    threeControls.mouseButtons = {
        LEFT: -1,       // Отрицательное значение полностью отключает ЛКМ
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE
    };
    
    // ★ Отключаем touch-события для одного пальца (соответствует ЛКМ)
    threeControls.touches = {
        ONE: THREE.TOUCH.NONE,
        TWO: THREE.TOUCH.DOLLY_ROTATE
    };

    // Освещение
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    threeScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 80, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    threeScene.add(dirLight);

    // Raycaster
    threeRaycaster = new THREE.Raycaster();
    threeMouse = new THREE.Vector2();

    // ★ КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем POINTER EVENTS вместо mouse events
    // OrbitControls в Three.js r128 использует Pointer Events API
    const domEl = threeRenderer.domElement;
    domEl.addEventListener('pointerdown', onThreePointerDown, true); // capture=true
    domEl.addEventListener('pointermove', onThreePointerMove, true);
    domEl.addEventListener('pointerup', onThreePointerUp, true);
    domEl.addEventListener('contextmenu', (e) => e.preventDefault());
    
    window.addEventListener('resize', onThreeResize);
    
    // ★ Защита от залипания при выходе за пределы окна
    window.addEventListener('pointerup', (e) => {
        if (e.button === 0 && isMouseDown) {
            isMouseDown = false;
            if (marqueeActive) {
                marqueeActive = false;
                hideMarqueeBox();
                if (threeControls) threeControls.enabled = true;
            }
        }
    });
    
    window.addEventListener('blur', () => {
        if (isMouseDown) {
            isMouseDown = false;
            marqueeActive = false;
            hideMarqueeBox();
            if (threeControls) threeControls.enabled = true;
        }
    });

    threeInitialized = true;
}

function onThreeResize() {
    const container = document.getElementById('threeContainer');
    if (!container || !threeCamera || !threeRenderer) return;
    const aspect = container.clientWidth / container.clientHeight;
    threeCamera.aspect = aspect;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(container.clientWidth, container.clientHeight);
}

// ===== POINTER EVENT HANDLERS =====
function onThreePointerDown(event) {
    // Обрабатываем только левую кнопку мыши (pointerId === 1 для мыши)
    if (event.button !== 0) return;
    if (event.pointerType !== 'mouse') return; // Игнорируем touch/pen
    
    event.stopPropagation(); // ★ Предотвращаем дальнейшую передачу события
    event.stopImmediatePropagation(); // ★ Блокируем все остальные обработчики
    
    isMouseDown = true;
    const container = document.getElementById('threeContainer');
    const rect = container.getBoundingClientRect();
    mouseDownPos = { x: event.clientX, y: event.clientY };
    mouseDownTime = Date.now();
    marqueeStart = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
    marqueeEnd = { ...marqueeStart };
    marqueeActive = false;
}

function onThreePointerMove(event) {
    if (event.pointerType !== 'mouse') return;
    
    const container = document.getElementById('threeContainer');
    const rect = container.getBoundingClientRect();

    if (isMouseDown) {
        const dx = event.clientX - mouseDownPos.x;
        const dy = event.clientY - mouseDownPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Если сдвинули мышь больше чем на 5px — начинаем marquee
        if (dist > 5 && !marqueeActive) {
            marqueeActive = true;
            // Отключаем OrbitControls во время marquee
            if (threeControls) threeControls.enabled = false;
        }

        if (marqueeActive) {
            marqueeEnd = {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
            updateMarqueeBox();
        }
    } else {
        // Hover-эффект на блоках (работает без нажатия)
        threeMouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        threeMouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        threeRaycaster.setFromCamera(threeMouse, threeCamera);
        const intersects = threeRaycaster.intersectObjects(blockMeshes);
        container.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
    }
}

function onThreePointerUp(event) {
    if (event.button !== 0) return;
    if (event.pointerType !== 'mouse') return;
    
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    isMouseDown = false;
    const container = document.getElementById('threeContainer');

    if (marqueeActive) {
        // Завершение marquee — выбираем блоки внутри рамки
        finishMarqueeSelect();
        marqueeActive = false;
        hideMarqueeBox();
        if (threeControls) threeControls.enabled = true;
        return;
    }

    // Короткий клик — одиночный выбор блока
    const elapsed = Date.now() - mouseDownTime;
    if (elapsed < 300) {
        const rect = container.getBoundingClientRect();
        threeMouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        threeMouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
        threeRaycaster.setFromCamera(threeMouse, threeCamera);
        
        const intersects = threeRaycaster.intersectObjects(blockMeshes);
        
        if (intersects.length > 0) {
            const hitObj = intersects[0].object;
            
            // Проверяем, является ли объект блоком
            if (hitObj.userData && hitObj.userData.blockIndex !== undefined) {
                const blockIndex = hitObj.userData.blockIndex;
                if (event.ctrlKey || event.metaKey) {
                    toggleBlockSelection(blockIndex);
                } else {
                    selectBlocks([blockIndex]);
                }
            } else {
                // Клик по земле/terrain — снимаем выделение
                if (!event.ctrlKey && !event.metaKey) {
                    deselectAllBlocks();
                }
            }
        } else {
            // Клик по пустому месту — снимаем выделение
            if (!event.ctrlKey && !event.metaKey) {
                deselectAllBlocks();
            }
        }
    }
}

// ===== MARQUEE DOM ELEMENT =====
function updateMarqueeBox() {
    let box = document.getElementById('selectionBox');
    if (!box) {
        box = document.createElement('div');
        box.id = 'selectionBox';
        box.style.cssText = 'position:absolute;border:2px dashed #ff6b00;background:rgba(255,107,0,0.1);pointer-events:none;z-index:1000;display:none;';
        document.getElementById('threeContainer').appendChild(box);
    }
    const x1 = Math.min(marqueeStart.x, marqueeEnd.x);
    const y1 = Math.min(marqueeStart.y, marqueeEnd.y);
    const x2 = Math.max(marqueeStart.x, marqueeEnd.x);
    const y2 = Math.max(marqueeStart.y, marqueeEnd.y);
    box.style.left = x1 + 'px';
    box.style.top = y1 + 'px';
    box.style.width = (x2 - x1) + 'px';
    box.style.height = (y2 - y1) + 'px';
    box.style.display = 'block';
}

function hideMarqueeBox() {
    const box = document.getElementById('selectionBox');
    if (box) box.style.display = 'none';
}

function finishMarqueeSelect() {
    const container = document.getElementById('threeContainer');
    const x1 = Math.min(marqueeStart.x, marqueeEnd.x);
    const y1 = Math.min(marqueeStart.y, marqueeEnd.y);
    const x2 = Math.max(marqueeStart.x, marqueeEnd.x);
    const y2 = Math.max(marqueeStart.y, marqueeEnd.y);
    const pickedIndices = [];

    const gridSize = state.terrainBlocks.gridSize || 3;
    const plot = state.objects.find(o => o.type === 'plot');
    if (!plot) return;
    const bbox = getObjBBox(plot);
    const plotWidth = bbox.w / state.scale;
    const plotHeight = bbox.h / state.scale;
    const blockSizeX = plotWidth / gridSize;
    const blockSizeZ = plotHeight / gridSize;

    // Проверяем каждый блок
    blockMeshes.forEach((mesh, idx) => {
        const block = state.terrainBlocks.blocks[idx];
        if (!block) return;

        // Вычисляем 4 угла блока в мировых координатах
        const corners = [
            { x: block.x * blockSizeX - plotWidth / 2, z: block.y * blockSizeZ - plotHeight / 2 },
            { x: (block.x + 1) * blockSizeX - plotWidth / 2, z: block.y * blockSizeZ - plotHeight / 2 },
            { x: block.x * blockSizeX - plotWidth / 2, z: (block.y + 1) * blockSizeZ - plotHeight / 2 },
            { x: (block.x + 1) * blockSizeX - plotWidth / 2, z: (block.y + 1) * blockSizeZ - plotHeight / 2 }
        ];

        // Проецируем углы на экран
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        let allBehindCamera = true;

        corners.forEach(corner => {
            const worldPos = new THREE.Vector3(corner.x, 0, corner.z);
            const screenPos = worldPos.project(threeCamera);

            if (screenPos.z < 1) {
                allBehindCamera = false;
                const screenX = (screenPos.x * 0.5 + 0.5) * container.clientWidth;
                const screenY = (-screenPos.y * 0.5 + 0.5) * container.clientHeight;
                minX = Math.min(minX, screenX);
                maxX = Math.max(maxX, screenX);
                minY = Math.min(minY, screenY);
                maxY = Math.max(maxY, screenY);
            }
        });

        // Если все углы за камерой, пропускаем блок
        if (allBehindCamera) return;

        // Проверяем пересечение bounding box блока с рамкой marquee
        if (maxX >= x1 && minX <= x2 && maxY >= y1 && minY <= y2) {
            pickedIndices.push(idx);
        }
    });

    if (pickedIndices.length > 0) {
        selectBlocks(pickedIndices);
    } else {
        deselectAllBlocks();
    }
}

// ===== ВЫДЕЛЕНИЕ БЛОКОВ =====
function selectBlocks(indices) {
    // Снимаем выделение со всех
    blockMeshes.forEach(mesh => {
        if (mesh.userData.originalColor !== undefined) {
            mesh.material.color.setHex(mesh.userData.originalColor);
        }
    });

    if (selectionWireframe) {
        threeScene.remove(selectionWireframe);
        selectionWireframe.geometry.dispose();
        selectionWireframe.material.dispose();
        selectionWireframe = null;
    }

    selectedBlocks = indices;

    // Подсвечиваем выбранные
    indices.forEach(idx => {
        const mesh = blockMeshes[idx];
        if (mesh) {
            if (mesh.userData.originalColor === undefined) {
                mesh.userData.originalColor = mesh.material.color.getHex();
            }
            mesh.material.color.setHex(0xffcc80); // Оранжевый оттенок
        }
    });

    // Создаём wireframe вокруг выбранных блоков
    if (indices.length > 0) {
        createSelectionWireframe(indices);
    }

    // Обновляем UI панель
    if (typeof updateBlockPanel === 'function') {
        updateBlockPanel();
    }
}

function toggleBlockSelection(index) {
    const pos = selectedBlocks.indexOf(index);
    if (pos >= 0) {
        selectedBlocks.splice(pos, 1);
        const mesh = blockMeshes[index];
        if (mesh && mesh.userData.originalColor !== undefined) {
            mesh.material.color.setHex(mesh.userData.originalColor);
        }
    } else {
        selectedBlocks.push(index);
        const mesh = blockMeshes[index];
        if (mesh) {
            if (mesh.userData.originalColor === undefined) {
                mesh.userData.originalColor = mesh.material.color.getHex();
            }
            mesh.material.color.setHex(0xffcc80);
        }
    }

    // Пересоздаём wireframe
    if (selectionWireframe) {
        threeScene.remove(selectionWireframe);
        selectionWireframe.geometry.dispose();
        selectionWireframe.material.dispose();
        selectionWireframe = null;
    }
    if (selectedBlocks.length > 0) {
        createSelectionWireframe(selectedBlocks);
    }
    if (typeof updateBlockPanel === 'function') {
        updateBlockPanel();
    }
}

function deselectAllBlocks() {
    blockMeshes.forEach(mesh => {
        if (mesh.userData.originalColor !== undefined) {
            mesh.material.color.setHex(mesh.userData.originalColor);
        }
    });

    if (selectionWireframe) {
        threeScene.remove(selectionWireframe);
        selectionWireframe.geometry.dispose();
        selectionWireframe.material.dispose();
        selectionWireframe = null;
    }

    selectedBlocks = [];
    if (typeof updateBlockPanel === 'function') {
        updateBlockPanel();
    }
}

function createSelectionWireframe(indices) {
    const gridSize = state.terrainBlocks.gridSize || 3;
    const plot = state.objects.find(o => o.type === 'plot');
    if (!plot) return;
    const bbox = getObjBBox(plot);
    const plotWidth = bbox.w / state.scale;
    const plotHeight = bbox.h / state.scale;
    const blockSizeX = plotWidth / gridSize;
    const blockSizeZ = plotHeight / gridSize;

    // Создаём Set для быстрого поиска выделенных блоков по координатам
    const selectedSet = new Set(indices.map(idx => {
        const block = state.terrainBlocks.blocks[idx];
        return block ? `${block.x},${block.y}` : null;
    }).filter(Boolean));

    const vertices = [];

    indices.forEach(idx => {
        const block = state.terrainBlocks.blocks[idx];
        if (!block) return;

        const bx = block.x;
        const by = block.y;
        const x1 = bx * blockSizeX - plotWidth / 2;
        const x2 = (bx + 1) * blockSizeX - plotWidth / 2;
        const z1 = by * blockSizeZ - plotHeight / 2;
        const z2 = (by + 1) * blockSizeZ - plotHeight / 2;
        const y = block.height + 0.1;

        // Проверяем 4 стороны блока
        const hasLeft   = selectedSet.has(`${bx - 1},${by}`);
        const hasRight  = selectedSet.has(`${bx + 1},${by}`);
        const hasTop    = selectedSet.has(`${bx},${by - 1}`);
        const hasBottom = selectedSet.has(`${bx},${by + 1}`);

        // Внешние стороны (рисуем, если сосед НЕ выделен)
        // Верхняя сторона (z = z1)
        if (!hasTop) {
            vertices.push(x1, y, z1, x2, y, z1);   // верхнее ребро
            vertices.push(x1, 0, z1, x2, 0, z1);   // нижнее ребро (на земле)
            vertices.push(x1, 0, z1, x1, y, z1);   // левая вертикаль
            vertices.push(x2, 0, z1, x2, y, z1);   // правая вертикаль
        }
        // Нижняя сторона (z = z2)
        if (!hasBottom) {
            vertices.push(x1, y, z2, x2, y, z2);
            vertices.push(x1, 0, z2, x2, 0, z2);
            vertices.push(x1, 0, z2, x1, y, z2);
            vertices.push(x2, 0, z2, x2, y, z2);
        }
        // Левая сторона (x = x1)
        if (!hasLeft) {
            vertices.push(x1, y, z1, x1, y, z2);
            vertices.push(x1, 0, z1, x1, 0, z2);
            vertices.push(x1, 0, z1, x1, y, z1);
            vertices.push(x1, 0, z2, x1, y, z2);
        }
        // Правая сторона (x = x2)
        if (!hasRight) {
            vertices.push(x2, y, z1, x2, y, z2);
            vertices.push(x2, 0, z1, x2, 0, z2);
            vertices.push(x2, 0, z1, x2, y, z1);
            vertices.push(x2, 0, z2, x2, y, z2);
        }
    });

    if (vertices.length === 0) return;

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3));

    const material = new THREE.LineBasicMaterial({
        color: 0xff6b00,
        linewidth: 2,
        depthTest: false
    });
    selectionWireframe = new THREE.LineSegments(geometry, material);
    selectionWireframe.renderOrder = 999;
    threeScene.add(selectionWireframe);
}

// ===== ОЧИСТКА СЦЕНЫ =====
function clearThreeScene() {
    if (!threeScene) return;
    while (threeScene.children.length > 0) {
        const obj = threeScene.children[0];
        threeScene.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
            if (Array.isArray(obj.material)) {
                obj.material.forEach(m => m.dispose());
            } else {
                obj.material.dispose();
            }
        }
    }
    blockMeshes = [];
    selectedBlocks = [];
    selectionWireframe = null;

    // Восстанавливаем свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    threeScene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(50, 80, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    threeScene.add(dirLight);
}

function rebuildThreeScene() {
    clearThreeScene();
    buildTerrain();
    buildThreeObjects();
    buildThreePlants();

    // Восстанавливаем выделение если было
    if (selectedBlocks.length > 0) {
        createSelectionWireframe(selectedBlocks);
    }
}