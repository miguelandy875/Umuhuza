from django.contrib import admin
from .models import Payment, DealerApplication, DealerDocument


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['payment_id', 'userid', 'payment_amount', 'payment_method',
                    'payment_status', 'createdat', 'confirmed_at']
    list_filter = ['payment_method', 'payment_status', 'createdat']
    search_fields = ['payment_id', 'payment_ref', 'transaction_id', 'userid__email']
    readonly_fields = ['payment_id', 'createdat', 'confirmed_at']
    
    fieldsets = (
        ('Payment Info', {
            'fields': ('payment_id', 'userid', 'pricing_id', 'listing_id')
        }),
        ('Transaction Details', {
            'fields': ('payment_amount', 'payment_method', 'payment_status')
        }),
        ('References', {
            'fields': ('payment_ref', 'transaction_id', 'failure_reason')
        }),
        ('Timestamps', {
            'fields': ('createdat', 'confirmed_at')
        }),
    )


class DealerDocumentInline(admin.TabularInline):
    model = DealerDocument
    extra = 1
    fields = ['doc_type', 'file_url', 'verified', 'file_size']


@admin.register(DealerApplication)
class DealerApplicationAdmin(admin.ModelAdmin):
    list_display = ['dealerapp_id', 'userid', 'business_name', 'business_type',
                    'appli_status', 'createdat', 'approvedat']
    list_filter = ['business_type', 'appli_status', 'createdat']
    search_fields = ['business_name', 'userid__email', 'tax_id']
    readonly_fields = ['createdat', 'updatedat', 'approvedat']
    inlines = [DealerDocumentInline]
    
    fieldsets = (
        ('Business Info', {
            'fields': ('userid', 'business_name', 'business_type', 'business_address')
        }),
        ('Contact Details', {
            'fields': ('business_phone', 'business_email')
        }),
        ('Legal Info', {
            'fields': ('tax_id', 'business_license')
        }),
        ('Application Status', {
            'fields': ('appli_status', 'rejection_reason')
        }),
        ('Timestamps', {
            'fields': ('createdat', 'approvedat', 'updatedat')
        }),
    )
    
    actions = ['approve_applications', 'reject_applications']
    
    def approve_applications(self, request, queryset):
        from django.utils import timezone
        updated = queryset.update(
            appli_status='approved',
            approvedat=timezone.now()
        )
        
        # Update user role to dealer
        for application in queryset:
            user = application.userid
            user.user_role = 'dealer'
            user.save(update_fields=['user_role'])
        
        self.message_user(request, f'{updated} applications approved')
    approve_applications.short_description = 'Approve selected applications'
    
    def reject_applications(self, request, queryset):
        updated = queryset.update(appli_status='rejected')
        self.message_user(request, f'{updated} applications rejected')
    reject_applications.short_description = 'Reject selected applications'


@admin.register(DealerDocument)
class DealerDocumentAdmin(admin.ModelAdmin):
    list_display = ['dealerdoc_id', 'dealerapp_id', 'doc_type', 'verified', 'uploadedat']
    list_filter = ['doc_type', 'verified', 'uploadedat']
    search_fields = ['dealerapp_id__business_name', 'doc_type']
    readonly_fields = ['uploadedat']