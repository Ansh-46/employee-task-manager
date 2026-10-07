from django.db import models
from django.contrib.auth.models import User

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
        }

class Employee(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('employee', 'Employee'),
    )
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('on_leave', 'On Leave'),
        ('inactive', 'Inactive'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='employee_profile')
    emp_code = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True, related_name='employees')
    designation = models.CharField(max_length=100)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    avatar_bg = models.CharField(max_length=20, default='#2563eb')
    joined_date = models.DateField(auto_now_add=True)

    class Meta:
        ordering = ['emp_code']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.emp_code})"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def initials(self):
        first = self.first_name[0].upper() if self.first_name else 'U'
        last = self.last_name[0].upper() if self.last_name else ''
        return f"{first}{last}"

    def to_dict(self):
        return {
            'id': self.emp_code,
            'db_id': self.id,
            'firstName': self.first_name,
            'lastName': self.last_name,
            'email': self.email,
            'department': self.department.name if self.department else 'General',
            'designation': self.designation,
            'role': self.role,
            'status': self.status,
            'avatarBg': self.avatar_bg,
            'initials': self.initials,
            'joined': self.joined_date.strftime('%b %Y') if self.joined_date else 'Recent',
        }
