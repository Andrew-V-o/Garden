// ===== ПЕРЕКЛЮЧЕНИЕ 2D/3D =====

let currentViewMode = '2d';
let threeAnimFrameId = null;

function switchTo2D() {
  if (currentViewMode === '2d') return;
  currentViewMode = '2d';
  state.viewMode = '2d';
  
  document.getElementById('btn2d').classList.add('active');
  document.getElementById('btn3d').classList.remove('active');
  document.getElementById('threeContainer').classList.remove('active');
  document.getElementById('canvas').style.display = 'block';
  document.getElementById('blockPanel').classList.remove('active');
  
  if (threeAnimFrameId) {
    cancelAnimationFrame(threeAnimFrameId);
    threeAnimFrameId = null;
  }
  
  document.querySelectorAll('.sidebar').forEach(s => s.style.display = '');
  document.getElementById('hintBar').style.display = '';
  
  render();
}

function switchTo3D() {
  if (currentViewMode === '3d') return;
  currentViewMode = '3d';
  state.viewMode = '3d';
  
  document.getElementById('btn2d').classList.remove('active');
  document.getElementById('btn3d').classList.add('active');
  document.getElementById('canvas').style.display = 'none';
  document.getElementById('threeContainer').classList.add('active');
  document.getElementById('blockPanel').classList.add('active');
  
  document.querySelectorAll('.sidebar').forEach(s => s.style.display = 'none');
  document.getElementById('hintBar').style.display = 'none';
  
  initThreeScene();
  rebuildThreeScene();
  updateBlockPanel();
  
  if (!threeAnimFrameId) {
    animateThree();
  }
}

function animateThree() {
  threeAnimFrameId = requestAnimationFrame(animateThree);
  if (threeControls) threeControls.update();
  if (threeRenderer && threeScene && threeCamera) {
    threeRenderer.render(threeScene, threeCamera);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
    if (currentViewMode === '2d') switchTo3D();
    else switchTo2D();
  }
});