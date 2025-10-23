import { format } from 'date-fns';
import { Check, CheckCheck } from 'lucide-react';

interface Message {
  message_id: number;
  sender: any;
  content: string;
  message_type: string;
  is_read: boolean;
  sentat: string;
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end gap-2 max-w-[70%] ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwnMessage && (
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-gray-600">
            {message.sender.user_firstname?.[0] || '?'}
          </div>
        )}

        {/* Message Bubble */}
        <div>
          <div
            className={`px-4 py-2 rounded-lg ${
              isOwnMessage
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-900'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          </div>

          {/* Timestamp & Read Status */}
          <div className={`flex items-center gap-1 mt-1 text-xs text-gray-500 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <span>{format(new Date(message.sentat), 'HH:mm')}</span>
            {isOwnMessage && (
              message.is_read ? (
                <CheckCheck className="w-3 h-3 text-primary-600" />
              ) : (
                <Check className="w-3 h-3" />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}