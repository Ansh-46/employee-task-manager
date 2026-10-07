/**
 * Employee Task Management System (ETMS)
 * Enterprise UI Controller & Dynamic Renderer
 */

document.addEventListener('DOMContentLoaded', function () {
  initToasts();
  initSidebar();
  initModals();
  initRoleSwitcher();
  initPageSpecifics();
});

// ============================================================================
// 1. Toast Notification System (Replaces alert() to fix Live Preview sandbox)
// ============================================================================
function initToasts() {
  if (!document.getElementById('etms-toast-container')) {
    const container = document.createElement('div');
    container.id = 'etms-toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

window.showToast = function (message, type = 'info', title = '') {
  const container = document.getElementById('etms-toast-container');
  if (!container) return;

  const titles = {
    success: title || 'Success',
    error: title || 'Error',
    warning: title || 'Warning',
    info: title || 'Notification'
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'ℹ'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ'}</div>
    <div class="toast-body">
      <div class="toast-title">${titles[type]}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" type="button">&times;</button>
  `;

  const closeBtn = toast.querySelector('.toast-close');
  closeBtn.addEventListener('click', () => {
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 250);
  });

  container.appendChild(toast);

  // Auto remove after 3.8s
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-hiding');
      setTimeout(() => toast.remove(), 250);
    }
  }, 3800);
};

// ============================================================================
// 2. Navigation & Sidebar Controller
// ============================================================================
function initSidebar() {
  const mobileToggle = document.getElementById('mobileToggle');
  const sidebar = document.getElementById('sidebar');

  if (mobileToggle && sidebar) {
    mobileToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });

    document.addEventListener('click', function (e) {
      if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // Safe active link detection (strips query parameters and hashes)
  const currentFileName = window.location.pathname.split('/').pop().split('?')[0].split('#')[0] || 'index.html';
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const targetFile = href.split('?')[0].split('#')[0];
    if (targetFile === currentFileName || (currentFileName === '' && targetFile === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// ============================================================================
// 3. Modal Manager
// ============================================================================
function initModals() {
  window.openModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Focus first input if available
      const firstInput = modal.querySelector('input:not([type=hidden]), select, textarea');
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
    }
  };

  window.closeModal = function (modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  // Click outside backdrop to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  });

  // ESC key to close active modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
}

// ============================================================================
// 4. Role Switcher & User Profile Sync
// ============================================================================
function initRoleSwitcher() {
  const currentUser = window.ETMS ? window.ETMS.getCurrentUser() : null;
  if (!currentUser) return;

  // Sync role badge and user snippets on sidebar and topbar
  document.querySelectorAll('.current-user-name').forEach(el => el.textContent = currentUser.name);
  document.querySelectorAll('.current-user-email').forEach(el => el.textContent = currentUser.email);
  document.querySelectorAll('.current-user-initials').forEach(el => el.textContent = currentUser.initials);
  document.querySelectorAll('.current-user-role-badge').forEach(el => {
    el.textContent = currentUser.role === 'admin' ? 'Administrator' : 'Team Member';
    el.className = `badge ${currentUser.role === 'admin' ? 'badge-admin' : 'badge-employee'}`;
  });

  // Topbar quick role switcher button (if present)
  const roleToggleBtn = document.getElementById('roleToggleBtn');
  if (roleToggleBtn) {
    roleToggleBtn.addEventListener('click', () => {
      const nextRole = currentUser.role === 'admin' ? 'employee' : 'admin';
      window.ETMS.setCurrentUserRole(nextRole);
      showToast(`Switched view to ${nextRole.toUpperCase()}`, 'info');
      setTimeout(() => window.location.reload(), 400);
    });
  }
}

// ============================================================================
// 5. Page-Specific Dynamic Controllers
// ============================================================================
function initPageSpecifics() {
  const path = window.location.pathname;

  if (document.getElementById('loginForm')) {
    handleLoginPage();
  } else if (document.getElementById('dashboardView')) {
    handleDashboardPage();
  } else if (document.getElementById('tasksView')) {
    handleTasksPage();
  } else if (document.getElementById('employeesView')) {
    handleEmployeesPage();
  } else if (document.getElementById('profileView')) {
    handleProfilePage();
  }
}

// Helper: Status Badges
function getStatusBadge(status) {
  const map = {
    pending: '<span class="status-pill status-pending"><span class="status-dot"></span> Pending</span>',
    in_progress: '<span class="status-pill status-in-progress"><span class="status-dot pulse"></span> In Progress</span>',
    completed: '<span class="status-pill status-completed"><span class="status-dot"></span> Completed</span>',
    overdue: '<span class="status-pill status-overdue"><span class="status-dot"></span> Overdue</span>'
  };
  return map[status] || `<span class="status-pill status-pending">${status}</span>`;
}

// Helper: Priority Badges
function getPriorityBadge(priority) {
  const map = {
    high: '<span class="priority-pill priority-high"><span class="priority-indicator"></span> High</span>',
    medium: '<span class="priority-pill priority-medium"><span class="priority-indicator"></span> Medium</span>',
    low: '<span class="priority-pill priority-low"><span class="priority-indicator"></span> Low</span>'
  };
  return map[priority] || `<span class="priority-pill">${priority}</span>`;
}

// Helper: Populate employee select options
function populateEmployeeSelect(selectEl) {
  if (!selectEl || !window.ETMS) return;
  const employees = window.ETMS.getEmployees();
  selectEl.innerHTML = '<option value="">Select Assignee...</option>';
  employees.forEach(emp => {
    const opt = document.createElement('option');
    opt.value = emp.id;
    opt.textContent = `${emp.firstName} ${emp.lastName} (${emp.department})`;
    selectEl.appendChild(opt);
  });
}

// ----------------------------------------------------------------------------
// Page Controller: Login
// ----------------------------------------------------------------------------
function handleLoginPage() {
  const roleButtons = document.querySelectorAll('.role-tab-btn');
  const roleInput = document.getElementById('selectedRole');
  const emailInput = document.getElementById('loginEmail');
  const form = document.getElementById('loginForm');

  roleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      roleButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const role = btn.dataset.role;
      if (roleInput) roleInput.value = role;

      if (emailInput) {
        if (role === 'admin') {
          emailInput.value = 'admin@corp.com';
        } else {
          emailInput.value = 'emily.miller@corp.com';
        }
      }
    });
  });

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const role = roleInput ? roleInput.value : 'admin';
      window.ETMS.setCurrentUserRole(role);
      showToast(`Authenticated as ${role.toUpperCase()}. Redirecting...`, 'success');
      setTimeout(() => {
        window.location.href = '/dashboard/';
      }, 600);
    });
  }
}

// ----------------------------------------------------------------------------
// Page Controller: Dashboard
// ----------------------------------------------------------------------------
function handleDashboardPage() {
  renderDashboardStats();
  renderDashboardRecentTasks();

  const taskForm = document.getElementById('createTaskForm');
  const assigneeSelect = document.getElementById('newTaskAssignee');
  populateEmployeeSelect(assigneeSelect);

  if (taskForm) {
    taskForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('newTaskTitle').value.trim();
      const desc = document.getElementById('newTaskDesc').value.trim();
      const assignee = assigneeSelect.value;
      const priority = document.getElementById('newTaskPriority').value;
      const dueDate = document.getElementById('newTaskDueDate').value;

      if (!title || !assignee || !dueDate) {
        showToast('Please fill all required fields.', 'error');
        return;
      }

      window.ETMS.addTask({
        title,
        description: desc,
        assignedTo: assignee,
        priority,
        dueDate
      });

      showToast('New task created and assigned successfully!', 'success');
      closeModal('createTaskModal');
      taskForm.reset();
      renderDashboardStats();
      renderDashboardRecentTasks();
    });
  }
}

function renderDashboardStats() {
  if (!window.ETMS) return;
  const stats = window.ETMS.getTaskStats();
  const elTotal = document.getElementById('statTotalTasks');
  const elInProgress = document.getElementById('statInProgress');
  const elCompleted = document.getElementById('statCompleted');
  const elOverdue = document.getElementById('statOverdue');

  if (elTotal) elTotal.textContent = stats.total;
  if (elInProgress) elInProgress.textContent = stats.inProgress;
  if (elCompleted) elCompleted.textContent = stats.completed;
  if (elOverdue) elOverdue.textContent = stats.overdue;
}

function renderDashboardRecentTasks() {
  const container = document.getElementById('recentTasksTbody');
  if (!container || !window.ETMS) return;

  const tasks = window.ETMS.getTasks().slice(0, 5);
  if (tasks.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No tasks created yet. Click "New Task" to create one.</td></tr>';
    return;
  }

  container.innerHTML = tasks.map(task => {
    const emp = window.ETMS.getEmployeeById(task.assignedTo) || {
      firstName: 'Unassigned',
      lastName: '',
      initials: 'UA',
      avatarBg: '#94a3b8'
    };

    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.92rem;">${escapeHtml(task.title)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${escapeHtml(task.description.substring(0, 55))}...</div>
        </td>
        <td>
          <div class="user-cell">
            <div class="avatar-tag" style="background-color: ${emp.avatarBg};">${emp.initials}</div>
            <div>
              <div style="font-weight: 600; font-size: 0.88rem;">${emp.firstName} ${emp.lastName}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.department || 'Operations'}</div>
            </div>
          </div>
        </td>
        <td>${getPriorityBadge(task.priority)}</td>
        <td style="font-size: 0.86rem; color: var(--text-main);">${task.dueDate}</td>
        <td>${getStatusBadge(task.status)}</td>
        <td>
          <button class="action-btn" onclick="openQuickStatusModal('${task.id}')" title="Change Status">
            Edit
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ----------------------------------------------------------------------------
// Page Controller: Tasks (Table + Kanban + Filter + CRUD)
// ----------------------------------------------------------------------------
function handleTasksPage() {
  populateEmployeeSelect(document.getElementById('newTaskAssignee'));
  renderTasksView();

  // Search and Filter Listeners
  const searchInput = document.getElementById('taskSearchInput');
  const statusFilter = document.getElementById('taskStatusFilter');
  const priorityFilter = document.getElementById('taskPriorityFilter');

  if (searchInput) searchInput.addEventListener('input', renderTasksView);
  if (statusFilter) statusFilter.addEventListener('change', renderTasksView);
  if (priorityFilter) priorityFilter.addEventListener('change', renderTasksView);

  // View Mode Switcher (Table vs Kanban)
  const viewToggleBtns = document.querySelectorAll('.view-toggle-btn');
  viewToggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewToggleBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const viewMode = btn.dataset.view;
      const tableView = document.getElementById('tasksTableView');
      const kanbanView = document.getElementById('tasksKanbanView');

      if (viewMode === 'kanban') {
        if (tableView) tableView.style.display = 'none';
        if (kanbanView) kanbanView.style.display = 'grid';
      } else {
        if (tableView) tableView.style.display = 'block';
        if (kanbanView) kanbanView.style.display = 'none';
      }
    });
  });

  // Task Creation Form
  const taskForm = document.getElementById('createTaskForm');
  if (taskForm) {
    taskForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const title = document.getElementById('newTaskTitle').value.trim();
      const desc = document.getElementById('newTaskDesc').value.trim();
      const assignee = document.getElementById('newTaskAssignee').value;
      const priority = document.getElementById('newTaskPriority').value;
      const dueDate = document.getElementById('newTaskDueDate').value;

      if (!title || !assignee || !dueDate) {
        showToast('Please fill all required task fields.', 'error');
        return;
      }

      window.ETMS.addTask({
        title,
        description: desc,
        assignedTo: assignee,
        priority,
        dueDate
      });

      showToast('Task created and assigned!', 'success');
      closeModal('createTaskModal');
      taskForm.reset();
      renderTasksView();
    });
  }

  // Update Status Form
  const updateForm = document.getElementById('updateStatusForm');
  if (updateForm) {
    updateForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const taskId = document.getElementById('editTaskId').value;
      const newStatus = document.getElementById('editStatusSelect').value;
      const progress = parseInt(document.getElementById('editProgressRange').value, 10);

      window.ETMS.updateTaskStatus(taskId, newStatus, progress);
      showToast('Task status updated successfully!', 'success');
      closeModal('updateStatusModal');
      renderTasksView();
    });
  }
}

function renderTasksView() {
  if (!window.ETMS) return;
  const searchVal = (document.getElementById('taskSearchInput')?.value || '').toLowerCase().trim();
  const statusVal = document.getElementById('taskStatusFilter')?.value || '';
  const priorityVal = document.getElementById('taskPriorityFilter')?.value || '';

  let tasks = window.ETMS.getTasks();

  // Apply filters
  tasks = tasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchVal) ||
                        task.description.toLowerCase().includes(searchVal);
    const matchStatus = !statusVal || task.status === statusVal;
    const matchPriority = !priorityVal || task.priority === priorityVal;
    return matchSearch && matchStatus && matchPriority;
  });

  const countEl = document.getElementById('activeTasksCount');
  if (countEl) countEl.textContent = tasks.length;

  renderTasksTable(tasks);
  renderTasksKanban(tasks);
}

function renderTasksTable(tasks) {
  const container = document.getElementById('tasksTbody');
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 32px;">No matching tasks found. Adjust filters or create a new task.</td></tr>';
    return;
  }

  container.innerHTML = tasks.map(task => {
    const emp = window.ETMS.getEmployeeById(task.assignedTo) || {
      firstName: 'Unassigned',
      lastName: '',
      initials: 'UA',
      avatarBg: '#94a3b8'
    };

    return `
      <tr>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.94rem;">${escapeHtml(task.title)}</div>
          <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 3px;">${escapeHtml(task.description)}</div>
          <div class="progress-bar-wrap" style="margin-top: 8px;">
            <div class="progress-bar-fill" style="width: ${task.progress || 0}%;"></div>
          </div>
        </td>
        <td>
          <div class="user-cell">
            <div class="avatar-tag" style="background-color: ${emp.avatarBg};">${emp.initials}</div>
            <div>
              <div style="font-weight: 600; font-size: 0.88rem;">${emp.firstName} ${emp.lastName}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${emp.department || 'Operations'}</div>
            </div>
          </div>
        </td>
        <td>${getPriorityBadge(task.priority)}</td>
        <td style="font-size: 0.86rem; color: var(--text-main); font-weight: 500;">${task.dueDate}</td>
        <td>${getStatusBadge(task.status)}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="action-btn" onclick="openQuickStatusModal('${task.id}')" title="Update Status">
              Update
            </button>
            <button class="action-btn danger" onclick="deleteTaskPrompt('${task.id}')" title="Delete Task">
              ✕
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function renderTasksKanban(tasks) {
  const colPending = document.getElementById('kanbanPending');
  const colInProgress = document.getElementById('kanbanInProgress');
  const colCompleted = document.getElementById('kanbanCompleted');

  if (!colPending || !colInProgress || !colCompleted) return;

  colPending.innerHTML = '';
  colInProgress.innerHTML = '';
  colCompleted.innerHTML = '';

  let cPending = 0, cInProg = 0, cDone = 0;

  tasks.forEach(task => {
    const emp = window.ETMS.getEmployeeById(task.assignedTo) || {
      firstName: 'Unassigned',
      initials: 'UA',
      avatarBg: '#94a3b8'
    };

    const cardHtml = `
      <div class="kanban-card" onclick="openQuickStatusModal('${task.id}')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          ${getPriorityBadge(task.priority)}
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${task.dueDate}</span>
        </div>
        <h4 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 6px; line-height: 1.3;">${escapeHtml(task.title)}</h4>
        <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 12px; line-height: 1.4;">${escapeHtml(task.description.substring(0, 80))}...</p>
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-light); padding-top: 8px;">
          <div class="user-cell" style="gap: 6px;">
            <div class="avatar-tag sm" style="background-color: ${emp.avatarBg};">${emp.initials}</div>
            <span style="font-size: 0.78rem; font-weight: 500;">${emp.firstName}</span>
          </div>
          <span style="font-size: 0.76rem; font-weight: 600; color: var(--primary);">${task.progress || 0}%</span>
        </div>
      </div>
    `;

    if (task.status === 'completed') {
      colCompleted.insertAdjacentHTML('beforeend', cardHtml);
      cDone++;
    } else if (task.status === 'in_progress') {
      colInProgress.insertAdjacentHTML('beforeend', cardHtml);
      cInProg++;
    } else {
      colPending.insertAdjacentHTML('beforeend', cardHtml);
      cPending++;
    }
  });

  const countP = document.getElementById('countKanbanPending');
  const countI = document.getElementById('countKanbanInProgress');
  const countC = document.getElementById('countKanbanCompleted');

  if (countP) countP.textContent = cPending;
  if (countI) countI.textContent = cInProg;
  if (countC) countC.textContent = cDone;
}

window.openQuickStatusModal = function (taskId) {
  const task = window.ETMS.getTasks().find(t => t.id === taskId);
  if (!task) return;

  const idInput = document.getElementById('editTaskId');
  const titleEl = document.getElementById('editTaskTitleText');
  const selectEl = document.getElementById('editStatusSelect');
  const rangeEl = document.getElementById('editProgressRange');
  const progressText = document.getElementById('editProgressVal');

  if (idInput) idInput.value = task.id;
  if (titleEl) titleEl.textContent = task.title;
  if (selectEl) selectEl.value = task.status;
  if (rangeEl) {
    rangeEl.value = task.progress || 0;
    if (progressText) progressText.textContent = `${rangeEl.value}%`;
    rangeEl.oninput = () => {
      if (progressText) progressText.textContent = `${rangeEl.value}%`;
    };
  }

  openModal('updateStatusModal');
};

window.deleteTaskPrompt = function (taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    window.ETMS.deleteTask(taskId);
    showToast('Task deleted successfully', 'warning');
    renderTasksView();
  }
};

// ----------------------------------------------------------------------------
// Page Controller: Employees
// ----------------------------------------------------------------------------
function handleEmployeesPage() {
  renderEmployeesList();

  const searchInput = document.getElementById('empSearchInput');
  const deptFilter = document.getElementById('empDeptFilter');

  if (searchInput) searchInput.addEventListener('input', renderEmployeesList);
  if (deptFilter) deptFilter.addEventListener('change', renderEmployeesList);

  const empForm = document.getElementById('addEmployeeForm');
  if (empForm) {
    empForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const firstName = document.getElementById('empFirstName').value.trim();
      const lastName = document.getElementById('empLastName').value.trim();
      const email = document.getElementById('empEmail').value.trim();
      const department = document.getElementById('empDept').value;
      const designation = document.getElementById('empDesignation').value.trim();
      const role = document.getElementById('empRole').value;

      if (!firstName || !lastName || !email || !department || !designation) {
        showToast('Please complete all employee fields.', 'error');
        return;
      }

      window.ETMS.addEmployee({
        firstName,
        lastName,
        email,
        department,
        designation,
        role
      });

      showToast(`Employee ${firstName} ${lastName} added successfully!`, 'success');
      closeModal('addEmployeeModal');
      empForm.reset();
      renderEmployeesList();
    });
  }
}

function renderEmployeesList() {
  const container = document.getElementById('employeesTbody');
  if (!container || !window.ETMS) return;

  const searchVal = (document.getElementById('empSearchInput')?.value || '').toLowerCase().trim();
  const deptVal = document.getElementById('empDeptFilter')?.value || '';

  let employees = window.ETMS.getEmployees();
  const allTasks = window.ETMS.getTasks();

  employees = employees.filter(emp => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const matchSearch = fullName.includes(searchVal) ||
                        emp.email.toLowerCase().includes(searchVal) ||
                        emp.designation.toLowerCase().includes(searchVal);
    const matchDept = !deptVal || emp.department.toLowerCase().includes(deptVal.toLowerCase());
    return matchSearch && matchDept;
  });

  const countEl = document.getElementById('empShowingCount');
  if (countEl) countEl.textContent = employees.length;

  if (employees.length === 0) {
    container.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 32px;">No matching employee records.</td></tr>';
    return;
  }

  container.innerHTML = employees.map(emp => {
    const empTaskCount = allTasks.filter(t => t.assignedTo === emp.id && t.status !== 'completed').length;
    const statusPill = emp.status === 'active'
      ? '<span class="status-pill status-completed"><span class="status-dot"></span> Active</span>'
      : '<span class="status-pill status-pending"><span class="status-dot"></span> On Leave</span>';

    const roleBadge = emp.role === 'admin'
      ? '<span class="badge badge-admin">Admin</span>'
      : '<span class="badge badge-employee">Employee</span>';

    return `
      <tr>
        <td>
          <div class="user-cell">
            <div class="avatar-tag" style="background-color: ${emp.avatarBg};">${emp.initials}</div>
            <div>
              <div style="font-weight: 600; font-size: 0.92rem;">${emp.firstName} ${emp.lastName}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${emp.email}</div>
            </div>
          </div>
        </td>
        <td><span style="font-weight: 500;">${emp.department}</span></td>
        <td><span style="color: var(--text-main); font-size: 0.88rem;">${emp.designation}</span></td>
        <td>${roleBadge}</td>
        <td><strong>${empTaskCount}</strong> active</td>
        <td>${statusPill}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="action-btn" onclick="viewEmployeeProfile('${emp.id}')">Profile</button>
            <button class="action-btn danger" onclick="deleteEmployeePrompt('${emp.id}')">✕</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.deleteEmployeePrompt = function (empId) {
  if (confirm('Are you sure you want to remove this employee record?')) {
    window.ETMS.deleteEmployee(empId);
    showToast('Employee removed successfully', 'warning');
    renderEmployeesList();
  }
};

window.viewEmployeeProfile = function (empId) {
  // Store targeted employee ID and redirect to profile.html
  sessionStorage.setItem('etms_view_emp_id', empId);
  window.location.href = '/profile/';
};

// ----------------------------------------------------------------------------
// Page Controller: Profile
// ----------------------------------------------------------------------------
function handleProfilePage() {
  if (!window.ETMS) return;
  const viewedEmpId = sessionStorage.getItem('etms_view_emp_id');
  const currentUser = window.ETMS.getCurrentUser();
  const emp = (viewedEmpId ? window.ETMS.getEmployeeById(viewedEmpId) : null) ||
              window.ETMS.getEmployeeById(currentUser.id) ||
              window.ETMS.getEmployees()[0];

  if (!emp) return;

  // Populate Profile Header
  const nameEl = document.getElementById('profileFullName');
  const roleEl = document.getElementById('profileRoleBadge');
  const titleEl = document.getElementById('profileTitle');
  const emailEl = document.getElementById('profileEmail');
  const avatarEl = document.getElementById('profileAvatar');
  const deptEl = document.getElementById('profileDept');

  if (nameEl) nameEl.textContent = `${emp.firstName} ${emp.lastName}`;
  if (roleEl) {
    roleEl.textContent = emp.role === 'admin' ? 'Administrator' : 'Team Member';
    roleEl.className = `badge ${emp.role === 'admin' ? 'badge-admin' : 'badge-employee'}`;
  }
  if (titleEl) titleEl.textContent = emp.designation;
  if (deptEl) deptEl.textContent = emp.department;
  if (emailEl) emailEl.textContent = emp.email;
  if (avatarEl) {
    avatarEl.textContent = emp.initials;
    avatarEl.style.backgroundColor = emp.avatarBg;
  }

  // Populate Assigned Tasks
  const myTasks = window.ETMS.getTasks().filter(t => t.assignedTo === emp.id);
  const tbody = document.getElementById('profileTasksTbody');
  const statAssigned = document.getElementById('profileStatAssigned');
  const statInProg = document.getElementById('profileStatInProg');
  const statDone = document.getElementById('profileStatDone');

  if (statAssigned) statAssigned.textContent = myTasks.length;
  if (statInProg) statInProg.textContent = myTasks.filter(t => t.status === 'in_progress').length;
  if (statDone) statDone.textContent = myTasks.filter(t => t.status === 'completed').length;

  if (tbody) {
    if (myTasks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 24px;">No active tasks assigned to this member.</td></tr>';
    } else {
      tbody.innerHTML = myTasks.map(task => `
        <tr>
          <td>
            <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(task.title)}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${escapeHtml(task.description)}</div>
          </td>
          <td>${getPriorityBadge(task.priority)}</td>
          <td style="font-size: 0.86rem;">${task.dueDate}</td>
          <td>${getStatusBadge(task.status)}</td>
          <td>
            <button class="action-btn" onclick="openQuickStatusModal('${task.id}')">Update</button>
          </td>
        </tr>
      `).join('');
    }
  }

  // Update Status Form listener
  const updateForm = document.getElementById('updateStatusForm');
  if (updateForm) {
    updateForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const taskId = document.getElementById('editTaskId').value;
      const newStatus = document.getElementById('editStatusSelect').value;
      const progress = parseInt(document.getElementById('editProgressRange').value, 10);

      window.ETMS.updateTaskStatus(taskId, newStatus, progress);
      showToast('Task updated successfully!', 'success');
      closeModal('updateStatusModal');
      handleProfilePage();
    });
  }
}

// Utility: HTML Escaping
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


