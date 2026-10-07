"""
Seed initial database records for TaskFlow ERP.
Populates superuser, departments, employees, and sprint tasks.
"""

import os
import sys
import django
from datetime import date, timedelta

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from employees.models import Department, Employee
from tasks.models import Task

def seed_database():
    print("[*] Initializing TaskFlow ERP Database Seeding...")

    # 1. Superuser
    admin_user, created = User.objects.get_or_create(username='admin', defaults={'email': 'admin@corp.com'})
    admin_user.set_password('admin123')
    admin_user.is_superuser = True
    admin_user.is_staff = True
    admin_user.first_name = 'Alex'
    admin_user.last_name = 'Davies'
    admin_user.save()
    print("[+] Superuser: admin / admin123 (email: admin@corp.com)")

    # 2. Departments
    departments_data = [
        ('Engineering', 'Core backend, API, and platform architecture'),
        ('DevOps & Cloud', 'Infrastructure, CI/CD pipelines, container orchestration'),
        ('Design & UI', 'Design tokens, Figma systems, and frontend ergonomics'),
        ('Quality Assurance', 'Automated testing and QA regression validations'),
        ('Operations & Management', 'Executive direction and project workflow management'),
    ]

    dept_objs = {}
    for name, desc in departments_data:
        d, _ = Department.objects.get_or_create(name=name, defaults={'description': desc})
        dept_objs[name] = d
    print(f"[+] Seeded {len(dept_objs)} departments")

    # 3. Employees
    employees_data = [
        ('EMP-100', 'Alex', 'Davies', 'admin@corp.com', 'Operations & Management', 'Engineering Director & Admin', 'admin', 'active', '#2563eb'),
        ('EMP-101', 'Emily', 'Miller', 'emily.miller@corp.com', 'Engineering', 'Senior Backend Engineer', 'employee', 'active', '#0284c7'),
        ('EMP-102', 'David', 'Kim', 'david.kim@corp.com', 'DevOps & Cloud', 'Cloud Infrastructure Lead', 'employee', 'active', '#d97706'),
        ('EMP-103', 'Sarah', 'Jenkins', 'sarah.jenkins@corp.com', 'Design & UI', 'Lead Product Designer', 'employee', 'active', '#7c3aed'),
        ('EMP-104', 'Raj', 'Patel', 'raj.patel@corp.com', 'Engineering', 'Full-Stack Developer', 'employee', 'on_leave', '#dc2626'),
    ]

    emp_objs = {}
    for code, fname, lname, email, dept_name, desig, role, status, color in employees_data:
        user, _ = User.objects.get_or_create(username=email, defaults={'email': email, 'first_name': fname, 'last_name': lname})
        user.set_password('password123')
        user.save()

        emp, _ = Employee.objects.get_or_create(
            emp_code=code,
            defaults={
                'user': user,
                'first_name': fname,
                'last_name': lname,
                'email': email,
                'department': dept_objs.get(dept_name),
                'designation': desig,
                'role': role,
                'status': status,
                'avatar_bg': color,
            }
        )
        emp_objs[code] = emp
    print(f"[+] Seeded {len(emp_objs)} employees")

    # 4. Tasks
    today = date.today()
    tasks_data = [
        ('TSK-1001', 'Implement JWT Token Authentication Service', 'Add refresh token rotation and bearer auth validation across microservice gateways.', 'EMP-101', 'high', 'in_progress', 65, today + timedelta(days=7)),
        ('TSK-1002', 'Automate Staging CI/CD Pipeline on GitHub Actions', 'Run automated end-to-end linting, Django unit tests, and build Docker containers.', 'EMP-102', 'medium', 'pending', 10, today + timedelta(days=11)),
        ('TSK-1003', 'Design Dark Mode Prototype and Token System', 'Build Figma design components and accessible high-contrast CSS variable themes.', 'EMP-103', 'low', 'completed', 100, today - timedelta(days=2)),
        ('TSK-1004', 'Database Schema Migration & Index Tuning', 'Benchmark composite indexes on tasks table to improve query performance.', 'EMP-104', 'high', 'overdue', 40, today - timedelta(days=4)),
        ('TSK-1005', 'Role-Based Access Control (RBAC) Architecture Review', 'Audit employee permission boundaries between admin operations and employee self-service.', 'EMP-100', 'high', 'in_progress', 75, today + timedelta(days=9)),
        ('TSK-1006', 'Employee Onboarding Document Portal', 'Create upload and compliance checklist interface for new engineering hires.', 'EMP-101', 'medium', 'pending', 0, today + timedelta(days=15)),
    ]

    for tcode, title, desc, emp_code, priority, status, progress, due_date in tasks_data:
        Task.objects.get_or_create(
            task_code=tcode,
            defaults={
                'title': title,
                'description': desc,
                'assigned_to': emp_objs.get(emp_code),
                'priority': priority,
                'status': status,
                'progress': progress,
                'due_date': due_date,
            }
        )
    print(f"[+] Seeded {len(tasks_data)} sprint tasks")
    print("[+] Database seeding completed successfully!")

if __name__ == '__main__':
    seed_database()
