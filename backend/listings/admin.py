from django.contrib import admin

from django.contrib import admin
from .models import Category, Listing, ListingImage, PricingPlan, RatingReview, Favorite, ReportMisconduct


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['cat_id', 'cat_name', 'slug', 'is_active', 'createdat']
    list_filter = ['is_active']
    search_fields = ['cat_name', 'slug']
    prepopulated_fields = {'slug': ('cat_name',)}


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1
    fields = ['image_url', 'is_primary', 'display_order']


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ['listing_id', 'listing_title', 'userid', 'cat_id', 'listing_price', 
                    'listing_status', 'is_featured', 'views', 'createdat']
    list_filter = ['listing_status', 'is_featured', 'cat_id', 'createdat']
    search_fields = ['listing_title', 'list_description', 'list_location']
    readonly_fields = ['views', 'createdat', 'updatedat']
    inlines = [ListingImageInline]
    
    fieldsets = (
        ('Basic Info', {
            'fields': ('userid', 'cat_id', 'listing_title', 'list_description')
        }),
        ('Pricing & Location', {
            'fields': ('listing_price', 'list_location')
        }),
        ('Status & Visibility', {
            'fields': ('listing_status', 'is_featured', 'expiration_date')
        }),
        ('Statistics', {
            'fields': ('views', 'createdat', 'updatedat')
        }),
    )


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ['listimage_id', 'listing_id', 'is_primary', 'display_order', 'uploadedat']
    list_filter = ['is_primary', 'uploadedat']
    search_fields = ['listing_id__listing_title']


@admin.register(PricingPlan)
class PricingPlanAdmin(admin.ModelAdmin):
    list_display = ['pricing_id', 'pricing_name', 'plan_price', 'duration_days', 
                    'category_scope', 'is_featured', 'is_active']
    list_filter = ['category_scope', 'is_featured', 'is_active']
    search_fields = ['pricing_name']


@admin.register(RatingReview)
class RatingReviewAdmin(admin.ModelAdmin):
    list_display = ['ratingrev_id', 'userid', 'reviewed_userid', 'rating', 'is_visible', 'createdat']
    list_filter = ['rating', 'is_visible', 'createdat']
    search_fields = ['userid__email', 'reviewed_userid__email', 'comment']
    readonly_fields = ['createdat', 'updatedat']


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ['fav_id', 'userid', 'listing_id', 'createdat']
    search_fields = ['userid__email', 'listing_id__listing_title']
    readonly_fields = ['createdat']
    
    
@admin.register(ReportMisconduct)
class ReportMisconductAdmin(admin.ModelAdmin):
    list_display = ['reportmiscond_id', 'userid', 'reported_userid', 'listing_id', 
                    'report_type', 'report_status', 'createdat']
    list_filter = ['report_type', 'report_status', 'createdat']
    search_fields = ['userid__email', 'report_reason']
    readonly_fields = ['createdat', 'resolved_at']
    
    fieldsets = (
        ('Report Info', {
            'fields': ('userid', 'reported_userid', 'listing_id')
        }),
        ('Details', {
            'fields': ('report_type', 'report_reason', 'report_status')
        }),
        ('Admin Action', {
            'fields': ('admin_notes', 'resolved_at')
        }),
        ('Timestamps', {
            'fields': ('createdat',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'userid', 'reported_userid', 'listing_id'
        )