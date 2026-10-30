// ===== UI ЗАДАЧ =====
// Содержит: панель задач, модалка задачи, маркеры на холсте

// ===== ПАНЕЛЬ ЗАДАЧ =====

function toggleTasksPanel() {
  const panel = document.getElementById('tasksPanel');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    renderTasksPanel();
  } else {
    panel.style.display = 'none';
  }
}

function renderTasksPanel() {
  const list = document.getElementById('tasksList');
  const filterStatus = document.getElementById('tasksFilterStatus').value;
  const filterPriority = document.getElementById('tasksFilterPriority').value;
  
  let tasks = getAllTasks();
  
  if (filterStatus === 'active') tasks = tasks.filter(t => !t.done);
  else if (filterStatus === 'done') tasks = tasks.filter(t => t.done);
  else if (filterStatus === 'overdue') tasks = tasks.filter(t => isTaskOverdue(t));
  
  if (filterPriority !== 'all') tasks = tasks.filter(t => t.priority === filterPriority);
  
  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  tasks.sort((a, b) => {
    if (a.done !== b.done) return a.done ? 1 : -1;
    if (isTaskOverdue(a) !== isTaskOverdue(b)) return isTaskOverdue(a) ? -1 : 1;
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    if (a.deadline && b.deadline) return new Date(a.deadline) - new Date(b.deadline);
    return 0;
  });
  
  if (tasks.length === 0) {
    list.innerHTML = '<div class="empty-hint">Нет задач</div>';
    return;
  }
  
  list.innerHTML = tasks.map(task => {
    const priorityData = getPriorityData(task.priority);
    const overdue = isTaskOverdue(task);
    const obj = state.objects.find(o => o.id === task.objectId);
    let label = '';
    if (task.objectType === 'planting') {
      const pl = obj?.plants?.find(p => p.id === task.plantingId);
      const plant = pl ? plants.find(p => p.id === pl.plantId) : null;
      label = plant ? `🌱 ${plant.name}` : 'Растение';
    } else if (obj) {
      if (obj.type === 'tree') {
        const tree = trees.find(t => t.id === obj.treeId);
        label = `🌳 ${tree?.name || 'Дерево'}`;
      } else {
        label = obj.name || obj.type;
      }
    }
    
    const deadlineStr = task.deadline ? new Date(task.deadline).toLocaleDateString('ru-RU') : '';
    
    return `
      <div class="task-item ${task.done ? 'done' : ''} ${overdue ? 'overdue' : ''}" style="border-left:4px solid ${getTaskColor(task)};">
        <div class="task-header-row">
          <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTaskDoneFromPanel(${task.objectId}, ${task.plantingId || 'null'}, ${task.id})">
          <span class="task-text" style="${task.done ? 'text-decoration:line-through;opacity:0.6;' : ''}">${task.text}</span>
        </div>
        <div class="task-meta">
          <span class="task-label">${label}</span>
          ${deadlineStr ? `<span class="task-deadline ${overdue ? 'overdue' : ''}">📅 ${deadlineStr}</span>` : ''}
          <span class="task-priority" style="color:${priorityData.color};">${priorityData.name.split(' ')[0]}</span>
        </div>
        <div class="task-actions">
          <button onclick="editTaskFromPanel(${task.objectId}, ${task.plantingId || 'null'}, ${task.id})" style="font-size:11px;padding:2px 6px;">✏️</button>
        </div>
      </div>
    `;
  }).join('');
}

function toggleTaskDoneFromPanel(objectId, plantingId, taskId) {
  const context = {
    objectType: plantingId ? 'planting' : 'object',
    objectId: objectId,
    plantingId: plantingId,
    taskId: taskId
  };
  toggleTaskDone(context);
}

function editTaskFromPanel(objectId, plantingId, taskId) {
  const context = {
    objectType: plantingId ? 'planting' : 'object',
    objectId: objectId,
    plantingId: plantingId,
    taskId: taskId
  };
  openTaskModal(context);
}

// ===== МОДАЛКА ЗАДАЧИ =====

let currentTaskContext = null;

function openTaskModal(context) {
  currentTaskContext = context;
  const modal = document.getElementById('taskModal');
  const title = document.getElementById('taskModalTitle');
  const deleteBtn = document.getElementById('taskDeleteBtn');
  
  if (context.taskId) {
    const task = getTaskById(context);
    if (!task) return;
    title.textContent = '✏️ Редактировать задачу';
    document.getElementById('taskText').value = task.text;
    document.getElementById('taskDeadline').value = task.deadline || '';
    document.getElementById('taskPriority').value = task.priority;
    document.getElementById('taskHighlightType').value = task.highlightType;
    document.getElementById('taskHighlightColor').value = task.highlightColor || getPriorityData(task.priority).color;
    deleteBtn.style.display = 'block';
  } else {
    title.textContent = '📝 Новая задача';
    document.getElementById('taskText').value = '';
    document.getElementById('taskDeadline').value = '';
    document.getElementById('taskPriority').value = 'medium';
    document.getElementById('taskHighlightType').value = 'marker';
    document.getElementById('taskHighlightColor').value = '#ff9800';
    deleteBtn.style.display = 'none';
  }
  
  updateTaskPreview();
  modal.classList.add('show');
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('show');
  currentTaskContext = null;
}

