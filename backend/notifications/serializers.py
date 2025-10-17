from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Notification

User = get_user_model()


# ============================================================================
# NOTIFICATION SERIALIZERS
# ============================================================================

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'notif_id', 'notif_title', 'notif_message', 'notif_type',
            'link_url', 'is_read', 'createdat', 'read_at'
        ]
        read_only_fields = ['notif_id', 'createdat', 'read_at']

