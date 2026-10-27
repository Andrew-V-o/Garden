// ===== СИСТЕМА ЗАДАЧ-НАПОМИНАЛОК =====

function createTask(text, deadline, priority, highlightType, highlightColor) {
  return {
    id: nextTaskId++,
    text: text,
    deadline: deadline || null,
    priority: priority || 'medium',
    highlightType: highlightType || 'marker',
    highlightColor: highlightColor || null,
    done: false,
    createdAt: new Date().toISOString()
  };
}

function getPriorityData(priorityId) {
  return TASK_PRIORITIES.find(p => p.id === priorityId) || TASK_PRIORITIES[1];
}

function getTaskColor(task) {
  if (task.highlightColor) return task.highlightColor;
  return getPriorityData(task.priority).color;
}

function isTaskOverdue(task) {
  if (!task.deadline || task.done) return false;
  return new Date(task.deadline) < new Date();
}

function getTasksCount(obj) {
  if (!obj.tasks) return { total: 0, active: 0, overdue: 0 };
  const total = obj.tasks.length;
  const active = obj.tasks.filter(t => !t.done).length;
  const overdue = obj.tasks.filter(t => isTaskOverdue(t)).length;
  return { total, active, overdue };
}

function getAllTasks() {
  const all = [];
  state.objects.forEach(obj => {
    if (obj.tasks && obj.tasks.length > 0) {
      obj.tasks.forEach(task => {
        all.push({ ...task, objectId: obj.id, objectType: obj.type });
      });
    }
    if (obj.plants) {
      obj.plants.forEach(pl => {
        if (pl.tasks && pl.tasks.length > 0) {
          pl.tasks.forEach(task => {
            all.push({ ...task, objectId: obj.id, plantingId: pl.id, objectType: 'planting' });
          });
        }
      });
    }
  });
  return all;
}

// ===== СИСТЕМА ИСТОРИИ (UNDO/REDO) =====

function saveState() {
  const stateSnapshot = JSON.parse(JSON.stringify(state.objects));
  
  // Проверяем, не идентично ли последнее состояние текущему
  if (state.history.length > 0 && state.historyIndex >= 0) {
    const lastState = JSON.stringify(state.history[state.historyIndex]);
    const currentState = JSON.stringify(stateSnapshot);
    if (lastState === currentState) return;
  }
  
  if (state.historyIndex < state.history.length - 1) {
    state.history = state.history.slice(0, state.historyIndex + 1);
  }
  
  state.history.push(stateSnapshot);
  
  if (state.history.length > MAX_HISTORY) {
    state.history.shift();
  }
  
  state.historyIndex = state.history.length - 1;
  
  updateHistoryButtons();
}

function undo() {
  if (state.historyIndex > 0) {
    state.historyIndex--;
    state.objects = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
    state.selectedId = null;
    state.selectedPlantingId = null;
    closePlantPopup();
    closeTreePopup();
    closeDecorPopup();
    closeMulchPopup();
    closePathPopup();
    render();
    updateHistoryButtons();
  }
}

function redo() {
  if (state.historyIndex < state.history.length - 1) {
    state.historyIndex++;
    state.objects = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
    state.selectedId = null;
    state.selectedPlantingId = null;
    closePlantPopup();
    closeTreePopup();
    closeDecorPopup();
    closeMulchPopup();
    closePathPopup();
    render();
    updateHistoryButtons();
  }
}

function updateHistoryButtons() {
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  
  if (undoBtn) {
    undoBtn.style.opacity = state.historyIndex > 0 ? '1' : '0.3';
    undoBtn.style.cursor = state.historyIndex > 0 ? 'pointer' : 'not-allowed';
  }
  
  if (redoBtn) {
    redoBtn.style.opacity = state.historyIndex < state.history.length - 1 ? '1' : '0.3';
    redoBtn.style.cursor = state.historyIndex < state.history.length - 1 ? 'pointer' : 'not-allowed';
  }
}

function initHistory() {
  state.history = [];
  state.historyIndex = -1;
  saveState();
}