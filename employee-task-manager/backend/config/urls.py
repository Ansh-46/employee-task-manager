"""
URL configuration for TaskFlow ERP.
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Admin Interface
    path('admin/', admin.site.urls),

    # REST / JSON API Endpoints
    path('api/', include('employees.urls')),
    path('api/', include('tasks.urls')),

    # Frontend Single Page Views served directly by Django
    path('', TemplateView.as_view(template_name='index.html'), name='view_login'),
    path('dashboard/', TemplateView.as_view(template_name='dashboard.html'), name='view_dashboard'),
    path('tasks/', TemplateView.as_view(template_name='tasks.html'), name='view_tasks'),
    path('employees/', TemplateView.as_view(template_name='employees.html'), name='view_employees'),
    path('profile/', TemplateView.as_view(template_name='profile.html'), name='view_profile'),
]

# Static assets serving in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.PROJECT_ROOT / 'frontend')
