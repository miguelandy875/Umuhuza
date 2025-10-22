import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  Bell, MessageCircle, Flag, CreditCard, Home as HomeIcon,
  Star, CheckCircle, X
} from 'lucide-react';
import type { Notification } from '../../types';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

const getNotificationIcon = (type: Notification['notif_type']) => {
  const icons = {
    system: Bell,
    chat: MessageCircle,
    report: Flag,
    payment: CreditCard,
    listing: HomeIcon,
    review: Star,
    verification: CheckCircle,
  };

  const Icon = icons[type] || Bell;
  return <Icon className="w-5 h-5" />;
};

const getNotificationColor = (type: Notification['notif_type']) => {
  const colors = {
    system: 'bg-blue-100 text-blue-600',
    chat: 'bg-green-100 text-green-600',
    report: 'bg-red-100 text-red-600',
    payment: 'bg-yellow-100 text-yellow-600',
    listing: 'bg-purple-100 text-purple-600',
    review: 'bg-orange-100 text-orange-600',
    verification: 'bg-teal-100 text-teal-600',
  };

  return colors[type] || colors.system;
};

export default function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.notif_id);
    }
  };

  const content = (
    <div
      className={`flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors ${
        !notification.is_read ? 'bg-primary-50' : ''
      }`}
      onClick={handleClick}
    >
      {/* Icon */}
      <div className={`p-2 rounded-full ${getNotificationColor(notification.notif_type)}`}>
        {getNotificationIcon(notification.notif_type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`font-medium text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
            {notification.notif_title}
          </h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onDelete(notification.notif_id);
            }}
            className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
            title="Delete notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {notification.notif_message}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(notification.createdat), { addSuffix: true })}
          </span>
          {!notification.is_read && (
            <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
          )}
        </div>
      </div>
    </div>
  );

  // If there's a link, wrap in Link component
  if (notification.link_url) {
    return (
      <Link to={notification.link_url} className="block border-b border-gray-200 last:border-0">
        {content}
      </Link>
    );
  }

  // Otherwise, just a div
  return <div className="border-b border-gray-200 last:border-0">{content}</div>;
}
