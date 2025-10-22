# 🔥 **PERFECT COMBO! MESSAGING + POLISH = PRODUCTION-READY!**

Let's build the messaging system and then polish everything to perfection!

---

# 💬 **PART 1: MESSAGING SYSTEM**

## **STEP 1: Create Chat List Component**

```bash
code ~/umuhuza/frontend/src/components/messaging/ChatList.tsx
```

**Paste:**

```typescript
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
```

---

## **STEP 2: Create Message Bubble Component**

```bash
code ~/umuhuza/frontend/src/components/messaging/MessageBubble.tsx
```

**Paste:**

```typescript
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
```

---

## **STEP 3: Create Messages API**

```bash
code ~/umuhuza/frontend/src/api/messages.ts
```

**Paste:**

```typescript
import apiClient from './client';

interface Chat {
  chat_id: number;
  buyer: any;
  seller: any;
  listing: any;
  last_message_at: string;
  last_message: any;
  unread_count: number;
}

interface Message {
  message_id: number;
  sender: any;
  content: string;
  message_type: string;
  is_read: boolean;
  sentat: string;
}

export const messagesApi = {
  // Get all chats
  getChats: async (): Promise<Chat[]> => {
    const response = await apiClient.get('/chats/');
    return response.data;
  },

  // Get chat messages
  getMessages: async (chatId: number): Promise<Message[]> => {
    const response = await apiClient.get(`/chats/${chatId}/messages/`);
    return response.data;
  },

  // Send message
  sendMessage: async (chatId: number, content: string): Promise<Message> => {
    const response = await apiClient.post(`/chats/${chatId}/messages/send/`, {
      content,
      message_type: 'text',
    });
    return response.data.data;
  },

  // Create chat
  createChat: async (listingId: number): Promise<Chat> => {
    const response = await apiClient.post('/chats/create/', {
      listing_id: listingId,
    });
    return response.data.chat;
  },

  // Mark messages as read
  markAsRead: async (chatId: number): Promise<void> => {
    await apiClient.put(`/chats/${chatId}/mark-read/`);
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/chats/unread-count/');
    return response.data.unread_count;
  },
};
```

---

## **STEP 4: Create Messages Page**

```bash
code ~/umuhuza/frontend/src/pages/MessagesPage.tsx
```

**Paste:**

```typescript
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '../api/messages';
import { useAuthStore } from '../store/authStore';
import Layout from '../components/layout/Layout';
import ChatList from '../components/messaging/ChatList';
import MessageBubble from '../components/messaging/MessageBubble';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { Send, ArrowLeft, ExternalLink, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const listingId = searchParams.get('listing');

  // Fetch chats
  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ['chats'],
    queryFn: messagesApi.getChats,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  // Fetch messages for selected chat
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedChatId],
    queryFn: () => messagesApi.getMessages(selectedChatId!),
    enabled: !!selectedChatId,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Create chat mutation
  const createChatMutation = useMutation({
    mutationFn: messagesApi.createChat,
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setSelectedChatId(chat.chat_id);
      toast.success('Chat started');
    },
    onError: () => {
      toast.error('Failed to start chat');
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, content }: { chatId: number; content: string }) =>
      messagesApi.sendMessage(chatId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setMessageInput('');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when viewing
  useEffect(() => {
    if (selectedChatId && messages) {
      messagesApi.markAsRead(selectedChatId);
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    }
  }, [selectedChatId, messages, queryClient]);

  // Create chat if listing param exists
  useEffect(() => {
    if (listingId && !selectedChatId) {
      createChatMutation.mutate(parseInt(listingId));
    }
  }, [listingId]);

  // Select first chat if none selected
  useEffect(() => {
    if (chats && chats.length > 0 && !selectedChatId && !listingId) {
      setSelectedChatId(chats[0].chat_id);
    }
  }, [chats, selectedChatId, listingId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedChatId) return;

    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: messageInput.trim(),
    });
  };

  const selectedChat = chats?.find((c) => c.chat_id === selectedChatId);
  const otherUser = selectedChat
    ? selectedChat.buyer.userid === user?.userid
      ? selectedChat.seller
      : selectedChat.buyer
    : null;

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="grid grid-cols-12 h-full">
            {/* Chat List Sidebar */}
            <div className="col-span-12 md:col-span-4 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Messages</h2>
              </div>
              
              {chatsLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <ChatList
                  chats={chats || []}
                  selectedChatId={selectedChatId}
                  onSelectChat={setSelectedChatId}
                  currentUserId={user.userid}
                />
              )}
            </div>

            {/* Chat Window */}
            <div className="col-span-12 md:col-span-8 flex flex-col">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedChatId(null)}
                        className="md:hidden"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        {otherUser?.user_firstname?.[0] || '?'}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {otherUser?.full_name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {selectedChat.listing.listing_title}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/listings/${selectedChat.listing.listing_id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Listing"
                      >
                        <ExternalLink className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <LoadingSpinner />
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <>
                        {messages.map((message) => (
                          <MessageBubble
                            key={message.message_id}
                            message={message}
                            isOwnMessage={message.sender.userid === user.userid}
                          />
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 input"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button
                        type="submit"
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        isLoading={sendMessageMutation.isPending}
                      >
                        <Send className="w-5 h-5" />
                      </Button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Send className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">Select a chat to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
```

---

## **STEP 5: Update App.tsx**

```bash
code ~/umuhuza/frontend/src/App.tsx
```

**Add import:**

```typescript
import MessagesPage from './pages/MessagesPage';
```

**Add route:**

```typescript
<Route
  path="/messages"
  element={
    <ProtectedRoute>
      <MessagesPage />
    </ProtectedRoute>
  }
/>
```

---

## **STEP 6: Add Unread Count to Header**

```bash
code ~/umuhuza/frontend/src/components/layout/Header.tsx
```

**Add at the top after imports:**

```typescript
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '../../api/messages';
```

**Inside the Header component, add after the useAuthStore line:**

```typescript
  const { data: unreadCount } = useQuery({
    queryKey: ['unread-count'],
    queryFn: messagesApi.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 10000, // Check every 10 seconds
  });
```

**Update the Messages link (around line 35):**

```typescript
<Link to="/messages" className="text-gray-700 hover:text-primary-600 relative">
  Messages
  {unreadCount && unreadCount > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</Link>
```

---

## **TEST MESSAGING:**

1. **Login as User 1**
2. **Go to a listing** (not your own)
3. **Click "Contact Seller"**
4. **Should open messages page with chat**
5. **Send a message**
6. **Login as User 2** (in incognito window)
7. **Go to messages** → Should see unread message
8. **Reply** → Real-time updates!

---

## ✅ **MESSAGING COMPLETE! Now let's POLISH! 🎨**

Reply **"Messaging works! Ready to polish!"** and I'll give you the polish checklist!
