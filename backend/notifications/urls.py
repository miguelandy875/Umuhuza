from django.urls import path
from . import views

urlpatterns = [
    path('notifications/', views.notification_list, name='notification-list'),
    path('notifications/<int:pk>/read/', views.notification_mark_read, name='notification-read'),
    path('notifications/read-all/', views.notification_mark_all_read, name='notification-read-all'),
    path('notifications/<int:pk>/delete/', views.notification_delete, name='notification-delete'),
    path('notifications/clear-all/', views.notification_clear_all, name='notification-clear-all'),
    path('notifications/unread-count/', views.notification_unread_count, name='notification-unread-count'),
]