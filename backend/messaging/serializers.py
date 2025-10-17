from rest_framework import serializers
from django.contrib.auth import get_user_model

from listings.serializers import ListingSerializer
from users.serializers import UserPublicSerializer
from .models import (
    User, Chat, Message
)

User = get_user_model()

# ============================================================================
# CHAT & MESSAGE SERIALIZERS
# ============================================================================

class MessageSerializer(serializers.ModelSerializer):
    sender = UserPublicSerializer(source='userid', read_only=True)
    
    class Meta:
        model = Message
        fields = [
            'message_id', 'sender', 'content', 'message_type',
            'file_url', 'is_read', 'sentat', 'read_at'
        ]
        read_only_fields = ['message_id', 'sentat', 'read_at']


class ChatSerializer(serializers.ModelSerializer):
    buyer = UserPublicSerializer(source='userid', read_only=True)
    seller = UserPublicSerializer(source='userid_as_seller', read_only=True)
    listing = ListingSerializer(source='listing_id', read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Chat
        fields = [
            'chat_id', 'buyer', 'seller', 'listing',
            'last_message_at', 'createdat', 'last_message', 'unread_count'
        ]
    
    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return MessageSerializer(last_msg).data
        return None
    
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.messages.filter(
                is_read=False
            ).exclude(userid=request.user).count()
        return 0