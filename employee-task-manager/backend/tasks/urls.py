from django.urls import path
from . import views

urlpatterns = [
    path('tasks/', views.api_list_or_create_tasks, name='api_tasks_list'),
    path('tasks/<str:task_code>/', views.api_task_detail, name='api_task_detail'),
    path('tasks/<str:task_code>/status/', views.api_update_task_status, name='api_update_task_status'),
    path('stats/', views.api_task_analytics, name='api_task_analytics'),
    path('auth/login/', views.api_auth_login, name='api_auth_login'),
]
