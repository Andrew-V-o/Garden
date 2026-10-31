/* ==================== FILE: js/3d/three-ui.js ==================== */
// ===== 3D UI — Панель управления блоками =====

// ===== Вспомогательная функция: обновить wireframe выделения =====
function refreshSelectionWireframe() {
    if (selectionWireframe) {
        threeScene.remove(selectionWireframe);
        selectionWireframe.geometry.dispose();
        selectionWireframe.material.dispose();
        selectionWireframe = null;
    }
    if (selectedBlocks.length > 0) {
        createSelectionWireframe(selectedBlocks);
    }
}

function updateBlockPanel() {
    const panel = document.getElementById('blockPanel');
    const infoEl = document.getElementById('blockInfo');
    const controlsEl = document.getElementById('blockControls');
    if (selectedBlocks.length === 0) {
        infoEl.textContent = 'Кликните на блок или выделите рамкой';
        controlsEl.style.display = 'none';
        return;
    }
    controlsEl.style.display = 'block';
    if (selectedBlocks.length === 1) {
        const block = state.terrainBlocks.blocks[selectedBlocks[0]];
        infoEl.textContent = `Блок [${block.x}, ${block.y}]`;
        document.getElementById('blockHeight').value = block.height;
        document.getElementById('blockHeightVal').textContent = block.height.toFixed(1);
    } else {
        infoEl.textContent = `Выбрано блоков: ${selectedBlocks.length}`;
        const firstBlock = state.terrainBlocks.blocks[selectedBlocks[0]];
        document.getElementById('blockHeight').value = firstBlock.height;
        document.getElementById('blockHeightVal').textContent = firstBlock.height.toFixed(1);
    }
}

function onBlockHeightChange(e) {
    if (selectedBlocks.length === 0) return;
    const val = parseFloat(e.target.value);
    document.getElementById('blockHeightVal').textContent = val.toFixed(1);
    
    selectedBlocks.forEach(idx => {
        state.terrainBlocks.blocks[idx].height = val;
    });
    
    updateSmoothTerrainHeights();
    refreshSelectionWireframe();
}

function resetBlock() {
    if (selectedBlocks.length === 0) return;
    selectedBlocks.forEach(idx => {
        state.terrainBlocks.blocks[idx].height = 0;
    });
    updateSmoothTerrainHeights();
    refreshSelectionWireframe();
    updateBlockPanel();
}

function applyToAll() {
    if (selectedBlocks.length === 0) return;
    const firstBlock = state.terrainBlocks.blocks[selectedBlocks[0]];
    const targetHeight = firstBlock.height;
    state.terrainBlocks.blocks.forEach((block, idx) => {
        block.height = targetHeight;
    });
    updateSmoothTerrainHeights();
    refreshSelectionWireframe();
    updateBlockPanel();
}

// ===== ОПТИМИЗИРОВАННАЯ ФУНКЦИЯ ДЛЯ БОЛЬШИХ СЕТОК =====
function setGridSize(size) {
    const oldGridSize = state.terrainBlocks.gridSize || 3;
    const oldBlocks = state.terrainBlocks.blocks || [];
    
    if (size === oldGridSize) return;
    
    // Создаём Map для быстрого доступа к старым блокам по координатам
    const oldBlocksMap = new Map();
    oldBlocks.forEach(block => {
        oldBlocksMap.set(`${block.x},${block.y}`, block);
    });
    
    // Создаём новую сетку
    state.terrainBlocks = {
        gridSize: size,
        blocks: []
    };
    
    // Интерполируем высоты из старой сетки в новую
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            // Центр нового блока в нормализованных координатах (0..1)
            const newX = (i + 0.5) / size;
            const newY = (j + 0.5) / size;
            
            // Преобразуем в координаты старой сетки
            const oldX = newX * oldGridSize - 0.5;
            const oldY = newY * oldGridSize - 0.5;
            
            // Билинейная интерполяция
            const x0 = Math.floor(oldX);
            const y0 = Math.floor(oldY);
            const x1 = x0 + 1;
            const y1 = y0 + 1;
            
            const fx = oldX - x0;
            const fy = oldY - y0;
            
            // Получаем высоты 4 окружающих блоков через Map (O(1) вместо O(n))
            const getHeight = (bx, by) => {
                const cx = Math.max(0, Math.min(oldGridSize - 1, bx));
                const cy = Math.max(0, Math.min(oldGridSize - 1, by));
                const block = oldBlocksMap.get(`${cx},${cy}`);
                return block ? block.height : 0;
            };
            
            const h00 = getHeight(x0, y0);
            const h10 = getHeight(x1, y0);
            const h01 = getHeight(x0, y1);
            const h11 = getHeight(x1, y1);
            
            const top = h00 + (h10 - h00) * fx;
            const bottom = h01 + (h11 - h01) * fx;
            const height = top + (bottom - top) * fy;
            
            state.terrainBlocks.blocks.push({
                x: i, 
                y: j,
                height: height
            });
        }
    }
    
    selectedBlocks = [];
    rebuildTerrain();
    updateBlockPanel();
    
    console.log(`✅ Сетка изменена с ${oldGridSize}×${oldGridSize} на ${size}×${size}. Создано ${size * size} блоков.`);
}

// Привязка обработчиков
document.addEventListener('DOMContentLoaded', () => {
    const bh = document.getElementById('blockHeight');
    if (bh) {
        bh.addEventListener('input', onBlockHeightChange);
    }
});