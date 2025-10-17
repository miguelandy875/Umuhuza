from django.shortcuts import render
from notifications.utils import notify_new_message
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Max
from django.utils import timezone

from .models import Chat, Message
from .serializers import ChatSerializer, MessageSerializer
from listings.models import Listing
from users.serializers import UserPublicSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_list(request):
    """
    Get all chats for current user
    GET /api/chats/
    """
    # Get chats where user is either buyer or seller
    chats = Chat.objects.filter(
        Q(userid=request.user) | Q(userid_as_seller=request.user),
        is_active=True
    ).select_related(
        'userid', 'userid_as_seller', 'listing_id'
    ).annotate(
        latest_message=Max('messages__sentat')
    ).order_by('-latest_message')
    
    serializer = ChatSerializer(chats, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat_create(request):
    """
    Create or get existing chat for a listing
    POST /api/chats/create/
    {
        "listing_id": 1
    }
    """
    listing_id = request.data.get('listing_id')
    
    if not listing_id:
        return Response({
            'error': 'listing_id is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    listing = get_object_or_404(Listing, pk=listing_id)
    
    # Can't chat with yourself
    if listing.userid == request.user:
        return Response({
            'error': 'You cannot chat with yourself'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if listing is active
    if listing.listing_status != 'active':
        return Response({
            'error': 'This listing is not available for chat'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Get or create chat
    chat, created = Chat.objects.get_or_create(
        userid=request.user,
        listing_id=listing,
        userid_as_seller=listing.userid,
        defaults={'is_active': True}
    )
    
    serializer = ChatSerializer(chat, context={'request': request})
    
    return Response({
        'message': 'Chat created' if created else 'Chat already exists',
        'chat': serializer.data
    }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_detail(request, pk):
    """
    Get chat details with messages
    GET /api/chats/{id}/
    """
    chat = get_object_or_404(Chat, pk=pk)
    
    # Check permission (must be participant)
    if chat.userid != request.user and chat.userid_as_seller != request.user:
        return Response({
            'error': 'You do not have permission to view this chat'
        }, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ChatSerializer(chat, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def chat_messages(request, chat_id):
    """
    Get all messages in a chat
    GET /api/chats/{chat_id}/messages/
    """
    chat = get_object_or_404(Chat, pk=chat_id)
    
    # Check permission
    if chat.userid != request.user and chat.userid_as_seller != request.user:
        return Response({
            'error': 'You do not have permission to view these messages'
        }, status=status.HTTP_403_FORBIDDEN)
    
    messages = chat.messages.all().select_related('userid').order_by('sentat')
    serializer = MessageSerializer(messages, many=True)
    
    # Mark messages as read (for the other user's messages)
    Message.objects.filter(
        chat_id=chat,
        is_read=False
    ).exclude(userid=request.user).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def message_send(request, chat_id):
    """
    Send a message in a chat
    POST /api/chats/{chat_id}/messages/
    {
        "content": "Hello, is this still available?",
        "message_type": "text"
    }
    """
    chat = get_object_or_404(Chat, pk=chat_id)
    
    # Check permission
    if chat.userid != request.user and chat.userid_as_seller != request.user:
        return Response({
            'error': 'You do not have permission to send messages in this chat'
        }, status=status.HTTP_403_FORBIDDEN)
    
    content = request.data.get('content')
    message_type = request.data.get('message_type', 'text')
    
    if not content:
        return Response({
            'error': 'Message content is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Create message
    message = Message.objects.create(
        userid=request.user,
        chat_id=chat,
        content=content,
        message_type=message_type
    )
    
    # Notify the other user
    recipient = chat.userid_as_seller if request.user == chat.userid else chat.userid
    notify_new_message(
        recipient=recipient,
        sender=request.user,
        listing_title=chat.listing_id.listing_title,
        chat_id=chat.chat_id
    )
    
    # Update chat's last_message_at
    chat.last_message_at = message.sentat
    chat.save(update_fields=['last_message_at'])
    
    # TODO: Send notification to other user
    # TODO: Send real-time update via WebSocket
    
    serializer = MessageSerializer(message)
    return Response({
        'message': 'Message sent successfully',
        'data': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_messages_read(request, chat_id):
    """
    Mark all messages in chat as read
    PUT /api/chats/{chat_id}/mark-read/
    """
    chat = get_object_or_404(Chat, pk=chat_id)
    
    # Check permission
    if chat.userid != request.user and chat.userid_as_seller != request.user:
        return Response({
            'error': 'You do not have permission to modify this chat'
        }, status=status.HTTP_403_FORBIDDEN)
    
    # Mark all unread messages from other user as read
    updated = Message.objects.filter(
        chat_id=chat,
        is_read=False
    ).exclude(userid=request.user).update(
        is_read=True,
        read_at=timezone.now()
    )
    
    return Response({
        'message': f'{updated} messages marked as read'
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    """
    Get total unread messages count for current user
    GET /api/chats/unread-count/
    """
    count = Message.objects.filter(
        chat_id__in=Chat.objects.filter(
            Q(userid=request.user) | Q(userid_as_seller=request.user)
        ),
        is_read=False
    ).exclude(userid=request.user).count()
    
    return Response({
        'unread_count': count
    })


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def chat_archive(request, pk):
    """
    Archive a chat (soft delete)
    DELETE /api/chats/{id}/archive/
    """
    chat = get_object_or_404(Chat, pk=pk)
    
    # Check permission
    if chat.userid != request.user and chat.userid_as_seller != request.user:
        return Response({
            'error': 'You do not have permission to archive this chat'
        }, status=status.HTTP_403_FORBIDDEN)
    
    chat.is_active = False
    chat.save(update_fields=['is_active'])
    
    return Response({
        'message': 'Chat archived successfully'
    })