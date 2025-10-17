from django.contrib import admin
from .models import Chat, Message


@admin.register(Chat)
class ChatAdmin(admin.ModelAdmin):
    list_display = ['chat_id', 'userid', 'userid_as_seller', 'listing_id', 
                    'last_message_at', 'is_active', 'createdat']
    list_filter = ['is_active', 'createdat', 'last_message_at']
    search_fields = ['userid__email', 'userid_as_seller__email', 'listing_id__listing_title']
    readonly_fields = ['createdat']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'userid', 'userid_as_seller', 'listing_id'
        )


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['message_id', 'chat_id', 'userid', 'message_type', 
                    'is_read', 'sentat']
    list_filter = ['message_type', 'is_read', 'sentat']
    search_fields = ['content', 'userid__email']
    readonly_fields = ['sentat', 'read_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'chat_id', 'userid'
        )