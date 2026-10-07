# Employee Task Management System (ETMS)

A full-stack enterprise web application built for managing employees, tasks, deadlines, and project workflows with role-based access control (Admin & Employee).

---

## 📅 6-Week Training Roadmap

| Phase | Focus Area | Status |
| :--- | :--- | :--- |
| **Week 1** | **Frontend Fundamentals** (HTML5, Modern CSS, Flex/Grid, UI Layouts) | 🚀 In Progress |
| **Week 2** | **JavaScript & Interactivity** (DOM, Validation, Live Filters, Dynamic Data) | ⏳ Upcoming |
| **Week 3** | **Django Backend Architecture** (Apps, Models, Migrations, Views, URLs) | ⏳ Upcoming |
| **Week 4** | **Full-Stack Integration** (Templates, CRUD Operations, Dashboard Analytics) | ⏳ Upcoming |
| **Week 5** | **Authentication & Polishing** (Role Permissions, Session Management, UI Polish) | ⏳ Upcoming |
| **Week 6** | **Professional Finishing** (Testing, Git/GitHub, Deployment, Viva Prep & Report) | ⏳ Upcoming |

---

## 📂 Project Structure

```text
employee-task-manager/
├── backend/
│   ├── config/              # Django core settings and root URL configuration
│   ├── employees/           # App for employee directory, profiles, departments
│   ├── tasks/               # App for tasks, statuses, assignments, priorities
│   └── manage.py            # Django command-line utility (Week 3)
│
├── frontend/
│   ├── css/
│   │   └── styles.css       # Design system, variables, layouts, components
│   ├── js/
│   │   └── main.js          # Navigation, modals, interactive UI behaviors
│   ├── images/              # Assets and avatars
│   ├── index.html           # Login page (Admin & Employee roles)
│   ├── dashboard.html       # Analytics dashboard & overview
│   ├── employees.html       # Employee directory & management
│   ├── tasks.html           # Task board & task assignment table
│   └── profile.html         # User profile & my assigned tasks
│
├── README.md                # Project documentation & roadmap
└── requirements.txt         # Python dependencies
```

---

## 👥 System Roles & Capabilities

### 🛡️ Admin
- Secure login & credentials authentication
- Executive dashboard with task KPI metrics
- Employee directory: Create, Read, Update, Delete (CRUD)
- Create tasks with priority, deadline, and description
- Assign tasks to specific employees or departments
- Track global progress and task status

### 👤 Employee
- Personalized login
- Employee personal dashboard
- View all assigned tasks with deadlines & priorities
- Update task status (`Pending`, `In Progress`, `Completed`)
- View and update personal profile details

---

## 🚀 How to Run (Week 1 — Frontend Preview)

1. Open the project folder in VS Code or your preferred editor.
2. In the `frontend/` directory, open `index.html` directly in your browser or launch it using **Live Server**.
3. Navigate across:
   - **Login**: `index.html`
   - **Dashboard**: `dashboard.html`
   - **Employees**: `employees.html`
   - **Tasks**: `tasks.html`
   - **Profile**: `profile.html`
