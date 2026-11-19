/* ==================== FILE: js/3d/three-ai-generator.js ==================== */
// ===== ДВУХЭТАПНЫЙ ПАЙПЛАЙН: Text → Image → 3D с очередью и фоновой заменой =====

const generatedModelsCache = new Map();
const generatedImagesCache = new Map();

let lastImageGenerationTime = 0;
const RATE_LIMIT_DELAY_MS = 50000; 

const generationQueue = [];
let isProcessingQueue = false;

async function generateImageFromText(prompt) {
    const maxRetries = 3;
    let attempt = 0;
    let delay = 5000;

    while (attempt < maxRetries) {
        const now = Date.now();
        const timeSinceLast = now - lastImageGenerationTime;

        if (timeSinceLast < RATE_LIMIT_DELAY_MS && lastImageGenerationTime > 0) {
            const waitTime = RATE_LIMIT_DELAY_MS - timeSinceLast;
            console.log(`⏳ Ожидание ${Math.ceil(waitTime / 1000)} сек. для соблюдения лимита API Pollinations...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        lastImageGenerationTime = Date.now();

        try {
            const enhancedPrompt = `${prompt}, isolated on white background, 3d render style, high quality, detailed, centered, full body view`;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=512&height=512&seed=${Math.floor(Math.random() * 100000)}&nologo=true&model=flux`;
            
            console.log(`📸 Отправка запроса на генерацию 2D изображения для "${prompt}" (попытка ${attempt + 1}/${maxRetries})...`);
            
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const blob = await response.blob();
            console.log(`✅ 2D изображение для "${prompt}" успешно получено:`, blob.size, "bytes");
            return blob;

        } catch (error) {
            attempt++;
            console.warn(`⚠️ Ошибка генерации изображения для "${prompt}" (попытка ${attempt}/${maxRetries}):`, error.message);
            
            if (attempt >= maxRetries) {
                throw new Error(`Не удалось сгенерировать изображение после ${maxRetries} попыток. Последняя ошибка: ${error.message}`);
            }
            
            console.log(`🔄 Повтор запроса изображения через ${delay / 1000} сек...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
}

async function generate3DFromImage(imageBlob) {
    let gradioClientFn = null;
    
    try {
        const module = await import("https://esm.sh/@gradio/client@0.10.0");
        gradioClientFn = module.client || (module.default && module.default.client);
        if (typeof gradioClientFn !== 'function') throw new Error("Функция client не найдена.");
    } catch (e) {
        throw new Error("Ошибка загрузки Gradio Client: " + e.message);
    }

    // ★ Ваш новый рабочий токен
    const HF_TOKEN = "hf_tTftMehKeKdlJKxjSZRdWkpCYlbxfvMsVxP"; 

    // Список публичных пространств (будут проверяться по очереди)
    const spaces = [
        "stabilityai/TripoSR",
        "TencentARC/InstantMesh",
        "microsoft/TRELLIS"
    ];

    let lastError = null;
    
    for (const spaceName of spaces) {
        try {
            console.log(`🔗 Попытка подключения к ${spaceName}...`);
            
            const app = await gradioClientFn(spaceName, { hf_token: HF_TOKEN || undefined });
            
            console.log("📤 Отправка изображения на генерацию 3D...");
            const file = new File([imageBlob], "plant.png", { type: "image/png" });
            
            const result = await app.predict("/predict", { image: file });

            let modelUrl = null;
            if (result && result.data && Array.isArray(result.data)) {
                for (const item of result.data) {
                    if (item && item.url) { modelUrl = item.url; break; }
                    if (item && item.path) { modelUrl = item.path; break; }
                    if (typeof item === 'string' && (item.endsWith('.glb') || item.endsWith('.gltf'))) {
                        modelUrl = item; break;
                    }
                }
            }

            if (!modelUrl) throw new Error("Не удалось извлечь URL 3D модели из ответа");
            console.log(`✅ 3D модель сгенерирована! URL: ${modelUrl}`);
            return modelUrl;
            
        } catch (error) {
            console.warn(`⚠️ Space ${spaceName} недоступен, пробуем следующий... Ошибка:`, error.message);
            lastError = error;
        }
    }
    throw new Error(`Все доступные 3D Space перегружены или недоступны. Последняя ошибка: ${lastError?.message}`);
}

function generateAndAssign3DModel(id, name, type, sceneObjectRef) {
    if (generatedModelsCache.has(name)) {
        console.log(`✅ Модель для "${name}" уже есть в кэше, пропускаем генерацию.`);
        return;
    }

    if (generationQueue.some(item => item.name === name)) {
        console.log(`⏳ Задача для "${name}" уже находится в очереди генерации.`);
        return;
    }

    generationQueue.push({ id, name, type, sceneObjectRef });
    processQueue();
}

async function processQueue() {
    if (isProcessingQueue || generationQueue.length === 0) return;
    isProcessingQueue = true;

    const task = generationQueue.shift();
    console.log(`🚀 Начинаем обработку очереди для: "${task.name}" (осталось в очереди: ${generationQueue.length})`);

    try {
        let imageBlob = generatedImagesCache.get(task.name);
        
        if (!imageBlob) {
            imageBlob = await generateImageFromText(task.name);
            generatedImagesCache.set(task.name, imageBlob);
        }

        let attempts = 0;
        const maxAttempts = 2; 
        let delay = 3000; 

        while (attempts < maxAttempts) {
            try {
                const modelUrl = await generate3DFromImage(imageBlob);
                
                generatedModelsCache.set(task.name, modelUrl);
                
                if (task.type === 'plant') {
                    const plant = plants.find(p => p.id === task.id);
                    if (plant) {
                        plant.model3dUrl = modelUrl;
                        if (typeof saveCustomPlants === 'function') saveCustomPlants();
                    }
                } else if (task.type === 'tree') {
                    const tree = trees.find(t => t.id === task.id);
                    if (tree) {
                        tree.model3dUrl = modelUrl;
                        if (typeof saveCustomTrees === 'function') saveCustomTrees();
                    }
                }

                if (task.sceneObjectRef && task.sceneObjectRef.group && typeof threeScene !== 'undefined' && threeScene) {
                    console.log("🔄 Замена стандартной геометрии на AI 3D модель в сцене...");
                    
                    threeScene.remove(task.sceneObjectRef.group);
                    
                    task.sceneObjectRef.group.traverse(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                            else child.material.dispose();
                        }
                    });

                    loadGLTFModel(modelUrl, task.sceneObjectRef.x, task.sceneObjectRef.y, task.sceneObjectRef.z, task.sceneObjectRef.scale);
                }

                console.log(`✅ Полный пайплайн завершён для "${task.name}"!`);
                break; 

            } catch (error) {
                attempts++;
                console.warn(`⚠️ Попытка 3D-генерации ${attempts}/${maxAttempts} не удалась: ${error.message}.`);
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    } catch (error) {
        console.warn(`⚠️ Не удалось сгенерировать 3D модель для "${task.name}": ${error.message}. Приложение продолжает работу со стандартной геометрией.`);
    }

    isProcessingQueue = false;
    
    if (generationQueue.length > 0) {
        setTimeout(processNodeQueueIfNeeded, 2000);
    }
}

function processNodeQueueIfNeeded() {
    processQueue();
}

function loadGLTFModel(url, x, y, z, scaleMultiplier = 1.0) {
    if (typeof THREE === 'undefined' || typeof THREE.GLTFLoader === 'undefined' || !threeScene) {
        console.error("Three.js или GLTFLoader не инициализированы!");
        return;
    }

    const loader = new THREE.GLTFLoader();
    loader.load(
        url,
        (gltf) => {
            const model = gltf.scene;
            model.position.set(x, y, z);
            
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            
            if (maxDim > 0) {
                const scaleFactor = (scaleMultiplier * 2.0) / maxDim;
                model.scale.set(scaleFactor, scaleFactor, scaleFactor);
                model.position.y += (size.y * scaleFactor) / 2;
            }

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            threeScene.add(model);
            console.log("✅ AI 3D модель успешно загружена и заменена в сцене!");
        },
        (xhr) => {
            const percent = (xhr.loaded / xhr.total * 100).toFixed(0);
            if (percent === '100') console.log(`Загрузка 3D файла: ${percent}%`);
        },
        (error) => {
            console.error("❌ Ошибка загрузки GLTF файла:", error);
        }
    );
}

window.generateAndAssign3DModel = generateAndAssign3DModel;
window.loadGLTFModel = loadGLTFModel;