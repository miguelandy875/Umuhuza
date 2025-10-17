from django.urls import path
from . import views

urlpatterns = [
    # Chats
    path('chats/', views.chat_list, name='chat-list'),
    path('chats/create/', views.chat_create, name='chat-create'),
    path('chats/<int:pk>/', views.chat_detail, name='chat-detail'),
    path('chats/<int:pk>/archive/', views.chat_archive, name='chat-archive'),
    path('chats/unread-count/', views.unread_count, name='unread-count'),
    
    # Messages
    path('chats/<int:chat_id>/messages/', views.chat_messages, name='chat-messages'),
    path('chats/<int:chat_id>/messages/send/', views.message_send, name='message-send'),
    path('chats/<int:chat_id>/mark-read/', views.mark_messages_read, name='mark-read'),
]