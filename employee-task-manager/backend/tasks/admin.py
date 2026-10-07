from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('task_code', 'title', 'assigned_to', 'priority', 'status', 'progress', 'due_date', 'created_at')
    list_filter = ('status', 'priority', 'assigned_to__department')
    search_fields = ('task_code', 'title', 'description', 'assigned_to__first_name', 'assigned_to__last_name')
    ordering = ('-created_at',)
