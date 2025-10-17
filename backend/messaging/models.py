from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

from listings.models import Listing
from users.models import User

# ============================================================================
# CHATS
# ============================================================================

class Chat(models.Model):
    chat_id = models.AutoField(primary_key=True, db_column='CHAT_ID')
    userid = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        db_column='USERID',
        related_name='chats_as_buyer'
    )
    listing_id = models.ForeignKey(Listing, on_delete=models.CASCADE, db_column='LISTING_ID')
    userid_as_seller = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        db_column='USERID_AS_SELLER',
        related_name='chats_as_seller'
    )
    last_message_at = models.DateTimeField(null=True, blank=True, db_column='LAST_MESSAGE_AT')
    is_active = models.BooleanField(default=True, db_column='IS_ACTIVE')
    createdat = models.DateTimeField(auto_now_add=True, db_column='CREATEDAT')
    
    class Meta:
        db_table = 'CHATS'
        unique_together = [['userid', 'listing_id', 'userid_as_seller']]
        indexes = [
            models.Index(fields=['last_message_at']),
        ]
    
    def __str__(self):
        return f"Chat between {self.userid.full_name} and {self.userid_as_seller.full_name}"


# ============================================================================
# MESSAGES
# ============================================================================

class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', 'Text'),
        ('image', 'Image'),
        ('file', 'File'),
    ]
    
    message_id = models.AutoField(primary_key=True, db_column='MESSAGE_ID')
    userid = models.ForeignKey(User, on_delete=models.CASCADE, db_column='USERID')
    chat_id = models.ForeignKey(Chat, on_delete=models.CASCADE, db_column='CHAT_ID', related_name='messages')
    content = models.TextField(db_column='CONTENT')
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text', db_column='MESSAGE_TYPE')
    file_url = models.CharField(max_length=255, null=True, blank=True, db_column='FILE_URL')
    is_read = models.BooleanField(default=False, db_column='IS_READ')
    sentat = models.DateTimeField(auto_now_add=True, db_column='SENTAT')
    read_at = models.DateTimeField(null=True, blank=True, db_column='READ_AT')
    
    class Meta:
        db_table = 'MESSAGES'
        indexes = [
            models.Index(fields=['chat_id']),
            models.Index(fields=['sentat']),
        ]
        ordering = ['sentat']
    
    def __str__(self):
        return f"Message from {self.userid.full_name} at {self.sentat}"

