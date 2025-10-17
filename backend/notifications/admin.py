from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['notif_id', 'userid', 'notif_title', 'notif_type', 
                    'is_read', 'createdat']
    list_filter = ['notif_type', 'is_read', 'createdat']
    search_fields = ['userid__email', 'notif_title', 'notif_message']
    readonly_fields = ['createdat', 'read_at']
    
    fieldsets = (
        ('Notification Info', {
            'fields': ('userid', 'notif_title', 'notif_message', 'notif_type')
        }),
        ('Link & Status', {
            'fields': ('link_url', 'is_read', 'read_at')
        }),
        ('Timestamps', {
            'fields': ('createdat',)
        }),
    )
