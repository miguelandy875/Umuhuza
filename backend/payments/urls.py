from django.urls import path
from . import views

urlpatterns = [
    # Dealer Applications
    path('dealer-applications/create/', views.dealer_application_create, name='dealer-application-create'),
    path('dealer-applications/status/', views.dealer_application_status, name='dealer-application-status'),
    path('dealer-applications/documents/', views.dealer_document_upload, name='dealer-document-upload'),
    
    # Payments
    path('payments/initiate/', views.payment_initiate, name='payment-initiate'),
    path('payments/verify/', views.payment_verify, name='payment-verify'),
    path('payments/history/', views.payment_history, name='payment-history'),
    path('payments/<str:payment_id>/', views.payment_detail, name='payment-detail'),
]