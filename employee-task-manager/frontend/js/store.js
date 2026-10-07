/**
 * Employee Task Management System (ETMS)
 * Hybrid State & REST API Synchronization Layer
 * - Syncs with Django Backend REST endpoints (/api/...) when server is running.
 * - Gracefully falls back to LocalStorage in standalone/Live Server mode.
 */

(function () {
  const STORAGE_KEYS = {
    EMPLOYEES: 'etms_employees',
    TASKS: 'etms_tasks',
    CURRENT_USER: 'etms_current_user',
    INITIALIZED: 'etms_initialized_v2'
  };

  const isServerAvailable = window.location.protocol.startsWith('http');

  const DEFAULT_EMPLOYEES = [
    {
      id: 'EMP-100',
      firstName: 'Alex',
      lastName: 'Davies',
      email: 'admin@corp.com',
      department: 'Operations & Management',
      designation: 'Engineering Director & Admin',
      role: 'admin',
      status: 'active',
      avatarBg: '#2563eb',
      initials: 'AD',
      joined: 'Aug 2022'
    },
    {
      id: 'EMP-101',
      firstName: 'Emily',
      lastName: 'Miller',
      email: 'emily.miller@corp.com',
      department: 'Engineering',
      designation: 'Senior Backend Engineer',
      role: 'employee',
      status: 'active',
      avatarBg: '#0284c7',
      initials: 'EM',
      joined: 'Mar 2024'
    },
    {
      id: 'EMP-102',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@corp.com',
      department: 'DevOps & Cloud',
      designation: 'Cloud Infrastructure Lead',
      role: 'employee',
      status: 'active',
      avatarBg: '#d97706',
      initials: 'DK',
      joined: 'Jan 2024'
    },
    {
      id: 'EMP-103',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      email: 'sarah.jenkins@corp.com',
      department: 'Design & UI',
      designation: 'Lead Product Designer',
      role: 'employee',
      status: 'active',
      avatarBg: '#7c3aed',
      initials: 'SJ',
      joined: 'Jun 2024'
    },
    {
      id: 'EMP-104',
      firstName: 'Raj',
      lastName: 'Patel',
      email: 'raj.patel@corp.com',
      department: 'Engineering',
      designation: 'Full-Stack Developer',
      role: 'employee',
      status: 'on_leave',
      avatarBg: '#dc2626',
      initials: 'RP',
      joined: 'Nov 2023'
    }
  ];

  const DEFAULT_TASKS = [
    {
      id: 'TSK-1001',
      title: 'Implement JWT Token Authentication Service',
      description: 'Add refresh token rotation and bearer auth validation across microservice gateways.',
      assignedTo: 'EMP-101',
      department: 'Engineering',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2026-10-14',
      createdAt: '2026-10-01',
      progress: 65
    },
    {
      id: 'TSK-1002',
      title: 'Automate Staging CI/CD Pipeline on GitHub Actions',
      description: 'Run automated end-to-end linting, Django unit tests, and build Docker containers.',
      assignedTo: 'EMP-102',
      department: 'DevOps & Cloud',
      priority: 'medium',
      status: 'pending',
      dueDate: '2026-10-18',
      createdAt: '2026-10-02',
      progress: 10
    },
    {
      id: 'TSK-1003',
      title: 'Design Dark Mode Prototype and Token System',
      description: 'Build Figma design components and accessible high-contrast CSS variable themes.',
      assignedTo: 'EMP-103',
      department: 'Design & UI',
      priority: 'low',
      status: 'completed',
      dueDate: '2026-10-05',
      createdAt: '2026-09-28',
      progress: 100
    },
    {
      id: 'TSK-1004',
      title: 'Database Schema Migration & Index Tuning',
      description: 'Benchmark composite indexes on tasks table to improve query performance.',
      assignedTo: 'EMP-104',
      department: 'Engineering',
      priority: 'high',
      status: 'overdue',
      dueDate: '2026-10-03',
      createdAt: '2026-09-25',
      progress: 40
    },
    {
      id: 'TSK-1005',
      title: 'Role-Based Access Control (RBAC) Architecture Review',
      description: 'Audit employee permission boundaries between admin operations and employee self-service.',
      assignedTo: 'EMP-100',
      department: 'Operations & Management',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2026-10-16',
      createdAt: '2026-10-04',
      progress: 75
    },
    {
      id: 'TSK-1006',
      title: 'Employee Onboarding Document Portal',
      description: 'Create upload and compliance checklist interface for new engineering hires.',
      assignedTo: 'EMP-101',
      department: 'Engineering',
      priority: 'medium',
      status: 'pending',
      dueDate: '2026-10-22',
      createdAt: '2026-10-05',
      progress: 0
    }
  ];

  function initStorage() {
    try {
      if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(DEFAULT_EMPLOYEES));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
          role: 'admin',
          id: 'EMP-100',
          name: 'Alex Davies',
          email: 'admin@corp.com',
          initials: 'AD'
        }));
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      }
    } catch (e) {}
  }

  initStorage();

  // Background sync with Django REST API if available
  if (isServerAvailable) {
    fetch('/api/employees/')
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(res.data));
        }
      })
      .catch(() => {});

    fetch('/api/tasks/')
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(res.data));
        }
      })
      .catch(() => {});
  }

  window.ETMS = {
    getEmployees: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.EMPLOYEES);
        return raw ? JSON.parse(raw) : DEFAULT_EMPLOYEES;
      } catch (e) {
        return DEFAULT_EMPLOYEES;
      }
    },

    getEmployeeById: function (id) {
      return this.getEmployees().find(emp => emp.id === id) || null;
    },

    saveEmployees: function (employees) {
      try {
        localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
      } catch (e) {}
    },

    addEmployee: function (empData) {
      const employees = this.getEmployees();
      const id = 'EMP-' + (Math.floor(100 + Math.random() * 900));
      const initials = (empData.firstName[0] || 'U') + (empData.lastName[0] || 'S');
      const colors = ['#2563eb', '#0284c7', '#7c3aed', '#059669', '#d97706', '#dc2626'];
      const avatarBg = colors[Math.floor(Math.random() * colors.length)];

      const newEmp = {
        id: id,
        firstName: empData.firstName,
        lastName: empData.lastName,
        email: empData.email,
        department: empData.department,
        designation: empData.designation,
        role: empData.role || 'employee',
        status: 'active',
        avatarBg: avatarBg,
        initials: initials.toUpperCase(),
        joined: 'Just now'
      };

      employees.unshift(newEmp);
      this.saveEmployees(employees);

      // Async push to Django backend
      if (isServerAvailable) {
        fetch('/api/employees/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(empData)
        }).catch(() => {});
      }

      return newEmp;
    },

    deleteEmployee: function (id) {
      let employees = this.getEmployees();
      employees = employees.filter(e => e.id !== id);
      this.saveEmployees(employees);

      if (isServerAvailable) {
        fetch(`/api/employees/${id}/`, { method: 'DELETE' }).catch(() => {});
      }
    },

    getTasks: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
        return raw ? JSON.parse(raw) : DEFAULT_TASKS;
      } catch (e) {
        return DEFAULT_TASKS;
      }
    },

    saveTasks: function (tasks) {
      try {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
      } catch (e) {}
    },

    addTask: function (taskData) {
      const tasks = this.getTasks();
      const id = 'TSK-' + (Math.floor(1000 + Math.random() * 9000));
      const emp = this.getEmployeeById(taskData.assignedTo);

      const newTask = {
        id: id,
        title: taskData.title,
        description: taskData.description || 'No detailed instructions provided.',
        assignedTo: taskData.assignedTo,
        department: emp ? emp.department : 'General',
        priority: taskData.priority || 'medium',
        status: 'pending',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString().split('T')[0],
        progress: 0
      };

      tasks.unshift(newTask);
      this.saveTasks(tasks);

      // Async push to Django backend
      if (isServerAvailable) {
        fetch('/api/tasks/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        }).catch(() => {});
      }

      return newTask;
    },

    updateTaskStatus: function (taskId, newStatus, progressPercent) {
      const tasks = this.getTasks();
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        task.status = newStatus;
        if (typeof progressPercent === 'number') {
          task.progress = progressPercent;
        } else if (newStatus === 'completed') {
          task.progress = 100;
        } else if (newStatus === 'in_progress' && task.progress === 0) {
          task.progress = 25;
        }
        this.saveTasks(tasks);

        // Async sync to Django backend
        if (isServerAvailable) {
          fetch(`/api/tasks/${taskId}/status/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus, progress: task.progress })
          }).catch(() => {});
        }
      }
      return task;
    },

    deleteTask: function (taskId) {
      let tasks = this.getTasks();
      tasks = tasks.filter(t => t.id !== taskId);
      this.saveTasks(tasks);

      if (isServerAvailable) {
        fetch(`/api/tasks/${taskId}/`, { method: 'DELETE' }).catch(() => {});
      }
    },

    getCurrentUser: function () {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return raw ? JSON.parse(raw) : { role: 'admin', id: 'EMP-100', name: 'Alex Davies', email: 'admin@corp.com', initials: 'AD' };
      } catch (e) {
        return { role: 'admin', id: 'EMP-100', name: 'Alex Davies', email: 'admin@corp.com', initials: 'AD' };
      }
    },

    setCurrentUserRole: function (role) {
      let user = this.getCurrentUser();
      if (role === 'admin') {
        user = {
          role: 'admin',
          id: 'EMP-100',
          name: 'Alex Davies (Admin)',
          email: 'admin@corp.com',
          initials: 'AD'
        };
      } else {
        user = {
          role: 'employee',
          id: 'EMP-101',
          name: 'Emily Miller',
          email: 'emily.miller@corp.com',
          initials: 'EM'
        };
      }
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
      } catch (e) {}
      return user;
    },

    getTaskStats: function () {
      const tasks = this.getTasks();
      const today = new Date().toISOString().split('T')[0];

      let total = tasks.length;
      let inProgress = 0;
      let completed = 0;
      let pending = 0;
      let overdue = 0;

      tasks.forEach(t => {
        if (t.status === 'completed') {
          completed++;
        } else if (t.status === 'in_progress') {
          inProgress++;
        } else if (t.status === 'pending') {
          pending++;
        }

        if (t.status !== 'completed' && t.dueDate < today) {
          overdue++;
        }
      });

      return { total, inProgress, completed, pending, overdue };
    }
  };
})();
