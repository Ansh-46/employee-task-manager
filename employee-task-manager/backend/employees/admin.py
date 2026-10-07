from django.contrib import admin
from .models import Employee, Department

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('emp_code', 'first_name', 'last_name', 'email', 'department', 'designation', 'role', 'status')
    list_filter = ('role', 'status', 'department')
    search_fields = ('emp_code', 'first_name', 'last_name', 'email', 'designation')
    ordering = ('emp_code',)
