from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Notification
from .serializers import NotificationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    """
    Get all notifications for current user
    GET /api/notifications/
    """
    notifications = Notification.objects.filter(
        userid=request.user
    ).order_by('-createdat')
    
    # Separate read and unread
    unread = notifications.filter(is_read=False)
    read = notifications.filter(is_read=True)[:20]  # Limit read notifications
    
    return Response({
        'unread_count': unread.count(),
        'unread': NotificationSerializer(unread, many=True).data,
        'read': NotificationSerializer(read, many=True).data
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def notification_mark_read(request, pk):
    """
    Mark a notification as read
    PUT /api/notifications/{id}/read/
    """
    notification = get_object_or_404(Notification, pk=pk, userid=request.user)
    
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=['is_read', 'read_at'])
    
    return Response({
        'message': 'Notification marked as read'
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def notification_mark_all_read(request):
    """
    Mark all notifications as read
    PUT /api/notifications/read-all/
    """
    updated = Notification.objects.filter(
        userid=request.user,
        is_read=False
    ).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'{updated} notifications marked as read'
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def notification_delete(request, pk):
    """
    Delete a notification
    DELETE /api/notifications/{id}/
    """
    notification = get_object_or_404(Notification, pk=pk, userid=request.user)
    notification.delete()
    
    return Response({
        'message': 'Notification deleted'
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def notification_clear_all(request):
    """
    Clear all read notifications
    DELETE /api/notifications/clear-all/
    """
    deleted = Notification.objects.filter(
        userid=request.user,
        is_read=True
    ).delete()
    
    return Response({
        'message': f'{deleted[0]} notifications cleared'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_unread_count(request):
    """
    Get unread notifications count
    GET /api/notifications/unread-count/
    """
    count = Notification.objects.filter(
        userid=request.user,
        is_read=False
    ).count()
    
    return Response({
        'unread_count': count
    })