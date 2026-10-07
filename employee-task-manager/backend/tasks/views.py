import json
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db.models import Count, Q
from django.contrib.auth import authenticate, login, logout
from employees.models import Employee, Department
from .models import Task

@csrf_exempt
def api_list_or_create_tasks(request):
    """GET /api/tasks/ - Query with filters (?status=..., ?priority=..., ?employee=...)
       POST /api/tasks/ - Create a new task
    """
    if request.method == 'GET':
        tasks = Task.objects.select_related('assigned_to', 'assigned_to__department').all()

        status_filter = request.GET.get('status')
        priority_filter = request.GET.get('priority')
        emp_filter = request.GET.get('employee')
        search_query = request.GET.get('q')

        if status_filter:
            if status_filter == 'overdue':
                tasks = tasks.filter(due_date__lt=timezone.now().date()).exclude(status='completed')
            else:
                tasks = tasks.filter(status=status_filter)

        if priority_filter:
            tasks = tasks.filter(priority=priority_filter)

        if emp_filter:
            tasks = tasks.filter(assigned_to__emp_code=emp_filter)

        if search_query:
            tasks = tasks.filter(Q(title__icontains=search_query) | Q(description__icontains=search_query))

        return JsonResponse({
            'success': True,
            'count': tasks.count(),
            'data': [t.to_dict() for t in tasks]
        })

    elif request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            title = payload.get('title', '').strip()
            description = payload.get('description', '').strip()
            assigned_code = payload.get('assignedTo')
            priority = payload.get('priority', 'medium')
            due_date_str = payload.get('dueDate')

            if not title or not due_date_str:
                return JsonResponse({'success': False, 'error': 'Title and Due Date are required'}, status=400)

            assigned_emp = None
            if assigned_code:
                try:
                    assigned_emp = Employee.objects.get(emp_code=assigned_code)
                except Employee.DoesNotExist:
                    pass

            due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()

            # Generate unique task code TSK-####
            last_task = Task.objects.order_by('-id').first()
            next_num = (last_task.id + 1001) if last_task else 1001
            task_code = f"TSK-{next_num}"

            task = Task.objects.create(
                task_code=task_code,
                title=title,
                description=description,
                assigned_to=assigned_emp,
                priority=priority,
                status='pending',
                progress=0,
                due_date=due_date
            )

            return JsonResponse({'success': True, 'data': task.to_dict()}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_task_detail(request, task_code):
    """GET/PUT/DELETE /api/tasks/<task_code>/"""
    try:
        task = Task.objects.select_related('assigned_to').get(task_code=task_code)
    except Task.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Task not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'success': True, 'data': task.to_dict()})

    elif request.method == 'PUT':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            if 'title' in payload: task.title = payload['title']
            if 'description' in payload: task.description = payload['description']
            if 'priority' in payload: task.priority = payload['priority']
            if 'status' in payload: task.status = payload['status']
            if 'progress' in payload: task.progress = int(payload['progress'])
            if 'dueDate' in payload:
                task.due_date = datetime.strptime(payload['dueDate'], '%Y-%m-%d').date()
            if 'assignedTo' in payload:
                emp = Employee.objects.filter(emp_code=payload['assignedTo']).first()
                task.assigned_to = emp
            task.save()
            return JsonResponse({'success': True, 'data': task.to_dict()})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    elif request.method == 'DELETE':
        task.delete()
        return JsonResponse({'success': True, 'message': 'Task deleted successfully'})

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_update_task_status(request, task_code):
    """POST /api/tasks/<task_code>/status/ - Quick status & progress updating"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

    try:
        task = Task.objects.get(task_code=task_code)
        payload = json.loads(request.body.decode('utf-8'))
        new_status = payload.get('status')
        progress = payload.get('progress')

        if new_status:
            task.status = new_status
        if progress is not None:
            task.progress = int(progress)
        elif new_status == 'completed':
            task.progress = 100

        task.save()
        return JsonResponse({'success': True, 'data': task.to_dict()})
    except Task.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Task not found'}, status=404)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

def api_task_analytics(request):
    """GET /api/stats/ - Aggregated dashboard analytics"""
    today = timezone.now().date()
    total = Task.objects.count()
    completed = Task.objects.filter(status='completed').count()
    in_progress = Task.objects.filter(status='in_progress').count()
    pending = Task.objects.filter(status='pending').count()
    overdue = Task.objects.filter(due_date__lt=today).exclude(status='completed').count()

    total_employees = Employee.objects.count()

    # Department distribution
    dept_distribution = list(
        Department.objects.annotate(
            active_tasks=Count('employees__tasks', filter=~Q(employees__tasks__status='completed'))
        ).values('name', 'active_tasks')
    )

    return JsonResponse({
        'success': True,
        'data': {
            'totalTasks': total,
            'completedTasks': completed,
            'inProgressTasks': in_progress,
            'pendingTasks': pending,
            'overdueTasks': overdue,
            'totalEmployees': total_employees,
            'departmentDistribution': dept_distribution,
        }
    })

@csrf_exempt
def api_auth_login(request):
    """POST /api/auth/login/"""
    if request.method != 'POST':
        return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

    try:
        payload = json.loads(request.body.decode('utf-8'))
        email = payload.get('email', '').strip()
        role = payload.get('role', 'admin')

        # Find corresponding employee
        emp = Employee.objects.filter(email=email).first()
        if not emp:
            emp = Employee.objects.filter(role=role).first()

        user_info = {
            'role': emp.role if emp else role,
            'id': emp.emp_code if emp else ('EMP-100' if role == 'admin' else 'EMP-101'),
            'name': emp.full_name if emp else ('Administrator' if role == 'admin' else 'Team Member'),
            'email': emp.email if emp else email,
            'initials': emp.initials if emp else ('AD' if role == 'admin' else 'EM')
        }

        return JsonResponse({'success': True, 'user': user_info})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)
