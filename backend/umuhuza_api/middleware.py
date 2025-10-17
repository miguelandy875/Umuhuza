from users.models import ActivityLog


def get_client_ip(request):
    """Get client IP address"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class ActivityLogMiddleware:
    """
    Middleware to log important user actions
    """
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Log specific actions after response
        if request.user.is_authenticated and request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            self.log_action(request, response)
        
        return response
    
    def log_action(self, request, response):
        """Log user actions"""
        path = request.path
        
        # Define loggable actions
        actions = {
            '/api/auth/login/': 'user_login',
            '/api/auth/register/': 'user_register',
            '/api/listings/create/': 'listing_create',
            '/api/payments/initiate/': 'payment_initiate',
            '/api/dealer-applications/create/': 'dealer_application',
            '/api/reports/create/': 'report_submit',
        }
        
        action_type = None
        for pattern, action in actions.items():
            if pattern in path:
                action_type = action
                break
        
        # Log if it's a tracked action and response is successful
        if action_type and 200 <= response.status_code < 300:
            try:
                ActivityLog.objects.create(
                    userid=request.user,
                    action_type=action_type,
                    description=f"{request.method} {path}",
                    ip_address=get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
                )
            except Exception as e:
                # Don't let logging errors break the app
                print(f"Activity log error: {e}")