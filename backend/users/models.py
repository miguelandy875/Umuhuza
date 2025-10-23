from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, phone_number, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        if not phone_number:
            raise ValueError('Users must have a phone number')
        
        email = self.normalize_email(email)
        user = self.model(email=email, phone_number=phone_number, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_verified', True)
        extra_fields.setdefault('email_verified', True)
        extra_fields.setdefault('user_role', 'dealer')  # Superusers are dealers
        extra_fields.setdefault('is_seller', True)
        extra_fields.setdefault('is_dealer', True)

        return self.create_user(email, phone_number, password, **extra_fields)


# ============================================================================
# USER MODEL (Custom)
# ============================================================================

class User(AbstractBaseUser, PermissionsMixin):
    USER_ROLES = [
        ('buyer', 'Buyer'),
        ('seller', 'Seller'),
        ('dealer', 'Dealer'),
    ]
    
    userid = models.AutoField(primary_key=True, db_column='USERID')
    user_firstname = models.CharField(max_length=255, db_column='USER_FIRSTNAME')
    user_lastname = models.CharField(max_length=255, db_column='USER_LASTNAME')
    email = models.EmailField(unique=True, db_column='USER_EMAIL')
    phone_number = models.CharField(max_length=20, db_column='PHONE_NUMBER')
    # Legacy role field - kept for backward compatibility
    user_role = models.CharField(
        max_length=10,
        choices=USER_ROLES,
        default='buyer',
        db_column='USER_ROLE'
    )
    # New role flags - users can be multiple roles simultaneously
    is_seller = models.BooleanField(
        default=False,
        db_column='IS_SELLER',
        help_text='True if user has created at least one listing'
    )
    is_dealer = models.BooleanField(
        default=False,
        db_column='IS_DEALER',
        help_text='True if user is an approved dealer'
    )
    profile_photo = models.CharField(
        max_length=255, 
        default='default-avatar.png',
        null=True,
        blank=True,
        db_column='PROFILE_PHOTO'
    )
    
    # Verification fields
    is_verified = models.BooleanField(default=False, db_column='IS_VERIFIED')
    is_active = models.BooleanField(default=True, db_column='IS_ACTIVE')
    email_verified = models.BooleanField(default=False, db_column='EMAIL_VERIFIED')
    phone_verified = models.BooleanField(default=False, db_column='PHONE_VERIFIED')
    email_verified_at = models.DateTimeField(null=True, blank=True, db_column='EMAIL_VERIFIED_AT')
    phone_verified_at = models.DateTimeField(null=True, blank=True, db_column='PHONE_VERIFIED_AT')
    
    # Token fields
    verification_token = models.CharField(max_length=100, null=True, blank=True, db_column='VERIFICATION_TOKEN')
    verification_token_expires = models.DateTimeField(null=True, blank=True, db_column='VERIFICATION_TOKEN_EXPIRES')
    reset_password_token = models.CharField(max_length=100, null=True, blank=True, db_column='RESET_PASSWORD_TOKEN')
    reset_password_expires = models.DateTimeField(null=True, blank=True, db_column='RESET_PASSWORD_EXPIRES')
    
    # Timestamps
    last_login = models.DateTimeField(null=True, blank=True, db_column='LAST_LOGIN')
    date_joined = models.DateTimeField(auto_now_add=True, db_column='DATE_JOINED')
    updatedat = models.DateTimeField(auto_now=True, db_column='UPDATEDAT')
    
    # Django admin fields
    is_staff = models.BooleanField(default=False)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['phone_number', 'user_firstname', 'user_lastname']
    
    class Meta:
        db_table = 'USERS'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['phone_number']),
            models.Index(fields=['user_role']),
            models.Index(fields=['is_verified']),
        ]
    
    def __str__(self):
        return f"{self.user_firstname} {self.user_lastname} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.user_firstname} {self.user_lastname}"

    @property
    def roles(self):
        """Return list of active roles for this user"""
        roles = ['buyer']  # Everyone is a buyer
        if self.is_seller:
            roles.append('seller')
        if self.is_dealer:
            roles.append('dealer')
        return roles

    @property
    def primary_role(self):
        """Return the most important role for display purposes"""
        if self.is_dealer:
            return 'dealer'
        elif self.is_seller:
            return 'seller'
        return 'buyer'
    

