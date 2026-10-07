@echo off
title TaskFlow ERP - Employee Task Management System
color 0B
echo =========================================================================
echo       TASKFLOW ERP - EMPLOYEE TASK MANAGEMENT SYSTEM
echo =========================================================================
echo.

cd /d "%~dp0backend"

echo [*] Applying latest Django database migrations...
"E:\python\python.exe" manage.py migrate
if %ERRORLEVEL% neq 0 (
    echo [!] Migration error. Retrying with local python...
    python manage.py migrate
)

echo.
echo [*] Seeding database with demo employees, tasks, and superuser...
"E:\python\python.exe" seed_data.py
if %ERRORLEVEL% neq 0 (
    python seed_data.py
)

echo.
echo =========================================================================
echo [*] Launching TaskFlow ERP Web Application...
echo [*] Access the application in your browser at:
echo       -> Web App:       http://127.0.0.1:8000/
echo       -> Admin Portal:  http://127.0.0.1:8000/admin/
echo       -> REST API:      http://127.0.0.1:8000/api/tasks/
echo.
echo [*] Default Login Credentials:
echo       - Administrator:  admin@corp.com / password123 (or Django admin / admin123)
echo       - Employee:       emily.miller@corp.com / password123
echo =========================================================================
echo.

"E:\python\python.exe" manage.py runserver 127.0.0.1:8000
if %ERRORLEVEL% neq 0 (
    python manage.py runserver 127.0.0.1:8000
)

pause
