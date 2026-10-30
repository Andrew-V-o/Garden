// ===== 3D СЦЕНА =====

let threeScene, threeCamera, threeRenderer, threeControls;
let threeRaycaster, threeMouse;
let selectedBlock = null;
let blockMeshes = [];
let threeInitialized = false;

function initThreeScene() {
  if (threeInitialized) return;
  
  const container = document.getElementById('threeContainer');
  
  // Сцена
  threeScene = new THREE.Scene();
  threeScene.background = new THREE.Color(0x87ceeb); // Небо
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
  
  // Управление камерой
  threeControls = new THREE.OrbitControls(threeCamera, threeRenderer.domElement);
  threeControls.enableDamping = true;
  threeControls.dampingFactor = 0.05;
  threeControls.maxPolarAngle = Math.PI / 2.1;
  threeControls.minDistance = 10;
  threeControls.maxDistance = 200;
  
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
  
  // Raycaster для выбора блоков
  threeRaycaster = new THREE.Raycaster();
  threeMouse = new THREE.Vector2();
  
  // Обработчик клика
  threeRenderer.domElement.addEventListener('click', onThreeClick);
  threeRenderer.domElement.addEventListener('mousemove', onThreeMouseMove);
  
  // Обработчик resize
  window.addEventListener('resize', onThreeResize);
  
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

function onThreeClick(event) {
  const container = document.getElementById('threeContainer');
  const rect = container.getBoundingClientRect();
  threeMouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  threeMouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
  
  threeRaycaster.setFromCamera(threeMouse, threeCamera);
  const intersects = threeRaycaster.intersectObjects(blockMeshes);
  
  if (intersects.length > 0) {
    const block = intersects[0].object;
    selectBlock(block.userData.blockIndex);
  } else {
    deselectBlock();
  }
}

function onThreeMouseMove(event) {
  const container = document.getElementById('threeContainer');
  const rect = container.getBoundingClientRect();
  threeMouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
  threeMouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;
  
  threeRaycaster.setFromCamera(threeMouse, threeCamera);
  const intersects = threeRaycaster.intersectObjects(blockMeshes);
  
  container.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
}

function animateThree() {
  requestAnimationFrame(animateThree);
  if (threeControls) threeControls.update();
  if (threeRenderer && threeScene && threeCamera) {
    threeRenderer.render(threeScene, threeCamera);
  }
}

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
  selectedBlock = null;
}

function rebuildThreeScene() {
  clearThreeScene();
  
  // Добавляем свет обратно
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
  
  // Строим terrain
  buildTerrain();
  
  // Строим объекты
  buildThreeObjects();
  
  // Строим растения
  buildThreePlants();
}