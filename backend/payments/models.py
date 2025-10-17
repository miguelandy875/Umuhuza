from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

from listings.models import Listing, PricingPlan
from users.models import User

# ============================================================================
# PAYMENTS
# ============================================================================

class Payment(models.Model):
    PAYMENT_METHODS = [
        ('mobile_money', 'Mobile Money'),
        ('card', 'Card'),
        ('wallet', 'Wallet'),
    ]
    
    PAYMENT_STATUS = [
        ('pending', 'Pending'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    payment_id = models.CharField(max_length=64, primary_key=True, db_column='PAYMENT_ID')
    userid = models.ForeignKey(User, on_delete=models.RESTRICT, db_column='USERID')
    pricing_id = models.ForeignKey(PricingPlan, on_delete=models.RESTRICT, db_column='PRICING_ID')
    listing_id = models.ForeignKey(
        Listing, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='LISTING_ID'
    )
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, db_column='PAYMENT_AMOUNT')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, db_column='PAYMENT_METHOD')
    payment_status = models.CharField(
        max_length=20, 
        choices=PAYMENT_STATUS, 
        default='pending',
        db_column='PAYMENT_STATUS'
    )
    payment_ref = models.CharField(max_length=255, unique=True, db_column='PAYMENT_REF')
    transaction_id = models.CharField(max_length=255, null=True, blank=True, db_column='TRANSACTION_ID')
    failure_reason = models.TextField(null=True, blank=True, db_column='FAILURE_REASON')
    createdat = models.DateTimeField(auto_now_add=True, db_column='CREATEDAT')
    confirmed_at = models.DateTimeField(null=True, blank=True, db_column='CONFIRMED_AT')
    
    class Meta:
        db_table = 'PAYMENTS'
        indexes = [
            models.Index(fields=['userid']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['createdat']),
        ]
    
    def __str__(self):
        return f"Payment {self.payment_id} - {self.payment_status}"


# ============================================================================
# DEALER APPLICATIONS
# ============================================================================

class DealerApplication(models.Model):
    BUSINESS_TYPES = [
        ('real_estate', 'Real Estate'),
        ('vehicle', 'Vehicle'),
        ('both', 'Both'),
    ]
    
    APPLICATION_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    dealerapp_id = models.AutoField(primary_key=True, db_column='DEALERAPP_ID')
    userid = models.OneToOneField(User, on_delete=models.CASCADE, db_column='USERID')
    business_name = models.CharField(max_length=255, db_column='BUSINESS_NAME')
    business_type = models.CharField(max_length=20, choices=BUSINESS_TYPES, db_column='BUSINESS_TYPE')
    business_address = models.TextField(db_column='BUSINESS_ADDRESS')
    business_phone = models.CharField(max_length=20, null=True, blank=True, db_column='BUSINESS_PHONE')
    business_email = models.EmailField(null=True, blank=True, db_column='BUSINESS_EMAIL')
    tax_id = models.CharField(max_length=100, null=True, blank=True, db_column='TAX_ID')
    business_license = models.CharField(max_length=100, null=True, blank=True, db_column='BUSINESS_LICENSE')
    appli_status = models.CharField(
        max_length=10, 
        choices=APPLICATION_STATUS, 
        default='pending',
        db_column='APPLI_STATUS'
    )
    rejection_reason = models.TextField(null=True, blank=True, db_column='REJECTION_REASON')
    createdat = models.DateTimeField(auto_now_add=True, db_column='CREATEDAT')
    approvedat = models.DateTimeField(null=True, blank=True, db_column='APPROVEDAT')
    updatedat = models.DateTimeField(auto_now=True, db_column='UPDATEDAT')
    
    class Meta:
        db_table = 'DEALER_APPLICATIONS'
    
    def __str__(self):
        return f"{self.business_name} - {self.appli_status}"


# ============================================================================
# DEALER DOCUMENTS
# ============================================================================

class DealerDocument(models.Model):
    dealerdoc_id = models.AutoField(primary_key=True, db_column='DEALERDOC_ID')
    dealerapp_id = models.ForeignKey(
        DealerApplication, 
        on_delete=models.CASCADE, 
        db_column='DEALERAPP_ID',
        related_name='documents'
    )
    doc_type = models.CharField(max_length=255, db_column='DOC_TYPE')
    file_url = models.CharField(max_length=255, db_column='FILE_URL')
    file_size = models.IntegerField(null=True, blank=True, db_column='FILE_SIZE')
    verified = models.BooleanField(default=False, db_column='VERIFIED')
    uploadedat = models.DateTimeField(auto_now_add=True, db_column='UPLOADEDAT')
    
    class Meta:
        db_table = 'DEALER_DOCUMENTS'
    
    def __str__(self):
        return f"{self.doc_type} for {self.dealerapp_id.business_name}"

