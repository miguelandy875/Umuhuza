import { format } from 'date-fns';
import { MessageCircle, User } from 'lucide-react';

interface Chat {
  chat_id: number;
  buyer: any;
  seller: any;
  listing: any;
  last_message_at: string;
  last_message: any;
  unread_count: number;
}

interface ChatListProps {
  chats: Chat[];
  selectedChatId: number | null;
  onSelectChat: (chatId: number) => void;
  currentUserId: number;
}

export default function ChatList({ chats, selectedChatId, onSelectChat, currentUserId }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <MessageCircle className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
        <p className="text-sm text-gray-600">
          Start a conversation by contacting a seller from their listing
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 overflow-y-auto h-full">
      {chats.map((chat) => {
        const otherUser = chat.buyer.userid === currentUserId ? chat.seller : chat.buyer;
        const isSelected = chat.chat_id === selectedChatId;
        
        return (
          <button
            key={chat.chat_id}
            onClick={() => onSelectChat(chat.chat_id)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-primary-50 border-l-4 border-primary-600' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                {otherUser.profile_photo ? (
                  <img
                    src={otherUser.profile_photo}
                    alt={otherUser.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-primary-600" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {otherUser.full_name}
                  </h3>
                  {chat.last_message_at && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {format(new Date(chat.last_message_at), 'MMM d')}
                    </span>
                  )}
                </div>

                {/* Listing Title */}
                <p className="text-sm text-gray-600 truncate mb-1">
                  {chat.listing.listing_title}
                </p>

                {/* Last Message */}
                {chat.last_message && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {chat.last_message.content}
                    </p>
                    {chat.unread_count > 0 && (
                      <span className="bg-primary-600 text-white text-xs font-semibold px-2 py-1 rounded-full flex-shrink-0">
                        {chat.unread_count}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}