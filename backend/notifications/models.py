
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

from users.models import User

# ============================================================================
# NOTIFICATIONS
# ============================================================================

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ('system', 'System'),
        ('chat', 'Chat'),
        ('report', 'Report'),
        ('payment', 'Payment'),
        ('listing', 'Listing'),
        ('review', 'Review'),
        ('verification', 'Verification'),
    ]
    
    notif_id = models.AutoField(primary_key=True, db_column='NOTIF_ID')
    userid = models.ForeignKey(User, on_delete=models.CASCADE, db_column='USERID', related_name='notifications')
    notif_title = models.CharField(max_length=255, db_column='NOTIF_TITLE')
    notif_message = models.TextField(db_column='NOTIF_MESSAGE')
    notif_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, db_column='NOTIF_TYPE')
    link_url = models.CharField(max_length=255, null=True, blank=True, db_column='LINK_URL')
    is_read = models.BooleanField(default=False, db_column='IS_READ')
    createdat = models.DateTimeField(auto_now_add=True, db_column='CREATEDAT')
    read_at = models.DateTimeField(null=True, blank=True, db_column='READ_AT')
    
    class Meta:
        db_table = 'NOTIFICATIONS'
        indexes = [
            models.Index(fields=['userid']),
            models.Index(fields=['is_read']),
            models.Index(fields=['notif_type']),
            models.Index(fields=['createdat']),
        ]
        ordering = ['-createdat']
    
    def __str__(self):
        return f"{self.notif_title} for {self.userid.full_name}"


