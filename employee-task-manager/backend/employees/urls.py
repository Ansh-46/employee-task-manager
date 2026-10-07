from django.urls import path
from . import views

urlpatterns = [
    path('employees/', views.api_list_or_create_employees, name='api_employees_list'),
    path('employees/<str:emp_code>/', views.api_employee_detail, name='api_employee_detail'),
    path('departments/', views.api_list_departments, name='api_departments_list'),
]
