from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    User, VerificationCode, UserBadge
)

User = get_user_model()



# ============================================================================
# USER SERIALIZERS
# ============================================================================

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = [
            'user_firstname', 'user_lastname', 'email', 
            'phone_number', 'password', 'password_confirm'
        ]
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            email=validated_data['email'],
            phone_number=validated_data['phone_number'],
            user_firstname=validated_data['user_firstname'],
            user_lastname=validated_data['user_lastname'],
            password=validated_data['password']
        )
        return user

# ============================================================================
# USER BADGE SERIALIZERS
# ============================================================================

class UserBadgeSerializer(serializers.ModelSerializer):
    is_active = serializers.ReadOnlyField()
    
    class Meta:
        model = UserBadge
        fields = ['userbadge_id', 'badge_type', 'issuedat', 'expires_at', 'is_active']
        
        
class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    badges = UserBadgeSerializer(many=True, read_only=True)  # Add this
    
    class Meta:
        model = User
        fields = [
            'userid', 'user_firstname', 'user_lastname', 'full_name',
            'email', 'phone_number', 'user_role', 'profile_photo',
            'is_verified', 'email_verified', 'phone_verified',
            'date_joined', 'last_login', 'badges'  # Add badges here
        ]
        read_only_fields = [
            'userid', 'email', 'is_verified', 'email_verified', 
            'phone_verified', 'date_joined', 'last_login'
        ]


class UserPublicSerializer(serializers.ModelSerializer):
    """Public profile for displaying in listings, reviews, etc."""
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = [
            'userid', 'full_name', 'profile_photo', 
            'user_role', 'is_verified', 'date_joined'
        ]


# ============================================================================
# VERIFICATION SERIALIZERS
# ============================================================================

class VerificationCodeSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=10)
    code_type = serializers.ChoiceField(choices=['email', 'phone'])


class ResendCodeSerializer(serializers.Serializer):
    code_type = serializers.ChoiceField(choices=['email', 'phone'])

