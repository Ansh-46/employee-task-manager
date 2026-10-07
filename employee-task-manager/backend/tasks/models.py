from django.db import models
from django.utils import timezone
from employees.models import Employee

class Task(models.Model):
    PRIORITY_CHOICES = (
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    )
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('overdue', 'Overdue'),
    )

    task_code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=250)
    description = models.TextField(blank=True, default='')
    assigned_to = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.PositiveIntegerField(default=0)
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.task_code}: {self.title}"

    @property
    def is_overdue(self):
        if self.status != 'completed' and self.due_date < timezone.now().date():
            return True
        return False

    def to_dict(self):
        # Auto-compute overdue status display if date has elapsed
        display_status = 'overdue' if (self.is_overdue and self.status != 'completed') else self.status
        dept_name = self.assigned_to.department.name if (self.assigned_to and self.assigned_to.department) else 'Operations'
        return {
            'id': self.task_code,
            'db_id': self.id,
            'title': self.title,
            'description': self.description,
            'assignedTo': self.assigned_to.emp_code if self.assigned_to else None,
            'assigneeName': self.assigned_to.full_name if self.assigned_to else 'Unassigned',
            'department': dept_name,
            'priority': self.priority,
            'status': display_status,
            'progress': self.progress,
            'dueDate': self.due_date.strftime('%Y-%m-%d') if self.due_date else '',
            'createdAt': self.created_at.strftime('%Y-%m-%d') if self.created_at else '',
        }
