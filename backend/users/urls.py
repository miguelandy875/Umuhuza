from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Verification
    path('skip-verification/', views.skip_verification_view, name='skip-verification'),
    path('verify-email/', views.verify_email_view, name='verify-email'),
    path('verify-phone/', views.verify_phone_view, name='verify-phone'),
    path('resend-code/', views.resend_code_view, name='resend-code'),
    
    # Profile
    path('profile/', views.profile_view, name='profile'),
    path('profile/update/', views.update_profile_view, name='update-profile'),
]