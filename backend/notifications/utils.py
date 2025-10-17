from .models import Notification


def create_notification(user, title, message, notif_type, link_url=None):
    """
    Helper function to create notifications
    """
    return Notification.objects.create(
        userid=user,
        notif_title=title,
        notif_message=message,
        notif_type=notif_type,
        link_url=link_url
    )


def notify_new_message(recipient, sender, listing_title, chat_id):
    """Notify user of new message"""
    create_notification(
        user=recipient,
        title='New Message',
        message=f'{sender.full_name} sent you a message about "{listing_title}"',
        notif_type='chat',
        link_url=f'/chats/{chat_id}'
    )


def notify_listing_status(user, listing_title, status):
    """Notify user about listing status change"""
    create_notification(
        user=user,
        title='Listing Status Updated',
        message=f'Your listing "{listing_title}" is now {status}',
        notif_type='listing'
    )


def notify_new_review(user, reviewer_name, rating):
    """Notify user of new review"""
    create_notification(
        user=user,
        title='New Review',
        message=f'{reviewer_name} left you a {rating}-star review',
        notif_type='review'
    )


def notify_payment_success(user, amount, plan_name):
    """Notify user of successful payment"""
    create_notification(
        user=user,
        title='Payment Successful',
        message=f'Your payment of {amount} BIF for {plan_name} was successful',
        notif_type='payment'
    )


def notify_verification_complete(user):
    """Notify user account is fully verified"""
    create_notification(
        user=user,
        title='Account Verified',
        message='Congratulations! Your account is now fully verified.',
        notif_type='verification'
    )