# ============================================================================
# VERIFICATION CODES
# ============================================================================

class VerificationCode(models.Model):
    CODE_TYPES = [
        ('email', 'Email'),
        ('phone', 'Phone'),
        ('password_reset', 'Password Reset'),
    ]
    
    code_id = models.AutoField(primary_key=True, db_column='CODE_ID')
    userid = models.ForeignKey(User, on_delete=models.CASCADE, db_column='USERID')
    code = models.CharField(max_length=10, db_column='CODE')
    code_type = models.CharField(max_length=20, choices=CODE_TYPES, db_column='CODE_TYPE')
    contact_info = models.CharField(max_length=255, db_column='CONTACT_INFO')
    is_used = models.BooleanField(default=False, db_column='IS_USED')
    expires_at = models.DateTimeField(db_column='EXPIRES_AT')
    createdat = models.DateTimeField(auto_now_add=True, db_column='CREATEDAT')
    used_at = models.DateTimeField(null=True, blank=True, db_column='USED_AT')
    
    class Meta:
        db_table = 'VERIFICATION_CODES'
        indexes = [
            models.Index(fields=['userid']),
            models.Index(fields=['code']),
            models.Index(fields=['code_type']),
            models.Index(fields=['expires_at']),
        ]
    
    def __str__(self):
        return f"{self.code_type} code for {self.userid.email}"
    
    def is_valid(self):
        return not self.is_used and self.expires_at > timezone.now()


# ============================================================================
# USER BADGES
# ============================================================================

class UserBadge(models.Model):
    BADGE_TYPES = [
        ('verified', 'Verified'),
        ('top_dealer', 'Top Dealer'),
        ('trusted_seller', 'Trusted Seller'),
        ('power_buyer', 'Power Buyer'),
    ]
    
    userbadge_id = models.AutoField(primary_key=True, db_column='USERBADGE_ID')
    userid = models.ForeignKey(User, on_delete=models.CASCADE, db_column='USERID', related_name='badges')
    badge_type = models.CharField(max_length=20, choices=BADGE_TYPES, db_column='BADGE_TYPE')
    issuedat = models.DateTimeField(auto_now_add=True, db_column='ISSUEDAT')
    expires_at = models.DateTimeField(null=True, blank=True, db_column='EXPIRES_AT')
    
    class Meta:
        db_table = 'USER_BADGES'
        unique_together = [['userid', 'badge_type']]
    
    def __str__(self):
        return f"{self.userid.full_name} - {self.badge_type}"
    
    def is_active(self):
        if self.expires_at:
            return timezone.now() < self.expires_at
        return True

# ============================================================================
# ACTIVITY LOGS
# ============================================================================

class ActivityLog(models.Model):
    log_id = models.AutoField(primary_key=True, db_column='LOG_ID')
    userid = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        db_column='USERID'
    )
    action_type = models.CharField(max_length=100, db_column='ACTION_TYPE')
    entity_type = models.CharField(max_length=50, null=True, blank=True, db_column='ENTITY_TYPE')
    entity_id = models.IntegerField(null=True, blank=True, db_column='ENTITY_ID')
    description = models.TextField(null=True, blank=True, db_column='DESCRIPTION')
    ip_address = models.GenericIPAddressField(null=True, blank=True, db_column='IP_ADDRESS')
    user_agent = models.TextField(null=True, blank=True, db_column='USER_AGENT')
    createdat = models.DateTimeField(auto_now_add=True, db_column='CREATEDAT')
    
    class Meta:
        db_table = 'ACTIVITY_LOGS'
        indexes = [
            models.Index(fields=['userid']),
            models.Index(fields=['action_type']),
            models.Index(fields=['entity_type', 'entity_id']),
            models.Index(fields=['createdat']),
        ]
    
    def __str__(self):
        user = self.userid.full_name if self.userid else "Anonymous"
        return f"{user} - {self.action_type} at {self.createdat}"