function updateTaskPreview() {
  const color = document.getElementById('taskHighlightColor').value;
  document.getElementById('taskPreview').style.background = color;
}

function getTaskById(context) {
  if (context.objectType === 'planting') {
    const obj = state.objects.find(o => o.id === context.objectId);
    if (!obj || !obj.plants) return null;
    const pl = obj.plants.find(p => p.id === context.plantingId);
    if (!pl || !pl.tasks) return null;
    return pl.tasks.find(t => t.id === context.taskId);
  } else {
    const obj = state.objects.find(o => o.id === context.objectId);
    if (!obj || !obj.tasks) return null;
    return obj.tasks.find(t => t.id === context.taskId);
  }
}

function getTasksList(context) {
  if (context.objectType === 'planting') {
    const obj = state.objects.find(o => o.id === context.objectId);
    if (!obj || !obj.plants) return [];
    const pl = obj.plants.find(p => p.id === context.plantingId);
    if (!pl) return [];
    if (!pl.tasks) pl.tasks = [];
    return pl.tasks;
  } else {
    const obj = state.objects.find(o => o.id === context.objectId);
    if (!obj) return [];
    if (!obj.tasks) obj.tasks = [];
    return obj.tasks;
  }
}

function saveCurrentTask() {
  const text = document.getElementById('taskText').value.trim();
  if (!text) { alert('Введите описание задачи'); return; }
  
  const deadline = document.getElementById('taskDeadline').value || null;
  const priority = document.getElementById('taskPriority').value;
  const highlightType = document.getElementById('taskHighlightType').value;
  const highlightColor = document.getElementById('taskHighlightColor').value || null;
  
  const tasks = getTasksList(currentTaskContext);
  
  if (currentTaskContext.taskId) {
    const task = tasks.find(t => t.id === currentTaskContext.taskId);
    if (task) {
      task.text = text;
      task.deadline = deadline;
      task.priority = priority;
      task.highlightType = highlightType;
      task.highlightColor = highlightColor;
    }
  } else {
    tasks.push(createTask(text, deadline, priority, highlightType, highlightColor));
  }
  
  closeTaskModal();
  render();
  if (document.getElementById('tasksPanel').style.display !== 'none') {
    renderTasksPanel();
  }
}

function deleteCurrentTask() {
  if (!currentTaskContext || !currentTaskContext.taskId) return;
  if (!confirm('Удалить задачу?')) return;
  
  const tasks = getTasksList(currentTaskContext);
  const idx = tasks.findIndex(t => t.id === currentTaskContext.taskId);
  if (idx >= 0) tasks.splice(idx, 1);
  
  closeTaskModal();
  render();
  if (document.getElementById('tasksPanel').style.display !== 'none') {
    renderTasksPanel();
  }
}

function toggleTaskDone(context) {
  const task = getTaskById(context);
  if (task) {
    task.done = !task.done;
    render();
    if (document.getElementById('tasksPanel').style.display !== 'none') {
      renderTasksPanel();
    }
  }
}

function openTasksForObject(objectType, objectId, plantingId) {
  const context = {
    objectType: objectType,
    objectId: objectId,
    plantingId: plantingId,
    taskId: null
  };
  openTaskModal(context);
}

function getTaskMarkerHTML(taskCount) {
  if (taskCount.active === 0) return '';
  const color = taskCount.overdue > 0 ? '#d32f2f' : '#ff9800';
  return `<span style="position:absolute;top:-4px;right:-4px;background:${color};color:white;border-radius:50%;width:16px;height:16px;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:bold;box-shadow:0 1px 3px rgba(0,0,0,0.3);">${taskCount.active}</span>`;
}

// ===== МАРКЕРЫ ЗАДАЧ НА ХОЛСТЕ =====

