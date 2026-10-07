# TaskFlow ERP &mdash; Full-Stack Employee Task Management System

[![Python](https://img.shields.io/badge/Python-3.13-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-6.1-darkgreen.svg)](https://www.djangoproject.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite3-lightblue.svg)](https://www.sqlite.org/)
[![Status](https://img.shields.io/badge/Status-Complete-success.svg)]()

TaskFlow ERP is a full-stack, enterprise-grade Employee Task Management System built with **HTML5, Modern CSS, Vanilla JavaScript, Python 3.13, Django 6.1, and SQLite3**. It provides end-to-end task assignment, status tracking, capacity monitoring, and role-based access control.

---

## ⚡ Quick Start (1-Click Launch)

### Option A: Automatic Launcher (Windows)
Double-click [**`RUN_SERVER.bat`**](file:///E:/coperateserve%20training/employee-task-manager/RUN_SERVER.bat) in the project root.  
It automatically:
1. Applies all Django schema migrations (`python manage.py migrate`).
2. Populates demo employees, departments, tasks, and superuser (`python seed_data.py`).
3. Launches the server at **`http://127.0.0.1:8000/`**.

### Option B: Manual Command Line
```powershell
# 1. Navigate to the backend directory
cd "E:\coperateserve training\employee-task-manager\backend"

# 2. Run database migrations
& "E:\python\python.exe" manage.py migrate

# 3. Seed initial database data
& "E:\python\python.exe" seed_data.py

# 4. Start the Django development server
& "E:\python\python.exe" manage.py runserver 127.0.0.1:8000
```

### Option C: Standalone Static Preview (No Python/Server Needed)
Open [**`frontend/index.html`**](file:///E:/coperateserve%20training/employee-task-manager/frontend/index.html) in your browser or with VS Code Live Server / Live Preview. The hybrid persistence engine automatically operates in client-side mode via `localStorage`.

---

## 🔐 Default Login Credentials

| Role | Username / Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@corp.com` | `password123` | Full dashboard, assign tasks, onboard staff, delete records |
| **Django Admin** | `admin` | `admin123` | Direct ORM database access via `/admin/` |
| **Employee (Backend)** | `emily.miller@corp.com` | `password123` | View assigned tasks, update status, track personal deliverables |
| **Employee (DevOps)** | `david.kim@corp.com` | `password123` | Self-service status reporting, profile view |

---

## 📂 Project Architecture & Directory Structure

```text
employee-task-manager/
│
├── backend/                         # Python + Django Web Application
│   ├── config/                      # Core Django configuration
│   │   ├── settings.py              # Installed apps, templates, static files, SQLite DB
│   │   ├── urls.py                  # Root URL routing (Admin, REST API, Frontend)
│   │   ├── wsgi.py / asgi.py        # Deployment entrypoints
│   │   └── __init__.py
│   │
│   ├── employees/                   # Staff & Department Directory App
│   │   ├── models.py                # Department & Employee models
│   │   ├── views.py                 # REST API controllers for staff CRUD
│   │   ├── urls.py                  # /api/employees/ endpoints
│   │   └── admin.py                 # Django admin registration
│   │
│   ├── tasks/                       # Deliverables & Analytics App
│   │   ├── models.py                # Task model (priority, status, deadline, progress)
│   │   ├── views.py                 # REST API for task CRUD, status updates, analytics
│   │   ├── urls.py                  # /api/tasks/, /api/stats/ endpoints
│   │   └── admin.py                 # Django admin registration
│   │
│   ├── db.sqlite3                   # Pre-seeded SQLite database
│   ├── manage.py                    # Django management CLI utility
│   └── seed_data.py                 # Idempotent database seeder
│
├── frontend/                        # Decoupled Modern User Interface
│   ├── css/
│   │   └── styles.css               # Slate design system, Kanban grid, toast system
│   ├── js/
│   │   ├── store.js                 # Hybrid data layer (Django REST sync + LocalStorage)
│   │   └── app.js                   # UI controller (modals, search, view toggles)
│   ├── index.html                   # Enterprise login page with role switchers
│   ├── dashboard.html               # Executive operations hub & KPI metrics
│   ├── tasks.html                   # Task orchestration (Table View & Kanban Board)
│   ├── employees.html               # Staff directory & onboarding modal
│   └── profile.html                 # Personal deliverables & self-service updates
│
├── RUN_SERVER.bat                   # 1-Click Windows execution script
├── PROJECT_REPORT.md                # Comprehensive academic & enterprise project report
├── PROJECT_PPT_OUTLINE.md           # 12-slide evaluation presentation deck & speaker notes
├── VIVA_QUESTIONS_AND_ANSWERS.md    # 35+ technical viva / interview preparation Q&As
├── requirements.txt                 # Backend Python package specifications
└── README.md                        # Master documentation
```

---

## 🚀 Key Features

1. **Role-Based Workflows (Admin & Employee):**
   - **Administrator:** Full visibility across deliverables, ability to create tasks, assign staff, onboard employees, and inspect department capacity.
   - **Employee:** Distraction-free portal showing assigned responsibilities, progress percentage sliders (0–100%), and task completion marking.
2. **Dual-View Task Orchestration:**
   - **List Table View:** Detailed tabular display with progress bars, due dates, and action menus.
   - **Kanban Board View:** Agile 3-column sprint board categorized into **To Do / Backlog**, **In Progress**, and **Completed**.
3. **Instant Live Search & Multi-Filters:**
   - Real-time client-side search across task titles and descriptions.
   - Multi-filtering by status (`Pending`, `In Progress`, `Completed`, `Overdue`) and priority (`High`, `Medium`, `Low`).
4. **Resilient UI Architecture:**
   - Custom **Toast Notification System** (`showToast`) preventing `alert()` sandbox crashes in VS Code Live Preview.
   - 100% self-contained native SVG icons with zero remote CDN dependencies.
5. **Hybrid Client-Server Persistence:**
   - Operates in full-stack mode with Django and SQLite.
   - Operates in standalone mode with LocalStorage if the server is offline.

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `GET /api/employees/` | GET | Retrieve full list of employees |
| `POST /api/employees/` | POST | Onboard new employee (`firstName`, `lastName`, `email`, `department`, `designation`) |
| `GET /api/employees/<emp_code>/` | GET | Retrieve single employee profile |
| `PUT /api/employees/<emp_code>/` | PUT | Update employee details |
| `DELETE /api/employees/<emp_code>/` | DELETE | Remove employee record |
| `GET /api/tasks/` | GET | List tasks (supports `?status=`, `?priority=`, `?employee=`, `?q=`) |
| `POST /api/tasks/` | POST | Create new deliverable (`title`, `assignedTo`, `priority`, `dueDate`) |
| `GET /api/tasks/<task_code>/` | GET | Retrieve specific task details |
| `PUT /api/tasks/<task_code>/` | PUT | Update task metadata |
| `POST /api/tasks/<task_code>/status/` | POST | Update status (`pending`, `in_progress`, `completed`) & progress % |
| `DELETE /api/tasks/<task_code>/` | DELETE | Delete task deliverable |
| `GET /api/stats/` | GET | Retrieve real-time dashboard analytics (Total, Completed, In-Progress, Overdue) |
| `POST /api/auth/login/` | POST | Authenticate user session by email & role |

---

## 🎓 Academic & Evaluation Deliverables Included

- [**`PROJECT_REPORT.md`**](file:///E:/coperateserve%20training/employee-task-manager/PROJECT_REPORT.md): Complete formal project documentation covering abstract, SRS, architecture, ER diagrams, test cases, and conclusions.
- [**`PROJECT_PPT_OUTLINE.md`**](file:///E:/coperateserve%20training/employee-task-manager/PROJECT_PPT_OUTLINE.md): 12-slide comprehensive presentation deck outline with complete speaker notes.
- [**`VIVA_QUESTIONS_AND_ANSWERS.md`**](file:///E:/coperateserve%20training/employee-task-manager/VIVA_QUESTIONS_AND_ANSWERS.md): Top 35+ technical viva and defense questions with thorough answers covering Django, ORM, REST, Frontend, Security, and Deployment.
