from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import ActivityLog
from .models import User
from .models import User, VerificationCode
from .models import User, VerificationCode, UserBadge

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['userid', 'email', 'full_name', 'user_role', 'is_verified', 'date_joined']
    list_filter = ['user_role', 'is_verified', 'is_active']
    search_fields = ['email', 'user_firstname', 'user_lastname', 'phone_number']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('user_firstname', 'user_lastname', 'phone_number', 'profile_photo')}),
        ('Permissions', {'fields': ('user_role', 'is_active', 'is_staff', 'is_superuser', 'is_verified')}),
        ('Verification', {'fields': ('email_verified', 'phone_verified', 'email_verified_at', 'phone_verified_at')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'phone_number', 'user_firstname', 'user_lastname', 'password1', 'password2'),
        }),
    )
    
@admin.register(VerificationCode)
class VerificationCodeAdmin(admin.ModelAdmin):
    list_display = ['code_id', 'userid', 'code', 'code_type', 'is_used', 'expires_at', 'createdat']
    list_filter = ['code_type', 'is_used']
    search_fields = ['code', 'contact_info']
    readonly_fields = ['createdat', 'used_at']
    
@admin.register(UserBadge)
class UserBadgeAdmin(admin.ModelAdmin):
    list_display = ['userbadge_id', 'userid', 'badge_type', 'issuedat', 'expires_at', 'is_active_status']
    list_filter = ['badge_type', 'issuedat']
    search_fields = ['userid__email', 'userid__user_firstname', 'userid__user_lastname']
    readonly_fields = ['issuedat']
    
    def is_active_status(self, obj):
        return obj.is_active()
    is_active_status.boolean = True
    is_active_status.short_description = 'Active'

@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ['log_id', 'userid', 'action_type', 'entity_type', 
                    'entity_id', 'ip_address', 'createdat']
    list_filter = ['action_type', 'entity_type', 'createdat']
    search_fields = ['userid__email', 'action_type', 'description', 'ip_address']
    readonly_fields = ['createdat']
    
    def has_add_permission(self, request):
        return False  # Logs are created automatically