function renderTaskMarkers(obj, x, y, size) {
  if (!obj.tasks || obj.tasks.length === 0) return;
  
  const ns = 'http://www.w3.org/2000/svg';
  const activeTasks = obj.tasks.filter(t => !t.done);
  if (activeTasks.length === 0) return;
  
  const urgentTasks = activeTasks.filter(t => t.priority === 'urgent' || isTaskOverdue(t));
  const topTask = urgentTasks[0] || activeTasks[0];
  const color = getTaskColor(topTask);
  
  const marker = document.createElementNS(ns, 'g');
  marker.setAttribute('pointer-events', 'none');
  
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y - size - 4);
  circle.setAttribute('r', 6);
  circle.setAttribute('fill', color);
  circle.setAttribute('stroke', 'white');
  circle.setAttribute('stroke-width', '1');
  
  if (topTask.highlightType === 'pulse') {
    const anim = document.createElementNS(ns, 'animate');
    anim.setAttribute('attributeName', 'r');
    anim.setAttribute('values', '6;8;6');
    anim.setAttribute('dur', '1.5s');
    anim.setAttribute('repeatCount', 'indefinite');
    circle.appendChild(anim);
    
    const animOp = document.createElementNS(ns, 'animate');
    animOp.setAttribute('attributeName', 'opacity');
    animOp.setAttribute('values', '0.9;0.4;0.9');
    animOp.setAttribute('dur', '1.5s');
    animOp.setAttribute('repeatCount', 'indefinite');
    circle.appendChild(animOp);
  }
  
  marker.appendChild(circle);
  
  const text = document.createElementNS(ns, 'text');
  text.setAttribute('x', x);
  text.setAttribute('y', y - size - 1);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '8');
  text.setAttribute('font-weight', 'bold');
  text.setAttribute('fill', 'white');
  text.textContent = activeTasks.length;
  marker.appendChild(text);
  
  objectsLayer.appendChild(marker);
  
  if (topTask.highlightType === 'glow') {
    const glow = document.createElementNS(ns, 'circle');
    glow.setAttribute('cx', x);
    glow.setAttribute('cy', y);
    glow.setAttribute('r', size + 4);
    glow.setAttribute('fill', 'none');
    glow.setAttribute('stroke', color);
    glow.setAttribute('stroke-width', '2');
    glow.setAttribute('opacity', '0.5');
    glow.setAttribute('pointer-events', 'none');
    objectsLayer.appendChild(glow);
  }
  
  if (topTask.highlightType === 'border') {
    const border = document.createElementNS(ns, 'circle');
    border.setAttribute('cx', x);
    border.setAttribute('cy', y);
    border.setAttribute('r', size + 2);
    border.setAttribute('fill', 'none');
    border.setAttribute('stroke', color);
    border.setAttribute('stroke-width', '1.5');
    border.setAttribute('stroke-dasharray', '3,2');
    border.setAttribute('pointer-events', 'none');
    objectsLayer.appendChild(border);
  }
}

function renderPlantingTaskMarkers(pl, x, y, r) {
  if (!pl.tasks || pl.tasks.length === 0) return;
  
  const ns = 'http://www.w3.org/2000/svg';
  const activeTasks = pl.tasks.filter(t => !t.done);
  if (activeTasks.length === 0) return;
  
  const urgentTasks = activeTasks.filter(t => t.priority === 'urgent' || isTaskOverdue(t));
  const topTask = urgentTasks[0] || activeTasks[0];
  const color = getTaskColor(topTask);
  
  const marker = document.createElementNS(ns, 'g');
  marker.setAttribute('pointer-events', 'none');
  
  const circle = document.createElementNS(ns, 'circle');
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y - r - 10);
  circle.setAttribute('r', 5);
  circle.setAttribute('fill', color);
  circle.setAttribute('stroke', 'white');
  circle.setAttribute('stroke-width', '1');
  
  if (topTask.highlightType === 'pulse') {
    const anim = document.createElementNS(ns, 'animate');
    anim.setAttribute('attributeName', 'r');
    anim.setAttribute('values', '5;7;5');
    anim.setAttribute('dur', '1.5s');
    anim.setAttribute('repeatCount', 'indefinite');
    circle.appendChild(anim);
  }
  
  marker.appendChild(circle);
  
  const text = document.createElementNS(ns, 'text');
  text.setAttribute('x', x);
  text.setAttribute('y', y - r - 8);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('font-size', '7');
  text.setAttribute('font-weight', 'bold');
  text.setAttribute('fill', 'white');
  text.textContent = activeTasks.length;
  marker.appendChild(text);
  
  objectsLayer.appendChild(marker);
}

// ===== DROPDOWN "КАРТЫ" =====

function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  
  // Закрываем все другие dropdown'ы
  document.querySelectorAll('.dropdown').forEach(d => {
    if (d.id !== dropdownId) d.classList.remove('open');
  });
  
  dropdown.classList.toggle('open');
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
}

// Закрытие dropdown при клике вне
document.addEventListener('click', (e) => {
  if (!e.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
});

// ===== КАРТА ЗАДАЧ =====

function toggleTaskHighlight() {
  state.taskHighlightMode = !state.taskHighlightMode;
  
  const hintBar = document.getElementById('hintBar');
  
  if (state.taskHighlightMode) {
    // Считаем статистику
    let totalActive = 0;
    let totalOverdue = 0;
    let plantsWithTasks = 0;
    
    state.objects.forEach(obj => {
      if (obj.plants) {
        obj.plants.forEach(pl => {
          const count = getTasksCount(pl);
          if (count.active > 0) {
            plantsWithTasks++;
            totalActive += count.active;
            totalOverdue += count.overdue;
          }
        });
      }
    });
    
    hintBar.textContent = `📋 Карта задач: ${plantsWithTasks} растений с ${totalActive} активными задачами${totalOverdue > 0 ? ` (${totalOverdue} просроченных!)` : ''}. Нажмите "🗺️ Карты → Карта задач" ещё раз, чтобы выключить.`;
    hintBar.classList.add('task-highlight-active');
  } else {
    hintBar.textContent = '💡 Выберите инструмент или объект из панели слева.';
    hintBar.classList.remove('task-highlight-active');
  }
  
  render();
}