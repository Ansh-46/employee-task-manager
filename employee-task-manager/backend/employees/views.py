import json
import random
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from .models import Employee, Department

@csrf_exempt
def api_list_or_create_employees(request):
    """GET /api/employees/ - List all employees
       POST /api/employees/ - Create a new employee record
    """
    if request.method == 'GET':
        employees = Employee.objects.all().select_related('department')
        return JsonResponse({
            'success': True,
            'count': employees.count(),
            'data': [emp.to_dict() for emp in employees]
        })

    elif request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            first_name = payload.get('firstName', '').strip()
            last_name = payload.get('lastName', '').strip()
            email = payload.get('email', '').strip()
            dept_name = payload.get('department', '').strip()
            designation = payload.get('designation', '').strip()
            role = payload.get('role', 'employee')

            if not first_name or not email or not designation:
                return JsonResponse({'success': False, 'error': 'Missing required employee fields'}, status=400)

            # Department lookup/create
            dept = None
            if dept_name:
                dept, _ = Department.objects.get_or_create(name=dept_name)

            # Generate unique code EMP-###
            last_emp = Employee.objects.order_by('-id').first()
            next_num = (last_emp.id + 101) if last_emp else 101
            emp_code = f"EMP-{next_num}"

            colors = ['#2563eb', '#0284c7', '#7c3aed', '#059669', '#d97706', '#dc2626']
            avatar_bg = random.choice(colors)

            # Create User if needed
            user, _ = User.objects.get_or_create(username=email, defaults={'email': email, 'first_name': first_name, 'last_name': last_name})
            user.set_password('password123')
            user.save()

            employee = Employee.objects.create(
                user=user,
                emp_code=emp_code,
                first_name=first_name,
                last_name=last_name,
                email=email,
                department=dept,
                designation=designation,
                role=role,
                status='active',
                avatar_bg=avatar_bg
            )

            return JsonResponse({'success': True, 'data': employee.to_dict()}, status=201)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

@csrf_exempt
def api_employee_detail(request, emp_code):
    """GET/PUT/DELETE /api/employees/<emp_code>/"""
    try:
        employee = Employee.objects.select_related('department').get(emp_code=emp_code)
    except Employee.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Employee not found'}, status=404)

    if request.method == 'GET':
        return JsonResponse({'success': True, 'data': employee.to_dict()})

    elif request.method == 'PUT':
        try:
            payload = json.loads(request.body.decode('utf-8'))
            if 'firstName' in payload: employee.first_name = payload['firstName']
            if 'lastName' in payload: employee.last_name = payload['lastName']
            if 'designation' in payload: employee.designation = payload['designation']
            if 'role' in payload: employee.role = payload['role']
            if 'status' in payload: employee.status = payload['status']
            if 'department' in payload:
                dept, _ = Department.objects.get_or_create(name=payload['department'])
                employee.department = dept
            employee.save()
            return JsonResponse({'success': True, 'data': employee.to_dict()})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

    elif request.method == 'DELETE':
        employee.delete()
        return JsonResponse({'success': True, 'message': 'Employee deleted successfully'})

    return JsonResponse({'success': False, 'error': 'Method not allowed'}, status=405)

def api_list_departments(request):
    """GET /api/departments/"""
    depts = Department.objects.all()
    return JsonResponse({
        'success': True,
        'data': [d.to_dict() for d in depts]
    })
