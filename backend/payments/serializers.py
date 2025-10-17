from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Payment, 
    DealerApplication, DealerDocument
)

User = get_user_model()

# ============================================================================
# PAYMENT SERIALIZERS
# ============================================================================

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            'payment_id', 'payment_amount', 'payment_method',
            'payment_status', 'payment_ref', 'createdat', 'confirmed_at'
        ]
        read_only_fields = ['payment_id', 'payment_status', 'createdat', 'confirmed_at']


class PaymentCreateSerializer(serializers.Serializer):
    pricing_id = serializers.IntegerField()
    listing_id = serializers.IntegerField(required=False)
    payment_method = serializers.ChoiceField(choices=['mobile_money', 'card', 'wallet'])
    phone_number = serializers.CharField(max_length=20, required=False)

# ============================================================================
# DEALER APPLICATION SERIALIZERS
# ============================================================================

class DealerDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = DealerDocument
        fields = ['dealerdoc_id', 'doc_type', 'file_url', 'verified', 'uploadedat']


class DealerApplicationSerializer(serializers.ModelSerializer):
    documents = DealerDocumentSerializer(many=True, read_only=True)
    
    class Meta:
        model = DealerApplication
        fields = [
            'dealerapp_id', 'business_name', 'business_type',
            'business_address', 'business_phone', 'business_email',
            'tax_id', 'business_license', 'appli_status',
            'rejection_reason', 'createdat', 'approvedat', 'documents'
        ]
        read_only_fields = [
            'dealerapp_id', 'appli_status', 'rejection_reason',
            'createdat', 'approvedat'
        ]

